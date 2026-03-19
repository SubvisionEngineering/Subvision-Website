# Subvision Site

Static replacement site for `subvision.ca`.

## Preview locally

From `C:\Users\aliha\Desktop\Code`:

```powershell
python serve_subvision.py
```

Then open:

- [http://127.0.0.1:8123/](http://127.0.0.1:8123/)
- [http://127.0.0.1:8123/studio.html](http://127.0.0.1:8123/studio.html)

## Push preview updates

From this folder:

```powershell
powershell -ExecutionPolicy Bypass -File ".\push-preview.ps1"
```

That will:

- sync the latest local site into the GitHub preview repo clone
- commit the `codex/redesign-preview` branch if anything changed
- push the preview branch to GitHub

You can also use the `Save + Push Preview` button inside the studio when `serve_subvision.py` is running.

## Legacy static preview

If you only want a simple file server without studio save/publish support:

```powershell
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Structure

- `index.html`
- `technology.html`
- `impact.html`
- `team.html`
- `contact.html`
- `assets/css/site.css`
- `assets/js/site.js`
- `assets/media/`

## Notes

- The site is framework-free and does not require Node.
- The excluded Oppfest video is intentionally not part of this build.
- Local JPG/PNG assets were converted into lighter web variants where possible.
- HEIC files were not used because local conversion support was unavailable in this environment.
