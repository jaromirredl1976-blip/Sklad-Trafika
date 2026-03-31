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

  const [kategorieList, setKategorieList] = useState([]);
  const [znackyList, setZnackyList] = useState([]);

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadData();
    loadLists();
  }, []);

  async function loadData() {
    const { data, error } = await supabase.from("sklad").select("*");

    if (error) {
      console.error(error);
      setItems([]);
      return;
    }

    setItems(data || []);
  }

  async function loadLists() {
    const { data: kat } = await supabase.from("kategorie").select("*");
    const { data: zn } = await supabase.from("znacky").select("*");

    setKategorieList(kat || []);
    setZnackyList(zn || []);
  }

  async function addOrUpdateItem() {
    if (!nazev || !kategorie || !znacka) {
      alert("Vyplň všechny údaje");
      return;
    }

    const payload = {
      nazev,
      kategorie,
      znacka,
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

  async function deleteItem(id) {
    await supabase.from("sklad").delete().eq("id", id);
    loadData();
  }

  function editItem(item) {
    setEditId(item.id);
    setNazev(item.nazev || "");
    setKategorie(item.kategorie || "");
    setZnacka(item.znacka || "");
    setKs(item.ks || "");
    setCena(item.cena || "");
  }

  function clearForm() {
    setNazev("");
    setKategorie("");
    setZnacka("");
    setKs("");
    setCena("");
  }

  const filtered = items
    .filter((i) =>
      (i.nazev || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (a.nazev || "").localeCompare(b.nazev || ""));

  const totalValue = items.reduce(
    (sum, i) => sum + (Number(i.ks) || 0) * (Number(i.cena) || 0),
    0
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>Sklad Trafika</h1>

      {/* SEARCH */}
      <input
        placeholder="🔍 Hledat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={inputStyle}
      />

      {/* FORM */}
      <div style={card}>
        <input
          placeholder="Název"
          value={nazev}
          onChange={(e) => setNazev(e.target.value)}
          style={inputStyle}
        />

        {/* DROPDOWN KATEGORIE */}
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

        {/* DROPDOWN ZNACKY */}
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
          type="number"
          placeholder="Ks"
          value={ks}
          onChange={(e) => setKs(e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Cena"
          value={cena}
          onChange={(e) => setCena(e.target.value)}
          style={inputStyle}
        />

        <button onClick={addOrUpdateItem} style={addBtn}>
          {editId ? "Uložit změny" : "Přidat"}
        </button>
      </div>

      {/* STATS */}
      <div style={card}>
        <p>Počet položek: {items.length}</p>
        <p style={{ color: "#4ea1ff", fontWeight: "bold" }}>
          Hodnota skladu: {totalValue} Kč
        </p>
      </div>

      {/* LIST */}
      <div style={card}>
        {filtered.map((item) => (
          <div key={item.id} style={row}>
            <span>
              {item.nazev || "-"} – {item.kategorie || "-"} –{" "}
              {item.znacka || "-"} – {item.ks || 0} ks –{" "}
              {item.cena || 0} Kč
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

/* STYLY */
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #2e3a4d",
  background: "#0b1220",
  color: "white",
};

const card = {
  background: "#0f172a",
  padding: "15px",
  borderRadius: "12px",
  marginTop: "15px",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid #1f2937",
};

const addBtn = {
  background: "#4ea1ff",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
};

const editBtn = {
  background: "#3b82f6",
  color: "white",
  border: "none",
  padding: "6px 10px",
  marginRight: "5px",
  borderRadius: "6px",
  cursor: "pointer",
};

const deleteBtn = {
  background: "#ff2e2e",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};
