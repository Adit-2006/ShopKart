# ShopKart — Production Deployment Guide

This guide deploys the ShopKart full‑stack e‑commerce app using only free tiers:

| Layer     | Technology                     | Hosting        |
| --------- | ------------------------------ | -------------- |
| Frontend  | React 19 + Vite 8              | Vercel (Hobby) |
| Backend   | Node.js + Express 5            | Render (Free)  |
| Database  | MongoDB + Mongoose 9           | MongoDB Atlas (M0) |
| Payments  | Razorpay (optional, test/live) | Razorpay       |

Everything below was verified against the actual source in this repository. Paths, script names and environment variable names are the real ones used by the code.

> **Never commit real secrets.** All examples use placeholders. The real values live only in `backend/.env` locally and in the Render/Vercel dashboards in production.

---

## 1. Verified project structure

```
ShopKart/
├── backend/                     # Express API  (deploy to Render, root dir = backend)
│   ├── index.js                 # Server entry point (npm start -> node index.js)
│   ├── config/
│   │   └── razorpay.js          # Razorpay client (reads RAZORPAY_KEY_ID/SECRET)
│   ├── controllers/
│   │   ├── cart.controller.js
│   │   ├── customer.controller.js   # register / login / me / logout, cookie settings
│   │   ├── order.controller.js      # Razorpay order creation + verification
│   │   ├── product.controllers.js
│   │   └── wishlist.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js   # JWT from cookie "token" OR "Authorization: Bearer"
│   ├── models/
│   │   ├── customer.models.js   # "User" model
│   │   ├── order.model.js       # "Order" model
│   │   └── product.models.js    # "Product" model
│   ├── routes/
│   │   ├── customer.routes.js   # /customers
│   │   ├── product.routes.js    # /products
│   │   ├── wishlist.routes.js   # /wishlist   (auth required)
│   │   ├── cart.routes.js       # /cart       (auth required)
│   │   └── order.routes.js      # /orders     (auth required)
│   ├── utils/
│   │   └── generateToken.js     # signs JWT with process.env.secret
│   ├── .env                     # LOCAL ONLY — git-ignored, never committed
│   ├── .env.example             # committed template (placeholders only)
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── package.json             # stray/unused (not the app) — ignore
│   └── shopkart/                # Vite + React app (deploy to Vercel, root dir = frontend/shopkart)
│       ├── index.html
│       ├── vite.config.js
│       ├── vercel.json          # SPA fallback rewrite for React Router
│       ├── eslint.config.js
│       ├── .env.example         # committed template (placeholders only)
│       ├── package.json         # build: "vite build", dev: "vite"
│       ├── package-lock.json
│       └── src/
│           ├── main.jsx         # React entry point
│           ├── App.jsx          # React Router routes
│           ├── services/api.js  # axios client, baseURL from VITE_API_URL
│           ├── components/      # Navbar, ProtectedRoute, cards, ...
│           ├── context/         # CartContext, WishlistContext
│           └── pages/           # Home, Products, Cart, Checkout, Orders, ...
├── DEPLOYMENT.md                # this file
├── .gitignore                   # repo-root ignore rules
└── README.md
```

**Verified API route prefixes (do not add another `/api` in the frontend):**

| Method + path | Auth | Purpose |
| ------------- | ---- | ------- |
| `GET  /api/health` | none | Health/readiness probe |
| `POST /customers/register` | none | Create account + set `token` cookie |
| `POST /customers/login` | none | Login + set `token` cookie |
| `GET  /customers/me` | yes | Current user (session check) |
| `POST /customers/logout` | none | Clear `token` cookie |
| `GET  /products`, `GET /products/:id` | none | Catalog |
| `POST /products` | none | Create product(s) |
| `GET/POST/PATCH/DELETE /cart[/:productId]` | yes | Cart |
| `GET/POST/DELETE /wishlist[/:productId]` | yes | Wishlist |
| `POST /orders/create-payment-order`, `POST /orders/verify-payment`, `GET /orders`, `GET /orders/:id` | yes | Orders |

Authentication is **cookie based**: login/register set an `httpOnly` JWT cookie named `token`, and the axios client sends it with `withCredentials: true`. The backend also accepts `Authorization: Bearer <jwt>` as a fallback, but the current frontend uses cookies only.

---

## 2. Prerequisites and local verification

- Node.js **22.x** (declared in both `package.json` `engines` fields; tested with v22.22.1)
- npm (lockfiles are committed — use `npm ci`)
- A MongoDB connection string (Atlas or local)
- Optional: Razorpay test keys for the payment flow

Local run (two terminals):

```bash
# ---- Backend ----
cd backend
cp .env.example .env          # then edit .env with real local values
npm ci
npm run dev                   # or: npm start

# ---- Frontend ----
cd frontend/shopkart
cp .env.example .env          # VITE_API_URL=http://localhost:8083
npm ci
npm run dev                   # Vite dev server on http://localhost:5173
```

