"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StoryGrid } from "../_components/story-grid";
import { getMood, moodFilters } from "@/lib/moods";
import type { Story } from "@/lib/notion";

type FilterKey = "subgenre" | "tropes" | "relationship" | "rhythm" | "rating" | "dark" | "spicy" | "toxicity" | "violence" | "plot";
type SortKey = "recommended" | "rating" | "dark" | "spicy" | "title";
type FilterDefinition = { key: FilterKey; label: string; options: string[] };

const filterKeys: FilterKey[] = ["subgenre", "tropes", "relationship", "rhythm", "rating", "dark", "spicy", "toxicity", "violence", "plot"];
const ratingOptions = ["3", "3.5", "4", "4.5"];
const sortLabels: Record<SortKey, string> = {
  recommended: "Recomendadas",
  rating: "Mejor valoradas",
  dark: "Más oscuras",
  spicy: "Más spicy",
  title: "Título A–Z",
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
}

function textOptions(stories: Story[], field: "subgenres" | "tropes" | "relationshipTypes") {
  return [...new Set(stories.flatMap((story) => story[field]).map((value) => value.trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));
}

function rhythmOptions(stories: Story[]) {
  return [...new Set(stories.flatMap((story) => story.filterValues["Ritmo"] ?? []))]
    .sort((a, b) => a.localeCompare(b, "es"));
}

function levelOptions(stories: Story[], field: "darkness" | "spice" | "toxicity" | "violence" | "plot") {
  return [...new Set(stories.map((story) => story[field]).filter((value): value is number =>
    value !== null && Number.isInteger(value) && value >= 1 && value <= 5))]
    .sort((a, b) => a - b)
    .map(String);
}

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

function matchesGroup(story: Story, key: FilterKey, values: string[]) {
  if (values.length === 0) return true;
  switch (key) {
    case "subgenre": return values.some((value) => story.subgenres.includes(value));
    case "tropes": return values.some((value) => story.tropes.includes(value));
    case "relationship": return values.some((value) => story.relationshipTypes.includes(value));
    case "rhythm": return values.some((value) => (story.filterValues["Ritmo"] ?? []).includes(value));
    case "rating": return story.rating !== null && values.some((value) => story.rating! >= Number(value));
    case "dark": return story.darkness !== null && values.some((value) => story.darkness === Number(value));
    case "spicy": return story.spice !== null && values.some((value) => story.spice === Number(value));
    case "toxicity": return story.toxicity !== null && values.some((value) => story.toxicity === Number(value));
    case "violence": return story.violence !== null && values.some((value) => story.violence === Number(value));
    case "plot": return story.plot !== null && values.some((value) => story.plot === Number(value));
  }
}

function sortStories(stories: Story[], sort: SortKey) {
  if (sort === "recommended") return stories;
  return [...stories].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title, "es");
    const field = sort === "rating" ? "rating" : sort === "dark" ? "darkness" : "spice";
    const aValue = a[field];
    const bValue = b[field];
    if (aValue === null && bValue !== null) return 1;
    if (aValue !== null && bValue === null) return -1;
    return (bValue ?? 0) - (aValue ?? 0) || a.title.localeCompare(b.title, "es");
  });
}

export function StoriesCatalog({ stories, authorNames }: { stories: Story[]; authorNames: Record<string, string> }) {
  const searchParams = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const filterAreaRef = useRef<HTMLDivElement>(null);
  const filterButtonsRef = useRef<Partial<Record<FilterKey, HTMLButtonElement>>>({});
  const resultsRef = useRef<HTMLDivElement>(null);

  const definitions = useMemo<FilterDefinition[]>(() => [
    { key: "subgenre", label: "Subgénero", options: textOptions(stories, "subgenres") },
    { key: "tropes", label: "Tropes", options: textOptions(stories, "tropes") },
    { key: "relationship", label: "Relación", options: textOptions(stories, "relationshipTypes") },
    { key: "rhythm", label: "Ritmo", options: rhythmOptions(stories) },
    { key: "rating", label: "Valoración", options: ratingOptions },
    { key: "dark", label: "Dark", options: levelOptions(stories, "darkness") },
    { key: "spicy", label: "Spicy", options: levelOptions(stories, "spice") },
    { key: "toxicity", label: "Toxicidad", options: levelOptions(stories, "toxicity") },
    { key: "violence", label: "Violencia", options: levelOptions(stories, "violence") },
    { key: "plot", label: "Trama", options: levelOptions(stories, "plot") },
  ], [stories]);

  const moodParam = searchParams.get("mood");
  const mood = getMood(moodParam ?? undefined);
  const selected = useMemo(() => Object.fromEntries(definitions.map(({ key, options }) => [
    key, [...new Set([...(mood ? moodFilters[mood.slug][key] ?? [] : []), ...searchParams.getAll(key)])]
      .filter((value) => options.includes(value)),
  ])) as Record<FilterKey, string[]>, [definitions, searchParams, mood]);
  const trope = searchParams.get("trope")?.trim() || null;
  const sortParam = searchParams.get("sort");
  const sort: SortKey = sortParam && sortParam in sortLabels ? sortParam as SortKey : "recommended";

  const activeCount = filterKeys.reduce((count, key) => count + Number(selected[key].length > 0), 0) + Number(Boolean(trope));
  const filteredStories = useMemo(() => sortStories(stories.filter((story) =>
    (!trope || normalize(trope) === "dark romance" || story.tropes.some((item) => normalize(item).includes(normalize(trope))))
    && filterKeys.every((key) => matchesGroup(story, key, selected[key]))
  ), sort), [stories, mood, trope, selected, sort]);

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

  function updateUrl(update: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    update(params);
    const query = params.toString();
    window.history.pushState(null, "", `/historias${query ? `?${query}` : ""}`);
  }

  function toggleOption(key: FilterKey, value: string, fromMenu = false) {
    updateUrl((params) => {
      if (mood) {
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
      if (mood) {
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
        <h1>{mood?.label ?? trope ?? "Libros"}</h1>
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
              <p><strong>{filteredStories.length}</strong> {filteredStories.length === 1 ? "libro disponible" : "libros disponibles"} con esta selección</p>
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
        <p role="status"><strong>{filteredStories.length}</strong> {filteredStories.length === 1 ? "libro encontrado" : "libros encontrados"}</p>
        <label>Ordenar: <select value={sort} onChange={(event) => updateUrl((params) => {
          if (event.target.value === "recommended") params.delete("sort");
          else params.set("sort", event.target.value);
        })}>{Object.entries(sortLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      </div>
      {filteredStories.length > 0 ? <StoryGrid stories={filteredStories} authorNames={authorNames} /> : (
        <div className="stories-no-results">
          <h2>No hay libros para esta selección</h2>
          <p>Prueba a quitar algún criterio para ver más lecturas.</p>
          {activeCount > 0 ? <button type="button" onClick={clearAll}>Limpiar filtros</button> : null}
        </div>
      )}
    </>
  );
}
