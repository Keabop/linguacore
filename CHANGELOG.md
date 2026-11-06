# Changelog

## [1.6.0](https://github.com/Keabop/linguacore/compare/v1.5.0...v1.6.0) (2026-11-06)


### Novedades

* add 'Can't speak now' defer option for speaking exercises ([405946a](https://github.com/Keabop/linguacore/commit/405946a1a1878d9ea1abb3cc3136f604c5f4bf03))
* add 'Ya puedo hablar' button to resume speaking in OutputStep ([83013b3](https://github.com/Keabop/linguacore/commit/83013b3450961e2f1a10f222a2f7d3905a7d3286))
* add cefr assessment question datasets ([6881aa9](https://github.com/Keabop/linguacore/commit/6881aa937bd00fe4697d879ebd6d83e452353f93))
* add CEFR Exam Simulator section to the navigation sidebar ([0f9a601](https://github.com/Keabop/linguacore/commit/0f9a60157a1699686c40f5b553cd784dc354a336))
* add CSV direct import validation check to Account.tsx ([462b7c7](https://github.com/Keabop/linguacore/commit/462b7c7b2debb4111f6c48e2f7cbabb531dfa66f))
* add fallback vocabulary support for custom and imported words in ReviewSession ([a7a00d9](https://github.com/Keabop/linguacore/commit/a7a00d9e464b86477da35677bb833e28e8afb03e))
* add favicon shortcut link to index.html pointing to logo.png ([a74df29](https://github.com/Keabop/linguacore/commit/a74df29f0da4beb4eab7dda89fa8bc47a6b77fa2))
* add hardening — error boundaries, retry, offline detection, API security, tests ([20c965f](https://github.com/Keabop/linguacore/commit/20c965fc85d6dd1c224e06572fdb13a8093895b3))
* add legal pages, consent, account deletion and paid-period Pro ([b505bb7](https://github.com/Keabop/linguacore/commit/b505bb736586d0de1832f7ee3bd69a6758fa2383))
* add light/dark theme system with toggle ([df7b6a4](https://github.com/Keabop/linguacore/commit/df7b6a44205a2d8cd1e4bd9a7b09c5550200f209))
* add multi-voice dialogue player utility ([617539a](https://github.com/Keabop/linguacore/commit/617539ac4d92db70e2723d054a2bf849c62ec844))
* add offline fallback banner in OutputStep with link to stories ([8b8e52d](https://github.com/Keabop/linguacore/commit/8b8e52d6e9eface25d01e50466c23c129dc28854))
* add Output system (Writing + Speaking) with AI evaluation ([762928f](https://github.com/Keabop/linguacore/commit/762928f7595b00b87f32b47ba8b0913ba52057d4))
* add SettingsModal with theme, plan management, and logout ([3b7f963](https://github.com/Keabop/linguacore/commit/3b7f9630742a4b1e7b118afcadb224bfd86c3039))
* add useSubscription hook for plan management ([eda1fb4](https://github.com/Keabop/linguacore/commit/eda1fb49e624a1aeb62634a916d846cdab60e3fd))
* **ai:** evaluators and tutor follow the CEFR descriptors of each level ([126093b](https://github.com/Keabop/linguacore/commit/126093bcf9126da21bfd0ce4dcf96d91ed4afee2))
* **ai:** mark writing and speaking with each exam's official criteria ([f2461e5](https://github.com/Keabop/linguacore/commit/f2461e5f763c85f766c9656a71e4302199190fbb))
* **ai:** sample bank and a script that checks the evaluators' bands ([7e4f0fc](https://github.com/Keabop/linguacore/commit/7e4f0fcb5b5605926affc1d5dab1fa7badf908e9))
* align live Dashboard design with high-fidelity landing mockup aesthetic, side-by-side active widgets, and premium greeting ([9e59439](https://github.com/Keabop/linguacore/commit/9e594398deac4dd495fe02560b4a52d7ec203d15))
* **api:** add cancel/reactivate subscription endpoint ([cdb5d77](https://github.com/Keabop/linguacore/commit/cdb5d77d75905194ee33204b21c42960a2f36d08))
* apply Phase 4 touch-ups including TTS accent selector, mutual mute controls, fluid waves, and bottom padding ([b757942](https://github.com/Keabop/linguacore/commit/b75794253b2a348331215fe0ab737fea0d9dc302))
* **audio:** clear notice when the browser has no English voices ([ec33916](https://github.com/Keabop/linguacore/commit/ec339166531429c9644a57e7284582a443a594a0))
* **audio:** Kokoro recordings for every listening and story, and the end-of-level bank they include ([f666c4e](https://github.com/Keabop/linguacore/commit/f666c4e39101254c8c5ee218baf3b1e7a3b6a300))
* **audio:** Kokoro recordings for the A1-B2 stories of phases 7 and 8 ([18bfeae](https://github.com/Keabop/linguacore/commit/18bfeae9986e895291c51ed65def28eca1a0c54c))
* **audio:** play pre-generated audio in the simulators, browser voices as fallback ([bbd1a1e](https://github.com/Keabop/linguacore/commit/bbd1a1e3af16f898c611f1779b2bc4dec10b9baa))
* **audio:** preferred voices per accent and speech rate per level ([1c1c7f7](https://github.com/Keabop/linguacore/commit/1c1c7f796b12442a033d552461261d1d28a8cf95))
* **audio:** voz de Kokoro para las historias de las fases 7 y 8 ([141ca3f](https://github.com/Keabop/linguacore/commit/141ca3fbacd9b8cc42b859455b5c891834dd6f87))
* **auth:** admin role in app_metadata with Pro access that leaves billing untouched ([e21f084](https://github.com/Keabop/linguacore/commit/e21f084672f555128de62c140a4d7192364c65ce))
* aviso de versión nueva que se aplica entre tareas ([#40](https://github.com/Keabop/linguacore/issues/40)) ([9995a29](https://github.com/Keabop/linguacore/commit/9995a2933ca9d9d178016f982de6694ab60ebf6d))
* **brand:** rebrand LinguaCore to Voxie across UI, manifest, and CORS ([6b42460](https://github.com/Keabop/linguacore/commit/6b42460e883e77c7000ae13df11009e500317a6c))
* **cache:** add AI response caching for story/vocab/exercise agents ([24751f4](https://github.com/Keabop/linguacore/commit/24751f427c9fe52f18c213556fe69a6cf41f0de3))
* **cloudflare:** migrate serverless APIs to Cloudflare Pages Functions and fix Mercado Pago webhook upgrade bug ([e14e9bc](https://github.com/Keabop/linguacore/commit/e14e9bccbcf71023254fc1627769a7f41b534053))
* comprehension questions in the reader and a unit vocabulary step with the whole deck ([355a8fd](https://github.com/Keabop/linguacore/commit/355a8fd9c81ccf7fc284e2a7e0fd4b82b65c22f0))
* **content:** A1 and A2 stories, two per unit, with key words in 3+ stories and questions ([472bc46](https://github.com/Keabop/linguacore/commit/472bc468bb2322e7f57b9a9b435f14d260bc66f9))
* **content:** A1 grammar cards with the depth of A2 and typical errors ([454bd14](https://github.com/Keabop/linguacore/commit/454bd148a82763a453ebec815e1405278cde8a47))
* **content:** add B1 and B2 stories with key words per unit ([ba8f253](https://github.com/Keabop/linguacore/commit/ba8f253dee73a9fdaff68f9bebe04d0ed07e533e))
* **content:** fase 0 — lista de referencia, IPA, métricas y auditoría de contenido ([24c29ac](https://github.com/Keabop/linguacore/commit/24c29ac6c36d1688326f8c72ff3912cc8a4b33b3))
* **content:** rebuild B1 and B2 vocabulary decks on CEFR-J ([f30a905](https://github.com/Keabop/linguacore/commit/f30a9059b0bdface095e5c9a185116b811754844))
* **content:** reference word list, IPA converter, content metrics and audit command ([5e7704f](https://github.com/Keabop/linguacore/commit/5e7704f05aa9812c2346951599dbf06122355f30))
* create Account page replacing Stats with profile, plan, and pro-gated stats ([c3e9d54](https://github.com/Keabop/linguacore/commit/c3e9d54fc7673151b6dd57460c3a82c203875562))
* design system tokens, Pro themes CSS, Plus Jakarta Sans + Be Vietnam Pro ([a085d2d](https://github.com/Keabop/linguacore/commit/a085d2d1a453cc56b376c7e77ad2d41b57406912))
* **design:** ajustes de loader, barra y tarjetas; Gemini sin Pro ([8af9ec0](https://github.com/Keabop/linguacore/commit/8af9ec02b07ef816b1ae8d4b52bfdc4367a5fd77))
* **design:** apply Jardín tokens, fonts and solid buttons app-wide ([1a880ce](https://github.com/Keabop/linguacore/commit/1a880ce6c4d82f8568a5fa9ae903ec1550cb5655))
* **design:** fade pages in after the loader and show it for every lazy page ([24aaf8e](https://github.com/Keabop/linguacore/commit/24aaf8e72a5496dea73548055d47b6145ee13f56))
* **design:** garden dashboard, leaf navigation and growing learning path ([1417f27](https://github.com/Keabop/linguacore/commit/1417f2720023fab264e06479fc6f01aaa6083db5))
* **design:** identidad «Jardín» en toda la app ([1e0e1fd](https://github.com/Keabop/linguacore/commit/1e0e1fd6603a22466adcebfe575d496d1fb668d1))
* **design:** sprout page loader, leafy story cards, no active-unit line ([aadb2d9](https://github.com/Keabop/linguacore/commit/aadb2d92b4f09889a3c82aa3fa9ad9e21fb371ca))
* **design:** tokenise lesson colours, plant on unit complete, answer moments ([b3f8700](https://github.com/Keabop/linguacore/commit/b3f8700ae4baad8a128adbd4172fa6e90fd434ba))
* **error-cards:** add ErrorReview component with adaptive exercise modes ([2b66703](https://github.com/Keabop/linguacore/commit/2b667032642c25f19b33577ca9af1b83817d5be7))
* **error-cards:** add migration, types, and useErrorCards hook ([91fd64f](https://github.com/Keabop/linguacore/commit/91fd64feceed877429ce0cef6170d27d77a5a02e))
* **error-cards:** enhance AI prompts to return example variants ([0253200](https://github.com/Keabop/linguacore/commit/02532001bf6ac1cc1473f54b06b249c289f327f7))
* **error-cards:** extract corrections from tutor and writing practice ([9785966](https://github.com/Keabop/linguacore/commit/97859666e43cf84eeaf7853e305d8ccf51d1d3dc))
* **error-cards:** integrate error card review into ReviewSession ([2413098](https://github.com/Keabop/linguacore/commit/2413098b222fe509255f54f2c0b71bbd0e1643e4))
* **error-cards:** show error card count on Dashboard ([0877ec5](https://github.com/Keabop/linguacore/commit/0877ec589c6f4fb9459808bd00ae7da7f0c2c6fa))
* **exams:** adaptive placement test with a 75-item bank and a confidence rating ([b950120](https://github.com/Keabop/linguacore/commit/b950120913c6de03b36d028dcb02c6cb8fec0273))
* **exams:** end-of-level exam with review, transfer, reading and listening ([df2448c](https://github.com/Keabop/linguacore/commit/df2448c79fa9a4ea604844c4b9424aeae4e2cee3))
* **exams:** fase 1 — motor de exámenes con tipos de pregunta, bandas y etapas adaptativas ([16e188a](https://github.com/Keabop/linguacore/commit/16e188ab07d91769ba5999328c48c996fe073b4e))
* **exams:** fase 2 — simulacro IELTS Academic nuevo ([ae3c52d](https://github.com/Keabop/linguacore/commit/ae3c52d5b9e8d0564734bda255080e67b577644d))
* **exams:** fase 3 — simulacro TOEFL iBT 2026 y rol de admin ([123246a](https://github.com/Keabop/linguacore/commit/123246a5d8705c13eca1879ff70cacaee152deb6))
* **exams:** fase 4 — Cambridge B1 Preliminary y B2 First con el formato real y criterios oficiales ([d27c918](https://github.com/Keabop/linguacore/commit/d27c918a8b2aff408dbccb948dd363b2a4120dce))
* **exams:** fase 5 — test de nivelación adaptativo con banco de 75 ítems ([db58420](https://github.com/Keabop/linguacore/commit/db584203789e9b183789158e5990027c91839f40))
* **exams:** question kinds, adaptive stages, real bands and honest scoring in the simulator ([3e084eb](https://github.com/Keabop/linguacore/commit/3e084eb6ce5e383378fffe83a5cb4e7edb1ba27a))
* **exams:** rebuild Cambridge B1 Preliminary and B2 First with the real format ([16cb585](https://github.com/Keabop/linguacore/commit/16cb5856a7a53b85db2921c9fbe5962ab842c355))
* **exams:** rebuild the IELTS Academic simulator with real structure, charts and part audio ([d728c81](https://github.com/Keabop/linguacore/commit/d728c8156516e1a0936d0c458dc90bb080d2b049))
* **exams:** rebuild the TOEFL iBT simulator with the 2026 format and adaptive modules ([331b76a](https://github.com/Keabop/linguacore/commit/331b76a7bc2e42b66162254b3de71bf8fb874581))
* fase 7 — historias A1 y A2 con preguntas de comprensión y vocabulario de la unidad ([eed62bb](https://github.com/Keabop/linguacore/commit/eed62bb12785f2ac189b75052569b06bf04537b4))
* fase 9 — cierre de nivel, gramática A1, evaluadores MCER y audio con Kokoro ([7555ce9](https://github.com/Keabop/linguacore/commit/7555ce927623caf99b89de86f2ec7ff8af302215))
* full offline support with IndexedDB persistence, mutation queue, and responsive spacing fixes ([f0eed6c](https://github.com/Keabop/linguacore/commit/f0eed6cfad8e8afc9d23d3f645f71197216ed0bd))
* **garden:** add plant species, garden, level leaf chip and plant picker ([e4e486c](https://github.com/Keabop/linguacore/commit/e4e486c03e0e64d89d15a43a230c378b5b5988a6))
* **gate:** add ProGate component, UsageBadge, and useUsageLimits hook ([1946a86](https://github.com/Keabop/linguacore/commit/1946a867eb025e9fed3224138b5f208465d56fa2))
* **gate:** add tier gating for levels, tutor, FSRS, and stories ([df625fd](https://github.com/Keabop/linguacore/commit/df625fd36132d816daa808bf8ad7439119bd5b6a))
* **history:** add conversation session types, hook, and i18n keys ([70cb1ed](https://github.com/Keabop/linguacore/commit/70cb1edb8c4588380db2843000e0868bc630d573))
* **history:** add end session, save conversation, and history view to Tutor ([7612e6a](https://github.com/Keabop/linguacore/commit/7612e6a2ebee7520dd6fd0a69624b0f64b2e533b))
* **history:** add save-to-history and writing history view in Practice ([5535a8f](https://github.com/Keabop/linguacore/commit/5535a8f5fdc2e95b4f78dfed9d39f16fab43fc5c))
* **i18n:** add account, settings, and plan translation keys ([af05bdd](https://github.com/Keabop/linguacore/commit/af05bdd364a007c2e0f40a2577b1f7843cd3c795))
* **i18n:** add English translation dictionary en.json ([c3dc41d](https://github.com/Keabop/linguacore/commit/c3dc41d549cc2aa0ec0188aa425762bd78b5d384))
* **i18n:** implement useBilingual hook and Bilingual text rendering component ([b096c67](https://github.com/Keabop/linguacore/commit/b096c6794902340b2ac68112b3750d1f6396f512))
* **i18n:** register en.json dictionary and initialize language dynamically from localStorage ([eb22112](https://github.com/Keabop/linguacore/commit/eb22112c08c4ae3ca700f4bcce8727ba480f3bd0))
* **i18n:** simulator, exam questions and report texts in Spanish and English ([9f2b797](https://github.com/Keabop/linguacore/commit/9f2b79751ac9a85ec74ff023eb07dbb5347b4984))
* **icons:** add AnimateIcons for navigation, streak, send, mic and correct ([b54a058](https://github.com/Keabop/linguacore/commit/b54a058dfc4b489c73654502ad159beed6e71df3))
* implement 3-step interactive minigame in ErrorLab.tsx ([ec46bce](https://github.com/Keabop/linguacore/commit/ec46bcebe858b54bcf8ab144f879c4b41ce0d864))
* implement admin dashboard and role access check ([35125a2](https://github.com/Keabop/linguacore/commit/35125a2a396603029fa74903520081b9e34cc845))
* implement CEFRSimulator interface and routes ([2526a60](https://github.com/Keabop/linguacore/commit/2526a60e3d838767ff941c4b823b1d9eb9306260))
* implement comprehensive StoryList card/grid redesign (Task 3) and ConversationTutor chat bubbles/correction cards (Task 4) ([2f2a6af](https://github.com/Keabop/linguacore/commit/2f2a6af90146f900d5be7153c208e9885195a62e))
* implement draggable sidebar layout, glass targets, and onboarding popup ([6dfcb4e](https://github.com/Keabop/linguacore/commit/6dfcb4e574567c58b34db5ff43d8c43e71ea8366))
* implement floating vertical dock sidebar and layout adjustments (Task 1) ([bc35138](https://github.com/Keabop/linguacore/commit/bc35138eb906e70d4ce5d3b5427b83c15b79cd7e))
* implement full FSRS CSV file upload and parsing in Account.tsx ([6407a76](https://github.com/Keabop/linguacore/commit/6407a767e93a1689292d7b7ee8c62962e9c7e769))
* implement generateCareerDeck function using Gemini 1.5 Flash in ai.ts ([aa95a7d](https://github.com/Keabop/linguacore/commit/aa95a7d45e0ca134d64df2566a74f680c121bb55))
* implement massive authentic exam databases, sequential writing, and interactive speaking simulation ([3bc2106](https://github.com/Keabop/linguacore/commit/3bc210601ad686fedc90e2cb9ecccac41c4781d1))
* implement premium LearningPath timeline redesign and motivational banner (Task 6) ([b6fa2d9](https://github.com/Keabop/linguacore/commit/b6fa2d9cbac8ece95c44f30a407c9ebb41914d87))
* implement Royal Gold theme settings and Account theme selector (Task 5) ([0ce6f63](https://github.com/Keabop/linguacore/commit/0ce6f63a8231111d78c25f5638910c182d63d071))
* implement smart audiobook mode and shadowing practice in StoryReader ([de80007](https://github.com/Keabop/linguacore/commit/de80007442fd0343fab880b632c3465bf41302e6))
* implement Task 2 — Dashboard stats cards, Continue Learning badge, and CEFR top-bands ([cae3938](https://github.com/Keabop/linguacore/commit/cae3938d02d4ece2427c57a10484ada2f11368c9))
* implement username editing within SettingsModal to persist custom display names in Supabase auth user_metadata ([94b89fb](https://github.com/Keabop/linguacore/commit/94b89fb364ca879afd7f4fabc80b69b4a842f73a))
* improve landing page design aesthetics, alignment, contrast, and update annual pricing to 1299 pesos ([2cb4fbe](https://github.com/Keabop/linguacore/commit/2cb4fbefb3a7b2d02ed6ba0bf6890457327c13f0))
* initial commit — LinguaCore English learning app ([853756c](https://github.com/Keabop/linguacore/commit/853756c6ac0ae948f159464e72c5d35c40c32cc3))
* integrate CEFR simulations history into Account screen ([e2de2da](https://github.com/Keabop/linguacore/commit/e2de2da8d4039416227c74344c9af9b908f11c2c))
* integrate export, custom import, and AI career decks in Account settings ([fc2d417](https://github.com/Keabop/linguacore/commit/fc2d417b40c66ea7bf68f15c844361e08fb0fe9b))
* jardín en pixel art, elegible en configuración ([#45](https://github.com/Keabop/linguacore/issues/45)) ([adfe480](https://github.com/Keabop/linguacore/commit/adfe48033bdc0ea340dd04ea7689636ab890caee))
* **landing:** add public landing page with feature showcase and pricing preview ([9b89aa6](https://github.com/Keabop/linguacore/commit/9b89aa69b88aa84c2703e62012b8fec00bfcf8cc))
* **landing:** narrative garden landing with try-it exercise; calmer auth and pricing ([cc655b4](https://github.com/Keabop/linguacore/commit/cc655b4ff517d60875996806fd8643a75152e7d2))
* **landing:** replace skeleton placeholders with real app mockups in how-it-works section ([802bd54](https://github.com/Keabop/linguacore/commit/802bd54bf2299eca64761f394013bdd07fcf8aad))
* **layout:** replace sidebar bottom with clickable user card, remove stats from nav ([bca348a](https://github.com/Keabop/linguacore/commit/bca348a49db650da869a1683a3be476c589e886b))
* lecciones parciales, rediseño libreta y puntajes justos ([#38](https://github.com/Keabop/linguacore/issues/38)) ([8d9987d](https://github.com/Keabop/linguacore/commit/8d9987d6c89bc626ecb5394ae40e518e1c0a88e4))
* libreta para tomar notas y glosario de términos de gramática ([#47](https://github.com/Keabop/linguacore/issues/47)) ([e02e761](https://github.com/Keabop/linguacore/commit/e02e7610aad818196f3336e65d5ffb7ea1c98d1a))
* **limits:** add per-user usage tracking and rate limiting by tier ([35e2be2](https://github.com/Keabop/linguacore/commit/35e2be2e4670937af64006135b9a98c5249c5235))
* make bento stats and recommended stories responsive on dashboard ([831a3fc](https://github.com/Keabop/linguacore/commit/831a3fcfad1925b3bab3b06eccb4cdd81c76a2e7))
* make CSV importer flexible for any app structure and add semantic coherence check for AI deck generation ([a96239c](https://github.com/Keabop/linguacore/commit/a96239c93a0d4aa4fc844c91c978227d65967727))
* migrate all remaining pages and components to Fluid Scholar design tokens ([b99e4f7](https://github.com/Keabop/linguacore/commit/b99e4f7d56fd2f0449c64e995fa3fe35f05d4343))
* migrate from IndexedDB/Dexie to Supabase (Postgres + Auth + RLS) ([7c26e8d](https://github.com/Keabop/linguacore/commit/7c26e8da5858595619244cb664e6ca30a555149f))
* **nav:** sliding active pill and a rail drag that previews where it lands ([143120c](https://github.com/Keabop/linguacore/commit/143120ca8ba282dd3e795b2b7c35a99a0475cbe9))
* optimize theme settings selector grid for narrow viewports ([163f5cc](https://github.com/Keabop/linguacore/commit/163f5cc153a4534496e233901bb6c5aad4ae37c0))
* páginas legales, consentimiento, eliminar cuenta y precios nuevos ([7ebbc3d](https://github.com/Keabop/linguacore/commit/7ebbc3d1ec23a6ddf527b87cb4911946cee27db2))
* **payments:** add temporary endpoint to generate test buyer account ([99c2b82](https://github.com/Keabop/linguacore/commit/99c2b82b76b69d6c534657cc9d3f91b17e363ec6))
* **payments:** integrate Mercado Pago subscriptions with create + webhook endpoints ([9993794](https://github.com/Keabop/linguacore/commit/9993794763fd830586fecbc1dc70523a71d8fc1d))
* **payments:** verify Mercado Pago webhook x-signature ([1a1fc52](https://github.com/Keabop/linguacore/commit/1a1fc52d3f2ddec020f27348157e27ab190a3319))
* **plan:** keep the fixed content free and limit only the AI ([ceeb585](https://github.com/Keabop/linguacore/commit/ceeb585295636c39dce7a84c20c5b25d920130c7))
* **practice:** 2-step level selection, free topic, responsive history fix ([f2a532a](https://github.com/Keabop/linguacore/commit/f2a532adb901638aef13deeb876cc452094c8d44))
* present all advanced capabilities (Error Lab, TOEFL/IELTS/Cambridge simulators, AI Decks, CSV porting) on landing page ([d002f9b](https://github.com/Keabop/linguacore/commit/d002f9bae1184db9ca4a2617f0d676856884d399))
* **pricing:** add transparent pricing page with Free vs Pro plans ([be615df](https://github.com/Keabop/linguacore/commit/be615df3ac4b75d999ed6911f4dbb611c354352b))
* **pwa:** add install prompt for Android/iOS with dismiss persistence ([89d7691](https://github.com/Keabop/linguacore/commit/89d7691230e9171e2845e4d91a0abb6ebc9a498b))
* **rebrand:** rename LinguaCore to Voxie in local storage, CORS, API, and guides ([b0fae22](https://github.com/Keabop/linguacore/commit/b0fae223d1a4139006fb9a4c7455ef2a66c3f7c9))
* redesign auth page with logo fix mobile responsive better spacing ([bef7df8](https://github.com/Keabop/linguacore/commit/bef7df800e05e816d8052a84468ed4196fec7e24))
* redesign auth page with soft inputs and new card style ([e015311](https://github.com/Keabop/linguacore/commit/e0153117ad1be2758f5a6086f629dc04124454d7))
* redesign dashboard with greeting, streak card, progress bloom ([11e5007](https://github.com/Keabop/linguacore/commit/11e50073c5c444d430a96685f000889398435fd4))
* redesign landing page with Fluid Scholar design system ([cf55b8d](https://github.com/Keabop/linguacore/commit/cf55b8dcf96feb61184d16aad637120eaf098b3d))
* register ErrorLab page scaffold and protected route in App.tsx ([cd97af5](https://github.com/Keabop/linguacore/commit/cd97af509d6563dee7feb0bb5c40166dd40b9d59))
* restore mobile floating bar in chat and review, and scale chat viewport height ([60cbd85](https://github.com/Keabop/linguacore/commit/60cbd8581b1ee05af66591fe91707c0715f2c718))
* restore story-unit mappings, B2 content, and VocabStep improvements ([32e3b4a](https://github.com/Keabop/linguacore/commit/32e3b4ac01dca1bc5018557cf6fabcfe3ab0a382))
* **routes:** replace /stats with /account route ([1e859f4](https://github.com/Keabop/linguacore/commit/1e859f48b6e7e992d917723da7bee02628325785))
* **routing:** convert core navigation pages to static imports for flicker-free transitions ([9f6b724](https://github.com/Keabop/linguacore/commit/9f6b724f983acd4178a068397f07017f856fc552))
* **settings:** integrate interactive language dropdown selector and event listener in SettingsModal ([4132cc9](https://github.com/Keabop/linguacore/commit/4132cc90a27591eab35936f06ebef4eb902c8cc9))
* **skill-mastery:** add GrammarReview component with adaptive depth ([bec00c1](https://github.com/Keabop/linguacore/commit/bec00c115afe3a8647ad5eba5bee5ceb2f8ca039))
* **skill-mastery:** add GrammarSkill types and A1-U1 skill definitions scaffold ([26b251b](https://github.com/Keabop/linguacore/commit/26b251b907a7925f13682533e5c86e7c605d8bb4))
* **skill-mastery:** add skill_cards table migration with RLS ([9232bec](https://github.com/Keabop/linguacore/commit/9232bec1b1b300e37dc69bfd102cdc32efbabed4))
* **skill-mastery:** add SkillCard types to database and domain models ([db3b2ca](https://github.com/Keabop/linguacore/commit/db3b2ca721a62524c35e178b8617858be4bb8e50))
* **skill-mastery:** add Spanish i18n translations for grammar review ([34bc386](https://github.com/Keabop/linguacore/commit/34bc3862292a2370bd3e828c9cf72b49f296f2ef))
* **skill-mastery:** add useSkillCards hook with FSRS integration ([ca9f7b7](https://github.com/Keabop/linguacore/commit/ca9f7b74ea13fd81850c2420b26f9b4bdcb08ed0))
* **skill-mastery:** create skill cards on unit checkpoint completion ([ee1ca19](https://github.com/Keabop/linguacore/commit/ee1ca19d77555d7df26c9243527cba107d49484e))
* **skill-mastery:** integrate grammar review tab into ReviewSession ([144e26c](https://github.com/Keabop/linguacore/commit/144e26c6c849be071ab69dc2e019755bf64dd046))
* **skill-mastery:** populate B2 grammar skills for all 13 units ([5af96da](https://github.com/Keabop/linguacore/commit/5af96da50c57110f01becba9079757cedfbc037e))
* **skill-mastery:** show grammar skills due count on Dashboard ([c0b18bc](https://github.com/Keabop/linguacore/commit/c0b18bcea2020af14ad619cce97f090d3615515c))
* **skill-mastery:** show skill mastery breakdown on completed units in LearningPath ([85ef9aa](https://github.com/Keabop/linguacore/commit/85ef9aaa1c74eb8e955263cb8ba601b7d6edaf9c))
* **stories:** reading highlight follows the audio, with level speed ([6be8174](https://github.com/Keabop/linguacore/commit/6be8174ad98b316ca59e64a793f2308f3bfbb612))
* **stories:** save a story's words on completion, require marking them and return to the lesson ([b68ab0c](https://github.com/Keabop/linguacore/commit/b68ab0ce4da2a252eb3d07e055f12808ee56f79c))
* **streak:** add a daily goal and streak freezes ([8c7ab28](https://github.com/Keabop/linguacore/commit/8c7ab281d01fbd54f41a5e60385585dc51f2e748))
* **streak:** count any study activity on the learner's local day ([ef881ed](https://github.com/Keabop/linguacore/commit/ef881ed405b86f0e053dd183051e2be83c23c469))
* ThemeContext supports light/dark mode + 4 Pro themes ([b0311ef](https://github.com/Keabop/linguacore/commit/b0311efd0b5f42aa3072500125f05264f37c79c6))
* **tier:** add tier system to profiles with useTier hook ([fd2d8cf](https://github.com/Keabop/linguacore/commit/fd2d8cfb2fb2e4eae7e5c21d12441086b861c104))
* **trial:** let visitors read a story and take the placement test ([5c14acf](https://github.com/Keabop/linguacore/commit/5c14acf8dc9be52a8cc0fee93cd7583a5498869d))
* **ui:** comprehensive UI polish with ReactBits components ([38a1452](https://github.com/Keabop/linguacore/commit/38a145245b9b069ffea049e9797c8674741f385d))
* update layout sidebar with Fluid Scholar design tokens ([3f7fb7e](https://github.com/Keabop/linguacore/commit/3f7fb7e8cf4368b4c67cf7e09f02548f91527cfa))
* update StoryList, LearningPath, ConversationTutor with Fluid Scholar tokens ([e270aba](https://github.com/Keabop/linguacore/commit/e270abaa2d10a3ec91dc1fbeb228abec4be425f9))
* upgrade landing page app visual mockup to a high-fidelity live dashboard representation ([a3929d5](https://github.com/Keabop/linguacore/commit/a3929d5c28a68e2f14c05182b7d56ded523f22a1))
* visual redesign 'Warm Learning' — indigo primary, CEFR colors, spacing normalization, typography cleanup ([463f3e5](https://github.com/Keabop/linguacore/commit/463f3e5970463c783895a5f399022698af8f0495))
* **vocab:** A1 and A2 decks with CMUdict IPA, CEFR-J levels and a credits page ([a06d933](https://github.com/Keabop/linguacore/commit/a06d933cb7a67ca9b2dd8bd2ae52b358c0114727))
* **vocab:** fase 6 — mazos A1 y A2 con IPA de CMUdict, niveles CEFR-J y créditos ([4d818f6](https://github.com/Keabop/linguacore/commit/4d818f6bc2dc58a57a42968782ea3a487b50c780))


### Correcciones

* **a11y:** accessibility fixes in StoryReader + floating bar tablet layout ([e2987b9](https://github.com/Keabop/linguacore/commit/e2987b96a3fd679dc1c3440989f3bf039cf9efef))
* add @types/node for serverless function type checking ([bc69c8c](https://github.com/Keabop/linguacore/commit/bc69c8cab436ab4be10e9d0f8502ca5dba41dd9e))
* address code reviewer feedback on dashboard runtime crash, loading guard, i18n, and redundant tailwind class ([7bbb1fe](https://github.com/Keabop/linguacore/commit/7bbb1fe300975e77ecbc885775fbe7e1794171eb))
* adjust horizontal sidebar width to 540px and unify typographic hierarchy within CEFR simulation cards ([cfd42fd](https://github.com/Keabop/linguacore/commit/cfd42fd2ae62405d2783649861cccf14b2fbe3a6))
* **ai:** score bands that match the colours, guarded prompts and every free Gemini model ([0e45c08](https://github.com/Keabop/linguacore/commit/0e45c08d52a7929d84f366cb279060dd5674fa75))
* ajustes de interfaz, pendientes de historias, simulador en i18n y error 401 de la IA ([3b7af04](https://github.com/Keabop/linguacore/commit/3b7af048a4017b23371994b5feeedec62c8a0c89))
* **api:** add tsconfig for serverless functions, fix PromiseLike.catch error ([05c6640](https://github.com/Keabop/linguacore/commit/05c66409760516a2a11863e26fc2ba7ed6a21d40))
* **audio:** name files by voice and generator, keep titles in a sentence, Safari and voice notice ([b1215fc](https://github.com/Keabop/linguacore/commit/b1215fcb03156893e13aa6a1dbc28a571ceafd92))
* **auth:** refresh a revoked session or sign out locally instead of failing AI calls with 401 ([491ed5d](https://github.com/Keabop/linguacore/commit/491ed5d7502c9ff3369dda26ba681d59ce418011))
* center sidebar links, restore colored logo image, and redesign recommended stories on Dashboard to match learning catalog cards ([5b0698e](https://github.com/Keabop/linguacore/commit/5b0698e7284bdd079aaa533d4f1c509120eee5d5))
* center timeline path nodes mathematically on the connector line and resolve border shift ([a7ff516](https://github.com/Keabop/linguacore/commit/a7ff51680d8afa3f462e94ffe6c122154f1ab18d))
* center user profile button vertically when horizontal using flex items-center h-full wrapper ([c11780f](https://github.com/Keabop/linguacore/commit/c11780f36bf699f2e0ff5ab3e721746fc2103373))
* change sidebar border-radius to 34px to form a perfect circular capsule ([1c1cae8](https://github.com/Keabop/linguacore/commit/1c1cae8b52fed266608303ad61e8fc63b9d17868))
* clean up syntax typo in cefr simulations SQL migration script ([93edd5f](https://github.com/Keabop/linguacore/commit/93edd5f9f382e51cac919b63bcfb64b514951cf2))
* **cloudflare:** remove Node crypto module dependency by implementing a cross-platform synchronous hash function ([2f29db5](https://github.com/Keabop/linguacore/commit/2f29db53165c99cb0caa467c5097c72204397539))
* compact vertical sidebar layout to prevent user icon overflow ([4d3dd17](https://github.com/Keabop/linguacore/commit/4d3dd1738920d3cda81c2837013f81011ea5c719))
* **content:** botón atrás único, sin emojis y arreglos de la auditoría de enseñanza ([a1c2205](https://github.com/Keabop/linguacore/commit/a1c2205de493fbd4d5905bb494f0183120947981))
* **content:** exact-form lemmas, unknown words, phrasal verbs, homographs and Cambridge-style IPA ([e1f69ca](https://github.com/Keabop/linguacore/commit/e1f69ca4f8712da07dffb11905fa16645772606b))
* **content:** shuffle answer options, fresh checkpoint items, real story stats, missing vocab ([ed8cc36](https://github.com/Keabop/linguacore/commit/ed8cc36e3732bea9cbea1999cdc2661fa67a632e))
* **design:** apply review fixes for answer moments, a11y labels and dead code ([6049d09](https://github.com/Keabop/linguacore/commit/6049d097dd458c3fee5b7d43bfb9e92f5c8a3d12))
* **design:** let the loader sprout finish growing before the page shows ([ece115a](https://github.com/Keabop/linguacore/commit/ece115a3a232a91edf615e462a566cbae7b90e3b))
* **design:** replace leftover white text and borders with garden tokens ([bee30bd](https://github.com/Keabop/linguacore/commit/bee30bd5b81fda816e0499fd869527eba77c4ab4))
* **edge:** inject global process polyfill to make third-party Mercado Pago SDK compatible with Cloudflare Pages Edge Runtime ([2b8e58f](https://github.com/Keabop/linguacore/commit/2b8e58fb1787b2f33e5dea069e8bdf55055b45f4))
* **edge:** polyfill global fetch to inject headers.raw() for compatibility with the Mercado Pago Node SDK in Cloudflare Workers ([120744d](https://github.com/Keabop/linguacore/commit/120744d1c9e3d127fe2b471cb772e6a823864522))
* **edge:** resolve ReferenceError: process is not defined by removing direct process.env usage in edge-imported libraries ([4433dc2](https://github.com/Keabop/linguacore/commit/4433dc2e93c7e9f8e71b388ab8a91d626f896c25))
* el texto calificado de la lectura en voz alta ya no ensancha la pantalla ([#46](https://github.com/Keabop/linguacore/issues/46)) ([1621aa1](https://github.com/Keabop/linguacore/commit/1621aa15ea7b6f64938d5b56f15f049c99874d46))
* enforce static height for horizontal rails and compact horizontal layout to prevent overflow ([46a3b11](https://github.com/Keabop/linguacore/commit/46a3b115699a7273188502d7edb6f0e26e9e4cc4))
* **exam:** accept written-out contractions, new transfer items and offline level unlock ([efe8c2d](https://github.com/Keabop/linguacore/commit/efe8c2db89cafb174d9e4ba4db1b70ce090c0784))
* **exams:** empty tasks score zero, fresh timer state, audio release, fairer placement, five First papers, a11y ([0f1da32](https://github.com/Keabop/linguacore/commit/0f1da32fb072a41760663d2ddffa3d1ceb088928))
* **exams:** IELTS items follow the recording, shuffled headings, part pages, legible chart ([9760490](https://github.com/Keabop/linguacore/commit/976049006b6c4f15a78374894548d62d3fc31f4a))
* **exercises:** accept curly apostrophes and count a double tap on next once ([edc978b](https://github.com/Keabop/linguacore/commit/edc978bd3f210e46771602f58a78623f26f9556a))
* **landing:** correct año typo and update footer to copyright notice ([d1a49fa](https://github.com/Keabop/linguacore/commit/d1a49fa6843817ebefa907862e5d03aa73d79341))
* lector y aviso del registro ([#36](https://github.com/Keabop/linguacore/issues/36)) ([64fcf6a](https://github.com/Keabop/linguacore/commit/64fcf6a2d6bcaca17a508939f17c5f0f9cee3622))
* light theme on auth page, add profile icon to mobile nav bar ([594e06b](https://github.com/Keabop/linguacore/commit/594e06bbf6f59c4570d794ebbbb14df81e7475b4))
* make mobile floating bar visible in initial selection and result dashboard screens of the CEFR Simulator ([cbb6201](https://github.com/Keabop/linguacore/commit/cbb6201f8a57f5bad30e0a1d08be1bb4cdfc973e))
* merge cancel-subscription into create-subscription to stay within Vercel 12-function limit ([55c1ccb](https://github.com/Keabop/linguacore/commit/55c1ccb750bde730bd36cd9012db5192aba56c9e))
* modo oscuro grafito, palabras sin parpadeo y avance al acertar ([#42](https://github.com/Keabop/linguacore/issues/42)) ([1b4d684](https://github.com/Keabop/linguacore/commit/1b4d684db5e2729e6101f961956ce58f37f01bf5))
* **payments:** add webhook notification_url and verify-on-return flow ([b52b27e](https://github.com/Keabop/linguacore/commit/b52b27e220d0fbc1a8f9006cf13ebd4d44296b5e))
* **payments:** always send payer_email (required by MP), use configurable test email ([67a73a6](https://github.com/Keabop/linguacore/commit/67a73a6dec21cc23b35c92acddcd646a51887b20))
* **payments:** force mock sandbox payer email when MERCADOPAGO_ACCESS_TOKEN is in TEST mode to prevent cross-environment errors ([f2cd077](https://github.com/Keabop/linguacore/commit/f2cd0771911a319ec7c264370b1e58d33e2877fd))
* **payments:** omit payer_email in Sandbox so MP asks at checkout ([2b31646](https://github.com/Keabop/linguacore/commit/2b3164663eebec9a9ae809a3a07bd45f41be934b))
* **payments:** trim whitespace from payer_email to prevent Mercado Pago validation errors ([63ccbb8](https://github.com/Keabop/linguacore/commit/63ccbb800a14bbab9f4533bd657aa9f75ae0bad4))
* **payments:** use real MP test buyer email for sandbox payer_email ([3b415e8](https://github.com/Keabop/linguacore/commit/3b415e80176d8fdce597eefa3266412c15e43e03))
* **perf:** level chunks without shared data, failed downloads reach the error boundary, guard every import form ([f8defd4](https://github.com/Keabop/linguacore/commit/f8defd49d13fbdd4e9d8542c609b7731c2500da1))
* **perf:** mark saved words once the decks arrive, preload every due card's deck, prefetch the level's deck ([7178979](https://github.com/Keabop/linguacore/commit/7178979345e91937e8b127a6aa2f2583a5150bf4))
* persist writing completion so it's not lost when deferring speaking ([730ea37](https://github.com/Keabop/linguacore/commit/730ea3760f603f65f820e01570280565ec7f58d2))
* process only the signed webhook id, explain blocked Gemini replies, type-check tests ([49f8456](https://github.com/Keabop/linguacore/commit/49f8456ba7cee9a5ea139a06fe81fa16c656bd01))
* remove next.js middleware add rate limiting to orchestrator ([9c00792](https://github.com/Keabop/linguacore/commit/9c00792b7f92b66f397e13ec4f2e7f01f794200f))
* remove redundant top-level back arrow button from CEFR Simulator selection screen ([53cf577](https://github.com/Keabop/linguacore/commit/53cf577779a933465bfb9eb43b631948691544e9))
* resolve navigation active double highlight, expand sidebar animated height to prevent avatar overflow, and enhance pedagogicalAdvice text styling ([2b737c4](https://github.com/Keabop/linguacore/commit/2b737c4a00cd0fa9a15fc239f378b415358e4f7f))
* resolve onboarding tooltip contrast styling using card theme variable ([99abb34](https://github.com/Keabop/linguacore/commit/99abb347e5926d20dd7a2b6899eec91a9f38abc3))
* resolve sidebar disappearance on drag using react key, and enforce symmetrical 480px size bounds ([1ac41df](https://github.com/Keabop/linguacore/commit/1ac41df42e696536b12b690f7f8c2cc58c69aedb))
* resolve sync errors, answer comparison, tutor layout, and defer button bugs ([bb1cdae](https://github.com/Keabop/linguacore/commit/bb1cdaec1d23305853b42d9848d1696d1222e0df))
* resolve TS strictNullChecks on generated passages by cleaning null values ([165b519](https://github.com/Keabop/linguacore/commit/165b519ebee0092b2cf427f60791ad18d60024f3))
* restore scrollable mobile floating nav bar with all nav items ([e0b7f5c](https://github.com/Keabop/linguacore/commit/e0b7f5c4f6bf47f776d1bf45758417f887b40054))
* review of phase 9 (exam grading, CEFR score bands, guarded prompts, Gemini models, audio names) ([d594722](https://github.com/Keabop/linguacore/commit/d594722c37d8e2d32dbe3bd296a16010d02fe7ae))
* review of phase 9 (listening on one screen, saved results, paused audio, offline cache, AI story markup) ([ee3baa7](https://github.com/Keabop/linguacore/commit/ee3baa7192859a8e229923fcd0d76468be10ad38))
* **review:** curly apostrophes and double taps in the grammar review, cloze and simulator speaking ([3c60cf0](https://github.com/Keabop/linguacore/commit/3c60cf03bc414cb1b68af3bc60409e166eb50858))
* satisfy rules of hooks in StoryList.tsx by moving useMemo above early return ([4f086ff](https://github.com/Keabop/linguacore/commit/4f086ff2dfb8417e26c6c7142f21be43b85dad4f))
* sin toasts, errores en la página y siguiente unidad al terminar ([#43](https://github.com/Keabop/linguacore/issues/43)) ([627b64a](https://github.com/Keabop/linguacore/commit/627b64a05d31a40211dd504322c8736da3b26183))
* skill cards due at midnight next day instead of 24h after ([a9670c9](https://github.com/Keabop/linguacore/commit/a9670c92013ca12a7ec6825693f064d30dbda123))
* speech recognition duplicating transcript in continuous mode ([06b5e5a](https://github.com/Keabop/linguacore/commit/06b5e5a0580868c606d912b4868aea8f73c484cc))
* story sentences keyed on the text and the in front of translation ([eb74507](https://github.com/Keabop/linguacore/commit/eb74507d72dd46cef0f6213d4f8282239fd228d7))
* **subscription:** consolidate profile and subscription queries under unified query key and staleTime ([7a025c1](https://github.com/Keabop/linguacore/commit/7a025c16be62a11ac706289b0a353697829a4f65))
* **ui:** fit the unit step indicator on phones down to 320 px ([cf7cb30](https://github.com/Keabop/linguacore/commit/cf7cb3083dca018d24e0cb1fed6990297673be18))
* **ui:** garden empty state in review and no emojis anywhere ([00df692](https://github.com/Keabop/linguacore/commit/00df692de37977fa539f66f5c5e6b7481a0b6260))
* **ui:** one shared back button that stays inside the app ([7f7d260](https://github.com/Keabop/linguacore/commit/7f7d260dcbb39cb69ee97fd62901cf30c8d8df92))
* **ui:** static landing card, auth backdrop, icon bar, plants that fit, loaders and chat deletion ([36ae7d0](https://github.com/Keabop/linguacore/commit/36ae7d09872dcf1d6c384f2364c5ef540f765652))
* **unit:** say to try again after a score of 0, steady checkpoint order and accent typos ([05dd7e2](https://github.com/Keabop/linguacore/commit/05dd7e2b2a14d0cb7fb884bae4f63e0ab4ac061b))
* **unit:** start the exercises over after a score of 0 instead of staying on the score ([fa64deb](https://github.com/Keabop/linguacore/commit/fa64debb35d7fa1d3f3c3e1e44e1fdf2722b5d5e))
* wrap CSS reset in [@layer](https://github.com/layer) base so Tailwind margin utilities work + global spacing improvements ([e3b348f](https://github.com/Keabop/linguacore/commit/e3b348f8b93db0638ae44c7747396ebfad291e05))


### Rendimiento

* **ai:** drop Gemini Pro from the fallback and turn off thinking ([070a247](https://github.com/Keabop/linguacore/commit/070a24781f5f7b848eb979c4229a46371d60f4c3))
* cada pantalla descarga solo su nivel (ruta 658→24 KB, unidad 1202→568 KB) ([bf848b1](https://github.com/Keabop/linguacore/commit/bf848b1e7b9869a2043f72b3e488619464085c78))
* **db:** evaluate auth.uid() once per query, merge profile policies, index FKs ([e9279ea](https://github.com/Keabop/linguacore/commit/e9279eaa45d394ad7cf140663072b4dc17c6e6c0))
* lazy-load pages and keep curriculum data out of the entry chunk ([5c7ee31](https://github.com/Keabop/linguacore/commit/5c7ee31e75ef4f47505d529f623b80cf050a1205))
* lazy-load pages and keep curriculum data out of the entry chunk ([e317669](https://github.com/Keabop/linguacore/commit/e3176695faa8177ebffff4d4f8a3a68c679b59b0))
* lesson screens download only their level ([18375de](https://github.com/Keabop/linguacore/commit/18375defd35a0c85430302457afd7257c3dd9d80))
* story list and dashboard read a story index instead of every story ([cef201f](https://github.com/Keabop/linguacore/commit/cef201f7e0f15d404b84abb14d4494d797ceb4d2))
* vocabulario por nivel (lector 466→202 KB, repaso 414→150 KB) ([055ecbc](https://github.com/Keabop/linguacore/commit/055ecbc2d0ab2d9a919f8efd88d7f00c12f847b2))
* vocabulary decks by level, found through a small word index ([be86b93](https://github.com/Keabop/linguacore/commit/be86b934222743943eb8ef775b3f9876a170ea5f))

## [1.5.0](https://github.com/Keabop/linguacore/compare/v1.4.0...v1.5.0) (2026-11-06)


### Novedades

* libreta para tomar notas y glosario de términos de gramática ([#47](https://github.com/Keabop/linguacore/issues/47)) ([e02e761](https://github.com/Keabop/linguacore/commit/e02e7610aad818196f3336e65d5ffb7ea1c98d1a))


### Correcciones

* el texto calificado de la lectura en voz alta ya no ensancha la pantalla ([#46](https://github.com/Keabop/linguacore/issues/46)) ([1621aa1](https://github.com/Keabop/linguacore/commit/1621aa15ea7b6f64938d5b56f15f049c99874d46))

## [1.4.0](https://github.com/Keabop/linguacore/compare/v1.3.0...v1.4.0) (2026-11-05)


### Novedades

* jardín en pixel art, elegible en configuración ([#45](https://github.com/Keabop/linguacore/issues/45)) ([adfe480](https://github.com/Keabop/linguacore/commit/adfe48033bdc0ea340dd04ea7689636ab890caee))


### Correcciones

* modo oscuro grafito, palabras sin parpadeo y avance al acertar ([#42](https://github.com/Keabop/linguacore/issues/42)) ([1b4d684](https://github.com/Keabop/linguacore/commit/1b4d684db5e2729e6101f961956ce58f37f01bf5))
* sin toasts, errores en la página y siguiente unidad al terminar ([#43](https://github.com/Keabop/linguacore/issues/43)) ([627b64a](https://github.com/Keabop/linguacore/commit/627b64a05d31a40211dd504322c8736da3b26183))

## [1.3.0](https://github.com/Keabop/linguacore/compare/v1.2.0...v1.3.0) (2026-11-05)


### Novedades

* aviso de versión nueva que se aplica entre tareas ([#40](https://github.com/Keabop/linguacore/issues/40)) ([9995a29](https://github.com/Keabop/linguacore/commit/9995a2933ca9d9d178016f982de6694ab60ebf6d))

## [1.2.0](https://github.com/Keabop/linguacore/compare/v1.1.1...v1.2.0) (2026-11-05)


### Novedades

* lecciones parciales, rediseño libreta y puntajes justos ([#38](https://github.com/Keabop/linguacore/issues/38)) ([8d9987d](https://github.com/Keabop/linguacore/commit/8d9987d6c89bc626ecb5394ae40e518e1c0a88e4))

## [1.1.1](https://github.com/Keabop/linguacore/compare/v1.1.0...v1.1.1) (2026-11-03)


### Correcciones

* lector y aviso del registro ([#36](https://github.com/Keabop/linguacore/issues/36)) ([64fcf6a](https://github.com/Keabop/linguacore/commit/64fcf6a2d6bcaca17a508939f17c5f0f9cee3622))

## [1.1.0](https://github.com/Keabop/linguacore/compare/v1.0.0...v1.1.0) (2026-11-03)


### Novedades

* páginas legales, consentimiento, eliminar cuenta y precios nuevos ([7ebbc3d](https://github.com/Keabop/linguacore/commit/7ebbc3d1ec23a6ddf527b87cb4911946cee27db2))

## 1.0.0 (2026-11-03)

Primera versión numerada: es la app que estaba en producción el 3 de noviembre de 2026.

### Novedades

* Unidades de A1 a B2 con vocabulario, gramática, escucha, escritura y habla.
* 80 historias con audio, y mazos de repaso con repetición espaciada (FSRS).
* Tutor de conversación y evaluación de escritura y habla con IA, con la escala del MCER.
* Prueba de nivel y examen de fin de nivel.
* Racha por cualquier actividad en la hora local, meta diaria y congelador de racha.
* Prueba sin cuenta: una historia y la prueba de nivel.
* Plan gratis con todo el contenido fijo; el plan Pro (Mercado Pago) amplía los límites de la IA.
* App instalable que funciona sin conexión, en español e inglés.
