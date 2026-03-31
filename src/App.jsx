import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  "https://jqddbwciekvfppfdpivk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZGRid2NpZWt2ZnBwZmRwaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjQyNTQsImV4cCI6MjA5MDQwMDI1NH0.lDdHLZ3WEl9N-K_tcS-UF8TFXwItPQSr83YB_Kk_cRo"
);

export default function App() {
  const [items, setItems] = useState([]);
  const [kategorie, setKategorie] = useState([]);
  const [znacky, setZnacky] = useState([]);

  const [nazev, setNazev] = useState("");
  const [katId, setKatId] = useState("");
  const [znId, setZnId] = useState("");
  const [ks, setKs] = useState("");
  const [cena, setCena] = useState("");

  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const [newKat, setNewKat] = useState("");
  const [newZn, setNewZn] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: items } = await supabase
      .from("sklad")
      .select(`
        *,
        kategorie(name),
        znacka(name)
      `)
      .order("id", { ascending: false });

    const { data: kat } = await supabase.from("kategorie").select("*");
    const { data: zn } = await supabase.from("znacky").select("*");

    setItems(items || []);
    setKategorie(kat || []);
    setZnacky(zn || []);
  }

  // ===============================
  // CRUD SKLAD
  // ===============================

  async function saveItem() {
    if (!nazev) return;

    const payload = {
      nazev,
      kategorie: katId || null,
      znacka: znId || null,
      ks: Number(ks) || 0,
      cena: Number(cena) || 0,
    };

    if (editId) {
      await supabase.from("sklad").update(payload).eq("id", editId);
      setEditId(null);
    } else {
      await supabase.from("sklad").insert([payload]);
    }

    clearForm();
    loadData();
  }

  function editItem(item) {
    setEditId(item.id);
    setNazev(item.nazev);
    setKatId(item.kategorie || "");
    setZnId(item.znacka || "");
    setKs(item.ks);
    setCena(item.cena);
  }

  async function deleteItem(id) {
    await supabase.from("sklad").delete().eq("id", id);
    loadData();
  }

  function clearForm() {
    setNazev("");
    setKatId("");
    setZnId("");
    setKs("");
    setCena("");
  }

  // ===============================
  // KATEGORIE
  // ===============================

  async function addKategorie() {
    if (!newKat) return;
    await supabase.from("kategorie").insert([{ name: newKat }]);
    setNewKat("");
    loadData();
  }

  async function deleteKategorie(id) {
    await supabase.from("kategorie").delete().eq("id", id);
    loadData();
  }

  async function editKategorie(id, name) {
    const newName = prompt("Nový název:", name);
    if (!newName) return;
    await supabase.from("kategorie").update({ name: newName }).eq("id", id);
    loadData();
  }

  // ===============================
  // ZNAČKY
  // ===============================

  async function addZnacka() {
    if (!newZn) return;
    await supabase.from("znacky").insert([{ name: newZn }]);
    setNewZn("");
    loadData();
  }

  async function deleteZnacka(id) {
    await supabase.from("znacky").delete().eq("id", id);
    loadData();
  }

  async function editZnacka(id, name) {
    const newName = prompt("Nová značka:", name);
    if (!newName) return;
    await supabase.from("znacky").update({ name: newName }).eq("id", id);
    loadData();
  }

  // ===============================
  // FILTER
  // ===============================

  const filtered = items.filter((i) =>
    i.nazev.toLowerCase().includes(search.toLowerCase())
  );

  const total = items.reduce((sum, i) => sum + i.ks * i.cena, 0);

  // ===============================
  // UI
  // ===============================

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Sklad</h1>

      <input
        placeholder="🔍 Hledat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <input
        placeholder="Název"
        value={nazev}
        onChange={(e) => setNazev(e.target.value)}
      />

      <select value={katId} onChange={(e) => setKatId(e.target.value)}>
        <option value="">Kategorie</option>
        {kategorie.map((k) => (
          <option key={k.id} value={k.id}>
            {k.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Nová kategorie"
        value={newKat}
        onChange={(e) => setNewKat(e.target.value)}
      />
      <button onClick={addKategorie}>+ Kat</button>

      <select value={znId} onChange={(e) => setZnId(e.target.value)}>
        <option value="">Značka</option>
        {znacky.map((z) => (
          <option key={z.id} value={z.id}>
            {z.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Nová značka"
        value={newZn}
        onChange={(e) => setNewZn(e.target.value)}
      />
      <button onClick={addZnacka}>+ Zn</button>

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

      <button onClick={saveItem}>
        {editId ? "Uložit" : "Přidat"}
      </button>

      <hr />

      <p>Počet položek: {items.length}</p>
      <p>Hodnota skladu: {total} Kč</p>

      <hr />

      {/* ITEMS */}
      {filtered.map((item) => (
        <div key={item.id} style={{ marginBottom: 10 }}>
          {item.nazev} – {item.kategorie?.name} – {item.znacka?.name} – {item.ks} ks – {item.cena} Kč

          <div>
            <button onClick={() => editItem(item)}>✏️</button>
            <button onClick={() => deleteItem(item.id)}>❌</button>
          </div>
        </div>
      ))}

      <hr />

      {/* KATEGORIE */}
      <h3>Kategorie</h3>
      {kategorie.map((k) => (
        <div key={k.id}>
          {k.name}
          <button onClick={() => editKategorie(k.id, k.name)}>✏️</button>
          <button onClick={() => deleteKategorie(k.id)}>❌</button>
        </div>
      ))}

      <h3>Značky</h3>
      {znacky.map((z) => (
        <div key={z.id}>
          {z.name}
          <button onClick={() => editZnacka(z.id, z.name)}>✏️</button>
          <button onClick={() => deleteZnacka(z.id)}>❌</button>
        </div>
      ))}
    </div>
  );
}
