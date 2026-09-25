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

El alcance aprobado del primer lanzamiento se encuentra en
[`docs/mvp-scope.md`](docs/mvp-scope.md).
