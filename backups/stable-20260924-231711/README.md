# Qist Khata App

A lightweight business ledger app for tracking customer sales, installments, and collected payments.

## Features

- Add customer records
- Record sales, payment receipts, and installments
- Dashboard summary cards
- Search ledger entries
- Local persistence using browser storage

## Run locally

Open the project folder and serve it with a simple static server:

```bash
cd "c:/Users/pc/WPS Cloud/qist-khata-app"
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Files

- `index.html` – app layout
- `style.css` – visual design
- `app.js` – ledger logic and state management
