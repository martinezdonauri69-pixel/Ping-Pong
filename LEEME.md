# D.M.R PING PONG · versión nueva (3D, 12 idiomas, tutorial)

## Cómo publicarlo (GitHub Pages)
1. En tu repositorio **borra todo lo viejo** y sube el CONTENIDO de esta carpeta (que `index.html` quede en la raíz).
2. Espera 1-2 minutos y abre `https://martinezdonauri69-pixel.github.io/`.

## Firebase (proyecto `dmr-ping-pong`) – hazlo una vez
1. **Authentication → Método de acceso**: activa *Correo electrónico/contraseña*.
2. **Authentication → Configuración → Dominios autorizados**: debe estar `martinezdonauri69-pixel.github.io`.
3. **Firestore Database → Reglas**: borra lo que hay, pega el contenido de `firestore.rules` y pulsa **Publicar**.
4. **Ser administrador**: juega una vez con tu cuenta, copia tu *UID* (Authentication → Usuarios) y en Firestore crea la colección `admins` con un documento cuyo **ID sea tu UID** (con cualquier campo, p. ej. `ok: true`). Al reiniciar el juego aparece el botón 👑 Admin.

## Qué cambió
- Proyecto dividido en archivos (`js/`, `css/`, `assets/`, `vendor/`). Sin código duplicado.
- Todo en 3D (Three.js incluido en `vendor/`, no necesita internet para cargar).
- Se quitaron los niveles de campaña; se mantiene el **nivel de perfil** y los **rangos** (Bronce → LEYENDA, 4 divisiones, insignias 3D, animación al subir de rango con sonido).
- Idiomas: 12, todo cambia al instante (incluye árabe de derecha a izquierda).
- Tutorial guiado con dedito y aro eléctrico; el resto de la pantalla queda bloqueada.
- Clic derecho = clic izquierdo; no sale menú, ni barras, ni selección/copia.

## Seguridad (honesto)
- Un juego web **siempre** se descarga completo al navegador: nadie puede esconder el código al 100 %. Lo incluido: el juego solo corre en tu dominio, bloqueo de iframe, atajos de inspección/guardado, menú, copia y arrastre.
- Lo que protege de verdad tus datos son las **reglas de Firestore** (`firestore.rules`): nadie puede darse verificación, ocultarse del ranking ni editar a otros jugadores.
- Para lo más importante (premios, rangos) lo ideal a futuro es validar en un servidor (Cloud Functions).
- Si usas otro dominio, agrégalo a `OK_HOSTS` en `js/security.js`.