Verify locally:

```bash
curl http://localhost:8083/api/health
# {"status":"ok","database":"connected","uptime":...}
```

Production build check (from `frontend/shopkart`):

```bash
VITE_API_URL=http://localhost:8083 npm run build   # outputs dist/
```

---

## 3. Create and configure MongoDB Atlas

1. Create a free account at <https://www.mongodb.com/cloud/atlas> and create an **M0 (Free)** cluster.
2. **Database user:** *Database Access → Add New Database User*.
   - Authentication: Password
   - Role: `readWrite` on the ShopKart database (or `Atlas admin` for simplicity, not recommended).
   - Save the username/password — you will put them inside the connection string.
3. **Network access:** *Network Access → Add IP Address*.
   - For Render (whose outbound IPs are dynamic on the free plan), add `0.0.0.0/0` to allow all, or add your Render service's static/outbound IPs if available on your plan.
   - For local development, also add your current IP.
4. **Get the connection string:** *Cluster → Connect → Drivers → Node.js*, copy the `mongodb+srv://...` string and insert the database name, e.g.:

   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/shopkart?retryWrites=true&w=majority
   ```

   Special characters in the password must be URL-encoded.

5. **Env var name used by the code: `dbUrl`** (camelCase). The backend reads `process.env.dbUrl` in `backend/index.js`. Use this exact name in Render and in `backend/.env`.

The app connects to MongoDB **before** it starts listening, so an unreachable/unauthenticated cluster makes the server exit with a clear log line rather than serving broken requests.

---

## 4. Deploy the backend to Render

1. Push this repository to GitHub (already at `https://github.com/Adit-2006/ShopKart`).
2. In Render: **New → Web Service → Build and deploy from a Git repository**, select the repo.
3. Configure exactly:

   | Setting | Value |
   | ------- | ----- |
   | **Name** | `shopkart-api` (or any name) |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm ci` |
   | **Start Command** | `npm start` |
   | **Health Check Path** | `/api/health` |
   | **Instance Type** | Free |

4. **Environment variables** (Render → Environment). Variable names must match exactly:

   | Key | Value (example / notes) |
   | --- | ----------------------- |
   | `dbUrl` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/shopkart?...` |
   | `secret` | a long random string, e.g. from `openssl rand -hex 32` |
   | `FRONTEND_URL` | your Vercel URL, e.g. `https://shopkart.vercel.app` (comma-separate multiple origins; no trailing slash) |
   | `NODE_ENV` | `production` |
   | `RAZORPAY_KEY_ID` | Razorpay key id (optional) |
   | `RAZORPAY_KEY_SECRET` | Razorpay key secret (optional) |
   | `COOKIE_SAMESITE` | leave unset (defaults to `none` in production). See §Appendix for the same-origin proxy option. |

   > `PORT` is injected by Render automatically — **do not set it**. The code uses `process.env.PORT` with a `8083` fallback.

   > The server binds to `0.0.0.0` so Render can route to it.

5. Deploy. When healthy, the logs show:

   ```
   [startup] MongoDB connected
   [startup] Server listening on port <port>
   ```

   If `dbUrl`/`secret` are missing the process exits with a clear message; if MongoDB is unreachable it logs `Failed to connect to MongoDB: ...` and exits (no credentials are printed).

6. Note the service URL, e.g. `https://shopkart-api.onrender.com`.

> **Node version:** `backend/package.json` pins `"engines": { "node": "22.x" }`. If you want to force it, also set the Render env var `NODE_VERSION=22`.

---

## 5. Deploy the frontend to Vercel

1. In Vercel: **Add New → Project**, import the same GitHub repo.
2. Configure exactly:

   | Setting | Value |
   | ------- | ----- |
   | **Framework Preset** | `Vite` |
   | **Root Directory** | `frontend/shopkart` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm ci` (or leave default `npm install`) |

3. **Environment variable** (Vercel → Settings → Environment Variables), for **Production** (and Preview if you want previews to work):

   | Key | Value |
   | --- | ----- |
   | `VITE_API_URL` | your Render URL, e.g. `https://shopkart-api.onrender.com` (no trailing slash, no `/api`) |

   > `VITE_*` values are compiled into the browser bundle at build time — they are **not** secret. Never put database strings, JWT secrets or API keys here. After changing this value you must **redeploy** for it to take effect.

4. Deploy. `frontend/shopkart/vercel.json` adds an SPA fallback (`rewrites` to `/index.html`), so deep links like `/products/123`, `/cart`, `/orders` load correctly on refresh.

5. Note the frontend URL, e.g. `https://shopkart.vercel.app`.

