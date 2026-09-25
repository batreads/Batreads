# Batreads

Batreads es una guía editorial de dark romance centrada en el descubrimiento de
historias mediante valoraciones de intensidad, tropes, warnings y recomendaciones
editoriales.

## Estado del proyecto

El proyecto está en fase de definición y preparación del MVP.

- Marca pública: **Batreads**
- Fuente editorial: Notion
- Repositorio: GitHub
- Aplicación web: Next.js + TypeScript (base inicial)
- Despliegue previsto: Vercel

## Desarrollo local

Requiere Node.js 20.9 o posterior y pnpm.

```bash
pnpm install
pnpm dev
```

La aplicación usa Next.js con App Router en `app/`. La página inicial es una
base provisional para el desarrollo del MVP. Las variables locales se guardan
en `.env.local`, que está excluido de Git.

## Variables de entorno locales

`.env.example` enumera las variables necesarias. En este checkout, `.env.local`
ya contiene `NEXT_PUBLIC_SITE_URL` y los IDs de las fuentes de datos de las
bases **Historias**, **Autoras**, **Sagas** y **SEO/Listas**. Falta pegar el valor
de `NOTION_TOKEN` en ese archivo para consultar Notion desde el servidor local;
no lo compartas ni lo subas a GitHub. El token configurado en Vercel se usa
solo en los despliegues de Vercel y no se copia automáticamente al equipo.

Los IDs son de **fuentes de datos** de Notion, que son los que se usarán para
consultar los registros. `NEXT_PUBLIC_SITE_URL` vale `http://localhost:3000`
en local; cuando la web use esta variable en producción, habrá que definirla
también en Vercel con el dominio público definitivo.

## Comprobación de acceso a Notion

Durante la compilación, `scripts/check-notion.mjs` lee una página autorizada si
están definidas `NOTION_TOKEN` y `NOTION_TEST_PAGE_ID`. Una respuesta incorrecta
detiene la compilación sin mostrar el token ni el contenido de la página.

En Vercel, configura ambas variables en **Project → Settings → Environment
Variables**. `NOTION_TEST_PAGE_ID` es el identificador de 32 caracteres que
aparece al final del enlace de una página de Notion. Si falta alguna variable,
la comprobación se omite para permitir el desarrollo local sin credenciales.

El alcance aprobado del primer lanzamiento se encuentra en
[`docs/mvp-scope.md`](docs/mvp-scope.md).
