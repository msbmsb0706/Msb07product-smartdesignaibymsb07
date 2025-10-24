import { useState } from "react";

export default function TestGemini() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGemini = async () => {
    setLoading(true);
    setText("");
    try {
      const res = await fetch("/api/test-gemini");
      const data = await res.json();
      const t = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      setText(t || "No text returned");
    } catch (err) {
      setText("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>Gemini API Test</h2>
      <button onClick={fetchGemini} style={{
        padding: "12px 24px",
        fontSize: 16,
        borderRadius: 8,
        cursor: "pointer"
      }}>
        Get Text
      </button>
      <p style={{ marginTop: 30, fontSize: 18 }}>
        {loading ? "Loading..." : text}
      </p>
    </div>
  );
    }
