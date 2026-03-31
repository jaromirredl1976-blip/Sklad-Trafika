import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabase = createClient(
  "https://jqddbwciekvfppfdpivk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZGRid2NpZWt2ZnBwZmRwaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjQyNTQsImV4cCI6MjA5MDQwMDI1NH0.lDdHLZ3WEl9N-K_tcS-UF8TFXwItPQSr83YB_Kk_cRo"
);

export default function App() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const [nazev, setNazev] = useState("");
  const [kategorie, setKategorie] = useState("");
  const [znacka, setZnacka] = useState("");
  const [ks, setKs] = useState("");
  const [cena, setCena] = useState("");

  const [editId, setEditId] = useState(null);

  // 🔥 NOVÉ
  const [kategorieList, setKategorieList] = useState([]);
  const [znackyList, setZnackyList] = useState([]);

  useEffect(() => {
    loadData();
    loadMeta(); // 🔥 důležité
  }, []);

  async function loadData() {
    const { data, error } = await supabase.from("sklad").select("*");
    if (!error) setItems(data);
  }

  // 🔥 NOVÁ FUNKCE
  async function loadMeta() {
    const { data: kat } = await supabase.from("kategorie").select("*");
    const { data: zn } = await supabase.from("znacky").select("*");

    setKategorieList(kat || []);
    setZnackyList(zn || []);
  }

  async function addOrUpdateItem() {
    if (!nazev) return;

    if (editId) {
      await supabase
        .from("sklad")
        .update({
          nazev,
          kategorie,
          znacka,
          ks: Number(ks),
          cena: Number(cena),
        })
        .eq("id", editId);

      setEditId(null);
    } else {
      await supabase.from("sklad").insert([
        {
          nazev,
          kategorie,
          znacka,
          ks: Number(ks),
          cena: Number(cena),
        },
      ]);
    }

    clearForm();
    loadData();
  }

  async function deleteItem(id) {
    await supabase.from("sklad").delete().eq("id", id);
    loadData();
  }

  function editItem(item) {
    setEditId(item.id);
    setNazev(item.nazev);
    setKategorie(item.kategorie);
    setZnacka(item.znacka);
    setKs(item.ks);
    setCena(item.cena);
  }

  function clearForm() {
    setNazev("");
    setKategorie("");
    setZnacka("");
    setKs("");
    setCena("");
  }

  const filtered = items.filter((i) =>
    i.nazev.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = items.reduce(
    (sum, i) => sum + i.ks * i.cena,
    0
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>Sklad Trafika</h1>

      <input
        placeholder="🔍 Hledat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={inputStyle}
      />

      <div style={card}>
        <input
          placeholder="Název"
          value={nazev}
          onChange={(e) => setNazev(e.target.value)}
          style={inputStyle}
        />

        {/* 🔥 KATEGORIE */}
        <select
          value={kategorie}
          onChange={(e) => setKategorie(e.target.value)}
          style={inputStyle}
        >
          <option value="">Kategorie</option>
          {kategorieList.map((k) => (
            <option key={k.id} value={k.name}>
              {k.name}
            </option>
          ))}
        </select>

        {/* 🔥 ZNAČKY */}
        <select
          value={znacka}
          onChange={(e) => setZnacka(e.target.value)}
          style={inputStyle}
        >
          <option value="">Značka</option>
          {znackyList.map((z) => (
            <option key={z.id} value={z.name}>
              {z.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Ks"
          value={ks}
          onChange={(e) => setKs(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Cena"
          value={cena}
          onChange={(e) => setCena(e.target.value)}
          style={inputStyle}
        />

        <button onClick={addOrUpdateItem} style={addBtn}>
          {editId ? "Uložit změny" : "Přidat"}
        </button>
      </div>

      <div style={card}>
        <p>Počet položek: {items.length}</p>
        <p style={{ color: "#4ea1ff", fontWeight: "bold" }}>
          Hodnota skladu: {totalValue} Kč
        </p>
      </div>

      <div style={card}>
        {filtered.map((item) => (
          <div key={item.id} style={row}>
            <span>
              {item.nazev} – {item.kategorie} – {item.znacka} –{" "}
              {item.ks} ks – {item.cena} Kč
            </span>

            <div>
              <button onClick={() => editItem(item)} style={editBtn}>
                Edit
              </button>

              <button
                onClick={() => deleteItem(item.id)}
                style={deleteBtn}
              >
                Smazat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
