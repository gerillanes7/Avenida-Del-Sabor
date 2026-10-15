# Ciudad Sabrosa

Juego web de restaurante inspirado en Restaurant City. Hecho con Vite y JavaScript, con cuentas y restaurantes públicos en Supabase.

- Sin las claves de Supabase el juego funciona igual, pero solo guarda en el navegador y el botón **Vecinos** no aparece.
- Con las claves, cada jugador crea su cuenta con email y contraseña, su restaurante se guarda en la nube y cualquiera puede visitar los restaurantes de los demás. Solo el dueño puede modificar el suyo; lo controla la base de datos (`supabase/schema.sql`).

## Probarlo en tu computadora

```bash
npm install
cp .env.example .env.local   # y pega tus claves de Supabase
npm run dev
```

## Publicarlo

### 1. Crear la base de datos en Supabase

1. Crea una cuenta gratis en https://supabase.com y un proyecto nuevo.
2. Ve a **SQL Editor**, pega el contenido de `supabase/schema.sql` y toca **Run**.
3. En **Project Settings > API** copia la **Project URL** y la clave **anon public**. Ambas son públicas y pueden ir en el juego.

### 2. Publicar el juego en Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En https://vercel.com toca **Add New > Project** e importa ese repositorio. Vercel reconoce Vite solo.
3. Antes de publicar, en **Environment Variables** agrega:
   - `VITE_SUPABASE_URL` con la Project URL
   - `VITE_SUPABASE_ANON_KEY` con la clave anon public
4. Toca **Deploy**. Vercel te da una dirección como `https://ciudad-sabrosa.vercel.app`.

### 3. Conectar los emails de confirmación

En Supabase, ve a **Authentication > URL Configuration** y pon la dirección de Vercel en **Site URL**. Así el enlace del email de confirmación vuelve al juego.

Si prefieres que los jugadores entren sin confirmar el email, desactiva **Confirm email** en **Authentication > Providers > Email**.

## Estructura

- `index.html`: la interfaz (barra superior, tienda y ventanas).
- `src/game.js`: el juego completo (dibujo, simulación, tienda, cuentas y visitas).
- `src/backend.js`: la conexión con Supabase (cuentas y tabla `restaurants`).
- `src/style.css`: los estilos.
- `supabase/schema.sql`: la tabla y los permisos de la base de datos.
