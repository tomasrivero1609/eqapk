# Deploy de eqapk en el VPS (eqapk.recepcioneq.com)

Backend NestJS dockerizado, detras del nginx del stack de recepcion, con su
propio Postgres. Todo en el VPS `144.217.165.30` (Ubuntu 24.04).

## Arquitectura

```
Internet ──443──> [recepcioneq-nginx] ──┬─> api.recepcioneq.com   -> recepcioneq-api:3001
                  (ya existente)         └─> eqapk.recepcioneq.com -> eqapk-api:3000
                                                                       │
                                              eqapk-api ── eqapk_internal ── eqapk-db (Postgres)
```

`eqapk-api` se une a la red `recepcioneq_external` (ya creada) para que el nginx
existente lo resuelva por nombre. No se toca ningun contenedor de recepcion;
solo se agrega un server block al nginx y se recarga.

---

## Paso 0 — DNS (hacelo primero, tarda en propagar)

Crear un registro **A**:

```
eqapk.recepcioneq.com   A   144.217.165.30
```

Verificar propagacion antes de seguir:

```bash
dig +short eqapk.recepcioneq.com    # debe devolver 144.217.165.30
```

## Paso 1 — Subir el codigo al VPS

El repo eqapk debe quedar en `/home/ubuntu/eqapk` (con `backend/`,
`docker-compose.yml`, etc.). Por ejemplo:

```bash
cd /home/ubuntu
git clone <URL_DEL_REPO_EQAPK> eqapk
cd eqapk
```

(En deploys posteriores: `git pull`.)

## Paso 2 — Variables de entorno

```bash
cd /home/ubuntu/eqapk
cp .env.vps.example .env
nano .env        # completar POSTGRES_PASSWORD y JWT_SECRET (generar uno nuevo)
```

Generar un JWT_SECRET fuerte:

```bash
openssl rand -base64 48
```

## Paso 3 — Levantar el stack de eqapk

```bash
cd /home/ubuntu/eqapk
sudo docker compose up -d --build
```

Esto construye la imagen, arranca `eqapk-db`, corre `prisma migrate deploy` y
levanta `eqapk-api`. Verificar:

```bash
sudo docker compose ps
sudo docker compose logs -f eqapk-api     # Ctrl+C para salir
```

Probar que responde dentro de la red (todavia sin dominio):

```bash
sudo docker exec recepcioneq-nginx-1 wget -qO- http://eqapk-api:3000/ ; echo
```

## Paso 4 — Seed inicial (una sola vez)

El arranque NO corre el seed. Crear los usuarios iniciales una unica vez:

```bash
sudo docker exec -it eqapk-api npx prisma db seed
```

> A futuro, NO repetir esto en cada deploy: el seed reescribe contrasenas.

## Paso 5 — Certificado TLS (editando el TEMPLATE de recepcion)

> IMPORTANTE: `deploy.sh` de recepcion REGENERA `nginx/nginx.conf` desde el
> template `nginx/nginx.ssl.conf` (`sed "s/__DOMAIN__/${DOMAIN}/g" ... > nginx.conf`).
> Por eso el bloque de eqapk va en el **template**, NO en `nginx.conf` (que se
> sobreescribe en cada deploy). Los bloques de eqapk usan el dominio literal
> `eqapk.recepcioneq.com`, asi que el `sed` no los toca.

### 5a. Agregar SOLO el block :80 al template y regenerar

(El block HTTPS todavia no: el cert aun no existe y nginx no arrancaria.)

```bash
cd /home/ubuntu/recepcioneq
# Pegar al final del template SOLO el primer server { listen 80; ... } de
# deploy/nginx-eqapk.conf (ACME challenge + redirect).
nano nginx/nginx.ssl.conf

# Regenerar nginx.conf desde el template, validar y recargar.
DOMAIN=$(grep -E '^DOMAIN=' .env | head -1 | sed -E 's/^DOMAIN=//; s/^"//; s/"$//')
sed "s/__DOMAIN__/${DOMAIN}/g" nginx/nginx.ssl.conf > nginx/nginx.conf
sudo docker exec recepcioneq-nginx-1 nginx -t && sudo docker exec recepcioneq-nginx-1 nginx -s reload
```

### 5b. Emitir el cert con el certbot existente (webroot compartido)

```bash
sudo docker run --rm \
  -v recepcioneq_certbot_certs:/etc/letsencrypt \
  -v recepcioneq_certbot_www:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d eqapk.recepcioneq.com \
  --email TU_EMAIL@dominio.com --agree-tos --no-eff-email
```

Confirmar: `sudo ls /var/lib/docker/volumes/recepcioneq_certbot_certs/_data/live/`
debe listar `eqapk.recepcioneq.com`.

## Paso 6 — Activar HTTPS y blindar

### 6a. Agregar el block :443 al template y regenerar

```bash
cd /home/ubuntu/recepcioneq
# Pegar al final del template el segundo server { listen 443 ssl ... } de
# deploy/nginx-eqapk.conf (el proxy a eqapk-api:3000).
nano nginx/nginx.ssl.conf

DOMAIN=$(grep -E '^DOMAIN=' .env | head -1 | sed -E 's/^DOMAIN=//; s/^"//; s/"$//')
sed "s/__DOMAIN__/${DOMAIN}/g" nginx/nginx.ssl.conf > nginx/nginx.conf
sudo docker exec recepcioneq-nginx-1 nginx -t && sudo docker exec recepcioneq-nginx-1 nginx -s reload
```

### 6b. Verificar ambos sitios

```bash
curl -sI https://api.recepcioneq.com/   | head -1   # recepcion: 404 del app = OK (sigue ruteando)
curl -sI https://eqapk.recepcioneq.com/ | head -1   # eqapk: 200
```

### 6c. Commitear en el repo de recepcion (sobrevive a git pull/checkout)

```bash
cd /home/ubuntu/recepcioneq
git add nginx/nginx.ssl.conf nginx/nginx.conf
git commit -m "nginx: agregar server block de eqapk.recepcioneq.com"
```

El certbot del stack de recepcion ya renueva TODOS los certs del volumen cada
12h, asi que la renovacion de eqapk queda cubierta automaticamente.

## Paso 7 — Apuntar la app movil al nuevo backend

En el repo eqapk (local), cambiar la URL de la API:

- `mobile/eas.json` -> perfiles `preview` y `production`:
  `EXPO_PUBLIC_API_URL: "https://eqapk.recepcioneq.com"`
- `mobile/src/utils/constants.ts` -> fallback de produccion.

Generar e instalar la nueva APK (EAS). **Mantener Render prendido** hasta que
todos los dispositivos esten en la build nueva; recien ahi dar de baja Render.

---

## Operacion

```bash
# Deploy de cambios
cd /home/ubuntu/eqapk && git pull && sudo docker compose up -d --build

# Logs
sudo docker compose logs -f eqapk-api

# Backup de la base
sudo docker exec eqapk-db pg_dump -U eqapk eqapk | gzip > eqapk_$(date +%F).sql.gz

# Reiniciar solo la API
sudo docker compose restart eqapk-api
```
