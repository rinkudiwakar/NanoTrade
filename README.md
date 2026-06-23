# NanoTrade Frontend

NanoTrade is a zero-latency crypto paper trading terminal designed for speed, precision, and simplicity. Built to mimic the professional, data-first UX of platforms like Zerodha, this frontend provides real-time market depth, trade execution, and portfolio tracking without the clutter.

## 🚀 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Radix UI base components
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Authentication**: [Supabase](https://supabase.com/) (JWT)
- **Real-time Data**: Native WebSockets connected to FastAPI / Redis Pub-Sub
- **API Client**: [Axios](https://axios-http.com/)
- **Charting**: TradingView's [Lightweight Charts](https://tradingview.github.io/lightweight-charts/)

## ⚡ Features

- **Real-time Orderbook & Trades**: Live updates streamed via WebSockets.
- **In-memory Matching Engine Support**: Lightning-fast order execution reflecting instantly in the UI.
- **Dynamic Portfolio Management**: Real-time USD to INR conversion, holdings, and order history tracking.
- **Premium UX**: Dark mode by default, data-dense layouts, and informative empty/loading states.
- **Absolute Privacy**: Secure JWT handling with automatic state wiping upon logout.

## 🛠️ Setup & Installation

### 1. Clone & Install Dependencies
```bash
cd NanoTrade-frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (based on the provided `.env.example` if applicable) or populate it directly:
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/market
VITE_SUPABASE_URL=<YOUR_SUPABASE_URL>
VITE_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
```
*(Note: You can swap the local URLs for a secure tunnel URL if running the backend via Cloudflare or Ngrok).*

### 3. Run Development Server
```bash
npm run dev
```
The application will start on `http://localhost:5173`.

## 📁 Project Structure

```text
src/
├── components/
│   ├── trading/         # Core terminal components (OrderBook, Watchlist, etc.)
│   └── ui/              # Reusable base components (Button, Input, Tabs)
├── hooks/
│   └── useWebSocket.ts  # Persistent real-time market data connection
├── lib/
│   ├── supabase.ts      # Supabase client initialization
│   └── utils.ts         # Utility functions (tailwind class merging)
├── pages/
│   ├── Auth.tsx         # Login and Signup flow
│   ├── Dashboard.tsx    # Protected terminal layout
│   └── LandingPage.tsx  # Marketing and entry point
├── services/
│   └── api.ts           # Axios instance with auth interceptors
└── store/
    ├── marketStore.ts   # Zustand store for volatile real-time market data
    └── userStore.ts     # Zustand store for session, balance, and holdings
```

## 🔐 Authentication Flow
NanoTrade relies on Supabase for secure user authentication. 
- The `api.ts` interceptor automatically attaches the `access_token` to all REST requests.
- The `userStore.ts` handles active session listening and ensures that sensitive data (`holdings`, `orders`, `balance`) is explicitly purged from memory immediately upon logout.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](#) if you want to contribute.

---
*Built as a high-performance crypto paper trading solution.*
