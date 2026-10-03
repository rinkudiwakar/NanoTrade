# 🖥️ NanoTrade Frontend — Professional Crypto Trading Terminal

<p align="center">
  <img src="https://img.shields.io/badge/React_18-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-orange?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/TradingView_Lightweight_Charts-blue?style=for-the-badge&logo=tradingview&logoColor=white" alt="Lightweight Charts" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/WebSockets-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="WebSockets" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
</p>

---

## 📌 Executive Overview

**NanoTrade Frontend** is a zero-latency crypto paper-trading terminal built with a data-dense, minimalist **Zerodha-inspired trading UX**. It provides institutional-grade trading tools for Indian cryptocurrency traders:

* **Real-Time Market Depth:** Live visual orderbook rendering bids and asks with dynamic depth percentage bars.
* **Hardware-Accelerated Financial Charts:** Integrated **TradingView Lightweight Charts** updating tick-by-tick directly on an HTML5 `<canvas>`.
* **Zero-Lag State Segregation:** High-frequency WebSocket price bursts are decoupled via dual **Zustand** stores, keeping order entry and portfolio views ultra-responsive.
* **Native INR Denomination:** All market prices, margins, order sizes, and PnL are denominated in Indian Rupees (INR) with real-time live currency conversion.
* **Instant Execution Feedback:** Limit and market orders trigger sub-millisecond execution updates, toast notifications, and automatic margin balance reconciliations.

> 📖 **Interview Candidate Notice:** A master, exhaustive interview preparation and system design study guide is included directly inside this folder at [**`INTERVIEW_PREPARATION_GUIDE.md`**](./INTERVIEW_PREPARATION_GUIDE.md).

---

## 🏗️ Frontend Architecture & Component Hierarchy

```mermaid
flowchart TB
    subgraph Browser ["Client Browser"]
        subgraph Views ["Pages & Layouts"]
            LANDING["LandingPage.tsx\n(Hero Chart, Live Markets, CTA)"]
            AUTH["Auth.tsx\n(Supabase Email/Password Login & Signup)"]
            DASHBOARD["Dashboard.tsx\n(Core Trading Terminal Layout)"]
        end

        subgraph TerminalComponents ["Trading Components (Zerodha Minimalist)"]
            WATCHLIST["Watchlist.tsx\n(Symbol, 24h Change, Volume)"]
            CHART["ChartContainer.tsx\n(Lightweight Charts Canvas)"]
            ORDERBOOK["OrderBook.tsx\n(Bids/Asks Depth & Spread)"]
            ORDERFORM["OrderForm.tsx\n(Limit/Market Buy & Sell)"]
            TRADEFEED["TradeFeed.tsx\n(Live Executed Trade Stream)"]
            PORTFOLIO["PortfolioTabs.tsx\n(Positions, Orders, Holdings Margin)"]
            TICKER["PriceTicker.tsx\n(INR Price, 24h High/Low/Delta)"]
        end

        subgraph StateManagement ["Zustand State Stores"]
            M_STORE["marketStore.ts\n(Orderbook, Recent Trades, Candlesticks)\n[SessionStorage Cache]"]
            U_STORE["userStore.ts\n(Session Token, Margin Balance, Active Orders)"]
        end

        subgraph Networking ["Communication Layer"]
            WS_HOOK["useWebSocket.ts\n(Auto-reconnecting Socket)"]
            AXIOS["api.ts\n(Axios Instance with Supabase JWT Interceptor)"]
        end
    end

    subgraph BackendGateway ["Backend API & Broadcast (FastAPI)"]
        REST_API["FastAPI REST Endpoints\n(POST /orders, GET /portfolio)"]
        WS_ENDPOINT["FastAPI WebSocket Hub\n(/ws/market)"]
    end

    %% Component to Layout
    DASHBOARD --> TICKER
    DASHBOARD --> WATCHLIST
    DASHBOARD --> CHART
    DASHBOARD --> ORDERBOOK
    DASHBOARD --> ORDERFORM
    DASHBOARD --> TRADEFEED
    DASHBOARD --> PORTFOLIO

    %% State Bindings
    M_STORE --> ORDERBOOK
    M_STORE --> CHART
    M_STORE --> TRADEFEED
    M_STORE --> TICKER
    U_STORE --> PORTFOLIO
    U_STORE --> ORDERFORM

    %% Network Connections
    WS_HOOK -->|Dispatches Price/Trades/Depth| M_STORE
    WS_ENDPOINT -->|Stream| WS_HOOK
    ORDERFORM -->|Place Order Request| AXIOS
    PORTFOLIO -->|Fetch Margin & History| AXIOS
    AXIOS -->|Authenticated REST Requests| REST_API
```

