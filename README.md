# CS Tutor AI - AI-Integrated Personal Assistant

Μια mobile εφαρμογή εκπαιδευτικού βοηθού για φοιτητές πληροφορικής, με ενσωμάτωση Τεχνητής Νοημοσύνης μέσω OpenAI API.

## Τεχνολογική Στοίβα

- **Frontend:** React Native + Expo
- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3)
- **AI API:** OpenAI GPT-3.5-turbo

## Λειτουργικότητα

- Chat με AI Tutor εξειδικευμένο σε θέματα πληροφορικής
- Αποθήκευση ιστορικού συνομιλιών σε SQLite βάση δεδομένων
- Οργάνωση συνομιλιών σε sessions με αυτόματη δημιουργία τίτλου
- Accordion UI για εύκολη πλοήγηση στο ιστορικό

## Οδηγίες Εγκατάστασης

### Προαπαιτούμενα
- Node.js v18+
- npm

### Frontend (React Native)
```bash
npm install
npx expo start --web
```

### Backend (Node.js)
```bash
cd backend
npm install
```

Δημιούργησε αρχείο `.env` στον φάκελο backend:
```
OPENAI_API_KEY=your_api_key_here
```

```bash
node server.js
```

## Αρχιτεκτονική

Mobile App (React Native)
↓
Node.js REST API (Express)
↓
OpenAI GPT-3.5-turbo API
↓
SQLite Database


## API Endpoints

- `POST /api/session` — Δημιουργία νέου session
- `POST /api/chat` — Αποστολή μηνύματος και λήψη απάντησης AI
- `GET /api/history` — Ανάκτηση ιστορικού συνομιλιών
- `DELETE /api/history` — Διαγραφή ιστορικού
