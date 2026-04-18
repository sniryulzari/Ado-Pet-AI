# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

Monorepo with separate frontend and backend directories:

- `fs-pet-adoption-fe-sniryulzari/` — React frontend (Create React App)
- `fs-pet-adoption-be-sniryulzari/` — Express backend (Node.js + MongoDB)

## Commands

### Frontend
```bash
cd fs-pet-adoption-fe-sniryulzari
npm start        # Dev server on port 3000
npm run build    # Production build
npm test         # Run tests
```

### Backend
```bash
cd fs-pet-adoption-be-sniryulzari
npm start        # Run server on port 8080
```

## Architecture

### Frontend (`src/`)

- **`App.js`** — Root component; defines all routes via React Router v6
- **`Context/`** — Two providers wrap the app:
  - `UsersContext` — auth state, current user, admin flag
  - `PetContext` — pet listings, search results
- **`routes/`** — `UserRoute` and `AdminRoute` wrappers enforce protected access
- **`Pages/`** — One component per route (Home, Search, PetDetails, MyPets, ProfileSettings, Admin pages)
- **`components/`** — Reusable UI (PetCard, modals, forms, navbar)

Auth flow: JWT issued on login → stored in HTTP-only cookies → sent with every request via Axios `withCredentials: true`.

Server URL is determined at runtime: production (`onrender.com`) vs. `localhost:8080`.

### Backend

MVC pattern:

- **`Routes/`** — `users.js`, `pets.js`, `admin.js`, `appOperations.js`
- **`Controllers/`** — Request handlers (thin layer, delegates to Models)
- **`Models/`** — Business logic and DB queries
- **`Schemas/`** — Mongoose schemas + AJV JSON Schema validation
- **`Middleware/`** — JWT auth, admin auth check, Multer + Cloudinary image upload, pet search filter builder

### API Route Groups

| Prefix | Purpose |
|---|---|
| `/users` | Auth (signup/login/logout), save/adopt/foster/return pets |
| `/pets` | Public search with filters, pet details |
| `/admin` | Pet CRUD (add/edit/delete), user management |
| `/appOperations` | Pet of the Week |

### Pet Lifecycle

`Available` → adopted (`Adopted`) or fostered (`Fostered`) → returned (`Available`).
Users can also save pets without adopting.

### Data Models (Mongoose)

**User:** `firstName`, `lastName`, `email`, `password` (bcrypt), `phoneNumber`, `bio`, `isAdmin`, `savedPet[]`, `adoptPet[]`, `fosterPet[]`

**Pet:** `type`, `breed`, `name`, `adoptionStatus`, `height`, `weight`, `color`, `bio`, `hypoallergenic`, `dietaryRestrictions`, `imageUrl` (Cloudinary), `userId` (current owner), `adopt[]`, `foster[]`

## Environment Variables

Backend requires a `.env` file:
- `MONGO_URI` — MongoDB connection string
- `TOKEN_SECRET` — JWT signing secret
- `PORT` — defaults to 8080
- Cloudinary credentials: `CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Email service: `BREVO_API_KEY`, `EMAIL_FROM`
- `FRONTEND_URL` — used by CORS and password-reset links

## Deployment

- Frontend: Render (`https://pet-adoption-133f.onrender.com`)
- Backend: Render (`https://pet-adoption-bbvp.onrender.com`)
