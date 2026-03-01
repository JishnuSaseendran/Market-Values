# Frontend — React Application

This is the frontend for Market Values, built with React 18, Vite, and TailwindCSS. It provides a responsive, dark-first UI for browsing stock prices, managing a portfolio, viewing AI predictions, and live trading through Upstox.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI library |
| React Router 7 | Client-side routing |
| Zustand | Lightweight global state |
| Axios | HTTP client with interceptors |
| TailwindCSS | Utility-first styling |
| Vite | Build tool and dev server |
| lightweight-charts | Professional OHLC charting |
| react-hot-toast | Toast notifications |
| react-icons | HeroIcons icon set |
| @headlessui/react | Unstyled accessible UI components |
| date-fns | Date formatting |
| Vitest + MSW | Testing and API mocking |

---

## Directory Structure

```
frontend/
├── index.html
├── vite.config.js          # Dev server config, API proxy
├── tailwind.config.js      # Custom animations and dark mode
├── package.json
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Router, global effects, auth guard
    ├── index.css           # Base styles, custom CSS
    ├── lib/
    │   └── api.js          # Axios instance with auth interceptor
    ├── pages/              # Full-page route components
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── DashboardPage.jsx
    │   ├── PortfolioPage.jsx
    │   ├── TradingPage.jsx
    │   ├── SettingsPage.jsx
    │   ├── MarketOverviewPage.jsx
    │   ├── HeatmapPage.jsx
    │   ├── ComparePage.jsx
    │   ├── PredictionPage.jsx
    │   └── UpstoxCallbackPage.jsx
    ├── components/         # Reusable UI components
    │   ├── Layout.jsx
    │   ├── Sidebar.jsx
    │   ├── BottomNav.jsx
    │   ├── ConnectionStatus.jsx
    │   ├── Chart.jsx
    │   ├── PredictionChart.jsx
    │   ├── TickerCard.jsx
    │   ├── IndexCard.jsx
    │   ├── SearchBar.jsx
    │   ├── TimeframeSelector.jsx
    │   ├── IndicatorPanel.jsx
    │   ├── ThemeToggle.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── WatchlistManager.jsx
    │   ├── AddToWatchlistModal.jsx
    │   ├── AlertManager.jsx
    │   ├── PortfolioForm.jsx
    │   ├── GainersLosersTable.jsx
    │   ├── SectorHeatmapCell.jsx
    │   ├── ComparisonChart.jsx
    │   ├── OrderForm.jsx
    │   ├── OrderBook.jsx
    │   ├── PositionsTable.jsx
    │   ├── HoldingsTable.jsx
    │   ├── UpstoxConnect.jsx
    │   └── NewsFeed.jsx
    ├── stores/             # Zustand state stores
    │   ├── authStore.js
    │   ├── stockStore.js
    │   ├── themeStore.js
    │   ├── alertStore.js
    │   ├── upstoxStore.js
    │   └── preferencesStore.js
    └── test/
        ├── setup.js
        └── mocks/
```

---

## Setup

### Prerequisites

- Node.js 18+
- Backend running at `http://localhost:8000`

### Ports

| Mode | Port | URL |
|------|------|-----|
| Local dev (Vite) | `5173` | http://localhost:5173 |
| Docker (Nginx) | `3000` | http://localhost:3000 |

In local dev, Vite proxies `/api` and `/ws` to the backend at `http://localhost:8000` — no CORS configuration needed.
In Docker, Nginx serves the production build on port `3000` and proxies API/WebSocket traffic to the backend container internally.

### Install and Run

```bash
npm install
npm run dev          # Dev server at http://localhost:5173
npm run build        # Production build
npm run preview      # Preview production build locally
npm test             # Run unit tests
```

---

## Routing

Defined in `src/App.jsx`:

