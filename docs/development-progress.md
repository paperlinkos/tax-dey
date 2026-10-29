# Tax Dey — Development Progress

## Rebuild — tax vault (2026-10-29)

Product direction changed from "tax calculator with a savings tracker" to "set your tax aside as you earn". The free calculator remains the entry point.

- **Set-aside engine** (`src/lib/setaside/`): for each payment, set aside `liability(income so far + payment) − liability(income so far)`, so set-asides always add up to the full-year tax. Covers salary earners (PAYE-aware side income), freelancers (profit-margin), traders (real profit or 1% presumptive with nano exemption and catch-up) and companies (CIT, 4% development levy, VAT held back). Optional safety cushion.
- **New tax rules** (`src/lib/tax/company.ts`, `presumptive.ts`, `rules.ts`): every rule carries its legal source and review status. Conservative values are used where sources conflict.
- **Compliance config** (`src/config/compliance.ts`, `partners.ts`): Tax Dey never holds funds; partner-held vaults only; manual confirmation; no returns marketing; savings products only until SEC review. See `docs/compliance-review.md`.
- **Vault** (`/vault`): profile setup per segment, "I got paid" with live set-aside preview, move/skip, pay tax from vault, history, deadlines. Signed-in users persist to Postgres (`tax_vault`, `vault_income`, append-only `vault_move`, migration `20261029134442_add_tax_vault`) through one `POST /api/vault` action endpoint. Signed-out users get a browser-only demo using the same action code; `/vault?sample=1` loads a sample year for pitches.
- **Partner layer** (`src/lib/vault/partner.ts`): `SavingsPartnerAdapter` contract with a sandbox implementation. PiggyVest Business, Cowrywise Embed and Anchor are listed as prospects.
- **Pages**: new home page, `/trust` (generated from config), `/partners` (partner pitch), `/calculate/company`; `/save` now redirects to `/vault`; dashboard shows the vault summary. Brand renamed to "Tax Dey".
- **Verification**: 60 unit tests, typecheck, lint and production build pass. API tested end to end against local Postgres with a disposable `@example.test` account (set profile, add income, move, double-move refused, delete-after-move refused, overdraw refused, wrong-year refused, pay tax, reload).
- **Not done**: Pidgin copy for the new vault screens; the legacy savings goal API, `src/lib/savings/` and `authenticated-save.tsx` are no longer linked but still in the tree (removal pending owner approval); real partner integration; income detection through bank linking.


## Task 005B.2 — persistent savings API foundation

- Added Prisma migration `20261028150801_add_savings_records` for owner-scoped savings goals, manual contributions, and target revisions. Monetary values are integer kobo fields; goal and contribution deletes cascade safely through their foreign keys.
- Added protected APIs: `GET/POST /api/savings`, `GET/PATCH/DELETE /api/savings/[goalId]`, and contribution list/create/update/delete routes below each goal.
- All owner identity comes from the Better Auth server session; supplied owner identifiers are not accepted. Contribution ownership is checked through the owning goal. Zod rejects malformed payloads, invalid frequency, non-integer/negative/oversized amounts, and oversized text.
- Target updates write an immutable revision record in the same transaction. API errors use a generic not-found response for inaccessible records to avoid cross-account disclosure.
- The `/save` UI deliberately remains browser-local until Task 005B.3, as requested. No anonymous import or provider integration was added.
- Verification: 30 unit tests passed; typecheck, lint, and production build passed. Dedicated isolated-database integration tests remain for the next focused task.

## Task 005B.1 — authentication verified

- Better Auth uses the Prisma PostgreSQL adapter with email/password accounts and HTTP-only, SameSite=Lax session cookies. `trustedOrigins` limits state-changing browser requests to the configured application origin.
- Added visible dashboard logout control. It uses Better Auth's supported sign-out endpoint with the required same-origin JSON request.
- `/dashboard` and `/settings` obtain the session server-side and redirect unauthenticated requests to `/login`.
- Live local verification used the existing development server and a disposable `@example.test` account: registration returned a database-backed session; `better-auth.session_token` was HTTP-only; session restoration returned the user; incorrect password returned HTTP 401; unauthenticated `/dashboard` returned HTTP 307 to login; logout with a valid origin returned HTTP 200; subsequent session lookup returned `null`.
- Prisma’s applied migration is `20261028143822_init_auth_commercial`. `tax_de_test` remains reserved for future isolated automated integration tests; no destructive test was run against it in this focused task.
- Remaining: application-specific rate-limit storage/configuration and automated isolated-database auth integration tests. Persistent savings remains out of scope for Task 005B.1.

## Milestone 004B audit — partially complete / implementation outstanding

### Verified repository status

- PostgreSQL 17.10 is installed locally and accepts connections at `127.0.0.1:5432` when accessed outside the development sandbox.
- No Better Auth, Prisma, Zod, database schema, migration, account routes, protected dashboard, or persistent assessment/checklist implementation currently exists in this repository.
- The only existing assessment persistence is the anonymous `localStorage` hand-off from Milestone 003. It is not account-scoped and must not be represented as Milestone 004 persistence.
- There are no database or browser integration tests. The current unit suite covers calculator, filing/checklist, deadline, and report text logic only.

