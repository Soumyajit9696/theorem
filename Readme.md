# Theorem — LaTeX to PNG Converter

<div align="center">

<img src="https://github.com/user-attachments/assets/10d0a27a-03dc-49f0-8038-6303b1f3fcb4" width="150" alt="Theorem app icon" />

# 𝕿𝖍𝖊𝖔𝖗𝖊𝖒

### Turn mathematical expressions into beautiful images.

A fast, free, privacy-first LaTeX equation editor and image generator.

**Write LaTeX. Preview instantly. Export beautifully.**

[**Homepage**](https://soumyajit9696.github.io/theorem/) · [**Open Web App →**](https://soumyajit9696.github.io/theorem/app/) · [**Download Desktop App**](https://github.com/Soumyajit9696/theorem/releases/latest)

<br>

[![License: MIT](https://img.shields.io/badge/License-MIT-0E7490?style=flat-square)](LICENSE)
[![Client-side](https://img.shields.io/badge/Processing-100%25%20Client--Side-A21CAF?style=flat-square)](https://soumyajit9696.github.io/theorem/app/)
[![Web App](https://img.shields.io/badge/Platform-Web-1F6E43?style=flat-square)](https://soumyajit9696.github.io/theorem/app/)
[![Desktop](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-C2440C?style=flat-square)](https://github.com/Soumyajit9696/theorem/releases/latest)

</div>

---

## Overview

**Theorem** is a LaTeX-to-image converter that transforms mathematical expressions into high-quality graphics. Write or paste your LaTeX, preview the rendered equation in real time, customize its appearance, and export it in the format you need.

Whether you're preparing lecture notes, research papers, presentations, scientific posters, documentation, or educational content, Theorem makes mathematical typesetting simple.

- **Live rendering** powered by MathJax 3.
- **Multiple export formats** for documents, presentations, and the web.
- **Transparent backgrounds** for seamless integration into your workflow.
- **Vector graphics** for sharp output at any scale.
- **Privacy-first processing** without uploading your equations to a server.
- **Web and desktop editions** for flexible access.

## Features

### Export & graphics

| Feature | Description |
|---|---|
| PNG | High-quality equation images with transparency support |
| WebP | Compact images with transparency support |
| JPG | Images with customizable solid backgrounds |
| SVG | Standalone vector graphics |
| PDF | Vector PDF export when the required libraries support it |
| Resolution control | Export at 1×–6× scale |
| Dimension preview | Inspect output dimensions before exporting |
| Clipboard | Copy images, SVG markup, LaTeX source, and data URIs |
| Shareable equations | Generate links containing your equation |

### LaTeX editing

| Feature | Description |
|---|---|
| Live preview | See mathematical expressions update as you type |
| Autocomplete | Complete commands and environment skeletons with `Tab` |
| Equation environments | Support for `equation`, `align`, `gather`, `cases`, `split`, matrices, and arrays |
| Smart input | Handle pasted fragments, display-math delimiters, comments, labels, and supported document wrappers |
| `.tex` support | Open, save, and drag-and-drop LaTeX source files |
| Render history | Return to recent equations |
| Templates | Explore 40+ examples covering mathematics, physics, chemistry, and more |
| Quick reference | Search approximately 160 commands with rendered examples |
| Symbol palette | Insert Greek letters, operators, relations, arrows, and other symbols |

### Appearance & customization

- Customize equation color, font size, background, and padding.
- Choose transparent or solid backgrounds.
- Adjust rounded corners and frame presets.
- Apply independent colors to selected parts of an equation.
- Switch between dark and light themes.
- Retain supported settings between sessions.

### Desktop edition

The Electron-based desktop edition extends the web experience with native desktop integration.

- Windows, macOS, and Linux packaging.
- Native application menus and status bar.
- Drag rendered equations into supported applications or folders.
- Local MathJax and export-library assets for offline operation.
- Automatic updates when the release and updater configuration support them.

## Getting started

### Use Theorem online

No installation required.

1. Open the [Theorem Web App](https://soumyajit9696.github.io/theorem/app/).
2. Type or paste your LaTeX expression.
3. Customize the appearance and output settings.
4. Choose your desired export format.
5. Export or copy your equation.

For example, enter:

```latex
\[
E = mc^2
\]
```

Or try a more advanced expression:

```latex
\begin{align}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \times \mathbf{B} &=
\mu_0 \mathbf{J} +
\mu_0 \varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{align}
```

### Run the web app locally

The web edition uses static HTML, CSS, and JavaScript.

```bash
git clone https://github.com/Soumyajit9696/theorem.git
cd theorem
```

You can open `app/index.html` directly or serve the repository locally:

```bash
npx serve .
```

Then open the local URL printed by the server.

### Run the desktop app

Install [Node.js](https://nodejs.org/) first.

```bash
cd desktop
npm install
npm start
```

This launches the desktop app in development mode.

## Build desktop installers

The desktop application uses Electron. The exact build commands depend on the scripts defined in `desktop/package.json`.

Typical commands are:

```bash
npm run dist:win
npm run dist:mac
npm run dist:linux
```

| Operating system | Output |
|---|---|
| Windows | `.exe` installer |
| macOS | `.dmg` installer |
| Linux | `.AppImage` and/or `.deb` |

Build each platform on its supported operating system or use a configured CI workflow. See [the latest desktop releases](https://github.com/Soumyajit9696/theorem/releases/latest) for available installers.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/⌘ + S` | Export in the current format |
| `Ctrl/⌘ + Shift + C` | Copy PNG to the clipboard |
| `Ctrl/⌘ + D` | Duplicate the current line |
| `Ctrl/⌘ + /` | Comment or uncomment a line |
| `Tab` | Accept autocomplete |
| `Esc` | Close panels |

*Shortcut availability may vary by platform and application context.*

## Frequently asked questions

<details>
<summary><strong>How do I convert LaTeX to PNG?</strong></summary>

Open the [web app](https://soumyajit9696.github.io/theorem/app/), enter your expression, and select PNG export. Choose your preferred resolution, colors, and background before exporting.

</details>

<details>
<summary><strong>Can I export equations with transparent backgrounds?</strong></summary>

Yes. Select the transparent background option for PNG or WebP. JPEG does not support transparency, so transparent areas must be filled with a solid color.

</details>

<details>
<summary><strong>Is Theorem free?</strong></summary>

Yes. Theorem is released under the MIT License. See the [LICENSE](LICENSE) file for the applicable terms.

</details>

<details>
<summary><strong>Are my equations uploaded to a server?</strong></summary>

The web edition processes equations in your browser and does not require an equation-processing backend. Browser-local settings may be stored in local storage. Desktop-specific features may have their own network requirements, such as update checks.

</details>

<details>
<summary><strong>Can I use Theorem offline?</strong></summary>

The desktop edition is designed to bundle its rendering and export dependencies locally. Offline availability depends on the packaged assets and the feature being used. The hosted web edition requires an initial connection to load the application.

</details>

<details>
<summary><strong>Which export formats are available?</strong></summary>

PNG, WebP, JPG, SVG, and PDF are supported. PDF output can be vector-based when the SVG-to-PDF libraries are available; fallback behavior depends on the implementation.

</details>

## Project structure

```text
theorem/
├── index.html
├── sw.js
├── app/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
├── desktop/
│   ├── main.js
│   ├── preload.js
│   ├── package.json
│   ├── build/
│   │   └── icon.png
│   └── renderer/
│       ├── index.html
│       ├── style.css
│       ├── script.js
│       ├── desktop-app.js
│       └── vendor/
├── .github/
│   └── workflows/
├── robots.txt
├── sitemap.xml
└── LICENSE
```

*The tree is illustrative; adjust it to match the files in the repository.*

## Technology stack

| Technology | Purpose |
|---|---|
| HTML, CSS, JavaScript | User interface and application logic |
| MathJax 3 | LaTeX parsing and mathematical SVG rendering |
| Electron | Desktop application |
| jsPDF | PDF generation |
| svg2pdf.js | SVG-to-PDF conversion |
| GitHub Pages | Static web hosting |
| GitHub Actions | Automated builds and releases |

### Acknowledgements

- [MathJax](https://www.mathjax.org/) — mathematical typesetting.
- [jsPDF](https://github.com/parallax/jsPDF) — PDF generation.
- [svg2pdf.js](https://github.com/yWorks/svg2pdf.js) — SVG-to-PDF conversion.
- [Fraunces](https://fonts.google.com/specimen/Fraunces) and [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) — typography.

## Deployment

The web edition is hosted on GitHub Pages.

- **Homepage:** https://soumyajit9696.github.io/theorem/
- **Web app:** https://soumyajit9696.github.io/theorem/app/

To deploy updates, push your changes to the configured GitHub Pages branch. Confirm the repository's Pages settings and workflow match your deployment setup.

Desktop release automation is managed separately through GitHub Actions. Consult the repository's workflow configuration for the exact release triggers and artifact names.

## Author

<div align="center">

**Soumyajit Das**

MSc Physics · Computational Materials Science · Software Development

[GitHub](https://github.com/Soumyajit9696) · [Portfolio](https://soumyajit9696.github.io/) · [Theorem](https://soumyajit9696.github.io/theorem/)

</div>

## License

Theorem is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Theorem**

*Write equations. Create possibilities.*

Made with care by [Soumyajit Das](https://github.com/Soumyajit9696).

</div>
