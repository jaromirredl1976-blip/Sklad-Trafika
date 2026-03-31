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

  // ✅ NAČTENÍ DAT
  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from("sklad")
        .select("*");

      if (error) {
        console.error("Chyba:", error);
      } else {
        setItems(data);
      }
    }

    loadData();
  }, []);

  // ✅ PŘIDÁNÍ POLOŽKY (MIMO useEffect)
  async function addItem() {
    const { error } = await supabase
      .from("sklad")
      .insert([
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

      location.reload();
    }
  }

  return (
    <div>
      <h1>Sklad Trafika</h1>

      {/* ✅ FORMULÁŘ */}
      <div>
        <input placeholder="Název" value={nazev} onChange={(e) => setNazev(e.target.value)} />
        <input placeholder="Kategorie" value={kategorieInput} onChange={(e) => setKategorieInput(e.target.value)} />
        <input placeholder="Značka" value={znackaInput} onChange={(e) => setZnackaInput(e.target.value)} />
        <input placeholder="Ks" value={ks} onChange={(e) => setKs(e.target.value)} />
        <input placeholder="Cena" value={cena} onChange={(e) => setCena(e.target.value)} />

        <button onClick={addItem}>Přidat</button>
      </div>

      {/* ✅ VÝPIS */}
      {items.length === 0 ? (
        <p>Žádná data</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.nazev} - {item.kategorie} - {item.znacka} - {item.ks} ks - {item.cena} Kč
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
