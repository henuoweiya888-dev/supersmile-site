# Hirose compatible assemblies — research and editorial checkpoint

Status: PUBLISHED and publicly verified after commit a9cc651 on 2026-09-10. Hirose local EN/ZH QA passed at 1280, 390 and 320px; public EN/ZH QA passed at 1280 and 390px, with actual desktop/mobile screenshots inspected. Key connector-systems-07; slug hirose-compatible. Public navigation reports 48 active / 35 pending in six groups. Next sequence entry: connector-systems-08 (JAE compatible), still inactive.

## Purpose and design

Retain the approved compact technical-magazine language, fixed navigation, inquiry and language behavior. Text first; independent relevant small real photos second. The new composition should follow signal paths and connector selection, not copy the Amphenol material-atlas layout. Vary compact full-width explanations, two-column comparisons with short rules, small photo cut-ins and a readable production sequence. No outer frames, table walls, oversized photographs or decorative masks. Paragraph indent 2em in each language. Content must address Google search coverage and practical engineering knowledge without implying universal product qualification.

## Verified reference outline

Reference read 2026-09-10: https://www.ql-custom.com/hirose-wire-harness

Retain these topic families in order, using original prose:

1. Brand overview and connector range.
2. Core products: DF wire-to-board; automotive interfaces and sealing; U.FL/W.FL2 miniature coax.
3. Customized solutions: industrial automation; new-energy automotive; medical equipment; IoT.
4. Product advantages: documented fit; termination/signal control; environment-specific materials; dimensional customization.
5. Industries: consumer electronics, automation, automotive/EV, medical, telecom/networking, robotics/motion, aerospace/defence, smart home/IoT. Explain use-case requirements rather than asserting supplier qualification in every industry.
6. Engineering measures: contact resistance, mating cycles, retention force, ingress protection, repeatable quality control.
7. Matching families: DF, automotive, micro-coax, mixed-function assemblies.
8. Prototype-to-production: design review, components, sample, fit/function, electrical tests, signoff, production, quality control, packaging/labels, shipping.
9. Procurement information and FAQ.

Do not copy customer reviews, four-hour response commitments, blanket genuine-stock statements, zero-loss/never-loosening/lifetime claims or biomedical safety assertions.

## Corrections required before drafting

- The reference abbreviates automotive products as ZE/ZH/GT and treats all as waterproof. Hirose has ZE05 and ZH05; JST separately has ZE and ZH. Keep exact manufacturer and complete family designation. Do not claim Hirose has no ZE/ZH-related families.
- Hirose distinguishes ZE05 internal connections from ZE064W external waterproof interfaces. GT17 is a shielded automotive data family, not a blanket waterproof or traction-power family. Family-specific drawing and test conditions govern each assembly.
- DF51 is a 2mm positive-lock family, not a universal microscopic phone connector. DF13 is 1.25mm; DF11 is 2mm. Pitch alone does not imply mating compatibility.
- U.FL and W.FL2 are distinct miniature coax families. Do not promise negligible loss, universal Wi-Fi/5G bandwidth, unlimited mating or removal by pulling the cable.
- HR10 and HR30 are not interchangeable environmental solutions. HR30 catalogue states IPX7/IPX8 under specified mated conditions; avoid upgrading this into an unconditional finished-harness IP rating.
- GT18W is marked not recommended for new design, with ZE064W as a successor to discuss with the manufacturer. Do not promote it as the default new-design choice or assert drop-in interchangeability.
- Official ZE05/ZE064W overview and older regional pages give different aggregated ratings/options. Avoid a universal numerical voltage/current/wire-range claim; specify the complete part number, applicable revision and active-contact loading.
- An EV control harness is not automatically a high-voltage battery/motor power cable. Medical use requires system-specific safety, cleaning and validation; connector material alone is not a biocompatibility claim.

## Primary technical sources read

