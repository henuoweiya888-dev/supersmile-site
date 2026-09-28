# Native tawk.to chat widget

All public pages use the official tawk.to widget from `assets/js/main.js`. The former custom floating contact menu and its message modal were removed from the public HTML; the normal contact page, email links, and WhatsApp links elsewhere on the site remain.

- Property ID: `6ab9c1af37585d3444b47642`
- Widget ID: `1k3ipp5et`
- Embed URL supplied by the site owner: `https://embed.tawk.to/6ab9c1af37585d3444b47642/1k3ipp5et`

These IDs are public widget identifiers, not account credentials. Never commit the tawk.to login email, password, or private API keys. The widget's greeting, language, availability hours, and offline form are managed in the tawk.to dashboard. One widget is currently used on every language version of the site; separate localized widgets would require additional IDs and routing work.

If the shared JavaScript changes, update its cache version in the public HTML files and in the page generators. Check the home, product, and contact pages at desktop and mobile sizes, confirm only one floating launcher appears, and verify that opening it reaches this property's chat. Do not send a test visitor message unless explicitly needed.

Official references: [adding a widget](https://help.tawk.to/article/adding-a-widget-to-your-website), [finding the widget ID](https://help.tawk.to/article/where-can-i-find-the-property-and-widget-id), [localizing widgets](https://help.tawk.to/article/change-the-widget-or-property-based-on-page-language).
