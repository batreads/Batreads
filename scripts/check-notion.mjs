const token = process.env.NOTION_TOKEN;
const pageId = process.env.NOTION_TEST_PAGE_ID;

if (!token || !pageId) {
  console.log("Comprobación de Notion omitida: faltan NOTION_TOKEN o NOTION_TEST_PAGE_ID.");
  process.exit(0);
}

const normalizedPageId = pageId.replaceAll("-", "").toLowerCase();

if (!/^[0-9a-f]{32}$/.test(normalizedPageId)) {
  console.error("NOTION_TEST_PAGE_ID debe ser un ID de página de Notion válido.");
  process.exit(1);
}

try {
  const response = await fetch(
    `https://api.notion.com/v1/pages/${normalizedPageId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2026-03-11",
      },
      signal: AbortSignal.timeout(10000),
    },
  );

  if (!response.ok) {
    const hint =
      response.status === 401
        ? "Revisa el token."
        : response.status === 403 || response.status === 404
          ? "Revisa que Batreads Web tenga acceso a la página y que el ID sea correcto."
          : "Revisa el estado de la API de Notion.";

    throw new Error(`Notion respondió ${response.status}. ${hint}`);
  }

  const page = await response.json();

  if (
    page.object !== "page" ||
    page.id?.replaceAll("-", "").toLowerCase() !== normalizedPageId
  ) {
    throw new Error("Notion no devolvió la página solicitada.");
  }

  console.log("Lectura de la página autorizada en Notion: correcta.");
} catch (error) {
  console.error(
    `Comprobación de Notion fallida: ${error instanceof Error ? error.message : "error desconocido"}`,
  );
  process.exitCode = 1;
}