---

## 🔄 How the Frontend & Backend Work Together

The frontend and backend interact through a synchronized dual-channel pipeline (REST for state mutations + WebSockets for real-time events):

```mermaid
sequenceDiagram
    autonumber
    actor Trader as Trader
    participant Form as OrderForm.tsx
    participant UserStore as Zustand userStore
    participant Axios as Axios API Client
    participant Backend as FastAPI Gateway
    participant Engine as C++ Matching Engine
    participant WS as WebSocket Hub
    participant WSHook as useWebSocket.ts
    participant MarketStore as Zustand marketStore
    participant Chart as TradingView Chart
    participant Book as OrderBook.tsx

    Note over Trader,Book: 1. Real-Time Streaming Phase
    WS->>WSHook: Pushes 'market:price' & 'orderbook' events
    WSHook->>MarketStore: setPriceUsd(), setOrderbook(), updateCandle()
    MarketStore->>Chart: Updates Candlestick High/Low/Close on Canvas
    MarketStore->>Book: Updates visual bid/ask ladders and depth bars

    Note over Trader,Book: 2. Order Placement Phase
    Trader->>Form: Enters 0.05 BTC @ ₹8,500,000 (Clicks BUY)
    Form->>Axios: POST /orders with Bearer JWT
    Axios->>Backend: Dispatches validated order
    Backend->>Backend: Locks margin & queues order into Redis Stream
    Backend-->>Form: 200 OK ("Order Queued")
    Form->>UserStore: fetchPortfolio() & fetchOrders() (Refreshes Margin)

    Note over Trader,Book: 3. Execution & Broadcast Phase
    Backend->>Engine: C++ Engine matches against Ask book
    Engine-->>Backend: Trade matched, Order status = FILLED
    Backend->>Backend: Settle Trade atomically in Supabase DB
    Backend->>WS: Broadcasts 'trade' and updated 'orderbook' to all clients
    WS->>WSHook: Event received
    WSHook->>MarketStore: addTrades([newTrade]), setOrderbook()
    MarketStore->>Chart: Injects trade tick into live candle
    MarketStore->>Book: Re-renders updated orderbook depth
```

---

## 🎨 UI & Design Standard (Zerodha Philosophy)

* **Terminal Dark Theme:** High-contrast palette (`#161A1E` background, `#2B3139` borders) reducing eye strain during long trading sessions.
* **Strict Semantic Colors:**
  * 🟢 **Buy / Profit / Up:** `#0ECB81`
  * 🔴 **Sell / Loss / Down:** `#F6465D`
  * ⚪ **Neutral / Accent:** `#848E9C` and `#EAECEF`
* **Data Density:** Tight padding, monospaced tabular numerals (`font-mono`), and zero frivolous gradients or slow animations.
* **Live Market Depth Bars:** Orderbook rows show dynamic horizontal percentage volume bars calculated against total book depth.

---

## 📁 Frontend Repository Directory Structure

