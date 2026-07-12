
# Treningsapp – Frontend

Dette er React-baserte frontend-delen av Treningsappen. Den håndterer brukergrensesnitt, navigasjon og logikk knyttet til opprettelse, visning og oppdatering av treningsplaner.

## Innholdsfortegnelse
1. [Oversikt](#oversikt)
2. [Struktur](#struktur)
3. [Hovedfunksjonalitet](#hovedfunksjonalitet)
4. [Teknologistack](#teknologistack)
5. [Nøkkelkomponenter](#nøkkelkomponenter)
6. [Konfigurasjon](#konfigurasjon)
7. [Mulige Forbedringer](#mulige-forbedringer)

---

## Oversikt

Frontenden er skrevet i **React** (med Remix/Vite og Tailwind CSS) og er designet for å la brukere:

- **Opprette og vedlikeholde treningsplaner** (mesocycles).
- **Loggføre økter** og se fremgang i sanntid.
- **Administrere egne øvelser** gjennom et enkelt og responsivt brukergrensesnitt.
- **Logge inn og ut** med autentisering mot backend via cookies og CSRF-token.

## Struktur

```bash
.
├── app
│   ├── components
│   │   ├── AddExerciseModal.jsx
│   │   ├── CalendarModal.jsx
│   │   ├── ChooseExerciseModal.jsx
│   │   ├── CurrentWorkout.jsx
kan│   │   ├── LandingPage.jsx
│   │   ├── MesocycleDetailsModal.jsx
│   │   ├── MesocycleForm.jsx
│   │   ├── MesocycleOverview.jsx
│   │   ├── Navbar.jsx
│   │   ├── NoteModal.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── RedoExerciseBlockModal.jsx
│   │   ├── TemplatePreviewModal.jsx
│   │   └── TemplateSelector.jsx
│   ├── constants
│   │   └── constants.js
│   ├── entry.client.jsx
│   ├── entry.server.jsx
│   ├── root.jsx                   # Rot-komponenten; initierer AuthProvider, Navbar, m.m.
│   ├── routes
│   │   ├── currentworkout.jsx
│   │   ├── _index.jsx
│   │   ├── login.jsx
│   │   ├── mesocycles.jsx
│   │   ├── mesocycles-new.jsx
│   │   ├── register.jsx
│   │   └── templates.jsx
│   ├── tailwind.css
│   └── utils
│       ├── AuthContext.jsx       # Oppsett for global auth-status (useAuth)
│       └── cookies.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── public
│   ├── favicon.ico
│   └── images
│       ├── dumbbells.jpg
│       ├── edgar-chaparro-sHfo3WOgGTU-unsplash.jpg
│       ├── lastweeksreps.png
│       ├── pexels-scottwebb-28076(1).jpg
│       ├── targetreps.png
│       └── targetweightandreps.png
├── README.md
├── remix.config.cjs
├── tailwind.config.js
└── vite.config.js
```

Her ser du at **React-komponenter** ligger i `app/components`, at ruter defineres i `app/routes`, og at global tilstand (for eksempel autentisering) håndteres i `app/utils`.

## Hovedfunksjonalitet

- **Opprettelse av Treningsplaner:**  
  Bruker kan definere varighet (uker, dager per uke) og øvelser.  
- **Øktloggføring:**  
  Registrer vekt, repetisjoner og fullførte sett. Kan automatisk regne ut nye vektmål og repetisjoner.  
- **Egendefinerte øvelser:**  
  Mulighet for å legge til custom øvelser i tillegg til forhåndsdefinerte.  
- **Autentisering og Autorisasjon:**  
  Via cookies, CSRF-token og ProtectedRoute som sikrer at kun innloggede brukere har tilgang til visse sider.

## Teknologistack

- **React/Remix**: Frontend-rammeverk for byggeprosess, ruting og rask utvikling.  
- **Tailwind CSS**: For rask og konsistent styling av UI-komponenter.  
- **Vite**: Rask byggeverktøy for React og moderne JavaScript.  
- **Context API (AuthContext)**: Håndterer global autentiseringsstatus og integrerer med backend.  
- **Fetch API**: For kall til backend (Node/Express).  

## Nøkkelkomponenter

1. **`root.jsx`**  
   - Hovedinnstegspunkt for UI. Initialiserer `AuthProvider`, `Navbar` og setter opp `<Outlet />` for ruter.  
   
2. **`routes/`**  
   - **`login.jsx`**, `register.jsx`: Skjemaer og logikk for innlogging/registrering.  
   - **`mesocycles-new.jsx`**: Lar brukeren opprette nye treningsplaner.  
   - **`currentworkout.jsx`**: Viser pågående treningsplan og håndterer logging av sett.  

3. **`components/`**  
   - **`MesocycleForm.jsx`**: Dynamisk skjema for å legge til dager, øvelser og varighet.  
   - **`CurrentWorkout.jsx`**: Presenterer og oppdaterer dagens øvelser i sanntid.  
   - **`ProtectedRoute.jsx`**: Høyereordenskomponent som sikrer at man er innlogget for å se sider.  
   - **Diverse “Modal”-komponenter** (f.eks. `AddExerciseModal.jsx`, `CalendarModal.jsx`): Håndterer popup-vinduer for tilleggsfunksjoner.  

4. **`utils/AuthContext.jsx`**  
   - Gir global tilstand for innloggingsstatus og funksjoner for login/logout.  

## Konfigurasjon

- **Miljøvariabler**:  
  Prosjektet bruker `import.meta.env.VITE_API_URL` for å peke til backend-serveren. Pass på at `VITE_API_URL` er riktig satt i `.env` eller i serverkonfig.  
- **CSRF og Cookies**:  
  Frontenden sender credentials i `fetch`-kall, og henter CSRF-token fra backend. Dette sikrer at kun innloggede og autoriserte brukere kan utføre skrivende operasjoner.  
- **Bygg og kjøring**:  
  Som standard kjører du `npm install` og `npm run dev` for å starte utviklingsserveren lokalt. For mer detaljer, se overordnet README i prosjektet.


---

Denne frontenden kompletterer backend-løsningen (Node/Express) ved å tilby et brukervennlig grensesnitt. For mer informasjon om hele løsningen og oppsett, se prosjektets overordnede README eller backend-README.