- https://www.hirose.com/product/series/DF51
- https://www.hirose.com/en/product/pr/DF51/
- https://www.hirose.com/en/product/pr/Board_to_Wire_Select_Map/
- https://www.hirose.com/en/product/series/GT17
- https://www.hirose.com/en/product/series/GT17H__HN
- https://www.hirose.com/en/product/pr/automotive/
- https://www.hirose.com/en/product/pr/ze05_ze064w/
- https://www.hirose.com/eu/additional/pressreleases/ze05_ze064w_eu_en.html
- https://www.hirose.com/product/series/GT18W
- https://www.hirose.com/product/series/U.FL
- https://www.hirose.com/product/series/W.FL2
- https://www.hirose.com/en/product/document?clcode=CL0321-1456-0-19&documentid=ed_U.FL_CAT&documenttype=Catalog&lang=en&productname=U.FL-LPHF6-062N2D-A-250&series=U.FL
- https://www.hirose.com/en/product/series/HR30
- https://www.hirose.com/en/product/pr/sensing_device/
- https://www.jst-mfg.com/product/index.php?lang=2&series=470
- https://www.jst-mfg.com/product/pdf/eng/eZH.pdf

## Image planning rule

Finalize the bilingual chapters before image selection. Every small heading needs an independently relevant real photo: fine-pitch PCB/connector, antenna/micro-coax, sealed external environment, RF measurement, enclosure routing, mating/inspection, material and application context. Check normalized source URLs against all active pages, inspect every downloaded image, and record commercial-use license/author/source. Avoid recycling the Amphenol images or generic factory photos across all topics. AI is a last resort only after specific real-photo searches fail, with the established natural low-saturation photographic style.

## Next execution step

Hirose work is complete. Continue with JAE when requested: verify its corresponding reference outline and current official connector documentation, then original copy, independent photographs, category-specific composition and local/public QA. Preserve unrelated dirty files. Do not regenerate earlier approved pages through the legacy all-category builder.

## Implementation checkpoint

- Original bilingual draft: 36 technical chapters and seven FAQs, with 2,619 English words in chapter prose before captions. Full connector references, series distinctions, assembly-level validation and procurement information are included.
- 38 distinct real-photo files: 33 Commons sources not reused by existing category source URLs and five company-owned workshop photographs. Every chapter has its own image. No AI images. Source, author, license and reference-versus-company boundaries are recorded in stock/hirose/SOURCES.md and bilingual captions.
- Rejected misleading images: forestry caliper, music-band analyzer, rendered IoT gateway and a machine-vision diagram. New-source normalized URL checks found no reused Commons source in the final selection.
- Composition uses interface cut-ins, paired application notes and compact workflow spreads. No decorative masks, card borders or ornamental numbers. Existing fixed header, 2em paragraph indent, inquiry and multilingual navigation are retained.

## Additional technical sources

Local and final public QA: 36 chapters, 37 content figures plus hero; no broken images, overflow, script errors or image-edge failures. Fixed header, language-specific inquiry/back links and FAQ interaction passed. Desktop hover and mobile menu expansion passed; pending entries remain nonlinks. Public checks initially observed old fallback HTML and transient image loads during rollout; a fresh complete four-state rerun passed, and hero returned HTTP 200 image/jpeg. Previous Amphenol category also passed local desktop/mobile EN/ZH regression checks. The QA helper now bounds image readiness and checks content photos instead of awaiting hidden language-menu SVG decode indefinitely. Lighthouse is not installed in the bundled runtime; no Lighthouse score is claimed.

- https://www.hirose.com/en/product/application/Smart-Grid_Smart-Meters
- https://www.hirose.com/en/product/pr/Signal_Bee/
- https://www.hirose.com/en/product/harness
- https://www.tek.com/en/documents/product-article/keithley-low-level-measurements-handbook---7th-edition
- https://www.tek.com/en/support/faqs/why-should-i-use-4-wire-ohms-versus-2-wire-ohms
- https://www.keysight.com/us/en/assets/7018-03477/application-notes/5991-0419.pdf
- https://www.keysight.com/us/en/lib/software-detail/programming-examples/method-of-implementation-ethernet-cableinterconnect-compliance-test-solutions-2342312.html
