import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

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

  async function addItem() {
    if (!nazev || !ks || !cena) return;

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

  async function deleteItem(id) {
    const potvrdit = confirm("Opravdu chceš smazat položku?");
    if (!potvrdit) return;

    const { error } = await supabase
      .from("sklad")
      .delete()
      .eq("id", id);

    if (!error) loadData();
  }

  const filteredItems = items.filter((item) =>
    `${item.nazev} ${item.kategorie} ${item.znacka}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalValue = filteredItems.reduce(
    (sum, item) => sum + item.ks * item.cena,
    0
  );

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "auto",
        color: "#e5e7eb",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Sklad Trafika
      </h1>

      {/* 🔍 SEARCH */}
      <input
        placeholder="🔍 Hledat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "25px",
          borderRadius: "10px",
          border: "1px solid #1f2937",
          background: "#020617",
          color: "white",
        }}
      />

      {/* 📦 FORM GRID */}
      <div
        style={{
          background: "#020617",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "25px",
          border: "1px solid #1f2937",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <input
            placeholder="Název"
            value={nazev}
            onChange={(e) => setNazev(e.target.value)}
          />
          <input
            placeholder="Kategorie"
            value={kategorieInput}
            onChange={(e) => setKategorieInput(e.target.value)}
          />
          <input
            placeholder="Značka"
            value={znackaInput}
            onChange={(e) => setZnackaInput(e.target.value)}
          />
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

        <button
          onClick={addItem}
          disabled={!nazev || !ks || !cena}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            opacity: !nazev || !ks || !cena ? 0.5 : 1,
            cursor: !nazev || !ks || !cena ? "not-allowed" : "pointer",
          }}
        >
          Přidat
        </button>
      </div>

      {/* 📊 STATISTIKY */}
      <div
        style={{
          background: "#020617",
          padding: "15px",
          borderRadius: "12px",
          marginBottom: "25px",
          border: "1px solid #1f2937",
        }}
      >
        <p>Počet položek: {filteredItems.length}</p>
        <p style={{ color: "#60a5fa", fontWeight: "bold" }}>
          Hodnota skladu: {totalValue} Kč
        </p>
      </div>

      {/* 📋 LIST */}
      <div
        style={{
          background: "#020617",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #1f2937",
        }}
      >
        {filteredItems.length === 0 ? (
          <p>Žádná data</p>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #1f2937",
              }}
            >
              <div>
                {item.nazev} – {item.kategorie} – {item.znacka} –{" "}
                {item.ks} ks – {item.cena} Kč
              </div>

              <button
                onClick={() => deleteItem(item.id)}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Smazat
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
