# F.A.N Coffee Shop

Single-page marketing site for **F.A.N Coffee Shop** — light periwinkle branding, full menu, admin dashboard, ready for [Vercel](https://vercel.com).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and set `SESSION_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`. For local testing, `.env.local` may already define `admin` / `changeme` — change these before deploying.

## Admin

- **Login:** footer link or [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Dashboard:** edit all site copy and menu categories/items (add, remove, edit), then **Save changes**

Content is stored in `data/site-content.json`. On Vercel, set `BLOB_READ_WRITE_TOKEN` so saves persist (see `.env.example`).

## Deploy to Vercel

1. Push this folder to a GitHub repository (or import from your machine).
2. In [Vercel](https://vercel.com/new), import the repo.
3. Add environment variables: `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and optionally `BLOB_READ_WRITE_TOKEN`.
4. Deploy.

## Customize

- **Content & menu:** use the admin dashboard, or edit `data/site-content.json`
- **Colors:** CSS variables in `app/globals.css` (`--periwinkle`, `--teal`, etc.)
- **Logo:** replace `public/logo.png`
