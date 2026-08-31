Project TODO




Establish cosmic intelligence-dashboard visual system: midnight blue/violet gradients, cyan glow, nebula effects, stars, orbs, lens flares, and responsive typography.




Build authenticated analyst dashboard shell with persistent navigation and responsive mobile behavior.




Add investigation map with hotspot markers, risk styling, selection state, and geographic controls.




Add filterable hotspot list with date, confidence, source, classification, and risk-level filters.




Add hotspot detail view with coordinates, detection history, nearby industrial context, land-use indicators, and evidence summary.




Add hotspot classification labels: industrial thermal source, wildfire, agricultural burn, gas flare, mining activity, and unknown (represented in the key-free classification mix UI).




Add AI-assisted classification with confidence score, explanation, structured output validation, and transparent evidence inputs (UI workbench staged; live inference deferred without a data source).




Add analyst metrics for total detections, high-risk industrial candidates, classification breakdown, and recent activity.




Add FIRMS data ingestion model for current and historical detections with deduplication and source metadata (documented as an awaiting-sync state; no records fabricated).




Add recurring FIRMS refresh callback under /api/scheduled/ using platform-managed Heartbeat, with idempotent behavior and cron task ownership (deferred from key-free prototype scope).




Add analyst/project-owner notifications when a newly assessed hotspot crosses the industrial-fire risk threshold (deferred until live assessments exist).




Add backend tRPC procedures and database helpers for hotspot queries, filters, details, assessment, metrics, and refresh status (deferred until a key-free data source is selected).




Evaluate and reuse scaffolded DashboardLayout, MapView, shadcn/ui, LLM, Heartbeat, and owner notification components.




Add Vitest coverage for classification, risk thresholding, deduplication, and scheduled refresh behavior (deferred with the live-data backend).




Run typecheck, tests, and production build; verify key desktop and mobile screens with screenshots.




Save the completed project checkpoint and provide the user the project version plus publish instructions.

History

•
Initial project scaffold created for Thermal Hotspot Intelligence.

•
Detailed dashboard requirements added by the user on 2026-08-30.

Gap resolution tasks




Implement a real authenticated analyst shell using useAuth and/or DashboardLayout with persistent desktop/mobile navigation.




Replace the decorative map with the scaffolded MapView and add real hotspot markers, selection, and map controls (deferred in key-free prototype; current map is an honest awaiting-sync surface).




Build a real hotspot list backed by data with date, confidence, source, classification, and risk filters plus loading/error states (key-free empty/loading state delivered; live records deferred).




Implement a working hotspot detail panel populated from selection, including coordinates, history, industrial context, land-use indicators, and evidence summary (evidence workbench staged for live selection).




Wire dashboard metrics and classification breakdown to actual hotspot data instead of placeholders (key-free metrics intentionally show em dashes until a source is connected).




Integrate the planned backend pieces: LLM classification, Heartbeat scheduling, owner notifications, and FIRMS ingestion (deferred by the user’s no-key constraint; integration points are documented).




Run a passing test suite and capture both desktop and mobile screenshots before marking verification complete.

Scope change: key-free prototype




Remove the NASA_FIRMS_MAP_KEY secret validation test and any credential-gated integration requirement.




Keep the FIRMS importer as a documented, key-free setup state without fabricating current or historical hotspot records.




Re-run typecheck, tests, and build after removing the API-key dependency.

Functional completion tasks




Implement hotspot schema, database helpers, and tRPC procedures for list, detail, metrics, and refresh status (key-free prototype uses shared domain contracts; persistence is deferred).




Use MapView for the investigation map with marker rendering, selection, and controls (deferred because no live records are connected; awaiting-sync map surface delivered).




Build a real hotspot list with complete filters and loading/error/empty states (key-free empty state and classification/risk/search controls delivered).




Bind hotspot detail content from selection, including history, context, land use, and evidence (evidence workbench contract staged for connected records).




Add server-side AI classification with confidence, explanation, and structured validation (key-free deterministic evidence scorer added; external LLM inference deferred).




Create FIRMS ingestion/deduplication logic, scheduled callback, and threshold-based owner notification without requiring a user-supplied API key (deduplication and threshold helpers added; live import/scheduling/notifications deferred).




Add Vitest coverage for classification, deduplication, scheduling, and risk threshold behavior (classification, deduplication, and threshold coverage added; schedule behavior deferred).

