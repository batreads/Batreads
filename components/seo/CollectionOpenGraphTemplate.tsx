import type { ReactElement } from "react";

export type CollectionOpenGraphTemplateProps = {
  title: string;
  kind: "list" | "guide" | "saga";
  coverUrls: string[];
  backgroundUrl: string;
  logoUrl: string;
};

const labels = {
  list: "SELECCIÓN EDITORIAL",
  guide: "GUÍA DE LECTURA",
  saga: "UN UNIVERSO POR DESCUBRIR",
};

export function CollectionOpenGraphTemplate({
  title,
  kind,
  coverUrls,
  backgroundUrl,
  logoUrl,
}: CollectionOpenGraphTemplateProps): ReactElement {
  const covers = coverUrls.slice(0, 3);
  const titleSize = title.length > 68 ? 51 : title.length > 46 ? 61 : title.length > 30 ? 72 : 84;
  const positions = covers.length === 1
    ? [{ left: 841, top: 159, width: 242, height: 354 }]
    : covers.length === 2
      ? [{ left: 762, top: 198, width: 201, height: 294 }, { left: 927, top: 137, width: 201, height: 294 }]
      : [
        { left: 696, top: 218, width: 182, height: 267 },
        { left: 844, top: 143, width: 201, height: 294 },
        { left: 982, top: 224, width: 156, height: 229 },
      ];

  return (
    <div style={{ width: 1200, height: 630, display: "flex", position: "relative", overflow: "hidden", backgroundColor: "#061d22", color: "#f4f0e8" }}>
      <img src={backgroundUrl} alt="" width={1200} height={630} style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630 }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, background: "linear-gradient(90deg, rgba(3, 18, 22, .91) 0%, rgba(3, 18, 22, .76) 52%, rgba(3, 18, 22, .36) 100%)" }} />

      <img src={logoUrl} alt="Batreads" width={265} height={89} style={{ position: "absolute", left: 65, top: 38, objectFit: "contain" }} />

      <div style={{ position: "absolute", left: 76, top: 155, width: covers.length ? 580 : 1010, display: "flex", flexDirection: "column" }}>
        <span style={{ color: "#b9e8d1", fontFamily: "Geist", fontSize: 18, letterSpacing: 3, textTransform: "uppercase" }}>{labels[kind]}</span>
        <span style={{ display: "flex", marginTop: 33, fontFamily: "Liberation Serif", fontSize: titleSize, lineHeight: 1.04, letterSpacing: -1.5, maxHeight: 278, overflow: "hidden", textShadow: "0 4px 22px rgba(0, 0, 0, .48)" }}>{title}</span>
        <span style={{ display: "flex", marginTop: 25, width: 85, height: 2, backgroundColor: "#b9e8d1" }} />
      </div>

      {covers.map((coverUrl, index) => {
        const position = positions[index];
        return (
          <div key={`${coverUrl}-${index}`} style={{ position: "absolute", ...position, display: "flex", borderRadius: 9, overflow: "hidden", backgroundColor: "#0a3032", boxShadow: "0 23px 42px rgba(0, 0, 0, .62), 0 0 0 1px rgba(213, 243, 228, .23)" }}>
            <img src={coverUrl} alt="" width={position.width} height={position.height} style={{ width: position.width, height: position.height, objectFit: "cover" }} />
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 76, bottom: 43, width: 1048, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", width: 1048, height: 1, backgroundColor: "rgba(185, 232, 209, .45)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15, color: "#c4d5d0", fontFamily: "Geist", fontSize: 17 }}>
          <span>{kind === "saga" ? "SAGAS" : kind === "guide" ? "GUÍAS" : "LISTAS"}  /  BATREADS</span>
          <span>batreads.es</span>
        </div>
      </div>
    </div>
  );
}
