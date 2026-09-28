import type { ReactElement } from "react";

export type OpenGraphTemplateProps = {
  title?: string;
  author?: string | null;
  coverUrl?: string | null;
  eyebrow?: string;
  description?: string;
  variant?: "default" | "story" | "author" | "list" | "saga";
  backgroundUrl: string;
  logoUrl: string;
};

export function OpenGraphTemplate({
  title,
  author,
  coverUrl,
  eyebrow,
  description,
  variant = "default",
  backgroundUrl,
  logoUrl,
}: OpenGraphTemplateProps): ReactElement {
  const hasCover = variant === "story" && Boolean(coverUrl);
  const detail = title?.trim();
  const secondarySize = detail && detail.length > 75 ? 26 : detail && detail.length > 44 ? 30 : 34;

  return (
    <div style={{ width: 1200, height: 630, display: "flex", position: "relative", overflow: "hidden", backgroundColor: "#061d22", color: "#f4f0e8" }}>
      <img src={backgroundUrl} alt="" width={1200} height={630} style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630 }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, background: "linear-gradient(90deg, rgba(3, 18, 22, .88) 0%, rgba(3, 18, 22, .64) 56%, rgba(3, 18, 22, .19) 100%)" }} />

      <div style={{ position: "absolute", left: 68, top: 44, display: "flex" }}>
        <img src={logoUrl} alt="Batreads" width={305} height={102} style={{ objectFit: "contain" }} />
      </div>

      <div style={{ position: "absolute", left: 76, top: hasCover ? 184 : 202, width: hasCover ? 610 : 980, display: "flex", flexDirection: "column" }}>
        <span style={{ color: "#b9e8d1", fontFamily: "Geist", fontSize: 17, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase" }}>
          {eyebrow || (variant === "story" ? "Una historia para perderte" : "Dark romance · Romantasy")}
        </span>
        <span style={{ display: "flex", flexDirection: "column", marginTop: 24, fontFamily: "Liberation Serif", fontSize: hasCover ? 76 : 88, lineHeight: 1.04, letterSpacing: -2, fontWeight: 400, textShadow: "0 4px 22px rgba(0, 0, 0, .42)" }}>
          <span>Tu próxima lectura</span>
          <span style={{ color: "#d5f3e4" }}>está aquí.</span>
        </span>
        {variant !== "default" && detail ? (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 32, maxWidth: hasCover ? 590 : 900 }}>
            <span style={{ color: "#f4f0e8", fontFamily: "Liberation Serif", fontSize: secondarySize, lineHeight: 1.15, fontWeight: 400, maxHeight: 82, overflow: "hidden", textOverflow: "ellipsis" }}>{detail}</span>
            {author ? <span style={{ marginTop: 8, color: "rgba(213, 243, 228, .78)", fontFamily: "Geist", fontSize: 18 }}>de {author}</span> : null}
          </div>
        ) : description ? (
          <span style={{ marginTop: 26, color: "rgba(213, 243, 228, .78)", fontFamily: "Geist", fontSize: 23 }}>{description}</span>
        ) : null}
      </div>

      {hasCover ? (
        <div style={{ position: "absolute", right: 74, top: 103, width: 338, height: 450, display: "flex", borderRadius: 10, overflow: "hidden", backgroundColor: "#0a3032", boxShadow: "0 27px 50px rgba(0, 0, 0, .62), 0 0 0 1px rgba(213, 243, 228, .23)" }}>
          <img src={coverUrl!} alt="Portada del libro" width={338} height={450} style={{ width: 338, height: 450, objectFit: "cover" }} />
        </div>
      ) : null}

      <div style={{ position: "absolute", left: 76, bottom: 50, display: "flex", alignItems: "center", color: "#b9e8d1", fontFamily: "Geist", fontSize: 20, letterSpacing: .4 }}>
        Descúbrela en Batreads <span style={{ marginLeft: 12, fontSize: 28 }}>→</span>
      </div>
      <div style={{ position: "absolute", left: 76, bottom: 94, width: 58, height: 1, backgroundColor: "rgba(185, 232, 209, .66)" }} />
    </div>
  );
}
