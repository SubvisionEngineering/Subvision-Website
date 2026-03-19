# Subvision Site

Static replacement site for `subvision.ca`.

## Preview locally

From this folder:

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
