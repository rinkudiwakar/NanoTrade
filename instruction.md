# NanoTrade Frontend Instructions (Zerodha-Style Trading Terminal)

---

## 🎯 Objective

Build a **real-time crypto paper trading platform UI** with a **Zerodha-like experience**, focused on:

* ⚡ Low latency (real-time updates)
* 🧘 Clean, minimal UI
* 📊 Data-first design
* 💱 INR-based trading

This is **NOT a dashboard** — this is a **professional trading terminal**.

---

## 🏗️ Tech Stack (STRICT)

### Core Stack:

* React (Vite)
* Tailwind CSS
* shadcn/ui (MANDATORY)
* Zustand (preferred) or Redux Toolkit
* Axios (centralized API client)
* Native WebSocket API
* Supabase Auth
* TradingView Charting Library

---

## 🚨 UI ARCHITECTURE RULE (CRITICAL)

```text
Tailwind = Layout + Custom Trading UI
shadcn = Reusable UI Components
```

### ✅ Use Tailwind for:

* Layout (Grid, Flex)
* Watchlist
* Orderbook
* Trade feed
* Chart container
* Market depth visualization

### ✅ Use shadcn for:

* Buttons
* Inputs (price, quantity)
* Tabs (Orders / Positions / Holdings)
* Dialogs (order confirm)
* Select / Dropdowns

---

### ❌ DO NOT:

* Build buttons/inputs manually
* Use shadcn for full page layout
* Overdesign UI (no gradients, no fancy effects)
* Copy Binance-style clutter

---

## 🎨 Design Philosophy (Zerodha Standard)

* Minimal UI
* High data density
* Fast rendering
* Clean typography (Inter)
* Strict color usage:

  * 🟢 Green → Buy / Up
  * 🔴 Red → Sell / Down

---

## 🖥️ Main Layout (FINAL)

```text
---------------------------------------------------------
| Watchlist |   Chart (TradingView)     | Orderbook     |
---------------------------------------------------------
| Buy/Sell Panel        | Trades Feed                  |
---------------------------------------------------------
| Positions / Orders / Holdings (Tabs)                |
---------------------------------------------------------
```

---

## 📊 Core Components

### 🔧 Custom (Tailwind)

* Watchlist
* OrderBook
* TradeFeed
* ChartContainer
* MarketDepth
* PriceTicker

---

### ⚡ UI (shadcn)

* Button
* Input
* Tabs
* Dialog
* Select

---

## 📈 Chart System (MOST IMPORTANT)

Use TradingView charting library.

### Required Features:

* Candlestick chart
* Timeframes:

  * 1m, 5m, 15m, 1h, 1D
* Indicators:

  * EMA
  * RSI
  * Volume

---

## 💱 INR Conversion Logic

Backend:

```text
BTC_USDT
```

Frontend:

```text
BTC/INR
```

### Rule:

```text
INR Price = USDT Price × conversion_rate
```

* Use fallback (90–100)
* Prefer live rate if available

---

## ⚡ Real-Time Data System (CRITICAL)

### MUST use WebSocket for:

* Price updates
* Orderbook updates
* Trades feed

---

### ❌ DO NOT:

* Poll APIs aggressively
* Spam REST endpoints

👉 Backend has rate limiting → excessive calls will fail.

---

## 📡 API Integration Rules

* Use centralized Axios instance
* Attach JWT token to protected routes
* Use async/await
* Handle errors globally

---

## 🚫 Error Handling

Handle globally:

* 401 → redirect to login
* 429 → show "Too many requests"
* Network failure → retry with backoff

---

## 🧱 State Management

Maintain:

* Market data (price, trades, orderbook)
* User session
* Orders
* Portfolio

👉 Use Zustand (preferred for simplicity)

---

## 🧩 Folder Structure

```text
src/
 ├── components/
 │    ├── trading/
 │    ├── ui/ (shadcn)
 │
 ├── pages/
 │    ├── Dashboard.jsx
 │    ├── Portfolio.jsx
 │
 ├── hooks/
 │    ├── useWebSocket.js
 │    ├── useMarketData.js
 │
 ├── store/
 │    ├── marketStore.js
 │    ├── userStore.js
```

---

## 🔥 Core Features (MANDATORY)

### 1. Place Orders

```http
POST /orders
```

Support:

* BUY / SELL
* LIMIT / MARKET

---

### 2. Portfolio

```http
GET /portfolio
```

Display:

* Balance
* Holdings

---

### 3. Orders History

```http
GET /orders/history
```

---

### 4. Market Data

* `/market/orderbook`
* `/market/price`
* `/market/trades`

---

## 🔥 Advanced Features (HIGH PRIORITY)

### 📊 PnL Calculation

```text
PnL = (Current Price - Entry Price) × Quantity
```

---

### 🔄 Order Lifecycle

```text
QUEUED → PARTIAL → FILLED
```

---

### 💱 Currency Toggle

* INR ↔ USDT view

---

### 📉 Depth Visualization

* Volume bars in orderbook

---

### 📈 Mini Charts (Watchlist)

* Sparkline per asset

---

## ⚡ Performance Rules

* Minimize re-renders
* Use memoization where needed
* Avoid unnecessary state updates
* Use WebSocket over REST

---

## ✅ Definition of Done

* User authentication works
* BTC/INR chart loads
* Real-time updates working
* Orders can be placed
* Portfolio updates correctly
* UI feels fast and clean (Zerodha-like)

---

## 🚀 Final Goal

Build a **low-latency, professional trading terminal UI**
that feels like a real exchange.
