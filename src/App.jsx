import React, { useEffect, useMemo, useState } from "react";

const DUMMY_DATA = [
  {
    id: 1,
    tradingSymbol: "RELIANCE",
    capitalMarketLastTradedPrice: 2915.45,
    futuresLastTradedPrice: 2921.1,
    percentageChange: 0.84,
    lastUpdatedTimestamp: "2025-09-05T06:40:02Z",
  },
  {
    id: 2,
    tradingSymbol: "TCS",
    capitalMarketLastTradedPrice: 3712.2,
    futuresLastTradedPrice: 3715.75,
    percentageChange: -0.45,
    lastUpdatedTimestamp: "2025-09-05T06:42:02Z",
  },
  {
    id: 3,
    tradingSymbol: "INFY",
    capitalMarketLastTradedPrice: 1360.5,
    futuresLastTradedPrice: 1363.25,
    percentageChange: 1.12,
    lastUpdatedTimestamp: "2025-09-05T06:30:02Z",
  },
  {
    id: 4,
    tradingSymbol: "HDFC",
    capitalMarketLastTradedPrice: 2620.3,
    futuresLastTradedPrice: 2625.0,
    percentageChange: -0.22,
    lastUpdatedTimestamp: "2025-09-05T06:44:02Z",
  },
  {
    id: 5,
    tradingSymbol: "ICICI",
    capitalMarketLastTradedPrice: 880.1,
    futuresLastTradedPrice: 882.6,
    percentageChange: 0.5,
    lastUpdatedTimestamp: "2025-09-05T06:38:02Z",
  },
  {
    id: 6,
    tradingSymbol: "LT",
    capitalMarketLastTradedPrice: 2430.8,
    futuresLastTradedPrice: 2436.4,
    percentageChange: 0.12,
    lastUpdatedTimestamp: "2025-09-05T06:36:02Z",
  },
  {
    id: 7,
    tradingSymbol: "AXIS",
    capitalMarketLastTradedPrice: 740.4,
    futuresLastTradedPrice: 742.0,
    percentageChange: -0.85,
    lastUpdatedTimestamp: "2025-09-05T06:20:02Z",
  },
  {
    id: 8,
    tradingSymbol: "BHARTI",
    capitalMarketLastTradedPrice: 780.6,
    futuresLastTradedPrice: 783.2,
    percentageChange: 2.5,
    lastUpdatedTimestamp: "2025-09-05T06:28:02Z",
  },
  {
    id: 9,
    tradingSymbol: "HINDUNILVR",
    capitalMarketLastTradedPrice: 2400.0,
    futuresLastTradedPrice: 2403.5,
    percentageChange: 0.0,
    lastUpdatedTimestamp: "2025-09-05T06:26:02Z",
  },
  {
    id: 10,
    tradingSymbol: "WIPRO",
    capitalMarketLastTradedPrice: 380.2,
    futuresLastTradedPrice: 381.0,
    percentageChange: 0.7,
    lastUpdatedTimestamp: "2025-09-05T06:12:02Z",
  },
  {
    id: 11,
    tradingSymbol: "MARUTI",
    capitalMarketLastTradedPrice: 8600.0,
    futuresLastTradedPrice: 8610.5,
    percentageChange: -1.2,
    lastUpdatedTimestamp: "2025-09-05T06:10:02Z",
  },
  {
    id: 12,
    tradingSymbol: "SBIN",
    capitalMarketLastTradedPrice: 540.5,
    futuresLastTradedPrice: 542.0,
    percentageChange: 0.33,
    lastUpdatedTimestamp: "2025-09-05T06:08:02Z",
  },
];

function fetchDummyData({ failRate = 0.2, delay = 800 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failRate) {
        reject(new Error("Simulated network error"));
      } else {
        resolve(JSON.parse(JSON.stringify(DUMMY_DATA)));
      }
    }, delay);
  });
}

function formatNumber(n) {
  if (n === null || n === undefined) return "-";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function relativeTimeFrom(timestamp) {
  const t = new Date(timestamp).getTime();
  const diff = Date.now() - t;
  const secs = Math.floor(diff / 1000);
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs} sec ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function DummyLineChart({ points = 30, width = 300, height = 80 }) {
  const data = useMemo(() => {
    const arr = [];
    let base = Math.random() * 100 + 50;
    for (let i = 0; i < points; i++) {
      base += (Math.random() - 0.5) * 8;
      arr.push(Math.max(0, base));
    }
    return arr;
  }, [points]);

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const coords = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke="#0f172a" strokeWidth={2} points={coords} />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.skeleton, height: 20, width: 100 }} />
      <div style={{ ...styles.skeleton, height: 18, width: 70, marginTop: 12 }} />
      <div style={{ ...styles.skeleton, height: 18, width: 90, marginTop: 8 }} />
      <div style={{ ...styles.skeleton, height: 14, width: 40, marginTop: 12 }} />
    </div>
  );
}

function ErrorState({ onRetry, message }) {
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <p style={{ margin: 0 }}>{message || "Something went wrong."}</p>
      <button onClick={onRetry} style={styles.btnPrimary}>
        Retry
      </button>
    </div>
  );
}

