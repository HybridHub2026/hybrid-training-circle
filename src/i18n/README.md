# Site languages

Portuguese remains at the original URLs. Spanish uses `/es` and `/es/<page>`;
English uses `/en` and `/en/<page>`.
The selector preserves the page, search parameters and hash. Internal navigation
stays in the selected language; no preference cookies or browser storage are used.

Shared components render the Portuguese source through `T`. Add the corresponding
Spanish and English text to `es.json` and `en.json` when adding or editing public copy. `Localized` handles
image descriptions, input placeholders, accessible labels and regular anchors;
the local `Link` wraps the router for translated destinations. Keep the brand slogan,
addresses, product names and the app screenshots unchanged.

Each translated route shares its original page component and metadata. `spanishHead`
and `englishHead` translate metadata and supply a local canonical plus reciprocal language
alternatives. New pages need both routes, translations and entries in the sitemap.

Validation: `npm test`, `npm run build`, and, with the preview running,
`node scripts/verify-locales.mjs http://127.0.0.1:8081`.
