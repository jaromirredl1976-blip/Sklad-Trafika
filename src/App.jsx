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

  async function loadAll() {
    const { data } = await supabase
      .from("sklad")
      .select(`
        *,
        kategorie(name),
        znacka(name)
      `);

    const { data: kat } = await supabase.from("kategorie").select("*");
    const { data: zn } = await supabase.from("znacky").select("*");

    setItems(data || []);
    setKategorieList(kat || []);
    setZnackyList(zn || []);
  }

  async function addOrUpdateItem() {
    if (!nazev) return;

    const payload = {
      nazev,
      kategorie,
      znacka,
      ks: Number(ks),
      cena: Number(cena),
    };

    if (editId) {
      await supabase.from("sklad").update(payload).eq("id", editId);
      setEditId(null);
    } else {
      await supabase.from("sklad").insert([payload]);
    }

    clearForm();
    loadAll();
  }

  function editItem(item) {
    setEditId(item.id);
    setNazev(item.nazev);
    setKategorie(item.kategorie);
    setZnacka(item.znacka);
    setKs(item.ks);
    setCena(item.cena);
  }

  async function deleteItem(id) {
    await supabase.from("sklad").delete().eq("id", id);
    loadAll();
  }

  function clearForm() {
    setNazev("");
    setKategorie("");
    setZnacka("");
    setKs("");
    setCena("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Sklad</h1>

      <input placeholder="Název" value={nazev} onChange={e => setNazev(e.target.value)} />

      <select value={kategorie} onChange={e => setKategorie(e.target.value)}>
        <option value="">Kategorie</option>
        {kategorieList.map(k => (
          <option key={k.id} value={k.id}>{k.name}</option>
        ))}
      </select>

      <select value={znacka} onChange={e => setZnacka(e.target.value)}>
        <option value="">Značka</option>
        {znackyList.map(z => (
          <option key={z.id} value={z.id}>{z.name}</option>
        ))}
      </select>

      <input placeholder="Ks" value={ks} onChange={e => setKs(e.target.value)} />
      <input placeholder="Cena" value={cena} onChange={e => setCena(e.target.value)} />

      <button onClick={addOrUpdateItem}>
        {editId ? "Uložit" : "Přidat"}
      </button>

      <hr />

      {items.map(item => (
        <div key={item.id}>
          {item.nazev} – {item.kategorie?.name} – {item.znacka?.name} – {item.ks} ks – {item.cena} Kč

          <button onClick={() => editItem(item)}>Edit</button>
          <button onClick={() => deleteItem(item.id)}>Smazat</button>
        </div>
      ))}
    </div>
  );
}
