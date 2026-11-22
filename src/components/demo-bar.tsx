"use client";

import { useEffect, useState } from "react";

/** DEMO BRANCH ONLY. Lets a tester switch between the administrator and test members. */
const PEOPLE = [
  { id: "admin", label: "Администратор" },
  { id: "m1", label: "Участник 1" },
  { id: "m2", label: "Участник 2" },
  { id: "m3", label: "Участник 3" },
];

export function DemoBar() {
  const [current, setCurrent] = useState("admin");
  useEffect(() => {
    const found = /(?:^|; )lz_demo=([^;]+)/.exec(document.cookie)?.[1];
    if (found) void Promise.resolve().then(() => setCurrent(found));
  }, []);
  const choose = (id: string) => {
    document.cookie = `lz_demo=${id}; path=/; max-age=86400; samesite=lax`;
    window.location.reload();
  };
  return (
    <div style={{ background: "#FFF3DC", borderBottom: "2px solid #F2B65D", padding: "0.6rem 1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#5a3b08" }}>
      <span>ДЕМО-РЕЖИМ: без входа и без настоящей базы данных. Отзывы хранятся временно и могут исчезнуть.</span>
      <span>Вы:</span>
      {PEOPLE.map((person) => (
        <button
          key={person.id}
          type="button"
          onClick={() => choose(person.id)}
          aria-pressed={current === person.id}
          style={{ minHeight: "2.4rem", padding: "0.3rem 0.8rem", borderRadius: 999, border: "1.5px solid #D99A3A", background: current === person.id ? "#6A3DA8" : "#fff", color: current === person.id ? "#fff" : "#3d2a06", fontWeight: 700, cursor: "pointer" }}
        >
          {person.label}
        </button>
      ))}
    </div>
  );
}
