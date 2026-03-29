import { useState, useEffect } from "react";

export default function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("sklad");
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("kategorie");
    return saved ? JSON.parse(saved) : ["Tabák"];
  });

  const [brands, setBrands] = useState(() => {
    const saved = localStorage.getItem("znacky");
    return saved ? JSON.parse(saved) : ["Veev"];
  });

  const [newCategory, setNewCategory] = useState("");
  const [newBrand, setNewBrand] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [brand, setBrand] = useState(brands[0]);
  const [price, setPrice] = useState(0);
  const [search, setSearch] = useState("");

  // ✏️ EDITACE
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem("sklad", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("kategorie", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("znacky", JSON.stringify(brands));
  }, [brands]);

  const addItem = () => {
    if (!name) return;
    setItems([...items, { name, category, brand, qty: 0, min: 3, price }]);
    setName("");
    setPrice(0);
  };

  const updateQty = (index, change) => {
    const updated = [...items];
    updated[index].qty += change;
    if (updated[index].qty < 0) updated[index].qty = 0;
    setItems(updated);
  };

  const deleteItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // ✏️ SPUSTIT EDITACI
  const startEdit = (index) => {
    const item = items[index];
    setName(item.name);
    setCategory(item.category);
    setBrand(item.brand);
    setPrice(item.price);
    setEditingIndex(index);
  };

  // 💾 ULOŽIT EDITACI
  const saveEdit = () => {
    const updated = [...items];
    updated[editingIndex] = {
      ...updated[editingIndex],
      name,
      category,
      brand,
      price,
    };
    setItems(updated);
    setEditingIndex(null);
    setName("");
    setPrice(0);
  };

  // ❌ ZRUŠIT EDIT
  const cancelEdit = () => {
    setEditingIndex(null);
    setName("");
    setPrice(0);
  };

  const addCategory = () => {
    if (!newCategory) return;
    if (categories.includes(newCategory)) return;
    setCategories([...categories, newCategory]);
    setNewCategory("");
  };

  const deleteCategory = (cat) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const addBrand = () => {
    if (!newBrand) return;
    if (brands.includes(newBrand)) return;
    setBrands([...brands, newBrand]);
    setNewBrand("");
  };

  const deleteBrand = (b) => {
    setBrands(brands.filter((x) => x !== b));
  };

  const totalValue = items.reduce((sum, i) => sum + i.qty * (i.price || 0), 0);
  const lowStock = items.filter((i) => i.qty <= i.min);

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "auto" }}>
      <h2>Sklad Trafika</h2>

      <div>
        💰 Hodnota skladu: <b>{totalValue} Kč</b><br />
        📉 Dochází: <b>{lowStock.length}</b>
      </div>

      <input
        placeholder="Hledat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <hr />

      {/* FORM */}
      <input
        placeholder="Název zboží"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <select value={brand} onChange={(e) => setBrand(e.target.value)}>
        {brands.map((b) => (
          <option key={b}>{b}</option>
        ))}
      </select>

      <input
        placeholder="Cena"
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
      />

      {editingIndex === null ? (
        <button onClick={addItem}>Přidat</button>
      ) : (
        <>
          <button onClick={saveEdit}>💾 Uložit</button>
          <button onClick={cancelEdit}>❌ Zrušit</button>
        </>
      )}

      <hr />

      {/* KATEGORIE */}
      <h4>Kategorie</h4>
      <input
        placeholder="Nová kategorie"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
      />
      <button onClick={addCategory}>Přidat</button>

      {categories.map((c) => (
        <div key={c}>
          {c} <button onClick={() => deleteCategory(c)}>❌</button>
        </div>
      ))}

      <hr />

      {/* ZNAČKY */}
      <h4>Značky</h4>
      <input
        placeholder="Nová značka"
        value={newBrand}
        onChange={(e) => setNewBrand(e.target.value)}
      />
      <button onClick={addBrand}>Přidat</button>

      {brands.map((b) => (
        <div key={b}>
          {b} <button onClick={() => deleteBrand(b)}>❌</button>
        </div>
      ))}

      <hr />

      {/* SEZNAM */}
      {filtered.map((item, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <b>{item.name}</b><br />
          {item.category} | {item.brand}<br />
          {item.qty} ks | {item.price} Kč<br />

          {item.qty <= item.min && (
            <span style={{ color: "red" }}>⚠ Dochází</span>
          )}

          <br />

          <button onClick={() => updateQty(i, 1)}>+1</button>
          <button onClick={() => updateQty(i, -1)}>-1</button>
          <button onClick={() => startEdit(i)}>✏️ Upravit</button>
          <button onClick={() => deleteItem(i)}>Smazat</button>
        </div>
      ))}
    </div>
  );
}