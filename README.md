# hari-sundhar.github.io

Personal portfolio of Hari Sundhar B, CAD Software Development Engineer.

Live at https://hari-sundhar.github.io

Plain HTML, CSS and JavaScript with no build step.

## Layouts

The site has four layouts with the same content:

| File | Layout | Assets |
|---|---|---|
| `v1.html` | Drawing Sheet | `assets/v1/` |
| `v2.html` | Executive Sidebar | `assets/v2/` |
| `v3.html` | Dark Product | `assets/v3/` |
| `v4.html` | Swiss Résumé | `assets/v4/` |

`index.html` is a copy of whichever layout is the default. Don't edit it directly; edit the `vN.html` file instead.

## Switching the default layout

- Press **Ctrl + Shift + L** on the site, or open it with `?layouts` (for example on a phone), to show the hidden layout bar. Anyone can preview layouts there.
- **Make default** opens the *Set default layout* workflow on GitHub. Click **Run workflow**, pick the layout and run it. It copies `vN.html` to `index.html`, and GitHub Pages updates within a few minutes. Only the repo owner can run it.
- Without the site: Actions tab, then *Set default layout*, then **Run workflow**.

## Editing content

Update the text in each `vN.html` you use. If you change the default layout's file, run the workflow again (or copy it to `index.html`) so the home page picks up the change.

To preview locally, open any `vN.html` in a browser.
