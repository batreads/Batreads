# Alcance del MVP de Batreads

**Estado:** aprobado para implementación

**Marca pública:** Batreads

**Fecha de decisión:** 6 de septiembre de 2026

## 1. Objetivo

Publicar una primera versión de Batreads que permita descubrir, comparar y
consultar historias de dark romance a partir de las fichas editoriales mantenidas
en Notion.

El MVP debe demostrar tres cosas:

1. Que una ficha editada y publicada en Notion puede convertirse en una página
   web completa sin duplicar contenido.
2. Que el catálogo permite encontrar historias por intensidad y características.
3. Que la identidad y el criterio editorial de Batreads son comprensibles desde
   la primera visita.

## 2. Público inicial

Lectores de habla hispana interesados en dark romance que necesitan saber de
antemano el nivel de oscuridad, contenido explícito, toxicidad, violencia,
tropes y warnings de una historia.

## 3. Propuesta de valor

Batreads no será solo un catálogo de libros. Cada ficha explicará:

- qué tipo de experiencia ofrece la historia;
- para qué lector puede funcionar;
- cuándo puede resultar demasiado intensa;
- qué contenido sensible incluye;
- qué leer después si se busca algo parecido, más oscuro o más spicy.

## 4. Páginas incluidas

### Inicio `/`

- Presentación breve de Batreads.
- Buscador o acceso directo al catálogo.
- Historias destacadas.
- Selección de listas editoriales.
- Entrada por niveles de oscuridad.
- Explicación breve del Dark Index.

### Catálogo `/historias`

- Tarjetas con portada, título, autoría, nota y niveles principales.
- Búsqueda por título o autoría.
- Filtros iniciales por Darkness, Spice, Toxicity, Tropes, Love Interest y
  plataforma.
- Orden por nota, oscuridad, spice y fecha de publicación en Batreads.
- Filtros reflejados en la URL para poder compartir resultados.

### Ficha `/historias/[slug]`

- Portada, título, autoría y veredicto.
- Nota global.
- Dark Index: Darkness, Spice, Toxicity, Violence y WTF.
- Valoración de trama, escritura, personajes, romance y originalidad.
- Ideal para y Evita si.
- Tropes, vibes y Love Interest.
- Warnings claramente visibles.
- Reseña editorial.
- Serie y datos bibliográficos.
- Enlaces a editorial, Amazon o plataforma de lectura.
- Historias parecidas y relaciones direccionales cuando existan.

### Listas `/listas` y `/listas/[slug]`

- Índice de listas publicadas.
- Página individual con título, descripción, portada e historias relacionadas.

### Metodología `/metodologia`

- Explicación de las escalas y del Dark Index.
- Diferencia entre intensidad y calidad.
- Criterio editorial y carácter subjetivo de las valoraciones.

### Warnings `/warnings`

- Explicación del sistema de avisos de contenido.
- Indicación de que los warnings pueden no ser exhaustivos.
- Recomendación de revisar cada ficha antes de leer.

### Página no encontrada

- Página 404 coherente con la identidad de Batreads.
- Enlace de regreso al catálogo.

## 5. Fuera del MVP

Quedan expresamente aplazados:

- recorridos o Journeys interactivos;
- cuentas de usuario y autenticación;
- favoritos sincronizados;
- comentarios y valoraciones de la comunidad;
- pagos, suscripciones o tienda;
- algoritmo automático avanzado de similitud;
- bases independientes de autoras, series o editoriales;
- aplicación móvil;
- panel de administración propio;
- Supabase u otra base de datos adicional;
- newsletter y analítica avanzada.

Las relaciones editoriales ya existentes en Notion podrán mostrarse en las
fichas, pero la navegación ramificada de Recorridos se implementará en una fase
posterior.

## 6. Contenido mínimo de lanzamiento

La web podrá considerarse lista para publicar cuando tenga:

- al menos 5 historias completas y marcadas como `Publicada`;
- al menos 2 listas editoriales publicadas;
- portada web estable para cada historia;
- slugs únicos;
- veredicto, reseña, Ideal para, Evita si y warnings revisados;
- enlaces externos comprobados;
- metodología y política de warnings publicadas.

Los registros `Pendiente`, `Clasificada` o `Lista` no serán visibles en
producción. El estado `Lista` podrá utilizarse en previews privadas.

## 7. Criterios de éxito

El MVP estará terminado cuando:

- todo el contenido público se obtenga de Notion;
- una persona pueda encontrar una historia mediante búsqueda o filtros;
- cada ficha muestre claramente intensidad, valoración y warnings;
- las páginas funcionen correctamente en móvil y escritorio;
- no se expongan notas internas ni credenciales;
- una modificación editorial pueda revisarse en preview antes de publicarse;
- la rama principal de GitHub despliegue correctamente en Vercel;
- el sitio tenga HTTPS, metadatos básicos, sitemap y páginas indexables.

## 8. Decisiones técnicas de alcance

- Notion será la única fuente de contenido editorial.
- GitHub será la fuente del código y de los recursos web estables.
- Vercel construirá y alojará la aplicación.
- La primera versión se generará principalmente de forma estática.
- La web leerá Notion durante la construcción, no en cada visita.
- Las portadas públicas se almacenarán en el repositorio o en un servicio con
  URL estable; no se dependerá de URLs temporales de Notion.
- No se construirá un backend propio para el MVP.

## 9. Dominio y lanzamiento

La primera publicación utilizará el subdominio gratuito de Vercel, previsiblemente
`batreads.vercel.app`, sujeto a disponibilidad.

La elección y compra del dominio definitivo no bloquea el desarrollo. Cuando se
decida, se conectará al mismo proyecto sin cambiar la arquitectura ni las URLs
internas.

## 10. Próxima fase

La fase siguiente es preparar Notion para publicación:

1. revisar estados y campos públicos;
2. añadir los campos mínimos que faltan;
3. elegir cinco historias de lanzamiento;
4. preparar dos listas públicas;
5. normalizar portadas y slugs.
