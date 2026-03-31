import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

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
      .select(`*, kategorie(name), znacka(name)`)
      .order("id", { ascending: false });

    const { data: kat } = await supabase.from("kategorie").select("*");
    const { data: zn } = await supabase.from("znacky").select("*");

    setItems(items || []);
    setKategorie(kat || []);
    setZnacky(zn || []);
  }

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

  // Kategorie
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

  // Značky
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

  const filtered = items.filter((i) =>
    i.nazev.toLowerCase().includes(search.toLowerCase())
  );

  const total = items.reduce((sum, i) => sum + i.ks * i.cena, 0);

  const input = {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #2a2a2a",
    background: "#0f172a",
    color: "white",
    width: "100%",
    marginBottom: "10px",
  };

  const btn = {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "#3b82f6",
    color: "white",
  };

  const btnIcon = {
    padding: "6px",
    marginLeft: "6px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#1f2937",
    color: "white",
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>Sklad</h1>

      {/* SEARCH */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Search size={18} />
        <input
          style={input}
          placeholder="Hledat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FORM */}
      <input style={input} placeholder="Název" value={nazev} onChange={e => setNazev(e.target.value)} />

      <select style={input} value={katId} onChange={e => setKatId(e.target.value)}>
        <option value="">Kategorie</option>
        {kategorie.map(k => (
          <option key={k.id} value={k.id}>{k.name}</option>
        ))}
      </select>

      <div style={{ display: "flex", gap: 8 }}>
        <input style={input} placeholder="Nová kategorie" value={newKat} onChange={e => setNewKat(e.target.value)} />
        <button style={btn} onClick={addKategorie}><Plus size={16} /></button>
      </div>

      <select style={input} value={znId} onChange={e => setZnId(e.target.value)}>
        <option value="">Značka</option>
        {znacky.map(z => (
          <option key={z.id} value={z.id}>{z.name}</option>
        ))}
      </select>

      <div style={{ display: "flex", gap: 8 }}>
        <input style={input} placeholder="Nová značka" value={newZn} onChange={e => setNewZn(e.target.value)} />
        <button style={btn} onClick={addZnacka}><Plus size={16} /></button>
      </div>

      <input style={input} placeholder="Ks" value={ks} onChange={e => setKs(e.target.value)} />
      <input style={input} placeholder="Cena" value={cena} onChange={e => setCena(e.target.value)} />

      <button style={{ ...btn, width: "100%" }} onClick={saveItem}>
        {editId ? "Uložit" : "Přidat"}
      </button>

      <hr />

      <p>Počet položek: {items.length}</p>
      <p>Hodnota skladu: {total} Kč</p>

      <hr />

      {/* ITEMS */}
      {filtered.map(item => (
        <div key={item.id} style={{
          background: "#0f172a",
          padding: 10,
          borderRadius: 8,
          marginBottom: 10
        }}>
          <div>{item.nazev}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {item.kategorie?.name} • {item.znacka?.name}
          </div>
          <div>{item.ks} ks • {item.cena} Kč</div>

          <div style={{ marginTop: 6 }}>
            <button style={btnIcon} onClick={() => editItem(item)}>
              <Pencil size={14} />
            </button>
            <button style={btnIcon} onClick={() => deleteItem(item.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {/* KATEGORIE */}
      <h3>Kategorie</h3>
      {kategorie.map(k => (
        <div key={k.id} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          <span style={{ flex: 1 }}>{k.name}</span>
          <button style={btnIcon} onClick={() => editKategorie(k.id, k.name)}>
            <Pencil size={14} />
          </button>
          <button style={btnIcon} onClick={() => deleteKategorie(k.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {/* ZNAČKY */}
      <h3>Značky</h3>
      {znacky.map(z => (
        <div key={z.id} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          <span style={{ flex: 1 }}>{z.name}</span>
          <button style={btnIcon} onClick={() => editZnacka(z.id, z.name)}>
            <Pencil size={14} />
          </button>
          <button style={btnIcon} onClick={() => deleteZnacka(z.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