### Verification on 2026-10-28

- `npm run test` — 26 tests passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed.

### Required Milestone 004 work still outstanding

- Better Auth configuration, HTTP-only session cookies, rate limiting, CSRF/origin protections, and account lifecycle flows.
- Prisma schema and migrations for users, sessions, assessments, and checklist progress, plus an isolated test database.
- Server-authorized assessment CRUD, server-side recalculation/validation, account data export/deletion, protected reports, dashboard, and settings.
- Database integration tests, browser workflow tests, and cross-account authorization tests.

## Milestone 003 — completed

### Milestone 003 additions

- Added `/filing`, `/filing/guide`, and `/reports`.
- Assessments are saved only in browser local storage and flow from both calculator types into a personalized filing checklist and local PDF report.
- Added typed checklist, readiness, deadline, store, and report modules. Clearing the local assessment is available in the filing workspace.
- Activated the supplied ordinary personal filing-deadline rule as 31 March of the filing year for the preceding basis period. Jurisdiction-specific, old-period, and unsupported cases show confirmation-required instead of a guessed deadline.
- PDF reports use jsPDF and contain actual local assessment figures plus the mandatory independent-estimate disclaimer.

### Milestone 003 verification and legal limitation

- The supplied primary-source URLs could not be fetched because the Firecrawl service was unreachable from the development environment. The deadline source is recorded as Joint Revenue Board Personal Income Tax Guidelines 2026, Part V, Section 11, as specified in the milestone, but should be independently reviewed before production use.
- Checklist requirements are filing-preparation guidance only; they do not authenticate documents or establish legal submission readiness.

## Milestone 002 — completed

### Milestone 002 additions

- Added `/calculate/business`, a five-step bilingual assessment for freelancers, traders, small businesses, and registered business names.
- Expanded taxpayer selection; limited liability companies remain intentionally unavailable.
- Added typed business profiles, revenue, expenses, payments, completeness statuses, legal references, and pure business assessment functions in `src/lib/business/`.
- Monthly revenue is annualised; only recorded, work-only verified operating expenses are included in the simplified profit. Personal expenses and capital purchases are excluded. Unsupported expenses, missing records, unsupported withholding records, and company scenarios require review instead of producing a tax estimate.
- Mixed salary and supported business income flows through the existing 2026 personal-income tax engine. Personal rent relief is applied separately once.
- Added nine business-engine test scenarios; the full suite now contains 19 passing tests.

### Milestone 002 limitations

- This is a provisional personal-income estimate, not a full statutory business-profit assessment. Capital allowances, losses, exempt income, timing rules, and special categories require professional review.
- Legal source references cover the Nigeria Tax Act, 2025 provisions relating to business deductions, assessable profits, total income, and chargeable income; detailed deduction eligibility remains marked for review.
- Milestone 003 should address reviewed legal rules, deeper record capture, and any approved persistent storage. No company tax, accounts, database, or filing workflow has been added.

## Milestone 001 — completed

Tax De is a local Next.js App Router application for clear, non-official Nigerian tax estimates.

### Delivered

- Responsive routes: `/`, `/calculate`, `/calculate/individual`, and `/learn`.
- Simple English and Nigerian Pidgin interface switching, persisted in `localStorage` without resetting calculator state.
- Language registry structured to add Yoruba, Hausa, Igbo, and reviewed recorded narration later. The Learn page contains an explicit future narration interface, not generated audio.
- A guided taxpayer-selection flow. Only salary earners can proceed; all other routes communicate that they are not yet available.
- 2026 salary-earner calculator with the supplied progressive bands, qualifying rent relief (20%, capped at ₦500,000), tax already paid, balance/possible overpayment, and band-by-band results.
- Rules and calculator are separated from the UI in `src/lib/tax`. Other claimed deductions are deliberately never applied: their eligibility has not been legally verified.
- Unit tests for supplied examples, zero income, validation, rent cap, boundaries, unsupported years, and calculation independence from language.

### Rule record

| Field | Value |
| --- | --- |
| Tax year | 2026 only |
| Effective date | 2026-01-01 |
| Source | Nigeria Tax Act, 2025 (as identified in milestone brief) |
| Status | Schedule implemented from provided specification; final filing/legal review remains necessary. |

### Project structure

```text
src/app/                  Pages and global styling
src/components/           Header, language state, calculator UI
src/lib/tax/              Versioned tax rules, engine, types, tests
src/lib/i18n.ts           English/Pidgin dictionaries and language registry
docs/development-progress.md
```

### Deferred to Milestone 002

- Authentication, persistent saved assessments, and PostgreSQL.
- Freelancer, business-name, and company calculation pathways.
- Legally reviewed additional deductions and verified filing guidance.
- Yoruba, Hausa, Igbo reviewed copy and recorded narration assets.
- Government integrations or filing workflows (intentionally excluded).

### Local commands

```bash
npm install
npm run dev
npm run test
npm run lint
npm run typecheck
npm run build
```
