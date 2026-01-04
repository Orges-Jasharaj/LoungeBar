# LoungeBar Frontend

Frontend aplikacion për LoungeBar, i krijuar me React + TypeScript + Vite.

## Karakteristika

- ✅ Login dhe Register forma
- ✅ JWT Authentication
- ✅ Protected Routes
- ✅ Dashboard bazë
- ✅ Komunikim me backend API

## Instalimi

```bash
npm install
```

## Ekzekutimi

```bash
npm run dev
```

Aplikacioni do të hapet në `http://localhost:3000`

## Struktura e Projektit

```
src/
├── components/          # Komponentët React
│   ├── Login.tsx       # Forma e login
│   ├── Register.tsx    # Forma e regjistrimit
│   ├── Dashboard.tsx   # Dashboard kryesor
│   └── ProtectedRoute.tsx  # Route mbrojtëse
├── context/            # React Context
│   └── AuthContext.tsx # Context për autentifikim
├── services/           # API Services
│   └── api.ts          # Axios instance dhe API calls
├── types/              # TypeScript types
│   └── auth.ts         # Types për autentifikim
├── App.tsx             # Komponenti kryesor
└── main.tsx            # Entry point
```

## Backend

Backend-i duhet të jetë duke u ekzekutuar në `http://localhost:5067`

## Hapat e Ardhshëm

- [ ] Dashboard për shfaqjen e porosive të tavolinës
- [ ] QR Code scanner
- [ ] Shfaqja e porosive në kohë reale
- [ ] UI/UX përmirësime

