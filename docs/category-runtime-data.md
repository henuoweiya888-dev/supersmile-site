# Category data delivered to browsers

`data/product-category-details.json` remains the authoritative editorial source.
After editing it, rebuild the browser data before deploying:

```sh
node tools/build_category_runtime_data.mjs
node --test tests/category-runtime-data.test.mjs
```

The generated `data/product-category-index.json` keeps publication state, the
localized overview and inquiry labels for every category. Complete editorial
records live in `data/product-category-pages/<category-key>.json`. The page's
existing `SS_PRODUCT_CATEGORY.key` selects the one record it needs.

Normal home, product, directory and contact visits load the summary index only.
A category page additionally loads its own record. When that record is
unavailable, the initial HTML remains visible. If the summary index itself is
unavailable, the previous combined source is the compatibility fallback.

The tests compare every generated record with the authoritative source, check
all English and Chinese inquiry labels, verify request scope, and exercise both
failure paths. Upload the index and category records with the main script in
the same deployment. When changing the data, advance its query revision in
`loadData()` along with the site's main-script revision.
