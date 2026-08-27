import { useEffect, useMemo, useState } from "react";

const WEEKDAY = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    ...WEEKDAY,
    timeZone: "UTC"
  });
}

function countdownLabel(days) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}

export default function App() {
  const [next, setNext] = useState(null);
  const [ekadashis, setEkadashis] = useState([]);
  const [year, setYear] = useState(2026);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);

    Promise.all([
      fetch("/api/ekadashis/next").then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/ekadashis?year=${year}`).then((r) => {
        if (!r.ok) throw new Error(`API responded ${r.status}`);
        return r.json();
      })
    ])
      .then(([nextData, listData]) => {
        if (cancelled) return;
        setNext(nextData);
        setEkadashis(listData.ekadashis);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [year]);

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Hindu Lunar Calendar</p>
        <h1>Ekadashi Tracker</h1>
        <p className="subtitle">
          The eleventh lunar day of each fortnight, traditionally observed with fasting and
          devotion. There are twenty-four Ekadashis in a normal year.
        </p>
      </header>

      {status === "loading" && <p className="notice">Loading observances…</p>}
      {status === "error" && (
        <p className="notice error">Could not reach the Ekadashi API: {error}</p>
      )}

      {status === "ready" && next && (
        <section className="next-card" aria-label="Next Ekadashi">
          <div className="next-badge">{countdownLabel(next.daysUntil)}</div>
          <h2>{next.name} Ekadashi</h2>
          <p className="next-date">{formatDate(next.date)}</p>
          <p className="next-meta">
            {next.paksha} paksha · {next.hinduMonth} month
          </p>
          <p className="next-desc">{next.description}</p>
        </section>
      )}

      {status === "ready" && (
        <section className="list-section">
          <div className="list-header">
            <h3>All Ekadashis in {year}</h3>
            <span className="count-pill">{ekadashis.length} observances</span>
          </div>
          <ul className="ekadashi-list">
            {ekadashis.map((e) => {
              const isPast = e.date < todayIso;
              const isNext = next && e.date === next.date;
              return (
                <li
                  key={e.date}
                  className={`ekadashi-item${isPast ? " past" : ""}${isNext ? " highlight" : ""}`}
                >
                  <div className="item-date">
                    <span className="item-day">
                      {new Date(`${e.date}T00:00:00Z`).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC"
                      })}
                    </span>
                    <span className={`paksha paksha-${e.paksha.toLowerCase()}`}>{e.paksha}</span>
                  </div>
                  <div className="item-body">
                    <div className="item-name-row">
                      <span className="item-name">{e.name}</span>
                      {isNext && <span className="next-tag">Next</span>}
                    </div>
                    <p className="item-desc">{e.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <footer className="footer">
        <span>Data is a curated 2026 reference. Fasting timings vary by regional panchang.</span>
      </footer>
    </div>
  );
}
