# Treningsappen

Treningsappen, hostet på [setoptimizer.com](https://setoptimizer.com), er en webapplikasjon utviklet for å lære meg webutvikling sommeren 2025 etter første året på Informatikk ved Universitetet i Tromsø. Appen er primært rettet mot meg selv og andre erfarne treningsentusiaster som trener med vekter på treningssenter. 

## Hva appen gjør

- **Lag dine treningsplaner:** Brukere kan lage og tilpasse egne treningsplaner og øvelser.
- **Loggføring av treningsøkter:** Appen registrerer utførte økter for å spore fremgang.
- **Automatiske progresjonsmål:** Basert på tidligere prestasjoner foreslår appen progresjonsmål for å hjelpe brukeren med å forbedre seg.
- **Alternative vektforslag:** Dersom de opprinnelige vektene er opptatt, foreslår appen tilgjengelige vekter og oppdaterer repetisjonsmålene deretter.

## Arkitektur og struktur

Prosjektet er delt opp i to hoveddeler:

- **Frontend:**  
  Utviklet med React.js. Frontend-delen håndterer brukergrensesnittet, og lar brukere interagere med appens funksjonalitet gjennom en moderne og responsiv webapplikasjon. Se - [Frontend README](./frontend/README.md)

- **Backend:**  
  En Node.js Express-server med en SQLite-database. Backenden håndterer forretningslogikk, datalagring, API-kall og generering av progresjonsmål basert på treningsdata. Se - [Backend README](./backend/README.md)

## Kom i gang lokalt

Krav:

- Node.js 20 eller nyere
- npm

Installer dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Backenden trenger en lokal `backend/.env` for vanlig kjøring:

```bash
DB_URI=<sqlite-cloud-uri>
JWT_SECRET_KEY=<valgfri-lang-hemmelighet>
```

Testene bruker mock/in-memory database og trenger ikke `DB_URI`.

## Starte appen

Start backend i en terminal:

```bash
cd backend
npm run dev
```

Start frontend i en annen terminal:

```bash
cd frontend
npm run dev
```

Frontend forventer at `VITE_API_URL` peker på backend, for eksempel i `frontend/.env`:

```bash
VITE_API_URL=http://localhost:3000/api
```

## Lokal seedet database

For lokal utvikling kan backenden kjøres mot en seedet SQLite-database i stedet for SQLite Cloud. Dette bruker `backend/database.sqlite`, som allerede er ignorert av Git.

Seed databasen og start backend lokalt:

```bash
cd backend
npm run db:seed
npm run dev:local
```

Demo-login for lokal utvikling:

```text
Bruker: demo@example.com
Passord: demo1234
```

For lokal frontend peker `frontend/.env` fortsatt på samme API-base:

```bash
VITE_API_URL=http://localhost:3000/api
```

Vanlig `npm run dev` i backend bruker fortsatt SQLite Cloud med mindre `DB_MODE=local` settes eksplisitt.

## Kjøre tester

Backend-testene kjøres slik:

```bash
cd backend
npm test -- --runInBand
```

Dette kjører Jest-testene for backend med isolert testdatabase.

Frontend E2E-testene kjøres med Playwright. Første gang må Chromium installeres:

```bash
cd frontend
npx playwright install chromium
```

Kjør E2E-testene slik:

```bash
cd frontend
npm run test:e2e
```

E2E-testene starter egen backend på port `3001`, egen frontend på port `5174`, og bruker en seedet SQLite-database i `backend/database.e2e.sqlite`. Denne filen er ignorert av Git og resettes av testene.

## E2E før merge til main

Repoet har en GitHub Actions workflow i `.github/workflows/e2e.yml` som kjører Playwright E2E-testene på pull requests mot `main`. For at GitHub skal blokkere merge når E2E feiler, må workflowen settes som required status check i branch protection:

1. Gå til GitHub repo settings.
2. Åpne Branches og legg til eller rediger protection rule for `main`.
3. Slå på `Require status checks to pass before merging`.
4. Velg status checken `Playwright E2E`.
5. Slå gjerne på `Require a pull request before merging`, slik at direkte push til `main` ikke omgår E2E-gaten.

Workflowen kan også kjøres manuelt fra Actions-fanen med `workflow_dispatch`.

## Pre-commit hook

Repoet bruker en lokal Git hook i `.githooks/pre-commit` som kjører backend-testene før hver commit. Hooken aktiveres med:

```bash
git config core.hooksPath .githooks
```

Hvis testene feiler, stoppes commiten. Dette er bevisst strengt siden repoet hovedsakelig utvikles av en person.