| Path | Page | Protected |
|------|------|-----------|
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/upstox/callback` | UpstoxCallbackPage | No |
| `/` | DashboardPage | Yes |
| `/portfolio` | PortfolioPage | Yes |
| `/settings` | SettingsPage | Yes |
| `/market` | MarketOverviewPage | Yes |
| `/heatmap` | HeatmapPage | Yes |
| `/compare` | ComparePage | Yes |
| `/trading` | TradingPage | Yes |
| `/predict` | PredictionPage | Yes |

Protected routes use the `ProtectedRoute` component, which redirects to `/login` if no token is found in localStorage.

---

## Pages

### DashboardPage (`/`)
Main landing page after login. Displays index cards (NIFTY 50, SENSEX), live ticker cards for all tracked stocks, and a candlestick chart for the selected symbol with optional technical indicator overlays.

### PortfolioPage (`/portfolio`)
Shows user holdings in a table with columns for symbol, buy price, quantity, current price, and real-time P&L (absolute and percentage). Includes a form to add or edit holdings.

### MarketOverviewPage (`/market`)
Displays top gainers, top losers, and most active stocks. Refreshes automatically.

### HeatmapPage (`/heatmap`)
Visual sector performance heatmap. Each cell represents a sector and is coloured green/red based on average percentage change.

### ComparePage (`/compare`)
Multi-stock normalised comparison chart. Select up to several symbols and view their relative % change over a common 6-month baseline.

### TradingPage (`/trading`)
Live Upstox trading interface. Requires Upstox account to be linked. Shows holdings, intraday positions, order book, trade history, and an order entry form.

### PredictionPage (`/predict`)
AI price prediction interface. Enter a stock symbol, select a forecast horizon (7, 14, or 30 days), and view the LSTM model's predicted prices alongside confidence bands.

### SettingsPage (`/settings`)
User preferences: default symbol, chart interval, and theme (dark/light).

---

## Components

### Layout

**`Layout.jsx`** — Master layout wrapper. Renders the Sidebar on desktop, a hamburger-triggered drawer on mobile, the page header (title + subtitle), `ConnectionStatus`, `BottomNav` on mobile, and the `<Outlet>` for the current page.

**`Sidebar.jsx`** — Desktop navigation with icon + label links for all routes. Shows the active route with a highlight.

**`BottomNav.jsx`** — Mobile sticky bottom navigation bar with icons for the primary routes.

**`ConnectionStatus.jsx`** — Small indicator showing whether the WebSocket connection to the stock price stream is live or disconnected.

---

### Charts

**`Chart.jsx`** — Generic `lightweight-charts` wrapper. Renders a candlestick series from OHLC data with optional SMA/RSI/MACD/Bollinger overlays. Supports both dark and light themes via `useThemeStore`. Auto-resizes on window resize.

**`PredictionChart.jsx`** — Specialized chart for the prediction page. Renders three series:
- Historical close price (blue line, last 90 days)
- Predicted prices (violet dashed line)
- Confidence band (shaded area using two area series)

Includes a legend with colour indicators and adapts to dark/light theme.

**`ComparisonChart.jsx`** — Normalised % change chart for multiple stocks simultaneously, each in a different colour.

---

### Stock Cards

**`TickerCard.jsx`** — Card for a single stock showing symbol, company name, current price, and change/change%. Colour-coded green/red. Clicking selects the symbol for the main chart.

**`IndexCard.jsx`** — Similar to `TickerCard` but styled for market indices (NIFTY, SENSEX) with larger typography.

---

### Trading

**`UpstoxConnect.jsx`** — OAuth link/unlink button for Upstox broker. Shows connection status and initiates the OAuth flow.

**`OrderForm.jsx`** — Form to place, modify, or cancel orders on Upstox. Supports market/limit order types, buy/sell direction, quantity, and price.

**`OrderBook.jsx`** — Displays open and completed orders from Upstox.

**`PositionsTable.jsx`** — Intraday positions with unrealised P&L.

**`HoldingsTable.jsx`** — Long-term Upstox holdings with average cost and current value.

---

### Portfolio & Watchlists

**`PortfolioForm.jsx`** — Add or edit a holding (symbol, buy price, quantity, date, notes).

**`WatchlistManager.jsx`** — Create, rename, and delete watchlists; add/remove stocks.

**`AddToWatchlistModal.jsx`** — Modal dialog for selecting which watchlist to add a stock to.

---

### Alerts

**`AlertManager.jsx`** — Create and delete price alerts. Each alert has a symbol, condition (`above` or `below`), and target price.

---

### Misc

**`SearchBar.jsx`** — Autocomplete search for stock symbols by name or ticker.

**`TimeframeSelector.jsx`** — Pill buttons for selecting chart interval (1m, 5m, 15m, 1h, 1d, 1wk, 1mo).

**`IndicatorPanel.jsx`** — Toggles for enabling/disabling technical indicators on the chart.

**`ThemeToggle.jsx`** — Dark/light mode switch, persisted to `useThemeStore`.

**`GainersLosersTable.jsx`** — Tabulated list of top gainers or losers.

**`SectorHeatmapCell.jsx`** — Single sector cell for the heatmap, coloured by performance.

**`NewsFeed.jsx`** — Scrollable list of aggregated financial news articles.

**`ProtectedRoute.jsx`** — Route guard that redirects unauthenticated users to `/login`.

---

## State Management (Zustand)

State is split into focused stores. Each store uses Zustand's `create` API, and some persist to `localStorage` via the `persist` middleware.

### `authStore.js`

| State | Type | Description |
|-------|------|-------------|
| `user` | object | Current user (id, username, email) |
| `token` | string | JWT access token |

| Action | Description |
|--------|-------------|
| `login(user, token)` | Set user and token, persist token to localStorage |
| `logout()` | Clear state and localStorage |

---

### `stockStore.js`

| State | Type | Description |
|-------|------|-------------|
| `stocks` | object | Map of symbol → price data |
| `selected` | string | Currently selected symbol |
| `connected` | boolean | WebSocket connection status |
| `upstoxConnected` | boolean | Upstox WS connection status |

| Action | Description |
|--------|-------------|
| `connect()` | Open WebSocket to `/ws/stocks`, auto-reconnect every 3s |
| `disconnect()` | Close WebSocket |
| `connectUpstox(token)` | Open authenticated Upstox WebSocket |
| `subscribeUpstox(symbols)` | Subscribe to Upstox instrument keys |
| `setSelected(symbol)` | Change selected symbol |

---

### `themeStore.js`

| State | Type | Description |
|-------|------|-------------|
| `theme` | `'dark'` \| `'light'` | Current theme |

| Action | Description |
|--------|-------------|
| `toggle()` | Switch between dark and light |
| `setTheme(t)` | Set explicitly |

Theme is persisted to localStorage and applied as a class on `<html>` (`dark` or `light`).

---

### `alertStore.js`

Manages active price alerts and incoming alert notifications from the WebSocket.

---

### `upstoxStore.js`

Holds Upstox connection status, holdings, positions, orders, and funds fetched from the API.

---

### `preferencesStore.js`

Persists user preferences (default symbol, chart interval) fetched from `/api/preferences`.

---

## HTTP Client (`src/lib/api.js`)

A pre-configured Axios instance:

```js
import api from '@/lib/api'

