# NanoTrade AI Agent Instructions (Gemini)

---

## 🎯 Role

You are an AI agent responsible for building a **Zerodha-style crypto trading frontend**.

Your goal is to create a **clean, fast, low-latency, real-time trading terminal** — not a generic dashboard.

---

## 🧠 System Context

NanoTrade is:

* Crypto paper trading platform
* Backend: FastAPI
* Auth: Supabase (JWT)
* Real-time: WebSocket (Redis Pub/Sub)
* Matching Engine: Custom order matching system

---

## 🚨 UI STACK RULE (CRITICAL)

```text
Tailwind = Layout + Custom Trading UI
shadcn = Reusable UI Components
```

### ✅ Use Tailwind for:

* Layout (grid, flex)
* Watchlist
* Orderbook
* Trade feed
* Chart container
* Market depth UI

### ✅ Use shadcn for:

* Buttons
* Inputs (price, quantity)
* Tabs (Orders / Positions / Holdings)
* Dialogs
* Dropdowns

---

### ❌ STRICTLY AVOID

* Building buttons/inputs manually
* Using shadcn for full layout
* Creating cluttered UI (like Binance)
* Adding unnecessary animations

---

## 🎨 UI Philosophy (Zerodha Standard)

* Minimal
* Data-first
* Fast rendering
* Dense but readable
* Professional trading interface

---

## 🖥️ Required Layout (FIXED)

```text
Watchlist | Chart | Orderbook
Buy/Sell  | Trades
Bottom Tabs (Orders / Positions / Holdings)
```

---

## 🔑 Responsibilities

---

### 1. Component Generation

Create modular and optimized components:

#### Custom (Tailwind-based):

* Watchlist
* OrderBook
* TradeFeed
* ChartContainer
* MarketDepth
* PriceTicker

#### Mixed:

* OrderForm (Tailwind layout + shadcn inputs/buttons)

#### UI (shadcn):

* Button
* Input
* Tabs
* Dialog
* Select

---

### 2. API Integration

Rules:

* Use async/await
* Use centralized Axios instance
* Attach JWT token:

  ```http
  Authorization: Bearer <token>
  ```
* Handle errors globally

---

### 3. WebSocket Handling (CRITICAL)

Must:

* Maintain persistent connection
* Reconnect automatically on failure
* Parse messages safely
* Update UI instantly (low latency)

---

### 4. State Management

Maintain global state:

* Market data (price, orderbook, trades)
* User session
* Orders
* Portfolio

👉 Prefer Zustand for simplicity and performance.

---

## 📡 API Usage

### Public:

* `/market/orderbook`
* `/market/price`
* `/market/trades`

### Private:

* `/portfolio`
* `/orders`
* `/orders/history`

---

## 💱 INR Conversion Logic

Convert:

```text
BTC_USDT → BTC/INR
```

### Rule:

```text
INR Price = USDT Price × conversion_rate
```

* Use fallback (90–100)
* Prefer live rate if available

---

## ⚠️ Constraints (VERY IMPORTANT)

* Avoid API spamming (backend has rate limiting)
* Prefer WebSocket over polling
* Use debouncing for order placement
* Minimize re-renders

---

## 🔄 WebSocket Strategy

* Connect once at app load
* Store connection globally
* Broadcast updates to all components
* Do NOT create multiple WebSocket connections

---

## 🎯 UX Behavior

* Price updates must feel instant
* Orderbook updates smoothly
* Orders must show lifecycle:

  ```text
  QUEUED → PARTIAL → FILLED
  ```
* UI must remain responsive under load

---

## ⚡ Performance Rules

* Avoid unnecessary state updates
* Use memoization where needed
* Batch updates when possible
* Prefer WebSocket over REST

---

## 🧪 Testing Goals

Ensure:

* Real-time updates work reliably
* Orders are placed correctly
* UI does not lag
* No excessive API calls
* Handles 429 (rate limit) gracefully

---

## 🚀 Final Goal

Build a **low-latency, Zerodha-style crypto trading terminal**
that feels like a real exchange and performs smoothly under real-time conditions.
