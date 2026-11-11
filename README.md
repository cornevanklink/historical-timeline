# A Brief History

A bilingual, static historical timeline. It runs without a build step and can be hosted on GitHub Pages.

## Run locally

From the project directory, start a local web server:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish on GitHub Pages

In the repository settings, open **Pages**, select the branch containing the site and the repository root (`/`), then save. GitHub Pages serves `index.html` directly; no build command is needed.

## Add or edit events

Edit `events.json`. Each event has a signed `year` (negative years are BCE), a `category`, and Dutch (`nl`) and English (`en`) versions of its `title` and `summary`:

```json
{
	"year": 1969,
	"category": "science",
	"title": {
		"nl": "Eerste maanlanding",
		"en": "First Moon landing"
	},
	"summary": {
		"nl": "Apollo 11 brengt de eerste mensen naar het maanoppervlak.",
		"en": "Apollo 11 carries the first people to the lunar surface."
	}
}
```

Events are displayed chronologically; the year is formatted as BCE or v.Chr. for negative years. Available categories are `civilization`, `science`, `conflict`, and `culture`.