const response = await api.get('/stocks')
const data = await api.post('/portfolio', { symbol: 'TCS.NS', ... })
```

- **Base URL:** `/api` (resolved by Vite proxy in dev, Nginx in prod)
- **Request interceptor:** Attaches `Authorization: Bearer {token}` from localStorage automatically
- **Response interceptor:** On `401 Unauthorized`, clears the token and redirects to `/login`

---

## Charting with lightweight-charts

Charts use the `lightweight-charts` library from TradingView.

**Basic usage pattern:**

```jsx
import { createChart } from 'lightweight-charts'
import { useEffect, useRef } from 'react'

function MyChart({ data }) {
  const ref = useRef()

  useEffect(() => {
    const chart = createChart(ref.current, { width: 800, height: 400 })
    const series = chart.addCandlestickSeries()
    series.setData(data)

    const resize = () => chart.applyOptions({ width: ref.current.clientWidth })
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      chart.remove()
    }
  }, [data])

  return <div ref={ref} />
}
```

See `src/components/Chart.jsx` and `src/components/PredictionChart.jsx` for production usage including theme integration.

---

## Styling

TailwindCSS with a custom config in `tailwind.config.js`:

- **Dark mode:** `class` strategy — dark styles are applied when `<html class="dark">` is present
- **Custom animations:** `pulse-glow`, `slide-in-left`, `fade-in`, `shimmer`, `dot-ping`

**Dark-first conventions:**

```jsx
// Background
<div className="bg-gray-900 dark:bg-gray-950" />

// Text
<span className="text-gray-100 dark:text-white" />

// Card
<div className="bg-gray-800 dark:bg-gray-900 rounded-xl p-4" />
```

Global base styles are in `src/index.css`.

---

## Adding a New Page

1. Create `src/pages/MyPage.jsx`
2. Add a route in `src/App.jsx`:
   ```jsx
   import MyPage from './pages/MyPage'
   // inside the protected routes:
   <Route path="/my-page" element={<MyPage />} />
   ```
3. Add a nav link to `src/components/Sidebar.jsx` (desktop):
   ```jsx
   { path: '/my-page', icon: HiMyIcon, label: 'My Page' }
   ```
4. Add to `src/components/BottomNav.jsx` (mobile) if it should appear in the bottom bar.

---

## Testing

Tests use Vitest and React Testing Library. API calls are mocked with Mock Service Worker (MSW).

```bash
npm test                        # Run all tests
npm test -- --watch             # Watch mode
npm test -- MyComponent.test    # Specific file
```

Test files live alongside their components as `__tests__/ComponentName.test.jsx` or inside `src/test/`.

---

## Build and Deployment

```bash
npm run build
```

Outputs a static build to `dist/`. In Docker, this is served by Nginx which also proxies `/api` and `/ws` to the backend container. See `../nginx.conf` for the proxy configuration.

**Vite proxy (dev only)** — defined in `vite.config.js`:

```js
proxy: {
  '/api': 'http://localhost:8000',
  '/ws':  { target: 'ws://localhost:8000', ws: true }
}
```
