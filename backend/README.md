
# Treningsapp – Backend

Dette er Node.js/Express-baserte backend-delen av Treningsappen. Den håndterer autentisering, datahåndtering og forretningslogikk for applikasjonen, inkludert treningsplaner, øvelser og progresjonsberegning.

## Innholdsfortegnelse
1. [Oversikt](#oversikt)
2. [Struktur](#struktur)
3. [Hovedfunksjonalitet](#hovedfunksjonalitet)
4. [Teknologistack](#teknologistack)
5. [Viktige Filer og Mapper](#viktige-filer-og-mapper)
6. [Autentisering og Sikkerhet](#autentisering-og-sikkerhet)
7. [API-ruter](#api-ruter)
8. [Mulige Forbedringer](#mulige-forbedringer)

---

## Oversikt
Backend-delen er ansvarlig for all serverlogikk for Treningsappen, som lar brukere:
- Registrere og logge inn med brukernavn og passord
- Opprette og hente treningsplaner (mesocycles)
- Opprette og hente øvelser
- Håndtere progresjon i vekt og repetisjoner
- Generere “deload”-uker basert på brukers historikk

En Node.js Express-server tar imot forespørsler fra frontenden, behandler dem og kobler seg opp mot en SQLite-database for lagring av data.

## Struktur
```
.
├── database.js              //  lokal database ikke i bruk
├── database.sqlite          // Lokal databasefil (om bruk, se .gitignore)
├── favicon.ico
├── index.js                 // Inngangspunkt for Express-server
├── jest.config.js           // Konfigurasjon for Jest (om du tester)
├── middleware.js            // Egendefinert middleware (JWT, CSRF, osv.)
├── package.json
├── package-lock.json
├── README.md                // Denne README-filen
├── remoteDatabase.js        // Oppkobling mot “fjern” SQLite-løsning
├── routes/
│   ├── exerciseRoutes.js    // Ruter for CRUD-operasjoner på øvelser
│   └── mesocycleRoutes.js   // Ruter for håndtering av treningsplaner
├── __tests__/
│   ├── auth.tests.js
│   └── csrf.tests.js        // Eksempler på testfiler
├── utils/
│   ├── calculateNewTarget.js
│   ├── createDeloadWeek.js
│   └── processPlan.js       // Hjelpefunksjoner for treningslogikk
└── vercel.json
```

Overnevnte filstruktur viser prosjektets kjernefiler. `node_modules` er utelatt for oversiktens skyld.

## Hovedfunksjonalitet
- **Brukerhåndtering:**
  Registrering, innlogging og sletting av brukere via JWT-basert autentisering.
- **Treningsplaner (Mesocycles):**
  Opprette, hente, oppdatere og markere planer som fullførte eller gjeldende.
  Inneholder også logikk for å håndtere progresjon (f.eks. økende vekter og repetisjoner) og “deload”-uker.
- **Øvelser:**
  Opprette og hente tilpassede øvelser for hver bruker.
- **Progresjonsberegning:**
  Regner ut nye vekt- og repetisjonsmål basert på tidligere prestasjoner.

## Teknologistack
- **Node.js & Express:** Serverrammeverk for HTTP-håndtering.
- **SQLite (via [@sqlitecloud/drivers])**: Database for å lagre brukere, mesocycles og øvelser.
- **Auth0 & JWT:** Auth0 håndterer login/signup/logout, mens en lokal httpOnly JWT-cookie autoriserer appens API-ruter.
- **CORS & Body-Parser:** Tillater forespørsler fra definerte domener og parsing av JSON-data fra klienten.

## Viktige Filer og Mapper

1. **`index.js`**
   - Applikasjonens inngangspunkt. Setter opp Express, CORS, Body-Parser, ruter og kobler til databasen.
   - Oppretter Auth0-ruter, `/api/me`, CORS, CSRF-tokenrute og kobler til domenespesifikke API-ruter.

2. **`remoteDatabase.js`**
   - Initialiserer koblingen til en “fjern” SQLite-database.
   - Oppretter tabeller (`users`, `Mesocycles`, `exercises`) ved oppstart.

3. **`middleware.js`**
   - **`authenticateToken`**: Middleware for å verifisere JWT-tokens.
   - **`csrfProtection`**: Bruker `csurf` for CSRF-beskyttelse.
   - **`csrfTokenRoute`**: Endepunkt for å hente CSRF-token.

4. **`routes/`**
   - **`exerciseRoutes.js`**: Ruter for oppretting og henting av øvelser (f.eks. `POST /exercises`, `GET /exercises`).
   - **`mesocycleRoutes.js`**: Ruter for treningsplaner (oppretting, henting, oppdatering).

5. **`utils/`**
   - **`calculateNewTarget.js`**: Beregner ny vekt/repetisjonsmål basert på forrige trening.
   - **`createDeloadWeek.js`**: Lager en “deload”-uke med lavere belastning.
   - **`processPlan.js`**: Identifiserer fullførte dager i en treningsplan, m.m.

## Autentisering og Sikkerhet
- **Auth0-login:**
  Login, signup og logout går via Auth0-rutene under `/api/auth0`.
- **JWT-baserte app-tokens:**
  Auth0 callback setter en lokal httpOnly JWT-cookie. Tokenet verifiseres med `authenticateToken`-middleware.
- **CSRF-beskyttelse**
  Gjennom `csurf` for å sikre skriveoperasjoner mot uautorisert tilgang.

## API-ruter
Eksempler på nøkkelruter (flere finnes i filene `exerciseRoutes.js` og `mesocycleRoutes.js`):

| Metode  | Rute               | Formål                                                                                  |
|---------|--------------------|-----------------------------------------------------------------------------------------|
| `GET`   | `/api/auth0/login` | Starter Auth0-login                                                                    |
| `GET`   | `/api/auth0/register` | Starter Auth0-signup                                                                |
| `GET`   | `/api/auth0/logout` | Logger ut av Auth0 og clearer lokal app-cookie                                        |
| `GET`   | `/api/me`          | Henter current user fra lokal app-cookie                                               |
| `GET`   | `/api/exercises`   | Henter alle øvelser for pålogget bruker                                               |
| `POST`  | `/api/exercises`   | Oppretter ny øvelse for pålogget bruker                                               |
| `POST`  | `/api/mesocycles`  | Oppretter ny treningsplan                                                              |
| `GET`   | `/api/mesocycles`  | Henter alle treningsplaner for pålogget bruker                                        |
| `PUT`   | `/api/mesocycles/:id` | Oppdaterer en gitt treningsplan (vekt, reps, fullførtstatus, m.m.)                |
| `GET`   | `/api/current-workout` | Henter gjeldende treningsplan og håndterer progresjonsberegning i sanntid        |

## Mulige Forbedringer
- **Omfattende enhetstester:**
  Flere tester kunne implementeres for å sikre robusthet, særlig rundt kritiske API-endepunkter.
- **Mer robust feil- og logginghåndtering:**
  Forenkler feilsøking i produksjonsmiljø ved å ha mer utfyllende loggmeldinger.
- **Mer utfyllende dokumentasjon:**
  Enda mer detaljerte beskrivelser av rutene (med eksempler på forespørsler og svar) i en egen API-dokumentasjon.

---

Denne backend-tjenesten fungerer som grunnmur for Treningsappen ved å tilby autentisering, datahåndtering og treningslogikk. For frontenden og et fullt oppsett, se det overordnede repositoriet eller frontend-mappen for mer informasjon.
```
