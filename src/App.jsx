import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Check,
  X
} from "lucide-react";

const supabase = createClient(
  "https://jqddbwciekvfppfdpivk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZGRid2NpZWt2ZnBwZmRwaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjQyNTQsImV4cCI6MjA5MDQwMDI1NH0.lDdHLZ3WEl9N-K_tcS-UF8TFXwItPQSr83YB_Kk_cRo"
);

export default function App() {
  const [items, setItems] = useState([]);
  const [kategorie, setKategorie] = useState([]);
  const [znacky, setZnacky] = useState([]);

  const [search, setSearch] = useState("");

  const [nazev, setNazev] = useState("");
  const [kat, setKat] = useState("");
  const [zn, setZn] = useState("");
  const [ks, setKs] = useState("");
  const [cena, setCena] = useState("");

  const [newKat, setNewKat] = useState("");
  const [newZn, setNewZn] = useState("");

  const [editId, setEditId] = useState(null);

  const [toast, setToast] = useState(null);

  const [editKatId, setEditKatId] = useState(null);
  const [editKatName, setEditKatName] = useState("");

  const [editZnId, setEditZnId] = useState(null);
  const [editZnName, setEditZnName] = useState("");

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("realtime")
      .on("postgres_changes", { event: "*", schema: "public" }, loadData)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(null), 2000);
  }

  async function loadData() {
    const { data: sklad } = await supabase
      .from("sklad")
      .select("*, kategorie(name), znacka(name)");

    const { data: kat } = await supabase.from("kategorie").select("*");
    const { data: zn } = await supabase.from("znacky").select("*");

    setItems(sklad || []);
    setKategorie(kat || []);
    setZnacky(zn || []);
  }

  async function saveItem() {
    if (!nazev) return;

    const payload = {
      nazev,
      kategorie: kat,
      znacka: zn,
      ks: Number(ks),
      cena: Number(cena)
    };

    if (editId) {
      await supabase.from("sklad").update(payload).eq("id", editId);
      setEditId(null);
      showToast("Uloženo");
    } else {
      await supabase.from("sklad").insert([payload]);
      showToast("Přidáno");
    }

    resetForm();
  }

  function editItem(item) {
    setEditId(item.id);
    setNazev(item.nazev);
    setKat(item.kategorie);
    setZn(item.znacka);
    setKs(item.ks);
    setCena(item.cena);
  }

  async function deleteItem(id) {
    if (!confirm("Smazat?")) return;
    await supabase.from("sklad").delete().eq("id", id);
    showToast("Smazáno");
  }

  async function addKategorie() {
    if (!newKat) return;
    await supabase.from("kategorie").insert([{ name: newKat }]);
    setNewKat("");
    showToast("Kategorie přidána");
  }

  async function addZnacka() {
    if (!newZn) return;
    await supabase.from("znacky").insert([{ name: newZn }]);
    setNewZn("");
    showToast("Značka přidána");
  }

  async function updateKategorie(id) {
    await supabase.from("kategorie").update({ name: editKatName }).eq("id", id);
    setEditKatId(null);
    showToast("Upraveno");
  }

  async function deleteKategorie(id) {
    await supabase.from("kategorie").delete().eq("id", id);
    showToast("Smazáno");
  }

  async function updateZnacka(id) {
    await supabase.from("znacky").update({ name: editZnName }).eq("id", id);
    setEditZnId(null);
    showToast("Upraveno");
  }

  async function deleteZnacka(id) {
    await supabase.from("znacky").delete().eq("id", id);
    showToast("Smazáno");
  }

  function resetForm() {
    setNazev("");
    setKat("");
    setZn("");
    setKs("");
    setCena("");
  }

  const filtered = items.filter(i =>
    i.nazev.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <h1>Sklad</h1>

      {toast && <div className="toast">{toast}</div>}

      {/* SEARCH */}
      <div className="row">
        <Search size={18} />
        <input
          placeholder="Hledat..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* FORM */}
      <input
        placeholder="Název"
        value={nazev}
        onChange={e => setNazev(e.target.value)}
      />

      <select value={kat} onChange={e => setKat(e.target.value)}>
        <option value="">Kategorie</option>
        {kategorie.map(k => (
          <option key={k.id} value={k.id}>{k.name}</option>
        ))}
      </select>

      <div className="row">
        <input
          placeholder="Nová kategorie"
          value={newKat}
          onChange={e => setNewKat(e.target.value)}
        />
        <button className="btn-add" onClick={addKategorie}>
          <Plus size={16} />
        </button>
      </div>

      <select value={zn} onChange={e => setZn(e.target.value)}>
        <option value="">Značka</option>
        {znacky.map(z => (
          <option key={z.id} value={z.id}>{z.name}</option>
        ))}
      </select>

      <div className="row">
        <input
          placeholder="Nová značka"
          value={newZn}
          onChange={e => setNewZn(e.target.value)}
        />
        <button className="btn-add" onClick={addZnacka}>
          <Plus size={16} />
        </button>
      </div>

      <input placeholder="Ks" value={ks} onChange={e => setKs(e.target.value)} />
      <input placeholder="Cena" value={cena} onChange={e => setCena(e.target.value)} />

      <button className="btn-primary" onClick={saveItem}>
        {editId ? "Uložit" : "Přidat"}
      </button>

      {/* ITEMS */}
      <div className="list">
        {filtered.map(item => (
          <div key={item.id} className="list-item">
            <div>
              <strong>{item.nazev}</strong>
              <div className="muted">
                {item.kategorie?.name} • {item.znacka?.name}
              </div>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-icon btn-edit" onClick={() => editItem(item)}>
                <Pencil size={16} />
              </button>
              <button className="btn-icon btn-delete" onClick={() => deleteItem(item.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* KATEGORIE */}
      <h2>Kategorie</h2>
      {kategorie.map(k => (
        <div key={k.id} className="list-item">
          {editKatId === k.id ? (
            <input value={editKatName} onChange={e => setEditKatName(e.target.value)} />
          ) : (
            <span>{k.name}</span>
          )}

          <div style={{ display: "flex", gap: 6 }}>
            {editKatId === k.id ? (
              <>
                <button onClick={() => updateKategorie(k.id)}>
                  <Check size={16} />
                </button>
                <button onClick={() => setEditKatId(null)}>
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-icon btn-edit"
                  onClick={() => {
                    setEditKatId(k.id);
                    setEditKatName(k.name);
                  }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => deleteKategorie(k.id)}
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* ZNAČKY */}
      <h2>Značky</h2>
      {znacky.map(z => (
        <div key={z.id} className="list-item">
          {editZnId === z.id ? (
            <input value={editZnName} onChange={e => setEditZnName(e.target.value)} />
          ) : (
            <span>{z.name}</span>
          )}

          <div style={{ display: "flex", gap: 6 }}>
            {editZnId === z.id ? (
              <>
                <button onClick={() => updateZnacka(z.id)}>
                  <Check size={16} />
                </button>
                <button onClick={() => setEditZnId(null)}>
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-icon btn-edit"
                  onClick={() => {
                    setEditZnId(z.id);
                    setEditZnName(z.name);
                  }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => deleteZnacka(z.id)}
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
