# Clani Frontend - Angular

Frontend aplikacija za upravljanje članov golf kluba.

## Zahteve

- Node.js (verzija 18 ali novejša)
- Angular CLI
- Zagon backend aplikacije (Spring Boot) na http://localhost:8080

## Namestitev

```bash
npm install
```

## Zagon v razvojnem načinu

1. Najprej zaženite Spring Boot backend (clani mikroservis) na portu 8080
2. Zaženite Angular razvojni strežnik:

```bash
npm start
```

Odprite brskalnik na `http://localhost:4200`

## Funkcionalnosti

- ✅ Prikaz vseh članov v tabeli
- ✅ Dodajanje novega člana
- ✅ Urejanje obstoječih članov (inline editing)
- ✅ Brisanje članov
- ✅ Povezava z REST API (http://localhost:8080/api/clani)

## API Endpoints

Backend mora biti zagnan in dostopen na:
- GET `/api/clani` - Pridobi vse člane
- GET `/api/clani/{id}` - Pridobi člana po ID
- POST `/api/clani` - Ustvari novega člana
- PUT `/api/clani/{id}` - Posodobi člana
- DELETE `/api/clani/{id}` - Izbriši člana

## Struktura projekta

```
src/app/
  ├── clani/
  │   ├── clani.component.ts      # Komponenta za upravljanje članov
  │   ├── clani.component.html    # HTML predloga
  │   ├── clani.component.css     # Stili
  │   └── clani.service.ts        # Servis za HTTP klice
  ├── app.routes.ts               # Routing konfiguracija
  └── app.config.ts               # Glavna konfiguracija
```

## Razvojne ukazi

```bash
# Zagon aplikacije
npm start

# Build produkcijske verzije
npm run build

# Testiranje
npm test
```
