"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("admin_token", data.token);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f5efe6", fontFamily: "var(--font-sans, sans-serif)"
    }}>
      <div style={{
        background: "white", borderRadius: 20, padding: "3rem 2.8rem",
        width: "100%", maxWidth: 400,
        boxShadow: "0 20px 60px rgba(45,35,29,0.1)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", background: "#b07d62",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem", color: "white", fontWeight: 700, fontSize: "1.2rem"
          }}>A</div>
          <h1 style={{ fontFamily: "var(--font-serif, serif)", fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>Admin Panel</h1>
          <p style={{ color: "#6d5a4d", fontSize: "0.88rem", marginTop: "0.4rem" }}>Vision of Akash</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{
              padding: "0.85rem 1rem", border: "1.5px solid #d1c1b1", borderRadius: 10,
              fontSize: "0.95rem", outline: "none", fontFamily: "inherit"
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              padding: "0.85rem 1rem", border: "1.5px solid #d1c1b1", borderRadius: 10,
              fontSize: "0.95rem", outline: "none", fontFamily: "inherit"
            }}
          />
          {error && <p style={{ color: "#e53e3e", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.95rem", background: "#2d231d", color: "white", border: "none",
              borderRadius: 10, fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, fontFamily: "inherit"
            }}
          >{loading ? "Logging in..." : "Login"}</button>
        </form>
      </div>
    </div>
  );
}
