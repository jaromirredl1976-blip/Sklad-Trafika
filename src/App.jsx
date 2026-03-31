import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabase = createClient(
  "https://jqddbwciekvfppfdpivk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZGRid2NpZWt2ZnBwZmRwaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjQyNTQsImV4cCI6MjA5MDQwMDI1NH0.lDdHLZ3WEl9N-K_tcS-UF8TFXwItPQSr83YB_Kk_cRo"
);

export default function App() {
  const [items, setItems] = useState([]);
  const [kategorieList, setKategorieList] = useState([]);
  const [znackyList, setZnackyList] = useState([]);

  const [nazev, setNazev] = useState("");
  const [kategorie, setKategorie] = useState("");
  const [znacka, setZnacka] = useState("");
  const [ks, setKs] = useState("");
  const [cena, setCena] = useState("");

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  // 🔥 NAČTENÍ DAT
  async function loadAll() {
    const { data, error } = await supabase
      .from("sklad")
      .select(`
        *,
        kategorie(id, name),
        znacka(id, name)
      `);

    if (error) console.error("Chyba sklad:", error);

    const { data: kat, error: errKat } = await supabase
      .from("kategorie")
      .select("*");

    if (errKat) console.error("Chyba kategorie:", errKat);

    const { data: zn, error: errZn } = await supabase
      .from("znacky")
      .select("*");

    if (errZn) console.error("Chyba znacky:", errZn);

    setItems(data || []);
    setKategorieList(kat || []);
    setZnackyList(zn || []);
  }

  // 🔥 ADD / UPDATE
  async function addOrUpdateItem() {
    if (!nazev) return;

    const payload = {
      nazev,
      kategorie: kategorie || null,
      znacka: znacka || null,
      ks: Number(ks) || 0,
      cena: Number(cena) || 0,
    };

    if (editId) {
      const { error } = await supabase
        .from("sklad")
        .update(payload)
        .eq("id", editId);

      if (error) console.error("Update chyba:", error);
      setEditId(null);
    } else {
      const { error } = await supabase.from("sklad").insert([payload]);

      if (error) console.error("Insert chyba:", error);
    }

    clearForm();
    loadAll();
  }

  // 🔥 EDIT (FIX)
  function editItem(item) {
    setEditId(item.id);
    setNazev(item.nazev);

    // MUSÍ být ID
    setKategorie(item.kategorie?.id || "");
    setZnacka(item.znacka?.id || "");

    setKs(item.ks);
    setCena(item.cena);
  }

  // 🔥 DELETE
  async function deleteItem(id) {
    const { error } = await supabase.from("sklad").delete().eq("id", id);

    if (error) console.error("Delete chyba:", error);

    loadAll();
  }

  function clearForm() {
    setNazev("");
    setKategorie("");
    setZnacka("");
    setKs("");
    setCena("");
  }

  // 🔥 výpočet hodnoty skladu
  const totalValue = items.reduce(
    (sum, item) => sum + item.ks * item.cena,
    0
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>Sklad</h1>

      <input
        placeholder="Název"
        value={nazev}
        onChange={(e) => setNazev(e.target.value)}
      />

      <select
        value={kategorie}
        onChange={(e) => setKategorie(e.target.value)}
      >
        <option value="">Kategorie</option>
        {kategorieList.map((k) => (
          <option key={k.id} value={k.id}>
            {k.name}
          </option>
        ))}
      </select>

      <select value={znacka} onChange={(e) => setZnacka(e.target.value)}>
        <option value="">Značka</option>
        {znackyList.map((z) => (
          <option key={z.id} value={z.id}>
            {z.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Ks"
        type="number"
        value={ks}
        onChange={(e) => setKs(e.target.value)}
      />

      <input
        placeholder="Cena"
        type="number"
        value={cena}
        onChange={(e) => setCena(e.target.value)}
      />

      <button onClick={addOrUpdateItem}>
        {editId ? "Uložit změny" : "Přidat"}
      </button>

      <hr />

      <h3>Počet položek: {items.length}</h3>
      <h3>Hodnota skladu: {totalValue} Kč</h3>

      <hr />

      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: 10 }}>
          <b>{item.nazev}</b> – {item.kategorie?.name || "-"} –{" "}
          {item.znacka?.name || "-"} – {item.ks} ks – {item.cena} Kč

          <br />

          <button onClick={() => editItem(item)}>Edit</button>
          <button onClick={() => deleteItem(item.id)}>Smazat</button>
        </div>
      ))}
    </div>
  );
}
