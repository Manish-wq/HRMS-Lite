# HRMS Lite - Deployment Guide

This guide covers deploying the HRMS Lite application using **free-tier** hosting platforms.

| Component | Platform    | Free Tier                        |
|-----------|-------------|----------------------------------|
| Frontend  | **Vercel**  | Unlimited sites, custom domains  |
| Backend   | **Render**  | Free web service, 750 hrs/month  |
| Database  | **Neon**    | Free PostgreSQL, 0.5 GB storage  |

---

## Prerequisites

- GitHub account with the HRMS repo pushed
- Custom domain with DNS access
- Accounts on [Vercel](https://vercel.com), [Render](https://render.com), and [Neon](https://neon.tech)

---

## Step 1: Database — Neon (Free PostgreSQL)

Render's free PostgreSQL expires after 90 days. **Neon** provides a permanently free PostgreSQL instance.

### 1.1 Create a Neon Project

1. Go to [neon.tech](https://neon.tech) → Sign up / Log in
2. Click **"New Project"**
3. Set project name: `hrms-lite`
4. Choose region closest to your backend (e.g., `US East`)
5. Click **Create Project**

### 1.2 Get Connection Details

After creation, Neon shows a connection string like:

```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Save these values — you'll need them for Render:

| Variable      | Value from connection string        |
|---------------|-------------------------------------|
| `DB_NAME`     | `neondb`                            |
| `DB_USER`     | `username`                          |
| `DB_PASSWORD` | `password`                          |
| `DB_HOST`     | `ep-cool-name-123456.us-east-2.aws.neon.tech` |
| `DB_PORT`     | `5432`                              |

---

## Step 2: Backend — Render

### 2.1 Prepare Backend for Production

Before deploying, add `gunicorn` as a dependency:

```bash
cd backend
uv add gunicorn
```

Create `backend/render.yaml` (optional, for Blueprint deploys):

```yaml
services:
  - type: web
    name: hrms-backend
    runtime: python
    buildCommand: pip install -r requirements.txt && python manage.py migrate
    startCommand: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.13
```

Generate a `requirements.txt` for Render (Render doesn't support `uv` natively):

```bash
cd backend
uv pip compile pyproject.toml -o requirements.txt
```

Or manually create `backend/requirements.txt`:

```
django>=6.0.3
djangorestframework>=3.16.1
django-cors-headers>=4.9.0
psycopg2-binary>=2.9.11
python-decouple>=3.8
gunicorn>=23.0.0
```

### 2.2 Create Render Web Service

1. Go to [render.com](https://render.com) → **Dashboard** → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting         | Value                                            |
|-----------------|--------------------------------------------------|
| Name            | `hrms-backend`                                   |
| Root Directory  | `backend`                                        |
| Runtime         | `Python`                                         |
| Build Command   | `pip install -r requirements.txt`                |
| Start Command   | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` |
| Instance Type   | **Free**                                         |

4. Add **Environment Variables** (click "Advanced" → "Add Environment Variable"):

| Key                    | Value                                      |
|------------------------|--------------------------------------------|
| `SECRET_KEY`           | *(generate a strong random key)*           |
| `DEBUG`                | `False`                                    |
| `DB_NAME`              | *(from Neon)*                              |
| `DB_USER`              | *(from Neon)*                              |
| `DB_PASSWORD`          | *(from Neon)*                              |
| `DB_HOST`              | *(from Neon)*                              |
| `DB_PORT`              | `5432`                                     |
| `ALLOWED_HOSTS`        | `hrms-backend.onrender.com,api.yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | `https://yourdomain.com,https://www.yourdomain.com` |

> **Generate SECRET_KEY** using:
> ```bash
> python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
> ```

5. Click **Create Web Service**

### 2.3 Run Migrations on Render

After the first deploy succeeds, run migrations:

- Go to your Render service → **Shell** tab
- Run: `python manage.py migrate`

Or add migrations to the build command:

```
pip install -r requirements.txt && python manage.py migrate
```

### 2.4 Custom Domain for Backend

1. In Render dashboard → your service → **Settings** → **Custom Domains**
2. Add: `api.yourdomain.com`
3. Render will show DNS records to add:

| Type  | Name  | Value                              |
|-------|-------|------------------------------------|
| CNAME | `api` | `hrms-backend.onrender.com`        |

4. Add this CNAME record in your domain's DNS settings
5. Wait for DNS propagation (usually 5–30 minutes)
6. Update `ALLOWED_HOSTS` env var to include `api.yourdomain.com`

---

## Step 3: Frontend — Vercel

### 3.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure:

| Setting              | Value       |
|----------------------|-------------|
| Framework Preset     | `Vite`      |
| Root Directory       | `frontend`  |
| Build Command        | `npm run build` |
| Output Directory     | `dist`      |

4. Add **Environment Variable**:

| Key            | Value                                    |
|----------------|------------------------------------------|
| `VITE_API_URL` | `https://api.yourdomain.com/api`         |

> ⚠️ Vite env vars must start with `VITE_` to be exposed to the client.

5. Click **Deploy**

### 3.2 Custom Domain for Frontend

1. In Vercel dashboard → your project → **Settings** → **Domains**
2. Add your domain: `yourdomain.com` (and/or `www.yourdomain.com`)
3. Vercel will show DNS records:

**For root domain (`yourdomain.com`):**

| Type | Name | Value          |
|------|------|----------------|
| A    | `@`  | `76.76.21.21`  |

**For www subdomain:**

| Type  | Name  | Value                |
|-------|-------|----------------------|
| CNAME | `www` | `cname.vercel-dns.com` |

4. Add these records in your DNS settings
5. Vercel auto-provisions SSL certificates

---

## Step 4: Update CORS & Allowed Hosts

After deployment, update the Render environment variables:

```
ALLOWED_HOSTS=api.yourdomain.com,hrms-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Render will auto-redeploy when env vars change.

---

## Step 5: Django Production Settings

Ensure `backend/config/settings.py` handles production correctly. The current setup with `python-decouple` already supports this. Verify these are set via env vars:

```python
# These are already in settings.py — no changes needed
SECRET_KEY = config('SECRET_KEY', default='...')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=...)
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='...', cast=...)
```

For production, also add static file serving. Add `whitenoise` if serving Django admin static files:

```bash
cd backend
uv add whitenoise
```

Add to `MIDDLEWARE` in `settings.py` (after `SecurityMiddleware`):

```python
'whitenoise.middleware.WhiteNoiseMiddleware',
```

Add to `settings.py`:

```python
STATIC_ROOT = BASE_DIR / 'staticfiles'
```

Then update the Render build command:

```
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
```

---

## DNS Summary

| Subdomain             | Type  | Target                           |
|-----------------------|-------|----------------------------------|
| `yourdomain.com`      | A     | `76.76.21.21` (Vercel)           |
| `www.yourdomain.com`  | CNAME | `cname.vercel-dns.com` (Vercel)  |
| `api.yourdomain.com`  | CNAME | `hrms-backend.onrender.com`      |

---

## Verification Checklist

After deployment, verify:

- [ ] `https://api.yourdomain.com/api/employees/` returns JSON
- [ ] `https://api.yourdomain.com/api/attendance/` returns JSON
- [ ] `https://yourdomain.com` loads the React app
- [ ] Dashboard shows stats from the live backend
- [ ] Can add/delete employees
- [ ] Can mark/edit/delete attendance
- [ ] CORS errors are absent in browser console
- [ ] SSL certificates are active (green lock icon)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Verify `CORS_ALLOWED_ORIGINS` matches your frontend URL exactly (include `https://`) |
| 500 errors on backend | Check Render logs; ensure `DEBUG=False` and `SECRET_KEY` is set |
| Database connection failed | Verify Neon credentials; ensure `?sslmode=require` if needed |
| Static files 404 | Run `collectstatic`; ensure `whitenoise` is in middleware |
| Render free tier sleeps | First request after inactivity takes ~30s (cold start) |
| Frontend env var not working | Must prefix with `VITE_`; redeploy after changing |

---

## Cost Summary

| Service        | Plan  | Cost    | Limits                      |
|----------------|-------|---------|-----------------------------|
| Vercel         | Hobby | **$0**  | 100 GB bandwidth/month      |
| Render         | Free  | **$0**  | 750 hrs/month, sleeps after 15 min inactivity |
| Neon           | Free  | **$0**  | 0.5 GB storage, 1 project   |
| **Total**      |       | **$0**  |                             |

> **Note:** Render free tier spins down after 15 minutes of inactivity. The first request after sleep takes ~30 seconds. For always-on, upgrade to Render's paid plan ($7/month).
