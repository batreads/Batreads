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
