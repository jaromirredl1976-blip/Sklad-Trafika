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

  // ✏️ EDIT STATE
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data, error } = await supabase.from("sklad").select("*");

    if (error) console.error(error);
    else setItems(data);
  }

  // ➕ ADD
  async function addItem() {
    const { error } = await supabase.from("sklad").insert([
      {
        nazev,
        kategorie: kategorieInput,
        znacka: znackaInput,
        ks: Number(ks),
        cena: Number(cena),
      },
    ]);

    if (!error) {
      setNazev("");
      setKategorieInput("");
      setZnackaInput("");
      setKs("");
      setCena("");
      loadData();
    }
  }

  // ❌ DELETE
  async function deleteItem(id) {
    await supabase.from("sklad").delete().eq("id", id);
    loadData();
  }

  // ✏️ START EDIT
  function startEdit(item) {
    setEditId(item.id);
    setEditData(item);
  }

  // 💾 SAVE EDIT
  async function saveEdit() {
    await supabase
      .from("sklad")
      .update({
        ...editData,
        ks: Number(editData.ks),
        cena: Number(editData.cena),
      })
      .eq("id", editId);

    setEditId(null);
    loadData();
  }

  const filteredItems = items.filter((item) =>
    item.nazev.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <h1>Sklad Trafika</h1>

      {/* 🔍 SEARCH */}
      <div className="card">
        <input
          placeholder="🔍 Hledat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ➕ FORM */}
      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
          <input placeholder="Název" value={nazev} onChange={(e) => setNazev(e.target.value)} />

          <input placeholder="Kategorie" value={kategorieInput} onChange={(e) => setKategorieInput(e.target.value)} />

          <input placeholder="Značka" value={znackaInput} onChange={(e) => setZnackaInput(e.target.value)} />

          <input placeholder="Ks" value={ks} onChange={(e) => setKs(e.target.value)} />

          <input placeholder="Cena" value={cena} onChange={(e) => setCena(e.target.value)} />
        </div>

        <div style={{ marginTop: "10px" }}>
          <button onClick={addItem}>Přidat</button>
        </div>
      </div>

      {/* 📊 STATS */}
      <div className="card">
        <strong>Počet položek:</strong> {items.length} <br />
        <strong>Hodnota skladu:</strong>{" "}
        {items.reduce((sum, i) => sum + i.ks * i.cena, 0)} Kč
      </div>

      {/* 📋 LIST */}
      <div className="card">
        {filteredItems.length === 0 ? (
          <p>Žádná data</p>
        ) : (
          <ul>
            {filteredItems.map((item) => (
              <li key={item.id}>
                {editId === item.id ? (
                  <>
                    <input
                      value={editData.nazev}
                      onChange={(e) =>
                        setEditData({ ...editData, nazev: e.target.value })
                      }
                    />
                    <input
                      value={editData.kategorie}
                      onChange={(e) =>
                        setEditData({ ...editData, kategorie: e.target.value })
                      }
                    />
                    <input
                      value={editData.znacka}
                      onChange={(e) =>
                        setEditData({ ...editData, znacka: e.target.value })
                      }
                    />
                    <input
                      value={editData.ks}
                      onChange={(e) =>
                        setEditData({ ...editData, ks: e.target.value })
                      }
                    />
                    <input
                      value={editData.cena}
                      onChange={(e) =>
                        setEditData({ ...editData, cena: e.target.value })
                      }
                    />

                    <button onClick={saveEdit}>Uložit</button>
                  </>
                ) : (
                  <>
                    <span>
                      {item.nazev} – {item.kategorie} – {item.znacka} –{" "}
                      {item.ks} ks – {item.cena} Kč
                    </span>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => startEdit(item)}>Edit</button>

                      <button
                        className="danger"
                        onClick={() => deleteItem(item.id)}
                      >
                        Smazat
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
