import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabase = createClient(
  "https://jqddbwciekvfppfdpivk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZGRid2NpZWt2ZnBwZmRwaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjQyNTQsImV4cCI6MjA5MDQwMDI1NH0.lDdHLZ3WEl9N-K_tcS-UF8TFXwItPQSr83YB_Kk_cRo"
);

export default function App() {
  const [items, setItems] = useState([]);

  // načtení dat ze Supabase
  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from("sklad")
        .select("*");

      if (error) {
        console.error("Chyba:", error);
      } else {
        setItems(data);
      }
    }

    loadData();
  }, []);

  return (
    <div>
      <h1>Sklad Trafika</h1>

      {items.length === 0 ? (
        <p>Žádná data</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.nazev} - {item.kategorie} - {item.znacka} - {item.ks} ks - {item.cena} Kč
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
