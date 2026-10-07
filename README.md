# Batreads

Batreads es un sitio editorial de dark romance centrado en el descubrimiento de
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

`.env.example` enumera `NOTION_TOKEN`, los IDs de las fuentes **Historias**,
**Autoras**, **Sagas** y **SEO/Listas**, y `NEXT_PUBLIC_SITE_URL`. Configura el
token y los IDs en `.env.local` y en las variables del proyecto en Vercel. No
compartas ni subas el token a GitHub.

Los IDs son de **fuentes de datos** de Notion, que son los que se usan para
consultar los registros. `NEXT_PUBLIC_SITE_URL` figura en `.env.example`, pero
el código actual no la utiliza. Las URLs canónicas y del sitemap se fijan en
`https://www.batreads.com` mediante `lib/site-url.ts`. Si se cambia de dominio,
hay que revisar ese archivo y la configuración del dominio en Vercel.

## Publicación desde Notion

Las páginas se generan desde `lib/notion`; añadir un registro publicado no
requiere crear un archivo de ruta. Las consultas y las páginas se revalidan
aproximadamente cada hora.

- **Historias:** deben tener `Estado ficha = Publicada` y
  `Publicación Batreads = Publicar`.
- **Autoras:** aparecen si `Estado = Publicada`. Como excepción de continuidad,
  nueve fichas concretas que ya eran públicas siguen apareciendo mientras su
  estado no sea `Descartada`. Tener una historia publicada no publica por sí
  solo una ficha nueva de autora. La biografía y la introducción se muestran
  cuando esos campos tienen contenido.
- **Sagas:** solo aparecen si `Estado ficha = Publicada`; relacionarlas con una
  historia publicada no basta. La publicación se decide manualmente en Notion:
  no hay una regla automática basada en el número de libros. La descripción y
  la introducción se muestran cuando esos campos tienen contenido. Para mostrar
  libros que aún no tienen ficha en Batreads,
  añade a la saga una propiedad de texto `Títulos en orden` en Notion, con un
  título por línea (en orden de lectura). La posición de cada línea corresponde
  al `N.º en saga`; los títulos aparecen aunque no exista edición en español.
  La ficha publicada, si existe, prevalece sobre el título de esa lista.
- **SEO/Listas:** se incluyen los registros con `Estado = Publicado` que estén
  identificados como listas por `Sección web`, `Ruta` o su plantilla. Su URL
  canónica es `/listas/<Slug>`; si `Ruta` contiene otro camino válido, ese
  camino redirige permanentemente a la URL canónica. Las listas publicadas
  aparecen en `/listas`. Las colecciones dinámicas utilizan los filtros
  configurados en Notion y solo muestran historias publicadas.

Las relaciones de Notion generan enlaces entre historias, autoras, sagas y
listas. La publicación en Notion y la inclusión en buscadores son cuestiones
distintas: `robots.txt` permite el rastreo general y anuncia `/sitemap.xml`.
El sitemap incluye las rutas públicas de historias, autoras y sagas; de las
páginas SEO/Listas solo incluye aquellas con `Indexable` activado. **Desactivar
`Indexable` no añade una metaetiqueta `noindex` ni impide acceder a la página**:
solo la omite del sitemap. Actualmente `/componentes` sí declara `noindex` de
forma explícita. No hay un `noindex` global para la web o las vistas previas.
El sitemap se genera en cada petición, aunque las consultas a Notion conservan
una caché aproximada de una hora.

## Comprobación de acceso a Notion

Durante la compilación, `scripts/check-notion.mjs` lee una página autorizada si
están definidas `NOTION_TOKEN` y `NOTION_TEST_PAGE_ID`. Una respuesta incorrecta
detiene la compilación sin mostrar el token ni el contenido de la página.

`NOTION_TEST_PAGE_ID` es una variable opcional con el identificador que
aparece al final del enlace de una página de Notion. Si falta alguna variable,
la comprobación se omite para permitir el desarrollo local sin credenciales.

El alcance aprobado del primer lanzamiento se encuentra en
[`docs/mvp-scope.md`](docs/mvp-scope.md).
