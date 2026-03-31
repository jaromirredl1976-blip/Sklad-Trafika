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

  // NAČTENÍ DAT
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

  // PŘIDÁNÍ
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

  // SMAZÁNÍ
  async function deleteItem(id) {
    const potvrdit = confirm("Opravdu chceš smazat položku?");
    if (!potvrdit) return;

    const { error } = await supabase
      .from("sklad")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Chyba:", error);
    } else {
      loadData();
    }
  }

  // FILTRACE
  const filteredItems = items.filter((item) =>
    `${item.nazev} ${item.kategorie} ${item.znacka}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // STATISTIKY
  const totalValue = filteredItems.reduce(
    (sum, item) => sum + item.ks * item.cena,
    0
  );

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <h1>Sklad Trafika</h1>

      {/* 🔍 SEARCH */}
      <input
        placeholder="🔍 Hledat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      />

      {/* 📦 FORM */}
      <div style={{ marginBottom: "20px" }}>
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

        <button
          onClick={addItem}
          disabled={!nazev || !ks || !cena}
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            borderRadius: "8px",
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
      <div style={{ marginBottom: "20px" }}>
        <p>Počet položek: {filteredItems.length}</p>
        <p style={{ color: "#60a5fa", fontWeight: "bold" }}>
          Hodnota skladu: {totalValue} Kč
        </p>
      </div>

      {/* 📋 LIST */}
      {filteredItems.length === 0 ? (
        <p>Žádná data</p>
      ) : (
        <ul>
          {filteredItems.map((item) => (
            <li key={item.id} style={{ marginBottom: "10px" }}>
              {item.nazev} – {item.kategorie} – {item.znacka} – {item.ks} ks –{" "}
              {item.cena} Kč

              <button
                onClick={() => deleteItem(item.id)}
                style={{
                  marginLeft: "10px",
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "6px",
                }}
              >
                Smazat
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
