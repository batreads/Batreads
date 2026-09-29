const koFiPage = "https://ko-fi.com/batreads";
const koFiWidget = `${koFiPage}/?hidefeed=true&widget=true&embed=true&preview=true`;

export function KofiWidget() {
  return (
    <div className="support-kofi-widget">
      <iframe
        id="kofiframe"
        src={koFiWidget}
        title="batreads"
        height="712"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <a href={koFiPage} target="_blank" rel="noopener noreferrer">
        Abrir Ko-fi en otra pestaña <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
