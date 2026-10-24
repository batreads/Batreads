"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./author-index.css";

export function AuthorIndex({ name, items, children }: { name: string; items: { id: string; title: string }[]; children: ReactNode }) {
  const content = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const headings = items.map(item => document.getElementById(item.id)).filter((heading): heading is HTMLElement => heading !== null);
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = headings[0];
        for (const heading of headings) if (heading.getBoundingClientRect().top <= 140) current = heading;
        setActive(current?.id ?? "");
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => { window.removeEventListener("scroll", update); cancelAnimationFrame(frame); };
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function close() { dialog.current?.close(); }
  const navigation = (
    <nav aria-label={`Índice de ${name}`}>
      <p className="author-index-label">En esta página</p>
      <ol>{items.map(item => <li key={item.id}>
        <a href={`#${item.id}`} aria-current={active === item.id ? "location" : undefined} onClick={() => {
          close();
          const heading = document.getElementById(item.id);
          heading?.setAttribute("tabindex", "-1");
          requestAnimationFrame(() => heading?.focus({ preventScroll: true }));
        }}>{item.title}</a>
      </li>)}</ol>
    </nav>
  );

  return <div className={`author-index-layout${items.length ? " author-index-ready" : ""}`}>
    {items.length > 0 ? <aside className="author-index-desktop">{navigation}</aside> : null}
    <div className="author-index-content" ref={content}>{children}</div>
    {items.length > 0 ? <>
      <button className="author-index-trigger" type="button" aria-haspopup="dialog" aria-controls="author-index-dialog" aria-expanded={open} onClick={() => { dialog.current?.showModal(); setOpen(true); }}>
        <span aria-hidden="true">☰</span> Índice
      </button>
      <dialog id="author-index-dialog" className="author-index-dialog" ref={dialog} aria-labelledby="author-index-title" onClose={() => setOpen(false)} onClick={event => {
        if (event.target === event.currentTarget && event.clientX > event.currentTarget.getBoundingClientRect().right) close();
      }}>
        <div className="author-index-heading"><span id="author-index-title">{name}</span><button type="button" aria-label="Cerrar índice" onClick={close}>×</button></div>
        {navigation}
      </dialog>
    </> : null}
  </div>;
}
