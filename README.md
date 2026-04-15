# Ryan Lindell - Portfolio

Static developer portfolio: **HTML**, **CSS**, and **JavaScript** (no build step).

## Local preview

Open `index.html` in your browser, or serve the folder with any static file server, for example:

```bash
npx --yes serve .
```

## Deploy (GitHub Pages)

Push to the default branch of a `username.github.io` repository (or enable Pages for this repo). The site entry point is `index.html` at the repository root.

**Custom domain:** The `CNAME` file is included for `ryanlindell.com`. Configure the domain in the repository **Settings → Pages → Custom domain** if needed.

### Projects

The projects index (`projects.html`) uses large image cards that link to hand-written pages under `projects/`. Copy `projects/project-template.html` when adding a new write-up, then add a matching `<li>` card on the projects page (with an image in e.g. `mbta/` or `assets/`).
