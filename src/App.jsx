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

  const [novaKategorie, setNovaKategorie] = useState("");
  const [novaZnacka, setNovaZnacka] = useState("");

  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const [editKatId, setEditKatId] = useState(null);
  const [editKatName, setEditKatName] = useState("");

  const [editZnId, setEditZnId] = useState(null);
  const [editZnName, setEditZnName] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const { data } = await supabase
      .from("sklad")
      .select(`
        *,
        kategorie(id,name),
        znacka(id,name)
      `)
      .order("created_at", { ascending: false });

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
      kategorie: kategorie || null,
      znacka: znacka || null,
      ks: ks ? Number(ks) : 0,
      cena: cena ? Number(cena) : 0,
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
    setKategorie(item.kategorie?.id || "");
    setZnacka(item.znacka?.id || "");
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

  // KATEGORIE
  async function addKategorie() {
    if (!novaKategorie) return;

    const { data } = await supabase
      .from("kategorie")
      .insert([{ name: novaKategorie }])
      .select()
      .single();

    setKategorie(data.id);
    setNovaKategorie("");
    loadAll();
  }

  async function deleteKategorie(id) {
    await supabase.from("kategorie").delete().eq("id", id);
    loadAll();
  }

  async function updateKategorie(id) {
    await supabase
      .from("kategorie")
      .update({ name: editKatName })
      .eq("id", id);

    setEditKatId(null);
    setEditKatName("");
    loadAll();
  }

  // ZNAČKY
  async function addZnacka() {
    if (!novaZnacka) return;

    const { data } = await supabase
      .from("znacky")
      .insert([{ name: novaZnacka }])
      .select()
      .single();

    setZnacka(data.id);
    setNovaZnacka("");
    loadAll();
  }

  async function deleteZnacka(id) {
    await supabase.from("znacky").delete().eq("id", id);
    loadAll();
  }

  async function updateZnacka(id) {
    await supabase
      .from("znacky")
      .update({ name: editZnName })
      .eq("id", id);

    setEditZnId(null);
    setEditZnName("");
    loadAll();
  }

  const filteredItems = items.filter(i =>
    i.nazev.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = filteredItems.reduce(
    (sum, i) => sum + i.ks * i.cena,
    0
  );

  const smallBtn = {
    marginLeft: 6,
    padding: "2px 6px",
    fontSize: 12,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1>Sklad</h1>

      {/* SEARCH */}
      <input
        placeholder="🔍 Hledat..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      {/* FORM */}
      <input placeholder="Název" value={nazev} onChange={e => setNazev(e.target.value)} />

      <select value={kategorie} onChange={e => setKategorie(e.target.value)}>
        <option value="">Kategorie</option>
        {kategorieList.map(k => (
          <option key={k.id} value={k.id}>{k.name}</option>
        ))}
      </select>

      <input
        placeholder="Nová kategorie"
        value={novaKategorie}
        onChange={e => setNovaKategorie(e.target.value)}
      />
      <button onClick={addKategorie}>+ Kategorie</button>

      <select value={znacka} onChange={e => setZnacka(e.target.value)}>
        <option value="">Značka</option>
        {znackyList.map(z => (
          <option key={z.id} value={z.id}>{z.name}</option>
        ))}
      </select>

      <input
        placeholder="Nová značka"
        value={novaZnacka}
        onChange={e => setNovaZnacka(e.target.value)}
      />
      <button onClick={addZnacka}>+ Značka</button>

      <input placeholder="Ks" value={ks} onChange={e => setKs(e.target.value)} />
      <input placeholder="Cena" value={cena} onChange={e => setCena(e.target.value)} />

      <button onClick={addOrUpdateItem}>
        {editId ? "Uložit" : "Přidat"}
      </button>

      <hr />

      <p>Počet položek: {filteredItems.length}</p>
      <p>Hodnota skladu: {totalValue} Kč</p>

      <hr />

      {/* ITEMS */}
      {filteredItems.map(item => (
        <div key={item.id} style={{ marginBottom: 10 }}>
          <b>{item.nazev}</b> – {item.kategorie?.name || "Bez kategorie"} – {item.znacka?.name || "Bez značky"} – {item.ks} ks – {item.cena} Kč
          <br />
          <button onClick={() => editItem(item)}>Edit</button>
          <button onClick={() => deleteItem(item.id)}>Smazat</button>
        </div>
      ))}

      <hr />

      {/* KATEGORIE */}
      <h3>Kategorie</h3>
      {kategorieList.map(k => (
        <div key={k.id} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          {editKatId === k.id ? (
            <>
              <input
                value={editKatName}
                onChange={e => setEditKatName(e.target.value)}
              />
              <button onClick={() => updateKategorie(k.id)} style={smallBtn}>💾</button>
            </>
          ) : (
            <>
              <span>{k.name}</span>
              <button onClick={() => { setEditKatId(k.id); setEditKatName(k.name); }} style={{ ...smallBtn, background: "#1890ff", color: "#fff" }}>✏️</button>
              <button onClick={() => deleteKategorie(k.id)} style={{ ...smallBtn, background: "#ff4d4f", color: "#fff" }}>✕</button>
            </>
          )}
        </div>
      ))}

      {/* ZNAČKY */}
      <h3>Značky</h3>
      {znackyList.map(z => (
        <div key={z.id} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          {editZnId === z.id ? (
            <>
              <input
                value={editZnName}
                onChange={e => setEditZnName(e.target.value)}
              />
              <button onClick={() => updateZnacka(z.id)} style={smallBtn}>💾</button>
            </>
          ) : (
            <>
              <span>{z.name}</span>
              <button onClick={() => { setEditZnId(z.id); setEditZnName(z.name); }} style={{ ...smallBtn, background: "#1890ff", color: "#fff" }}>✏️</button>
              <button onClick={() => deleteZnacka(z.id)} style={{ ...smallBtn, background: "#ff4d4f", color: "#fff" }}>✕</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
