# Site languages

Portuguese remains at the original URLs. Spanish uses `/es` and `/es/<page>`;
English uses `/en` and `/en/<page>`.
The selector preserves the page, search parameters and hash. Internal navigation
stays in the selected language. Initial entry at `/` uses the saved manual choice,
then the first supported browser language, with English as the fallback. Direct
links to other pages retain their URL language. Detection runs once after hydration
and replaces history, preserving the search parameters and hash.

Explicit selector choices save only `pt`, `es` or `en` under `hybridhub-language`
in localStorage. Automatic detection writes nothing. Storage failures never block
navigation. The Cookie Policy documents this preference storage.

Shared components render the Portuguese source through `T`. Add the corresponding
Spanish and English text to `es.json` and `en.json` when adding or editing public copy. `Localized` handles
image descriptions, input placeholders, accessible labels and regular anchors;
the local `Link` wraps the router for translated destinations. Keep the brand slogan,
addresses, product names and the app screenshots unchanged.

Each translated route shares its original page component and metadata. `spanishHead`
and `englishHead` translate metadata and supply a local canonical plus reciprocal language
alternatives. New pages need both routes, translations and entries in the sitemap.
The page list in `pages.json` generates the sitemap during each production build.
Every URL lists all three languages and the default, matching its HTML alternatives.

Validation: `npm test`, `npm run build`, and, with the preview running,
`node scripts/verify-locales.mjs http://127.0.0.1:8081`.
The same check accepts `https://hybridhub.pt` to audit published content, indexing
directives, metadata, language alternatives, structured data, robots and sitemap.
