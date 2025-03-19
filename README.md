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
  Utviklet med React.js. Frontend-delen håndterer brukergrensesnittet, og lar brukere interagere med appens funksjonalitet gjennom en moderne og responsiv webapplikasjon.

- **Backend:**  
  En Node.js Express-server med en SQLite-database. Backenden håndterer forretningslogikk, datalagring, API-kall og generering av progresjonsmål basert på treningsdata.

Denne todelte arkitekturen (frontend/back-end) gir en klar separasjon mellom presentasjon og logikk, noe som gjør appen modulær, lett vedlikeholdbar og enklere å videreutvikle.
