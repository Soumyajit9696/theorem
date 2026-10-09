
# Theorem — LaTeX to PNG Converter & Equation Image Generator

![Theorem](assets/og.png)

[![Live app](https://img.shields.io/badge/live-app-C2440C?style=flat-square)](https://soumyajit9696.github.io/theorem/)
[![License: MIT](https://img.shields.io/badge/license-MIT-1F6E43?style=flat-square)](LICENSE)
[![100% client-side](https://img.shields.io/badge/100%25-client--side-0E7490?style=flat-square)](https://soumyajit9696.github.io/theorem/)
[![Built by Soumyajit Das](https://img.shields.io/badge/built%20by-Soumyajit%20Das-A21CAF?style=flat-square)](https://github.com/Soumyajit9696)

> **Convert LaTeX to PNG** — render equations live and export transparent PNG, SVG, JPG or
> true-vector PDF images. Free, private, no signup.
> Built by [Soumyajit Das](https://github.com/Soumyajit9696).

**[ TRY THE LIVE APP → ](https://soumyajit9696.github.io/theorem/)**

Theorem is a **LaTeX to PNG / LaTeX to image** converter that runs entirely in your browser.
Type or paste LaTeX, watch it typeset in milliseconds, then press it out as a crisp image for
slides, papers, notes, documentation — or anywhere you need a math equation as an image.

## Why Theorem for LaTeX → PNG?

- **Transparent backgrounds** — exported PNGs keep their alpha channel, so equations drop
  cleanly onto slides, Notion, docs, and dark backgrounds.
- **True vector exports** — standalone SVG and vector PDF (via jsPDF + svg2pdf), crisp at any zoom.
- **1×–6× resolution scale** with a live pixel-dimension readout before you export.
- **Full customization** — ink color, font size, background color, padding, rounded corners,
  frame presets, and per-selection coloring with its own palette.
- **Complete LaTeX environment support** — `equation`, `align`, `gather`, `cases`, `split`,
  the matrix family, and `array` with rules. Pasted fragments with `$$…$$`, `\[…\]`,
  `\label`, `%` comments, even `\documentclass` wrappers just work.
- **Fast and private** — rendering is MathJax 3 in your browser. Nothing is uploaded anywhere.
- **Zero setup** — no build step, no backend, no account. One HTML file, one CSS, one JS.

## Everything inside

| Feature | Details |
|---|---|
| ⌨️ **Live typesetting** | MathJax 3 SVG output with a millisecond render timer |
| 🧠 **Inline autocomplete** | Type `\` + letters, Tab completes — environment skeletons included |
| 📚 **40+ templates** | Calculus, linear algebra, probability, physics, chemistry, environments |
| 📖 **Quick reference** | ~160 commands with rendered examples, searchable, click-to-insert |
| 🎨 **Selection color** | Highlight parts of an equation, independent of the main ink |
| 📋 **Clipboard** | Copy PNG, SVG markup, LaTeX source, base64 data URI, or a share link |
| 📂 **.tex files** | Open, save, and drag-and-drop `.tex` directly onto the editor |
| 🌓 **Dark & light themes** | Persisted, no flash on load |
| 🕘 **Render history** | Recent equations remembered across sessions |

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/⌘ + S` | export in the current format |
| `Ctrl/⌘ + ⇧ + C` | copy PNG to clipboard |
| `Ctrl/⌘ + D` | duplicate line |
| `Ctrl/⌘ + /` | comment / uncomment line |
| `Tab` | accept autocomplete |
| `Esc` | close panels |

<img width="1763" height="860" alt="image" src="https://github.com/user-attachments/assets/0c6ad2cf-12a1-49d7-98c6-4a4dfc3ca936" />



## FAQ

### How do I convert LaTeX to PNG?

Open the [live app](https://soumyajit9696.github.io/theorem/), type or paste your LaTeX, and press
**Export PNG**. Set the resolution from 1× to 6×, pick the ink color, and choose a transparent or
colored background before exporting.

### Can I export LaTeX equations with a transparent background?

Yes — choose the **Transparent** background mode and the PNG keeps its alpha channel. JPEG has no
alpha, so transparent backgrounds are filled white in `.jpg` exports.

### Is Theorem free, and does it upload my equations?

Theorem is completely free (MIT license) and runs entirely in your browser. Nothing you type is
uploaded anywhere; settings live only in your own browser's localStorage.

### Which formats can I export?

PNG, JPG, SVG (standalone vector), and PDF (true vector when svg2pdf is available, otherwise
rasterized at your chosen scale). You can also copy a base64 data URI for embedding in HTML/CSS,
or a share link that carries the equation in the URL.

## Run it locally

No build step — just open `index.html`, or serve the folder:

    git clone https://github.com/Soumyajit9696/theorem.git
    cd theorem
    npx serve .

### Deploy on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages → Source: Deploy from a branch → main / (root)**.
3. Live at <https://soumyajit9696.github.io/theorem/>

## Project structure

    theorem/
    ├── index.html      app markup + SEO meta & structured data
    ├── style.css       theme (light/dark), layout, components
    ├── script.js       the entire application
    ├── robots.txt
    ├── sitemap.xml
    └── assets/
        └── og.png      1200×630 social preview image

## Tech & credits

- [MathJax 3](https://www.mathjax.org/) — TeX → SVG typesetting
- [jsPDF](https://github.com/parallax/jsPDF) + [svg2pdf.js](https://github.com/yWorks/svg2pdf.js) — PDF export
- [Fraunces](https://fonts.google.com/specimen/Fraunces) & [IBM Plex](https://fonts.google.com/specimen/IBM+Plex+Sans) — typography

## Author

**Soumyajit Das** — [GitHub](https://github.com/Soumyajit9696) · [Theorem repo](https://github.com/Soumyajit9696/theorem)

## License

MIT — see [LICENSE](LICENSE).


Two small notes:

1. The first line `![Theorem](assets/og.png)` shows the hero image — if you haven't added `assets/og.png` yet, GitHub will show a broken-image icon. Either add the screenshot or delete that line.
2. Everything (all links, badges, repo URLs) is already set for `Soumyajit9696/theorem` — no edits needed.