---

## 6. Connect the frontend URL to the backend CORS config

CORS on the backend is an **explicit allow-list** read from `FRONTEND_URL`. The frontend sends credentials, so wildcards are never used.

1. Copy the Vercel production URL.
2. In Render → your service → **Environment**, set:

   ```
   FRONTEND_URL=https://shopkart.vercel.app
   ```

   Multiple origins (e.g. preview deployments) can be comma-separated with no spaces:

   ```
   FRONTEND_URL=https://shopkart.vercel.app,https://shopkart-git-main-yourname.vercel.app
   ```

3. Save — Render redeploys automatically. Until `FRONTEND_URL` matches the browser origin exactly (scheme + host, no trailing slash), the browser will block credentialed requests and the server logs `[cors] Blocked request from disallowed origin: ...`.

Local development on `http://localhost:5173` is always allowed outside production, even without `FRONTEND_URL`.

---

## 7. Test the health endpoint and API routes

```bash
# Health (should be 200 once the DB is connected)
curl -i https://shopkart-api.onrender.com/api/health

# Public catalog (200)
curl -i https://shopkart-api.onrender.com/products

# Protected route without auth (401)
curl -i https://shopkart-api.onrender.com/cart
```

The health endpoint returns only `{ status, database, uptime }` — no credentials or environment values.

---

## 8. Test signup, login, authenticated requests and core flows

Browser flow (recommended, uses the real cookie flow):

1. Open the Vercel URL → redirected to `/register`.
2. Create an account → you are redirected to `/login`.
3. Log in → lands on `/home`; open the browser DevTools → Application → Cookies and confirm a `token` cookie exists for the **backend domain**.
4. Browse `/products`, add items to the **cart** and **wishlist** (badges update).
5. Go to `/checkout`, fill the shipping form and place an order. With no real Razorpay keys the backend returns a development order reference and the app navigates to `/order-success/:id`.
6. Check `/orders` and `/orders/:id`.

CLI flow (cookie jar) for quick smoke tests:

```bash
BASE=https://shopkart-api.onrender.com
JAR=/tmp/shopkart-cookies.txt

# Register
curl -i -c "$JAR" -X POST "$BASE/customers/register" \
  -H 'Content-Type: application/json' \
  -d '{"fullname":"Test User","email":"test@example.com","password":"secret123","phone":"1234567890"}'

# Login
curl -i -c "$JAR" -X POST "$BASE/customers/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123"}'

# Authenticated session check
curl -i -b "$JAR" "$BASE/customers/me"

# Logout
curl -i -b "$JAR" -X POST "$BASE/customers/logout"
```

> Use a throwaway email/DB for these tests. Do not point test scripts at production data.

---

