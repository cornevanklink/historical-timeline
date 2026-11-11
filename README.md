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

Edit `events.json`. Each event has a `category` and Dutch (`nl`) and English (`en`) versions of its `title` and `summary`. Use a signed `year` (negative years are BCE) for year-only events, or use `date` for a specific date. Add `endDate` to show a period; both date fields use `YYYY-MM-DD`:

```json
{
	"date": "1969-07-20",
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

For an event that spans a period, include both dates:

```json
{
  "date": "1914-07-28",
  "endDate": "1918-11-11",
  "category": "conflict",
  "title": {
    "nl": "De Eerste Wereldoorlog",
    "en": "The First World War"
  },
  "summary": {
    "nl": "Een conflict dat Europa en de wereld ingrijpend verandert.",
    "en": "A conflict that profoundly reshapes Europe and the world."
  }
}
```

Events are displayed chronologically, with larger time gaps shown as additional vertical space. The scale is compressed to keep long historical spans readable. Year-only events format negative years as BCE or v.Chr.; dated events show localized dates. The light/dark theme can be selected in the header and is saved in the browser. Available categories are `civilization`, `science`, `conflict`, `culture`, `dutch-history`, and `family-birthdays`.