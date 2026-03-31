import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabase = createClient(
  "https://jqddbwciekvfppfdpivk.supabase.co",
  "TVŮJ_API_KEY"
);

export default function App() {
  const [items, setItems] = useState([]);
  const [nazev, setNazev] = useState("");
  const [kategorieInput, setKategorieInput] = useState("");
  const [znackaInput, setZnackaInput] = useState("");
  const [ks, setKs] = useState("");
  const [cena, setCena] = useState("");
  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState(null);

  // dropdown data
  const kategorieList = ["Tabák", "Cigarety", "Doplňky"];
  const znackyList = ["Marlboro", "Philip Morris", "Austin"];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data, error } = await supabase.from("sklad").select("*");

    if (!error) setItems(data);
  }

  // ADD
  async function addItem() {
    if (!nazev || !ks || !cena) return;

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

  // DELETE
  async function deleteItem(id) {
    if (!confirm("Opravdu smazat?")) return;

    const { error } = await supabase
      .from("sklad")
      .delete()
      .eq("id", id);

    if (!error) loadData();
  }

  // EDIT
  async function updateItem(item) {
    const { error } = await supabase
      .from("sklad")
      .update(item)
      .eq("id", item.id);

    if (!error) {
      setEditId(null);
      loadData();
    }
  }

  const filteredItems = items.filter((item) =>
    `${item.nazev} ${item.kategorie} ${item.znacka}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalValue = filteredItems.reduce(
    (sum, item) => sum + item.ks * item.cena,
    0
  );

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "auto", color: "#e5e7eb" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Sklad Trafika
      </h1>

      {/* SEARCH */}
      <input
        placeholder="🔍 Hledat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "25px",
          borderRadius: "10px",
          border: "1px solid #1f2937",
          background: "#020617",
          color: "white",
        }}
      />

      {/* FORM */}
      <div style={{
        background: "#020617",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "25px",
        border: "1px solid #1f2937",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "10px",
          marginBottom: "15px",
        }}>
          <input placeholder="Název" value={nazev} onChange={(e) => setNazev(e.target.value)} />

          <select value={kategorieInput} onChange={(e) => setKategorieInput(e.target.value)}>
            <option value="">Kategorie</option>
            {kategorieList.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>

          <select value={znackaInput} onChange={(e) => setZnackaInput(e.target.value)}>
            <option value="">Značka</option>
            {znackyList.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>

          <input placeholder="Ks" value={ks} onChange={(e) => setKs(e.target.value)} />
          <input placeholder="Cena" value={cena} onChange={(e) => setCena(e.target.value)} />
        </div>

        <button
          onClick={addItem}
          disabled={!nazev || !ks || !cena}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            opacity: !nazev || !ks || !cena ? 0.5 : 1,
          }}
        >
          Přidat
        </button>
      </div>

      {/* STATS */}
      <div style={{
        background: "#020617",
        padding: "15px",
        borderRadius: "12px",
        marginBottom: "25px",
        border: "1px solid #1f2937",
      }}>
        <p>Počet položek: {filteredItems.length}</p>
        <p style={{ color: "#60a5fa", fontWeight: "bold" }}>
          Hodnota skladu: {totalValue} Kč
        </p>
      </div>

      {/* LIST */}
      <div style={{
        background: "#020617",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #1f2937",
      }}>
        {filteredItems.map((item) => (
          <div key={item.id} style={{
            padding: "10px 0",
            borderBottom: "1px solid #1f2937",
          }}>

            {editId === item.id ? (
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  value={item.nazev}
                  onChange={(e) =>
                    setItems(items.map(i =>
                      i.id === item.id ? { ...i, nazev: e.target.value } : i
                    ))
                  }
                />

                <input
                  value={item.ks}
                  onChange={(e) =>
                    setItems(items.map(i =>
                      i.id === item.id ? { ...i, ks: e.target.value } : i
                    ))
                  }
                />

                <input
                  value={item.cena}
                  onChange={(e) =>
                    setItems(items.map(i =>
                      i.id === item.id ? { ...i, cena: e.target.value } : i
                    ))
                  }
                />

                <button onClick={() => updateItem(item)}>Uložit</button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  {item.nazev} – {item.kategorie} – {item.znacka} – {item.ks} ks – {item.cena} Kč
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setEditId(item.id)}
                    style={{
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    Smazat
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
