# Treningsappen

Treningsappen, hostet på [setoptimizer.com](https://setoptimizer.com), er en webapplikasjon utviklet for å lære meg webutvikling sommeren 2025 etter første året på Informatikk ved Universitetet i Tromsø. Appen er primært rettet mot meg selv og andre erfarne treningsentusiaster som trener med vekter på treningssenter. 

OBS! Databaseleverandøren har bestemt seg for å sette databasen i dvale om den ikke blir brukt på 12 timer og dette fører til at funksjonalitet som involverer databasen ikke funker før den har våknet opp noe som tar et minutt.

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

## Kjøre tester

Backend-testene kjøres slik:

```bash
cd backend
npm test -- --runInBand
```

Dette kjører Jest-testene for backend med isolert testdatabase. Frontend har forelopig ikke eget testscript.

## Pre-commit hook

Repoet bruker en lokal Git hook i `.githooks/pre-commit` som kjører backend-testene før hver commit. Hooken aktiveres med:

```bash
git config core.hooksPath .githooks
```

Hvis testene feiler, stoppes commiten. Dette er bevisst strengt siden repoet hovedsakelig utvikles av en person.
