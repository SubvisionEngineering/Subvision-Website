# Subvision Redesign Preview

This folder contains the new multi-page Subvision site and its local visual editor, kept separate from the current live site files.

## Why it is separated

- It is not meant to replace the current root site yet.
- It can be pushed to a non-live branch for review without changing GitHub Pages.
- The entire redesign, media package, and local editor stay grouped in one place.

## Contents

- `site/`
  - the redesigned static website
  - the local-only `studio.html` editor
  - assets, media, and layout override data
- `serve_preview.py`
  - local preview server with direct save support for `layout-overrides.json`

## Recommended GitHub usage

Keep this folder on a separate branch such as `codex/redesign-preview` or another non-production review branch.

Do not point GitHub Pages at this branch until you are ready to switch the live site.

## Local review

From inside `redesign-preview`:

```powershell
python serve_preview.py
```

Then open:

- `http://127.0.0.1:8123/site/`
- `http://127.0.0.1:8123/site/studio.html`

## Promotion later

When you want this redesign to become the live site, promote the contents of `site/` into the repo root or into the branch/path used by GitHub Pages.
