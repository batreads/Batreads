"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StoryGrid } from "../_components/story-grid";
import type { Story } from "@/lib/notion";
import { filterKeys, sortLabels, STORIES_PER_PAGE, type FilterDefinition, type FilterKey, type SortKey } from "@/lib/story-catalog";

function selectionLabel(key: FilterKey, values: string[]) {
  if (["dark", "spicy", "toxicity", "violence", "plot"].includes(key)) {
    const levels = values.map(Number).sort((a, b) => a - b);
    if (levels.length > 1 && levels.every((level, index) => index === 0 || level === levels[index - 1] + 1)) {
      return `${levels[0]}–${levels.at(-1)}/5`;
    }
    return levels.map((level) => `${level}/5`).join(", ");
  }
  if (key === "rating") return values.map((value) => `${value}★ o más`).join(", ");
  return values.join(" o ");
}

function paginationItems(page: number, pageCount: number) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  return [...pages].filter((item) => item >= 1 && item <= pageCount).sort((a, b) => a - b);
}

export function StoriesCatalog({
  stories,
  authorNames,
  definitions,
  selected,
  moodLabel,
  hasMood,
  trope,
  sort,
  total,
  page,
  pageCount,
}: {
  stories: Story[];
  authorNames: Record<string, string>;
  definitions: FilterDefinition[];
  selected: Record<FilterKey, string[]>;
  moodLabel: string | null;
  hasMood: boolean;
  trope: string | null;
  sort: SortKey;
  total: number;
  page: number;
  pageCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const filterAreaRef = useRef<HTMLDivElement>(null);
  const filterButtonsRef = useRef<Partial<Record<FilterKey, HTMLButtonElement>>>({});
  const resultsRef = useRef<HTMLDivElement>(null);
  const previousPageRef = useRef(page);
  const shouldScrollToResultsRef = useRef(false);

  const activeCount = filterKeys.reduce((count, key) => count + Number(selected[key].length > 0), 0) + Number(Boolean(trope));

  useEffect(() => {
    if (!openFilter) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!filterAreaRef.current?.contains(event.target as Node)) setOpenFilter(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenFilter(null);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openFilter]);

  useEffect(() => {
    if (!shouldScrollToResultsRef.current || previousPageRef.current === page) {
      previousPageRef.current = page;
      return;
    }

    shouldScrollToResultsRef.current = false;
    previousPageRef.current = page;
    const results = resultsRef.current;
    if (!results) return;

    results.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }, [page]);

  function updateUrl(update: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    update(params);
    params.delete("page");
    const query = params.toString();
    router.push(`/historias${query ? `?${query}` : ""}`, { scroll: false });
  }

  function goToPage(nextPage: number) {
    if (nextPage === page) return;
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage === 1) params.delete("page");
    else params.set("page", String(nextPage));
    shouldScrollToResultsRef.current = true;
    const query = params.toString();
    router.push(`/historias${query ? `?${query}` : ""}`, { scroll: false });
  }

  function toggleOption(key: FilterKey, value: string, fromMenu = false) {
    updateUrl((params) => {
      if (hasMood) {
        params.delete("mood");
        filterKeys.forEach((filterKey) => {
          params.delete(filterKey);
          selected[filterKey].forEach((item) => params.append(filterKey, item));
        });
      }
      const next = selected[key].includes(value) ? selected[key].filter((item) => item !== value) : [...selected[key], value];
      params.delete(key);
      next.forEach((item) => params.append(key, item));
    });
    if (fromMenu) {
      setOpenFilter(null);
      requestAnimationFrame(() => filterButtonsRef.current[key]?.focus());
    }
  }

  function removeContext(key: "mood" | "trope") {
    updateUrl((params) => params.delete(key));
  }

  function removeGroup(key: FilterKey) {
    updateUrl((params) => {
      if (hasMood) {
        params.delete("mood");
        filterKeys.forEach((filterKey) => {
          params.delete(filterKey);
          if (filterKey !== key) selected[filterKey].forEach((value) => params.append(filterKey, value));
        });
      } else {
        params.delete(key);
      }
    });
  }

  function clearAll() {
    updateUrl((params) => {
      [...filterKeys, "mood", "trope"].forEach((key) => params.delete(key));
    });
  }

  return (
    <>
      <header className="page-heading">
        <h1>{moodLabel ?? trope ?? "Libros"}</h1>
        <p>Descubre libros de dark romance con contexto, intensidad y criterio editorial.</p>
      </header>

      <section className="stories-filter-shell" aria-label="Filtros de libros">
        <div className="stories-filter-head">
          <div className="stories-filter-summary" aria-label="Filtros aplicados">
            <div className="stories-filter-intro">
              <span className="stories-filter-kicker">Encuentra tu próxima lectura</span>
              <span className="stories-filter-title">{activeCount === 0 ? "Explora a tu manera" : "Tu selección"}</span>
            </div>
            {activeCount > 0 ? <div className="stories-filter-chips">
              {trope ? <span className="stories-filter-chip">Trope: <strong>{trope}</strong><button type="button" onClick={() => removeContext("trope")} aria-label={`Quitar trope ${trope}`}>×</button></span> : null}
              {definitions.filter(({ key }) => selected[key].length > 0).map(({ key, label }) => (
                <span className="stories-filter-chip" key={key}>
                  {label}: <strong>{selectionLabel(key, selected[key])}</strong>
                  <button type="button" onClick={() => removeGroup(key)} aria-label={`Quitar filtro ${label}`}>×</button>
                </span>
              ))}
            </div> : null}
          </div>
          <div className="stories-filter-actions">
            {activeCount > 0 ? <button className="stories-filter-clear" type="button" onClick={clearAll}>Limpiar todo</button> : null}
            <button className="stories-filter-toggle" type="button" aria-expanded={panelOpen} aria-controls="stories-filter-panel" onClick={() => { setPanelOpen(!panelOpen); setOpenFilter(null); }}>
              <span aria-hidden="true">☷</span> Filtros {activeCount > 0 ? <span className="stories-filter-count">{activeCount}</span> : null}<span className="stories-filter-chevron" aria-hidden="true">⌄</span>
            </button>
          </div>
        </div>
        {panelOpen ? (
          <div className="stories-filter-panel" id="stories-filter-panel" ref={filterAreaRef}>
            <div className="stories-filter-grid">
              {definitions.map(({ key, label, options }) => (
                <div className="stories-filter-group" key={key}>
                  <button ref={(element) => { filterButtonsRef.current[key] = element ?? undefined; }} className={`stories-filter-trigger${selected[key].length ? " is-active" : ""}`} type="button" aria-expanded={openFilter === key} aria-controls={`stories-filter-options-${key}`} onClick={() => setOpenFilter(openFilter === key ? null : key)}>
                    <span>{label}</span>{selected[key].length > 0 ? <span className="stories-filter-group-count">{selected[key].length}</span> : null}<span className="stories-filter-trigger-chevron" aria-hidden="true">⌄</span>
                  </button>
                  {openFilter === key ? (
                    <div className="stories-filter-options" id={`stories-filter-options-${key}`} aria-label={label}>
                      {options.length ? options.map((value) => (
                        <label className="stories-filter-option" key={value}>
                          <input type="checkbox" checked={selected[key].includes(value)} onChange={() => toggleOption(key, value, true)} />
                          <span>{key === "rating" ? `${value}★ o más` : ["dark", "spicy", "toxicity", "violence", "plot"].includes(key) ? `${value}/5` : value}</span>
                        </label>
                      )) : <p className="stories-filter-no-options">Sin opciones disponibles</p>}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="stories-filter-footer">
              <p><strong>{total}</strong> {total === 1 ? "libro disponible" : "libros disponibles"} con esta selección</p>
              <button type="button" onClick={() => {
                setPanelOpen(false);
                setOpenFilter(null);
                requestAnimationFrame(() => resultsRef.current?.scrollIntoView({
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                  block: "start",
                }));
              }}>Ver resultados <span aria-hidden="true">→</span></button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="stories-results-bar" ref={resultsRef}>
        <p role="status"><strong>{total}</strong> {total === 1 ? "libro encontrado" : "libros encontrados"}{total > STORIES_PER_PAGE ? ` · Mostrando ${(page - 1) * STORIES_PER_PAGE + 1}–${Math.min(page * STORIES_PER_PAGE, total)}` : ""}</p>
        <label>Ordenar: <select value={sort} onChange={(event) => updateUrl((params) => {
          if (event.target.value === "recommended") params.delete("sort");
          else params.set("sort", event.target.value);
        })}>{Object.entries(sortLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      </div>
      {total > 0 ? <>
        <StoryGrid stories={stories} authorNames={authorNames} />
        {pageCount > 1 ? <nav className="stories-pagination" aria-label="Paginación de libros">
          <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1}>← Anterior</button>
          <div className="stories-pagination-pages">
            {paginationItems(page, pageCount).map((item, index, items) => <span key={item} className="stories-pagination-item">
              {index > 0 && item - items[index - 1] > 1 ? <span className="stories-pagination-ellipsis" aria-hidden="true">…</span> : null}
              <button type="button" onClick={() => goToPage(item)} aria-current={item === page ? "page" : undefined} aria-label={`Página ${item}`}>{item}</button>
            </span>)}
          </div>
          <button type="button" onClick={() => goToPage(page + 1)} disabled={page === pageCount}>Siguiente →</button>
        </nav> : null}
      </> : (
        <div className="stories-no-results">
          <h2>No hay libros para esta selección</h2>
          <p>Prueba a quitar algún criterio para ver más lecturas.</p>
          {activeCount > 0 ? <button type="button" onClick={clearAll}>Limpiar filtros</button> : null}
        </div>
      )}
    </>
  );
}
