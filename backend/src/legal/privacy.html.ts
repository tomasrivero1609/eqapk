// Politica de privacidad servida en GET /privacy (https://eqapk.recepcioneq.com/privacy).
// URL publica requerida por Google Play. Mantener el contenido consistente con el
// formulario "Data safety" de la Play Console.

export const PRIVACY_POLICY_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index, follow" />
  <title>Política de Privacidad — Eventos Quilmes</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.65;
      color: #1f2937;
      background: #f8fafc;
    }
    main {
      max-width: 760px;
      margin: 0 auto;
      padding: 40px 22px 80px;
    }
    h1 { font-size: 1.8rem; margin-bottom: 4px; color: #0f172a; }
    h2 { font-size: 1.2rem; margin-top: 34px; color: #0f172a; }
    .updated { color: #64748b; font-size: 0.9rem; margin-top: 0; }
    a { color: #2563eb; }
    ul { padding-left: 1.2rem; }
    li { margin: 6px 0; }
    code { background: #e2e8f0; padding: 1px 6px; border-radius: 4px; font-size: 0.9em; }
    footer { margin-top: 48px; padding-top: 18px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.85rem; }
  </style>
</head>
<body>
  <main>
    <h1>Política de Privacidad</h1>
    <p class="updated">Aplicación: <strong>Eventos Quilmes</strong> · Desarrollador: <strong>Rivero Studio</strong><br />
    Última actualización: 5 de junio de 2026</p>

    <p>
      Esta Política de Privacidad describe cómo <strong>Rivero Studio</strong> ("nosotros") trata
      la información en la aplicación móvil <strong>Eventos Quilmes</strong> (la "App"). La App es
      una <strong>herramienta interna de gestión</strong> para el personal de un salón de eventos y
      servicio de catering. No está dirigida al público general ni a menores de edad.
    </p>

    <h2>1. Información que recopilamos</h2>
    <ul>
      <li><strong>Datos de cuenta del usuario:</strong> nombre, dirección de correo electrónico y
        contraseña (almacenada de forma cifrada con hash; nunca en texto plano).</li>
      <li><strong>Datos de gestión cargados por el personal:</strong> información de eventos,
        clientes (nombre, teléfono, correo, dirección), menús, pagos e inventario, ingresada por
        los usuarios para operar el negocio.</li>
      <li><strong>Datos técnicos mínimos:</strong> registros de acceso necesarios para la seguridad
        y el funcionamiento del servicio.</li>
    </ul>

    <h2>2. Cómo usamos la información</h2>
    <ul>
      <li>Brindar las funciones de gestión de la App (autenticación, eventos, clientes, pagos,
        inventario).</li>
      <li>Autenticar a los usuarios mediante un token de sesión (JWT).</li>
      <li>Mantener la seguridad e integridad del servicio.</li>
    </ul>
    <p>
      <strong>No</strong> vendemos ni alquilamos datos personales, <strong>no</strong> mostramos
      publicidad y <strong>no</strong> usamos los datos con fines distintos a operar la App.
    </p>

    <h2>3. Servicios de terceros</h2>
    <ul>
      <li><strong>Google Calendar (opcional):</strong> si está habilitado, los eventos pueden
        sincronizarse con un calendario de Google de la empresa a través de la API de Google
        Calendar.</li>
      <li><strong>Correo electrónico:</strong> podemos enviar correos transaccionales (por ejemplo,
        comprobantes) mediante un proveedor de email.</li>
    </ul>

    <h2>4. Almacenamiento y seguridad</h2>
    <p>
      Los datos se almacenan en servidores propios administrados por Rivero Studio, con acceso
      restringido y cifrado en tránsito mediante HTTPS/TLS. Las contraseñas se guardan con hash.
      El acceso a la App está protegido por autenticación y un sistema de permisos por rol.
    </p>

    <h2>5. Conservación de datos</h2>
    <p>
      Conservamos la información mientras la cuenta esté activa o sea necesaria para operar el
      negocio. Podés solicitar la eliminación de tu cuenta y de tus datos personales escribiéndonos
      (ver Contacto).
    </p>

    <h2>6. Tus derechos</h2>
    <p>
      Podés solicitar el acceso, la corrección o la eliminación de tus datos personales
      contactándonos al correo indicado abajo. Atenderemos tu solicitud conforme a la legislación
      aplicable.
    </p>

    <h2>7. Menores</h2>
    <p>
      La App es una herramienta de trabajo y no está dirigida a menores de 13 años. No recopilamos
      conscientemente datos de menores.
    </p>

    <h2>8. Cambios en esta política</h2>
    <p>
      Podemos actualizar esta política ocasionalmente. Publicaremos la versión vigente en esta misma
      dirección con su fecha de actualización.
    </p>

    <h2>9. Contacto</h2>
    <p>
      Ante cualquier consulta sobre privacidad o para ejercer tus derechos, escribinos a:<br />
      <a href="mailto:riverostudio.dev@gmail.com">riverostudio.dev@gmail.com</a>
    </p>

    <footer>
      © 2026 Rivero Studio — Eventos Quilmes. Todos los derechos reservados.
    </footer>
  </main>
</body>
</html>`;
