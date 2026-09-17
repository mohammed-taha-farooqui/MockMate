# MockMate — Frontend

> **Member B · React + Vite + TailwindCSS v4 Frontend Foundation**

MockMate is a candidate-only AI Voice Interviewer platform. Candidates practice
realistic mock interviews with a conversational AI, receive instant feedback, and
track their progress over time.

---

## Technologies Used

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI component framework |
| Vite | 6 | Build tool & dev server |
| React Router DOM | 6 | Client-side routing |
| TailwindCSS | 4 | Utility-first CSS (CSS-first config) |
| Axios | 1.7 | HTTP client for backend API calls |
| lucide-react | latest | Icon library |

---

## Project Structure

```
frontend/
├── public/
│   ├── avatar/        # AI avatar assets
│   └── assets/        # Static assets (favicon, images)
│
├── src/
│   ├── components/    # Reusable UI components
│   │   ├── Navbar.jsx
│   │   └── PageShell.jsx
│   ├── pages/         # Route-level page components
│   │   ├── Home.jsx
│   │   ├── Setup.jsx
│   │   ├── MatchResult.jsx
│   │   ├── InterviewLobby.jsx
│   │   ├── Interview.jsx
│   │   ├── Feedback.jsx
│   │   ├── FinalReport.jsx
│   │   ├── Progress.jsx
│   │   └── NotFound.jsx
│   ├── hooks/         # Custom React hooks (future)
│   ├── services/
│   │   └── api.js     # Axios instance
│   ├── utils/         # Helper functions (future)
│   ├── context/       # React context providers (future)
│   ├── App.jsx        # Root component with routing
│   ├── main.jsx       # React entry point
│   └── index.css      # Global styles + Tailwind v4 import
│
├── .env.example       # Environment variable template
├── .gitignore
├── package.json
├── vite.config.js
└── README.md          # This file
```

---

## Routes

| Path | Page | Description |
|---|---|---|
| `/` | Home | Landing page |
| `/setup` | Setup | Configure interview parameters |
| `/match-result` | Match Result | Review AI-matched interview profile |
| `/interview-lobby` | Interview Lobby | Mic check & pre-interview brief |
| `/interview` | Interview | Live AI voice interview session |
| `/feedback` | Feedback | Per-answer AI feedback |
| `/final-report` | Final Report | Overall session report & export |
| `/progress` | Progress | Historical analytics & trends |

---

## Installation

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

---

## Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173** by default.

---

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

---

## Environment Variables

Create a `.env` file in the `frontend/` directory (copy from `.env.example`):

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000` | URL of the MockMate backend API |

> ⚠️ **Never commit `.env` files containing real secrets to version control.**

All environment variables must be prefixed with `VITE_` to be exposed to the
browser by Vite.

---

## Notes for Team Members

- **TailwindCSS v4** uses a **CSS-first configuration** — there is no
  `tailwind.config.js`. Tailwind is configured via `src/index.css` using
  `@import "tailwindcss"` and custom CSS properties.
- The Axios instance in `src/services/api.js` must be used for **all API calls**.
  Do not hard-code backend URLs inside components.
- Placeholder pages are marked with 🚧 — they will be replaced with full
  implementations in subsequent milestones.