```text
NanoTrade-frontend/
├── index.html                  # HTML entry point with Inter font import
├── vite.config.ts              # Vite bundler configuration & path aliases (@)
├── tsconfig.json               # TypeScript compiler options
├── package.json                # Dependencies and npm run scripts
├── public/                     # Static assets and icons
├── INTERVIEW_PREPARATION_GUIDE.md  # 🌟 Master System Design & Interview Guide
└── src/
    ├── main.tsx                # React DOM root render
    ├── App.tsx                 # Route switches (Landing, Auth, Terminal Dashboard)
    ├── index.css               # Tailwind CSS base styles & custom color variables
    ├── components/
    │   ├── trading/            # Core trading terminal modules
    │   │   ├── ChartContainer.tsx  # TradingView Lightweight Charts canvas
    │   │   ├── HeroChart.tsx       # Interactive landing page showcase chart
    │   │   ├── LiveMarkets.tsx     # Landing page live market price feed
    │   │   ├── OrderBook.tsx       # Live bid/ask depth ladder
    │   │   ├── OrderForm.tsx       # Limit & market order execution modal
    │   │   ├── PortfolioTabs.tsx   # Margin, open orders, holdings tabs
    │   │   ├── PriceTicker.tsx     # Header bar price & 24h market stats
    │   │   ├── TradeFeed.tsx       # Real-time public trade execution stream
    │   │   └── Watchlist.tsx       # Crypto asset watchlist selector
    │   └── ui/                 # Reusable base components (Tabs, Button, Input)
    ├── hooks/
    │   └── useWebSocket.ts     # Persistent WebSocket hook with auto-reconnect
    ├── lib/
    │   ├── supabase.ts         # Supabase client SDK instance
    │   └── utils.ts            # Tailwind classnames merger (clsx + twMerge)
    ├── pages/
    │   ├── Auth.tsx            # Supabase email/password login & registration
    │   ├── Dashboard.tsx       # Protected Zerodha-style trading terminal
    │   └── LandingPage.tsx     # Marketing hero page with live charts
    ├── services/
    │   └── api.ts              # Centralized Axios client with JWT interceptor
    └── store/
        ├── marketStore.ts      # High-velocity volatile market state (Zustand)
        └── userStore.ts        # User portfolio, balance, orders & session (Zustand)
```

---

## ⚡ State Management Architecture

To prevent UI stutter during heavy market volatility (where WebSockets push 20+ ticks per second), NanoTrade partitions state into two decoupled stores:

### 1. `marketStore.ts` (Volatile Market Data)
* Handles high-frequency streaming events:
  * `orderbook`: `{ bids: [{ price, quantity }], asks: [{ price, quantity }] }`
  * `recentTrades`: Max 100 executed trades, trimmed with `.slice(0, 100)`.
  * `candles`: Dynamic OHLCV candlesticks for the TradingView chart.
* **Live Tick Aggregator (`updateCandle`):** Evaluates trade timestamps and updates the open 1-minute candle's High, Low, and Close in-place without triggering an API fetch.
* Persisted in `sessionStorage` to allow seamless page refreshes without losing chart history.

### 2. `userStore.ts` (User Ledger & Session)
* Handles user-specific sensitive financial data:
  * `balance`: Virtual available INR margin.
  * `holdings`: Array of asset balances, quantities, and volume-weighted purchase prices.
  * `orders`: History of pending (`QUEUED`, `PROCESSING`) and finished (`FILLED`, `CANCELLED`) orders.
* **Zero Data Leakage:** On logout, `clearSession()` explicitly purges all user data from memory and local storage.

---

## ⚙️ Environment Variables

Create a `.env` file in the `NanoTrade-frontend/` directory (or use `.env.example`):

```env
# Backend API Base URL
VITE_API_URL=http://localhost:8000

# Real-Time WebSocket Endpoint
VITE_WS_URL=ws://localhost:8000/ws/market

# Supabase Authentication & Database
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

*(Note: For remote deployments or tunnels like Cloudflare/ngrok, replace `localhost:8000` with your public HTTPS/WSS URL).*

---

## 🛠️ Setup & Installation Guide

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)

### 1. Install Dependencies
```bash
cd NanoTrade-frontend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Open .env and insert your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 3. Launch Development Server
```bash
npm run dev
```
The terminal interface will start on **`http://localhost:5173`**.

### 4. Build Production Bundle
```bash
npm run build
```
Generates an optimized, minified production distribution in the `dist/` directory.

---

## 📚 Master Interview Preparation Guide

Are you preparing for an interview where this project is on your resume?  
Read the dedicated **[INTERVIEW_PREPARATION_GUIDE.md](./INTERVIEW_PREPARATION_GUIDE.md)** located directly in this folder. It covers:
* 30-second and 2-minute project elevator pitches.
* Low-latency C++ matching engine data structures and complexity ($\mathcal{O}(\log P)$ vs $\mathcal{O}(1)$).
* Distributed locking and pre-execution margin validation.
* Redis Streams vs Pub/Sub architectural trade-offs.
* Idempotent PostgreSQL RPC trade settlement math.
* 35+ technical interview questions with word-for-word high-scoring answers.
