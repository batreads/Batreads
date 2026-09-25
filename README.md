# Batreads

Batreads es una guía editorial de dark romance centrada en el descubrimiento de
historias mediante valoraciones de intensidad, tropes, warnings y recomendaciones
editoriales.

## Estado del proyecto

El proyecto está en desarrollo del MVP.

- Marca pública: **Batreads**
- Fuente editorial: Notion
- Repositorio: GitHub
- Aplicación web: Next.js + TypeScript + App Router
- Despliegue: Vercel desde `main`

## Desarrollo local

Requiere Node.js 20.9 o posterior y pnpm.

```bash
pnpm install
pnpm dev
```

La aplicación usa Next.js con App Router en `app/`. Las variables locales se
guardan en `.env.local`, que está excluido de Git.

## Variables de entorno locales

`.env.example` enumera las variables necesarias: `NOTION_TOKEN`, los IDs de las
fuentes **Historias**, **Autoras**, **Sagas** y **SEO/Listas**, y
`NEXT_PUBLIC_SITE_URL`. Cópialas a `.env.local` en tu equipo y a las variables
del proyecto en Vercel. No compartas ni subas el token a GitHub.

Los IDs son de **fuentes de datos** de Notion, que son los que se usarán para
consultar los registros. `NEXT_PUBLIC_SITE_URL` vale `http://localhost:3000`
en local y debe contener la URL pública en Vercel para las URLs canónicas.

## Publicación desde Notion

Las páginas se generan desde `lib/notion`; añadir un registro publicado no
requiere crear un archivo de ruta. Las consultas y las páginas se revalidan
aproximadamente cada hora.

- **Historias:** deben tener `Estado ficha = Publicada` y
  `Publicación Batreads = Publicar`.
- **Autoras:** aparecen si están `Publicada` o si tienen una historia publicada.
  La biografía y la introducción solo aparecen con estado `Lista` o `Publicada`.
- **Sagas:** aparecen si su ficha está `Publicada` o si contienen una historia
  publicada. La descripción y la introducción solo aparecen con estado `Lista`
  o `Publicada`.
- **SEO/Listas:** solo aparecen con `Estado = Publicado`. La URL procede de
  `Ruta`; las páginas de la sección `listas` aparecen además en `/listas`.
  Las colecciones dinámicas utilizan los filtros configurados en Notion y solo
  muestran historias publicadas.

Las relaciones de Notion generan enlaces entre historias, autoras, sagas y
listas. Por ahora toda la web envía `noindex` hasta que se conecte el dominio
definitivo; cambiar de dominio no retira esa instrucción automáticamente.

## Comprobación de acceso a Notion

Durante la compilación, `scripts/check-notion.mjs` lee una página autorizada si
están definidas `NOTION_TOKEN` y `NOTION_TEST_PAGE_ID`. Una respuesta incorrecta
detiene la compilación sin mostrar el token ni el contenido de la página.

`NOTION_TEST_PAGE_ID` es una variable opcional con el identificador que
aparece al final del enlace de una página de Notion. Si falta alguna variable,
la comprobación se omite para permitir el desarrollo local sin credenciales.

El alcance aprobado del primer lanzamiento se encuentra en
[`docs/mvp-scope.md`](docs/mvp-scope.md).
