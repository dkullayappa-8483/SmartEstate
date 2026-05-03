# SmartEstate (GitHub Pages)

Static site only. Live URL after setup:

**`https://<your-username>.github.io/<repository-name>/`**

Example: `https://dkullayappa-8483.github.io/SmartEstate/`

## One-time setup on GitHub

1. Sign in to GitHub and click **New repository**.
2. Name the repository (example: **SmartEstate**). Leave **empty** — no README, no .gitignore (this folder already has them).
3. Create the repository.

## Push this folder from your PC

Open PowerShell or Terminal **inside this folder** (`SmartEstate-gh-pages`), then run (replace `YOUR-USER` and `YOUR-REPO`):

```bash
git init
git add .
git commit -m "Initial commit: SmartEstate GitHub Pages site"
git branch -M main
git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
git push -u origin main
```

If GitHub asks you to log in, use a **Personal Access Token** as the password (Settings → Developer settings → Tokens).

## Enable GitHub Pages

1. Open the repo on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)**.
4. Save. Wait about one minute, then open:

**`https://YOUR-USER.github.io/YOUR-REPO/`**
