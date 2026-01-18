# Mobile App - Gestión de Salón de Eventos

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar la URL de la API en `src/utils/constants.ts`:
   - Para desarrollo local: `http://localhost:3000`
   - Para dispositivo físico Android: `http://10.0.2.2:3000`
   - Para dispositivo físico iOS: `http://TU_IP_LOCAL:3000`

3. Iniciar el servidor:
```bash
npm start
```

## Estructura del Proyecto

```
mobile/
├── src/
│   ├── screens/          # Pantallas de la app
│   │   ├── auth/         # Login y Registro
│   │   ├── events/        # Gestión de eventos
│   │   ├── dishes/        # Lista de platos
│   │   ├── menus/         # Lista de menús
│   │   └── clients/       # Lista de clientes
│   ├── components/        # Componentes reutilizables
│   ├── navigation/        # Configuración de navegación
│   ├── services/          # Servicios API
│   ├── store/             # Estado global (Zustand)
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilidades
│   └── types/             # TypeScript types
```

## Funcionalidades

- ✅ Autenticación (Login/Registro)
- ✅ Gestión de Eventos
- ✅ Lista de Platos
- ✅ Lista de Menús
- ✅ Lista de Clientes
- ✅ Navegación con tabs
- ✅ Estado global con Zustand
- ✅ React Query para datos del servidor
