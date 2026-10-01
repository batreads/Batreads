import type { ReactElement } from "react";

export function HomeOpenGraphTemplate({ backgroundUrl, logoUrl }: { backgroundUrl: string; logoUrl: string }): ReactElement {
  return (
    <div style={{ width: 1200, height: 630, display: "flex", position: "relative", overflow: "hidden", backgroundColor: "#071011", color: "#f8f0e8" }}>
      <img src={backgroundUrl} alt="" width={1200} height={630} style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, background: "linear-gradient(90deg, rgba(3, 13, 14, .72), rgba(3, 13, 14, .53) 48%, rgba(3, 13, 14, .7))" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, background: "linear-gradient(0deg, rgba(3, 13, 14, .78), transparent 27%, transparent 76%, rgba(3, 13, 14, .5))" }} />

      <img src={logoUrl} alt="Batreads" width={360} height={121} style={{ position: "absolute", left: 420, top: 24, objectFit: "contain" }} />

      <div style={{ position: "absolute", left: 110, top: 208, width: 980, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <span style={{ fontFamily: "Geist", fontSize: 19, letterSpacing: 3, color: "#c9eadb" }}>DARK ROMANCE · ROMANTASY</span>
        <span style={{ display: "flex", marginTop: 26, fontFamily: "Liberation Serif", fontSize: 82, lineHeight: 1.04, letterSpacing: -2, textShadow: "0 5px 24px rgba(0, 0, 0, .8)" }}>
          Tu próxima <span style={{ marginLeft: 17, color: "#b9e8d1" }}>obsesión</span>
        </span>
        <span style={{ fontFamily: "Liberation Serif", fontSize: 84, lineHeight: 1.04, letterSpacing: -2, textShadow: "0 5px 24px rgba(0, 0, 0, .8)" }}>empieza aquí.</span>
      </div>

      <div style={{ position: "absolute", left: 76, bottom: 43, width: 1048, display: "flex", flexDirection: "column" }}>
        <div style={{ width: 1048, height: 1, backgroundColor: "rgba(217, 237, 224, .58)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15, color: "#e5e7dc", fontFamily: "Geist", fontSize: 17 }}>
          <span>HISTORIAS INTENSAS · RECOMENDACIONES REALES</span>
          <span>batreads.es</span>
        </div>
      </div>
    </div>
  );
}
