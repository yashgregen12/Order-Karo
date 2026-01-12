# Client (React + Vite)

Simple frontend for the provided backend. Uses Vite + React and Tailwind CSS.

Quick start

1. Copy `.env.example` to `.env` and set `VITE_API_URL` if your backend isn't on the default.
2. Install dependencies:

```powershell
cd client; npm install
```

3. Run dev server:

```powershell
npm run dev
```

Notes

- The frontend expects the backend to expose APIs at `${VITE_API_URL}/products` and `/orders`.
- If your backend runs on `http://localhost:5000`, the default is correct.
