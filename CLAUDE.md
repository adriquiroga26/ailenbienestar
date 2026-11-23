# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Landing page (single page, in Spanish) for Ailen Bienestar — Reiki, Access Bars, and holistic therapy services in Córdoba, Argentina. Static site, no framework, no build step, no package manager.

## Running locally

There is no build/lint/test tooling. Open `index.html` directly in a browser, or serve the directory with any static file server / editor Live Server extension.

## Architecture

- `index.html` — the entire site (single page, anchor-based navigation: `#inicio`, `#servicios`, `#actividades`, `#sobre-mi`, `#contacto`). All service detail content lives in `<template>` tags at the bottom of the file (`#tpl-reiki`, `#tpl-reiki-distancia`, `#tpl-iniciaciones`, `#tpl-access-bars`), keyed by the `data-service` attribute on each card's "Saber más" button.
- `js/main.js` — single vanilla-JS file, no dependencies, wired up in one `DOMContentLoaded` listener. Handles: mobile nav toggle, scroll-reveal animations (`IntersectionObserver` on `.reveal` elements, respects `prefers-reduced-motion` via CSS), the service-detail modal (clones the matching `<template>` into `#modalOverlay`/`#modalBody`), footer year, back-to-top button, WhatsApp number copy-to-clipboard, and nav scroll-spy (highlights the active section link).
- `js/actividades.js` — the only file to edit to add/remove upcoming activities (`window.ACTIVIDADES`, one object per date). `main.js` renders the calendar in `#calendar` and the detail in `#activityPanel`, marking days automatically; it's a `.js` (not JSON) so it works when opening `index.html` via `file://`. Also in `main.js`: the hero photo is injected only if `assets/img/hero.jpg` exists.
- `css/styles.css` — all styling, driven by CSS custom properties defined in `:root` (cream/purple/gold palette: `--bg`, `--purple`, `--gold`, `--card`, etc.). Breakpoints: 1100px (cards 2 cols), 900px (activities/about stack), 760px (nav collapses to hamburger), 560px (cards 1 col). Backup of the pre-redesign site: `../ailen-bienestar-backup-2026-11-23`.
- `assets/img/` — site images, referenced directly by relative path.
- `robots.txt` / `sitemap.xml` — point at the production domain `https://ailenbienestar.com.ar/`.

## Conventions to follow

- Adding a new service card in `index.html` requires three things kept in sync: the `.card` block under `#servicios`, a matching `<template id="tpl-{service}">` with the detail content, and the `data-service="{service}"` attribute on the card's button — `js/main.js` maps between them via that ID suffix.
- The WhatsApp number (`5493516767010` / `+5493516767010`) and email (`ailenbienestar@gmail.com`) appear multiple times across `index.html` (nav CTA, hero, service cards, contact section, `copy-phone` button) — update all occurrences together.
- Commented-out sections in `index.html` (e.g. the Facelift service card/template, an older contact section) are intentionally disabled features kept for reference, not dead code to delete unprompted.
- No CSS/JS build step: write plain CSS (custom properties, no preprocessor) and plain ES5-style JS directly in `css/styles.css` / `js/main.js`.