function StockCard({ stock, onOpen, initialView = "A" }) {
  const [viewB, setViewB] = useState(initialView === "B");

  const left = viewB ? stock.capitalMarketLastTradedPrice : stock.futuresLastTradedPrice;
  const right = viewB ? stock.futuresLastTradedPrice : stock.capitalMarketLastTradedPrice;

  return (
    <div style={styles.card} onClick={() => onOpen(stock)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{stock.tradingSymbol}</strong>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setViewB((s) => !s);
          }}
          style={styles.smallBtn}
          aria-label="toggle view"
        >
          {viewB ? "B" : "A"}
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 14 }}>{formatNumber(left)}</div>
        <div style={{ fontSize: 12, color: "#666" }}>{formatNumber(right)}</div>
      </div>

      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: stock.percentageChange > 0 ? "green" : stock.percentageChange < 0 ? "red" : "#333" }}>
          {stock.percentageChange > 0 ? "+" : ""}{formatNumber(stock.percentageChange)}%
        </div>
        <div style={{ fontSize: 12, color: "#777" }}>{relativeTimeFrom(stock.lastUpdatedTimestamp)}</div>
      </div>
    </div>
  );
}

function Drawer({ item, onClose }) {
  if (!item) return null;
  return (
    <div style={styles.drawerOverlay} onClick={onClose}>
      <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{item.tradingSymbol} — Details</h3>
          <button aria-label="close" onClick={onClose} style={styles.smallBtn}>
            Close
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <DummyLineChart width={420} height={100} />
        </div>

        <div style={{ marginTop: 12 }}>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td>Capital Market LTP</td>
                <td style={{ textAlign: "right" }}>{formatNumber(item.capitalMarketLastTradedPrice)}</td>
              </tr>
              <tr>
                <td>Futures LTP</td>
                <td style={{ textAlign: "right" }}>{formatNumber(item.futuresLastTradedPrice)}</td>
              </tr>
              <tr>
                <td>Change</td>
                <td style={{ textAlign: "right" }}>{formatNumber(item.percentageChange)}%</td>
              </tr>
              <tr>
                <td>Last Updated</td>
                <td style={{ textAlign: "right" }}>{new Date(item.lastUpdatedTimestamp).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  const [openItem, setOpenItem] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRefreshIndex((i) => i + 1);
    }, 1000 * 15);
    return () => clearInterval(id);
  }, []);

  const load = (opts = {}) => {
    setLoading(true);
    setError(null);
    fetchDummyData(opts)
      .then((resp) => {
        const now = new Date().toISOString();
        const withTime = resp.map((r) => ({ ...r, lastUpdatedTimestamp: now }));
        setData(withTime);
      })
      .catch((e) => setError(e.message || "Failed"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load({ failRate: 0.15, delay: 900 });
  }, []);

  const onRefresh = () => {
    load({ failRate: 0.25, delay: 700 });
  };

  const filtered = useMemo(() => {
    let arr = data.slice();
    if (query.trim()) {
      arr = arr.filter((d) => d.tradingSymbol.toLowerCase().includes(query.trim().toLowerCase()));
    }
    if (sortBy) {
      arr.sort((a, b) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (av === bv) return 0;
        return sortDir === "asc" ? (av - bv) : (bv - av);
      });
    }
    return arr;
  }, [data, query, sortBy, sortDir, refreshIndex]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>Stock Watchlist Lite</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            placeholder="Search symbol..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.input}
          />

          <select
            value={sortBy || ""}
            onChange={(e) => setSortBy(e.target.value || null)}
            style={styles.input}
          >
            <option value="">Sort by</option>
            <option value="percentageChange">Percentage Change</option>
            <option value="capitalMarketLastTradedPrice">Capital Market LTP</option>
            <option value="futuresLastTradedPrice">Futures LTP</option>
          </select>

          <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} style={styles.input}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>

          <button onClick={onRefresh} style={styles.btnPrimary}>
            Refresh
          </button>
        </div>
      </header>

      <main style={{ padding: 20 }}>
        {loading && (
          <div style={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {error && !loading && <ErrorState message={error} onRetry={() => load({ failRate: 0.15, delay: 900 })} />}

        {!loading && !error && (
          <div style={styles.grid}>
            {filtered.map((s) => (
              <StockCard key={s.id} stock={s} onOpen={(it) => setOpenItem(it)} />
            ))}
          </div>
        )}
      </main>

      <Drawer item={openItem} onClose={() => setOpenItem(null)} />

      <footer style={{ padding: 14, textAlign: "center", color: "#666" }}>
        Built for the Frontend Intern assignment — shows 6 cards per row on wide screens.
      </footer>
    </div>
  );
}

const styles = {
  page: { fontFamily: "Inter, Roboto, Arial, sans-serif", minHeight: "100vh", background: "#f8fafc" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 20, gap: 12 },
  input: { padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", minWidth: 120 },
  btnPrimary: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },
  smallBtn: {
    background: "#eef2ff",
    border: "1px solid #ddd",
    padding: "6px 8px",
    borderRadius: 6,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  },
  card: {
    background: "#fff",
    borderRadius: 8,
    padding: 12,
    boxShadow: "0 1px 2px rgba(16,24,40,0.05)",
    cursor: "pointer",
    minHeight: 110,
  },
  skeleton: { background: "linear-gradient(90deg,#e5e7eb,#f3f4f6)", borderRadius: 4, opacity: 0.9 },
  drawerOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  drawer: { width: 460, background: "#fff", padding: 16, height: "100%", overflow: "auto" },
};
