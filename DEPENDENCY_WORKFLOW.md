# KudiCart Admin Portal — Dependency & Reproducible Environment Guide

## 1. Runtime Standardization
- **Node.js:** `>=20.0.0 <23.0.0` (LTS, recommended: `v22.17.0`)
- **npm:** `>=10.0.0` (Pinned: `10.9.2`)
- **Configuration Files:** `.nvmrc`, `.node-version`, `.npmrc`, `package.json`

## 2. Port Architecture
- **Port:** `3000`
- **Dashboard URL:** `http://localhost:3000`

## 3. First-Time Setup
```bash
npm ci
npm run validate:deps
```

## 4. Normal Daily Development
```bash
npm run dev
```
Do **not** run `npm install` on normal daily startup.

## 5. Adding/Updating Dependencies
```bash
npm install <package-name>
npm run validate:deps
npm run type-check
npm run build
git add package.json package-lock.json
git commit -m "feat(deps): add <package-name>"
```
Colleague pulls and installs via:
```bash
git pull
npm ci
```