## 9. Common deployment errors and fixes

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Render deploy fails immediately, logs `Missing required environment variable(s): dbUrl, secret` | Env vars not set | Set `dbUrl` and `secret` in Render |
| Render logs `Failed to connect to MongoDB: ...` | Wrong `dbUrl`, bad password, or Atlas IP allow-list | Verify the connection string (URL-encode the password) and add `0.0.0.0/0` (or Render's IPs) in Atlas → Network Access |
| Browser console: `blocked by CORS policy` / server logs `[cors] Blocked request from disallowed origin` | `FRONTEND_URL` doesn't match the browser origin | Set `FRONTEND_URL` to the exact Vercel origin (https, no trailing slash), then redeploy |
| Login "succeeds" but you are immediately logged out / `GET /customers/me` returns 401 | Third-party cookie blocked cross-site, or cookie not `Secure`/`SameSite=None` | Ensure `NODE_ENV=production` (so cookies are `SameSite=None; Secure`) and the site is loaded over HTTPS. See the Appendix for the most reliable fix (same-origin proxy) |
| Refresh on `/products/123` returns Vercel 404 | Missing SPA rewrite | `frontend/shopkart/vercel.json` must be present (it is in this repo) |
| Frontend calls `http://localhost:8083` in production | `VITE_API_URL` was not set (or not set for the right environment) before building | Set `VITE_API_URL` in Vercel and redeploy — Vite bakes it in at build time |
| Vercel build fails / wrong folder | Wrong Root Directory | Set Root Directory to `frontend/shopkart` |
| Render build runs the frontend | Wrong Root Directory | Set Root Directory to `backend` |
| `npm ci` fails on Render/Vercel | `package-lock.json` out of sync with `package.json` | Run `npm install` locally and commit the updated lockfile |

---

## 10. Free-tier behaviour, sleeping and limits

- **Render Free Web Service:** spins down after ~15 minutes of inactivity. The first request after idle triggers a cold start (~30–60 s). Free instance hours are limited (~750 h/month across free services). Expect slow first loads.
- **Vercel Hobby:** generous static hosting/CDN, but intended for personal/non-commercial projects; there are bandwidth and build-minute limits. Serverless functions (not used here — this is a static Vite build) have their own limits.
- **MongoDB Atlas M0:** ~512 MB storage, shared CPU/RAM, limited concurrent connections, no automated backups. Fine for demos; not for production traffic.
- **Razorpay:** test mode is free; live mode has transaction fees. Without keys the app falls back to a local test reference for orders.

Cold starts do not affect the health endpoint's correctness — it will return `200` once wake-up and DB connection complete.

---

## 11. Environment variables to change when moving localhost → production

| Variable | Where | Local value | Production value |
| -------- | ----- | ----------- | ---------------- |
| `dbUrl` | Render (`backend/.env` locally) | local Mongo or dev Atlas URI | Atlas production connection string |
| `secret` | Render | any dev string | a **new** long random secret (`openssl rand -hex 32`) |
| `NODE_ENV` | Render | `development` | `production` |
| `FRONTEND_URL` | Render | `http://localhost:5173` | `https://<your-app>.vercel.app` |
| `PORT` | Render | `8083` (fallback) | injected by Render — do not set |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Render | test keys (optional) | live/test keys (optional) |
| `VITE_API_URL` | Vercel | `http://localhost:8083` | `https://<your-service>.onrender.com` |

`PORT`, `NODE_ENV` and hosting URLs are the only values that must differ; the backend code reads all of them from the environment.

> Note: the existing local `backend/.env` also contains `username`, `password` and `google_doc`. **None of these are read anywhere in the code** — they are legacy/unused and can be omitted from Render.

---

## Appendix A — Cross-site cookies (important for reliability)

The frontend (`*.vercel.app`) and backend (`*.onrender.com`) are on **different sites**. For the browser to send the `token` cookie on cross-origin requests, the backend uses (in production):

```
SameSite=None; Secure; HttpOnly
```

and the frontend sends `withCredentials: true` (already enabled in `src/services/api.js`). This works in Chrome, Firefox and Edge over HTTPS, but **Safari/iOS and strict privacy modes block third-party cookies by default**, which can make login appear to fail there.

### Most reliable alternative: serve the API same-origin via a Vercel rewrite

Proxy the API through the Vercel domain so cookies become first-party. Add rewrites to `frontend/shopkart/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/customers/:path*", "destination": "https://<your-service>.onrender.com/customers/:path*" },
    { "source": "/products/:path*",  "destination": "https://<your-service>.onrender.com/products/:path*" },
    { "source": "/cart/:path*",      "destination": "https://<your-service>.onrender.com/cart/:path*" },
    { "source": "/wishlist/:path*",  "destination": "https://<your-service>.onrender.com/wishlist/:path*" },
    { "source": "/orders/:path*",    "destination": "https://<your-service>.onrender.com/orders/:path*" },
    { "source": "/api/:path*",       "destination": "https://<your-service>.onrender.com/api/:path*" },
    { "source": "/(.*)",             "destination": "/index.html" }
  ]
}
```

Then:
- Set Vercel `VITE_API_URL` to an **empty value** (the API client then uses relative, same-origin requests — supported by the code).
- Set Render `COOKIE_SAMESITE=lax` (same-origin, more secure).
- `FRONTEND_URL` can remain the Vercel origin.

This removes third-party-cookie dependency entirely and also sidesteps CORS. It is optional; the direct `VITE_API_URL → Render` setup works on mainstream desktop browsers.

> **CSRF note:** `SameSite=None` means the browser will attach the auth cookie to requests originating from *other* sites. The backend responds with a CORS block so the attacker cannot read the response, but the request itself can still reach the server (e.g. `POST /cart/:id`). The same-origin proxy option above lets you use `SameSite=Lax`, which prevents the cookie from being sent on cross-site state-changing requests and therefore mitigates this. If you keep the direct cross-site setup, consider adding a CSRF token or an `Origin`-header check on state-changing routes.

---

## Appendix B — Secret hygiene

- `backend/.env` is **not** tracked by Git (verified) and is now ignored by `backend/.gitignore`.
- The committed `lab6.md` documents environment **variable names** and the code's placeholder fallback (`rzp_test_secret`) — it contains **no real credentials**.
- If the values in `backend/.env` (MongoDB password, `secret`, Razorpay keys) were ever shared, pasted into a chat, or committed elsewhere, **rotate them**:
  1. MongoDB Atlas → Database Access → Edit user → change password; update `dbUrl` in Render.
  2. Generate a new `secret` (`openssl rand -hex 32`); updating it invalidates all existing sessions (users must log in again).
  3. Razorpay Dashboard → regenerate API keys; update `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` in Render.
- Git history is intentionally never rewritten. Rotation is the safe remedy if a secret was exposed.
