import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

// 🔌 Supabase
const supabase = createClient(
  "https://jqddbwciekvfppfdpivk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZGRid2NpZWt2ZnBwZmRwaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjQyNTQsImV4cCI6MjA5MDQwMDI1NH0.lDdHLZ3WEl9N-K_tcS-UF8TFXwItPQSr83YB_Kk_cRo"
);

export default function App() {
  const [items, setItems] = useState([]);

  const [nazev, setNazev] = useState("");
  const [kategorieInput, setKategorieInput] = useState("");
  const [znackaInput, setZnackaInput] = useState("");
  const [ks, setKs] = useState("");
  const [cena, setCena] = useState("");

  const [search, setSearch] = useState("");

  // 📥 NAČTENÍ DAT
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data, error } = await supabase.from("sklad").select("*");

    if (error) {
      console.error("Chyba:", error);
    } else {
      setItems(data);
    }
  }

  // ➕ PŘIDÁNÍ
  async function addItem() {
    if (!nazev || !kategorieInput || !znackaInput) return;

    const { error } = await supabase.from("sklad").insert([
      {
        nazev,
        kategorie: kategorieInput,
        znacka: znackaInput,
        ks: Number(ks),
        cena: Number(cena),
      },
    ]);

    if (error) {
      console.error("Chyba:", error);
    } else {
      setNazev("");
      setKategorieInput("");
      setZnackaInput("");
      setKs("");
      setCena("");

      loadData();
    }
  }

  // ❌ SMAZÁNÍ
  async function deleteItem(id) {
    const { error } = await supabase.from("sklad").delete().eq("id", id);

    if (error) {
      console.error("Chyba:", error);
    } else {
      loadData();
    }
  }

  // 🔍 FILTR
  const filteredItems = items.filter((item) =>
    item.nazev.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <h1>Sklad Trafika</h1>

      {/* 🔍 SEARCH */}
      <div className="card">
        <input
          placeholder="🔍 Hledat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 🧾 FORM */}
      <div className="card">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "10px",
          }}
        >
          <input
            placeholder="Název"
            value={nazev}
            onChange={(e) => setNazev(e.target.value)}
          />

          <select
            value={kategorieInput}
            onChange={(e) => setKategorieInput(e.target.value)}
          >
            <option value="">Kategorie</option>
            <option>Tabák</option>
            <option>Cigarety</option>
            <option>Nápoje</option>
          </select>

          <select
            value={znackaInput}
            onChange={(e) => setZnackaInput(e.target.value)}
          >
            <option value="">Značka</option>
            <option>Marlboro</option>
            <option>Philip Morris</option>
            <option>Austin</option>
          </select>

          <input
            placeholder="Ks"
            value={ks}
            onChange={(e) => setKs(e.target.value)}
          />

          <input
            placeholder="Cena"
            value={cena}
            onChange={(e) => setCena(e.target.value)}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <button onClick={addItem}>Přidat</button>
        </div>
      </div>

      {/* 📊 STATISTIKA */}
      <div className="card">
        <strong>Počet položek:</strong> {items.length} <br />
        <strong>Hodnota skladu:</strong>{" "}
        {items.reduce((sum, i) => sum + i.ks * i.cena, 0)} Kč
      </div>

      {/* 📋 LIST */}
      <div className="card">
        {filteredItems.length === 0 ? (
          <p>Žádná data</p>
        ) : (
          <ul>
            {filteredItems.map((item) => (
              <li key={item.id}>
                <span>
                  {item.nazev} – {item.kategorie} – {item.znacka} – {item.ks} ks
                  – {item.cena} Kč
                </span>

                <button
                  className="danger"
                  onClick={() => deleteItem(item.id)}
                >
                  Smazat
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
