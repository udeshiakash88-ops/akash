"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Project { _id?: string; title: string; category: string; image: string; link: string; stats: { likes: string; views: string }; order: number; }
interface Education { _id?: string; degree: string; short: string; year: string; status?: string; statusType: 'done' | 'current' | 'future'; icon: string; schoolName: string; schoolShort: string; location: string; order: number; }
interface Gear { _id?: string; name: string; subtitle: string; description: string; icon: string; tags: string[]; order: number; }
interface Feedback { _id?: string; name: string; role: string; brand: string; text: string; avatar: string; metric: string; order: number; }
interface Skill { _id?: string; categoryTitle: string; icon: string; skills: string[]; order: number; }
interface Settings { _id?: string; heroTitle: string; heroSubTitle: string; heroDescription: string; heroImage: string; stats: { label: string; value: string }[]; socials: { platform: string; url: string }[]; contactEmail: string; contactPhone: string; contactAddress: string; aboutImage: string; languages: string; heroBadgeText: string; heroBadgeShow: boolean; }

const emptyProject: Project = { title: "", category: "", image: "", link: "", stats: { likes: "", views: "" }, order: 0 };
const emptyEducation: Education = { degree: "", short: "", year: "", status: "", statusType: "done", icon: "graduation", schoolName: "", schoolShort: "", location: "", order: 0 };
const emptyGear: Gear = { name: "", subtitle: "", description: "", icon: "iphone", tags: [], order: 0 };
const emptyFeedback: Feedback = { name: "", role: "", brand: "", text: "", avatar: "", metric: "", order: 0 };
const emptySkill: Skill = { categoryTitle: "", icon: "strategy", skills: [], order: 0 };
const emptySettings: Settings = { heroTitle: "", heroSubTitle: "", heroDescription: "", heroImage: "", stats: [], socials: [], contactEmail: "", contactPhone: "", contactAddress: "", aboutImage: "", languages: "", heroBadgeText: "", heroBadgeShow: false };

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<"projects" | "education" | "gear" | "feedback" | "skills" | "settings">("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [gear, setGear] = useState<Gear[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>(emptyProject);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [aboutUploadLoading, setAboutUploadLoading] = useState(false);
  const [aboutUploadError, setAboutUploadError] = useState("");
  const [aboutUploadSuccess, setAboutUploadSuccess] = useState("");
  
  const [securityData, setSecurityData] = useState({ currentUsername: "", currentPassword: "", newUsername: "", newPassword: "" });
  const [securityMsg, setSecurityMsg] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);
  const [heroUploadLoading, setHeroUploadLoading] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState("");
  const [heroUploadSuccess, setHeroUploadSuccess] = useState("");

  function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  }

  function authHeaders() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    setMsg("");
    try {
      const urls = ["/api/projects", "/api/education", "/api/gear", "/api/feedback", "/api/skills", "/api/settings"];
      const responses = await Promise.all(urls.map(u => fetch(u, { headers: authHeaders() })));
      const data = await Promise.all(responses.map(r => r.json()));

      setProjects(Array.isArray(data[0]) ? data[0] : []);
      setEducation(Array.isArray(data[1]) ? data[1] : []);
      setGear(Array.isArray(data[2]) ? data[2] : []);
      setFeedback(Array.isArray(data[3]) ? data[3] : []);
      setSkills(Array.isArray(data[4]) ? data[4] : []);
      if (data[5] && !data[5].error) setSettings(data[5]);
      
    } catch (err) {
      setMsg("Connection error: Failed to reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/admin"); return; }
    fetchData();
  }, [fetchData, router]);

  // Sync settings into formData whenever settings tab is active and settings are loaded
  useEffect(() => {
    if (tab === "settings") {
      setFormData({ ...emptySettings, ...settings });
    }
  }, [tab, settings]);

  function logout() {
    localStorage.removeItem("admin_token");
    router.push("/admin");
  }

  function openAdd() {
    setEditItem(null);
    if (tab === "projects") setFormData({ ...emptyProject });
    else if (tab === "education") setFormData({ ...emptyEducation });
    else if (tab === "gear") setFormData({ ...emptyGear });
    else if (tab === "feedback") setFormData({ ...emptyFeedback });
    else if (tab === "skills") setFormData({ ...emptySkill });
    else if (tab === "settings") setFormData({ ...settings });
    setShowForm(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    setFormData({ ...item });
    setShowForm(true);
  }

  async function handleAboutImageUpload(file: File | null) {
    if (!file) return;

    setAboutUploadError("");
    setAboutUploadSuccess("");
    setAboutUploadLoading(true);

    try {
      const token = getToken();
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        setAboutUploadError(data.error || "Failed to upload image");
        return;
      }

      setFormData((prev: Settings) => ({ ...prev, aboutImage: data.url }));
      setAboutUploadSuccess("Image uploaded successfully. Save settings to apply.");
    } catch {
      setAboutUploadError("Upload failed. Please try again.");
    } finally {
      setAboutUploadLoading(false);
    }
  }

  async function handleHeroImageUpload(file: File | null) {
    if (!file) return;

    setHeroUploadError("");
    setHeroUploadSuccess("");
    setHeroUploadLoading(true);

    try {
      const token = getToken();
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        setHeroUploadError(data.error || "Failed to upload image");
        return;
      }

      setFormData((prev: Settings) => ({ ...prev, heroImage: data.url }));
      setHeroUploadSuccess("Hero image uploaded. Save settings to apply.");
    } catch {
      setHeroUploadError("Upload failed. Please try again.");
    } finally {
      setHeroUploadLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMsg("");
    const base = `/api/${tab}`;
    const id = editItem?._id;

    try {
      const res = await fetch(id ? `${base}/${id}` : base, {
        method: id ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMsg("Saved successfully!");
        setShowForm(false);
        fetchData();
      } else {
        const d = await res.json();
        setMsg(d.error || "Error saving");
      }
    } catch {
      setMsg("Error: Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    const base = `/api/${tab}`;
    await fetch(`${base}/${id}`, { method: "DELETE", headers: authHeaders() });
    fetchData();
  }

  const getItems = () => {
    if (tab === "projects") return projects;
    if (tab === "education") return education;
    if (tab === "gear") return gear;
    if (tab === "feedback") return feedback;
    if (tab === "skills") return skills;
    return [];
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, fieldName: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMsg("Uploading file...");

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: uploadData
      });

      const data = await res.json();
      if (res.ok) {
        setFormData((prev: any) => ({ ...prev, [fieldName]: data.url }));
        setMsg("File uploaded successfully!");
      } else {
        setMsg(data.error || "Upload failed");
      }
    } catch (err) {
      setMsg("Upload error: Connection failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleChangeCredentials() {
    const { currentUsername, currentPassword, newUsername, newPassword } = securityData;
    if (!currentUsername || !currentPassword || !newUsername || !newPassword) {
      setSecurityMsg("All security fields are required");
      return;
    }

    setSecurityLoading(true);
    setSecurityMsg("");

    try {
      const res = await fetch("/api/admin/change-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(securityData)
      });

      const data = await res.json();
      if (res.ok) {
        setSecurityMsg("✅ Success! Credentials updated. Please use new ones next time.");
        setSecurityData({ currentUsername: "", currentPassword: "", newUsername: "", newPassword: "" });
      } else {
        setSecurityMsg(`❌ ${data.error || "Failed to update"}`);
      }
    } catch {
      setSecurityMsg("❌ Error: Could not connect to the server.");
    } finally {
      setSecurityLoading(false);
    }
  }

  const items = getItems();

  const inputStyle: React.CSSProperties = {
    padding: "0.75rem 0.9rem", border: "1.5px solid #d1c1b1", borderRadius: 8,
    fontSize: "0.9rem", fontFamily: "inherit", width: "100%", boxSizing: "border-box",
    outline: "none", background: "#faf7f3"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5efe6", fontFamily: "var(--font-sans, sans-serif)" }}>
      {/* Navbar */}
      <header style={{
        background: "white", padding: "1rem 2rem", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        boxShadow: "0 2px 12px rgba(45,35,29,0.07)", position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#b07d62", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>A</div>
          <span style={{ fontFamily: "var(--font-serif, serif)", fontWeight: 700, fontSize: "1.1rem" }}>Admin Panel</span>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          <a href="/" target="_blank" style={{ fontSize: "0.82rem", color: "#b07d62", textDecoration: "none", fontWeight: 600 }}>← View Site</a>
          <button onClick={logout} style={{ padding: "0.5rem 1.2rem", background: "#2d231d", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", fontWeight: 700 }}>Logout</button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          {(["projects", "education", "gear", "feedback", "skills", "settings"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setShowForm(false); }} style={{
              padding: "0.6rem 1.4rem", borderRadius: 100, border: "none", cursor: "pointer",
              background: tab === t ? "#b07d62" : "white", color: tab === t ? "white" : "#2d231d",
              fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase",
              boxShadow: "0 2px 8px rgba(45,35,29,0.08)", flexShrink: 0
            }}>{t}</button>
          ))}
        </div>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-serif, serif)", fontSize: "1.5rem", textTransform: "capitalize" }}>
            {tab} <span style={{ color: "#b07d62", fontSize: "1rem" }}>{tab !== 'settings' ? `(${items.length})` : ''}</span>
          </h2>
          {tab !== 'settings' && (
            <button onClick={openAdd} style={{
              padding: "0.7rem 1.6rem", background: "#b07d62", color: "white", border: "none",
              borderRadius: 100, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", letterSpacing: "0.08em"
            }}>+ Add New</button>
          )}
        </div>

        {msg && <div style={{ padding: "0.75rem 1rem", background: msg.includes("success") ? "#d4edda" : "#f8d7da", borderRadius: 8, marginBottom: "1rem", fontSize: "0.88rem" }}>{msg}</div>}

        {/* Database Diagnostic Tool */}
        {!loading && msg.includes("Failed to fetch") && (
          <div style={{ 
            background: "#fff9f2", border: "1.5px solid #d1c1b1", borderRadius: 12, 
            padding: "1.2rem", marginBottom: "1.5rem", boxShadow: "0 4px 15px rgba(176,125,98,0.1)"
          }}>
            <h4 style={{ margin: "0 0 0.6rem", color: "#b07d62", fontSize: "1rem", fontFamily: "var(--font-serif, serif)" }}>🔍 Connection Diagnostic Tool</h4>
            <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#6d5a4d" }}>
              It looks like your database is not accessible. This is usually caused by an IP whitelisting issue in MongoDB Atlas.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
              <div style={{ background: "white", padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid #d1c1b1", fontSize: "0.85rem" }}>
                <span style={{ fontWeight: 600 }}>Your Public IP:</span> <code style={{ color: "#b07d62", fontSize: "0.95rem" }}>112.140.191.92</code>
              </div>
              <button 
                onClick={async () => {
                  setMsg("Testing connection...");
                  const res = await fetch("/api/admin/test-db");
                  const data = await res.json();
                  if (data.status === "SUCCESS") {
                    setMsg("✅ Success! Database connected. Refreshing...");
                    fetchData();
                  } else {
                    setMsg(`❌ ${data.type || "Error"}: ${data.message}`);
                  }
                }}
                style={{ 
                  padding: "0.6rem 1.2rem", background: "#b07d62", color: "white", border: "none", 
                  borderRadius: 100, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer"
                }}
              >
                Test Connection
              </button>
            </div>
            <p style={{ marginTop: "0.8rem", fontSize: "0.75rem", color: "#9c8c7d", fontStyle: "italic" }}>
              Instructions: Copy the IP above, go to <b>MongoDB Atlas &gt; Network Access</b>, and add it to your IP Access List.
            </p>
          </div>
        )}

        {/* Form — content tabs only */}
        {showForm && tab !== 'settings' && (
          <div style={{ background: "white", borderRadius: 16, padding: "1.8rem", marginBottom: "1.5rem", boxShadow: "0 8px 30px rgba(45,35,29,0.08)" }}>
            <h3 style={{ margin: "0 0 1.2rem", fontFamily: "var(--font-serif, serif)", color: "#b07d62", textTransform: "capitalize" }}>
              {editItem ? "Edit" : "Add New"} {tab}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.2rem 0.8rem" }}>
              {tab === "projects" && <>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Project Title</label>
                  <input style={inputStyle} placeholder="Enter title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Category</label>
                  <input style={inputStyle} placeholder="Wedding, Cinematic, etc." value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Instagram Reel URL</label>
                  <input style={inputStyle} placeholder="https://..." value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Thumbnail Image</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input style={inputStyle} placeholder="URL or upload →" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                    <label style={{ 
                      padding: "0 1rem", background: "#f5efe6", border: "1.5px solid #d1c1b1", 
                      borderRadius: 8, display: "flex", alignItems: "center", cursor: "pointer",
                      fontSize: "0.8rem", fontWeight: 700, color: "#b07d62", whiteSpace: "nowrap"
                    }}>
                      {uploading ? "..." : "Upload"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFileUpload(e, "image")} />
                    </label>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>No. of Likes</label>
                  <input style={inputStyle} placeholder="e.g. 15k" value={formData.stats?.likes} onChange={e => setFormData({ ...formData, stats: { ...formData.stats, likes: e.target.value } })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>No. of Views</label>
                  <input style={inputStyle} placeholder="e.g. 350k" value={formData.stats?.views} onChange={e => setFormData({ ...formData, stats: { ...formData.stats, views: e.target.value } })} />
                </div>
              </>}

              {tab === "education" && <>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Degree Name</label>
                  <input style={inputStyle} placeholder="e.g. Master of Commerce" value={formData.degree} onChange={e => setFormData({ ...formData, degree: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Degree Short Code</label>
                  <input style={inputStyle} placeholder="e.g. M.Com" value={formData.short} onChange={e => setFormData({ ...formData, short: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>School/University Name</label>
                  <input style={inputStyle} placeholder="Enter full name" value={formData.schoolName} onChange={e => setFormData({ ...formData, schoolName: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>University Code</label>
                  <input style={inputStyle} placeholder="e.g. MKBU" value={formData.schoolShort} onChange={e => setFormData({ ...formData, schoolShort: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Location</label>
                  <input style={inputStyle} placeholder="City, State" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Year Group</label>
                  <input style={inputStyle} placeholder="e.g. 2021 - 2023" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                </div>
              </>}
              {tab === "gear" && <>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Gear Name</label>
                  <input style={inputStyle} placeholder="e.g. iPhone 15 Pro Max" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Role/Subtitle</label>
                  <input style={inputStyle} placeholder="e.g. Main Capture Device" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Icon Selection</label>
                  <input style={inputStyle} placeholder="iphone | gimbal | drone | camera | laptop" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Tags (comma skip)</label>
                  <input style={inputStyle} placeholder="e.g. 4K, Pro Res, HDR" value={formData.tags?.join(', ')} onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map((s: string) => s.trim()) })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Short Description</label>
                  <textarea style={{ ...inputStyle, width: '100%' }} rows={2} placeholder="Explain why you use this..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </>}
              {tab === "feedback" && <>
                <input style={inputStyle} placeholder="Client Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <input style={inputStyle} placeholder="Role" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                <input style={inputStyle} placeholder="Brand Name" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                <input style={inputStyle} placeholder="Metric (e.g. +40% growth)" value={formData.metric} onChange={e => setFormData({ ...formData, metric: e.target.value })} />
                <textarea style={{ ...inputStyle, gridColumn: "1 / -1" }} placeholder="Feedback Text" value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} />
              </>}
              {tab === "skills" && <>
                <div style={{ display: "flex", flexDirection: "column", gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Skill Category Title</label>
                  <input style={inputStyle} placeholder="e.g. Post Production" value={formData.categoryTitle} onChange={e => setFormData({ ...formData, categoryTitle: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Category Icon</label>
                  <input style={inputStyle} placeholder="strategy | production | creative" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Skills List (comma skip)</label>
                  <input style={inputStyle} placeholder="e.g. Davinci, Premiere, FCP" value={formData.skills?.join(', ')} onChange={e => setFormData({ ...formData, skills: e.target.value.split(',').map((s: string) => s.trim()) })} />
                </div>
              </>}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>Display Order (Position)</label>
                <input style={inputStyle} type="number" placeholder="e.g. 1" value={formData.order} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", marginTop: "1.5rem" }}>
              <button onClick={handleSave} disabled={saving} style={{ padding: "0.8rem 2.5rem", background: "#2d231d", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>{saving ? "Saving..." : "Save Now"}</button>
              <button onClick={() => setShowForm(false)} style={{ padding: "0.8rem 1.8rem", background: "transparent", border: "1.5px solid #d1c1b1", borderRadius: 10, cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Settings Panel — always visible on settings tab */}
        {tab === 'settings' && (
          <div style={{ background: "white", borderRadius: 16, padding: "1.8rem", marginBottom: "1.5rem", boxShadow: "0 8px 30px rgba(45,35,29,0.08)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>

              {/* Hero Section */}
              <div>
                <h4 style={{ margin: "0 0 1rem", color: "#b07d62", fontFamily: "var(--font-serif, serif)", fontSize: "1rem", borderBottom: "1px solid #ede0d4", paddingBottom: "0.5rem" }}>🎯 Hero Section</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0.8rem" }}>
                  <input style={inputStyle} placeholder="Hero Title (e.g. Vision of Akash)" value={formData.heroTitle || ''} onChange={e => setFormData({ ...formData, heroTitle: e.target.value })} />
                  <input style={inputStyle} placeholder="Hero Subtitle (e.g. Creative Director)" value={formData.heroSubTitle || ''} onChange={e => setFormData({ ...formData, heroSubTitle: e.target.value })} />
                  <textarea style={{ ...inputStyle, gridColumn: "1 / -1" }} rows={2} placeholder="Hero Description" value={formData.heroDescription || ''} onChange={e => setFormData({ ...formData, heroDescription: e.target.value })} />
                  <input style={{ ...inputStyle, gridColumn: "1 / -1" }} placeholder="Hero Image URL" value={formData.heroImage || ''} onChange={e => setFormData({ ...formData, heroImage: e.target.value })} />

                  <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleHeroImageUpload(e.target.files?.[0] || null)}
                      style={{ fontSize: "0.82rem", color: "#6d5a4d" }}
                    />
                    {heroUploadLoading && <span style={{ fontSize: "0.82rem", color: "#b07d62", fontWeight: 600 }}>Uploading...</span>}
                  </div>

                  {heroUploadError && <p style={{ gridColumn: "1 / -1", margin: 0, color: "#c53030", fontSize: "0.8rem", fontWeight: 600 }}>{heroUploadError}</p>}
                  {heroUploadSuccess && <p style={{ gridColumn: "1 / -1", margin: 0, color: "#2f855a", fontSize: "0.8rem", fontWeight: 600 }}>{heroUploadSuccess}</p>}

                  {formData.heroImage && (
                    <img
                      src={formData.heroImage}
                      alt="Hero preview"
                      style={{ gridColumn: "1 / -1", width: "100%", maxWidth: 320, height: 180, objectFit: "cover", borderRadius: 10, border: "1.5px solid #d1c1b1", background: "#faf7f3" }}
                    />
                  )}
                </div>
              </div>

              {/* Hero Badge */}
              <div>
                <h4 style={{ margin: "0 0 1rem", color: "#b07d62", fontFamily: "var(--font-serif, serif)", fontSize: "1rem", borderBottom: "1px solid #ede0d4", paddingBottom: "0.5rem" }}>🏷️ Hero Badge (Floating Banner)</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "0.8rem", alignItems: "center" }}>
                  <input style={inputStyle} placeholder="Badge Text (e.g. ALL GUJARAT SERVICE AVAILABLE)" value={formData.heroBadgeText || ''} onChange={e => setFormData({ ...formData, heroBadgeText: e.target.value })} />
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none", fontSize: "0.88rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                    <input type="checkbox" checked={!!formData.heroBadgeShow} onChange={e => setFormData({ ...formData, heroBadgeShow: e.target.checked })} style={{ width: 16, height: 16, cursor: "pointer" }} />
                    Show Badge
                  </label>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h4 style={{ margin: "0 0 1rem", color: "#b07d62", fontFamily: "var(--font-serif, serif)", fontSize: "1rem", borderBottom: "1px solid #ede0d4", paddingBottom: "0.5rem" }}>📊 Hero Stats</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {Array.isArray(formData.stats) && formData.stats.map((stat: { value: string; label: string }, i: number) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.6rem", alignItems: "center", borderBottom: "1px solid #f0f0f0", paddingBottom: "0.8rem" }}>
                      <input style={inputStyle} placeholder="Value (e.g. 5+)" value={stat.value} onChange={e => { const s = [...formData.stats]; s[i] = { ...s[i], value: e.target.value }; setFormData({ ...formData, stats: s }); }} />
                      <input style={inputStyle} placeholder="Label (e.g. Years Experience)" value={stat.label} onChange={e => { const s = [...formData.stats]; s[i] = { ...s[i], label: e.target.value }; setFormData({ ...formData, stats: s }); }} />
                      <button onClick={() => { const s = formData.stats.filter((_: any, idx: number) => idx !== i); setFormData({ ...formData, stats: s }); }} style={{ padding: "0.55rem 0.8rem", background: "#fee2e2", border: "none", borderRadius: 6, cursor: "pointer", color: "#c53030", fontWeight: 700, fontSize: "0.85rem" }}>✕</button>
                    </div>
                  ))}
                  <button onClick={() => setFormData({ ...formData, stats: [...(Array.isArray(formData.stats) ? formData.stats : []), { value: '', label: '' }] })} style={{ padding: "0.55rem 1.2rem", background: "#f5efe6", border: "1.5px dashed #d1c1b1", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: "#b07d62", alignSelf: "flex-start" }}>+ Add Stat</button>
                </div>
              </div>

              {/* Socials */}
              <div>
                <h4 style={{ margin: "0 0 1rem", color: "#b07d62", fontFamily: "var(--font-serif, serif)", fontSize: "1rem", borderBottom: "1px solid #ede0d4", paddingBottom: "0.5rem" }}>🔗 Social Links</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {Array.isArray(formData.socials) && formData.socials.map((social: { platform: string; url: string }, i: number) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.6rem", alignItems: "center", borderBottom: "1px solid #f0f0f0", paddingBottom: "0.8rem" }}>
                      <input style={inputStyle} placeholder="Platform (e.g. Instagram)" value={social.platform} onChange={e => { const s = [...formData.socials]; s[i] = { ...s[i], platform: e.target.value }; setFormData({ ...formData, socials: s }); }} />
                      <input style={inputStyle} placeholder="URL" value={social.url} onChange={e => { const s = [...formData.socials]; s[i] = { ...s[i], url: e.target.value }; setFormData({ ...formData, socials: s }); }} />
                      <button onClick={() => { const s = formData.socials.filter((_: any, idx: number) => idx !== i); setFormData({ ...formData, socials: s }); }} style={{ padding: "0.55rem 0.8rem", background: "#fee2e2", border: "none", borderRadius: 6, cursor: "pointer", color: "#c53030", fontWeight: 700, fontSize: "0.85rem" }}>✕</button>
                    </div>
                  ))}
                  <button onClick={() => setFormData({ ...formData, socials: [...(Array.isArray(formData.socials) ? formData.socials : []), { platform: '', url: '' }] })} style={{ padding: "0.55rem 1.2rem", background: "#f5efe6", border: "1.5px dashed #d1c1b1", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: "#b07d62", alignSelf: "flex-start" }}>+ Add Social</button>
                </div>
              </div>

              {/* About Image */}
              <div>
                <h4 style={{ margin: "0 0 1rem", color: "#b07d62", fontFamily: "var(--font-serif, serif)", fontSize: "1rem", borderBottom: "1px solid #ede0d4", paddingBottom: "0.5rem" }}>🖼️ About Section</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                  <input style={inputStyle} placeholder="Profile Image URL (About section)" value={formData.aboutImage || ''} onChange={e => setFormData({ ...formData, aboutImage: e.target.value })} />

                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleAboutImageUpload(e.target.files?.[0] || null)}
                      style={{ fontSize: "0.82rem", color: "#6d5a4d" }}
                    />
                    {aboutUploadLoading && <span style={{ fontSize: "0.82rem", color: "#b07d62", fontWeight: 600 }}>Uploading...</span>}
                  </div>

                  {aboutUploadError && <p style={{ margin: 0, color: "#c53030", fontSize: "0.8rem", fontWeight: 600 }}>{aboutUploadError}</p>}
                  {aboutUploadSuccess && <p style={{ margin: 0, color: "#2f855a", fontSize: "0.8rem", fontWeight: 600 }}>{aboutUploadSuccess}</p>}

                  {formData.aboutImage && (
                    <img
                      src={formData.aboutImage}
                      alt="About preview"
                      style={{ width: "100%", maxWidth: 280, height: 180, objectFit: "cover", borderRadius: 10, border: "1.5px solid #d1c1b1", background: "#faf7f3" }}
                    />
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 style={{ margin: "0 0 1rem", color: "#b07d62", fontFamily: "var(--font-serif, serif)", fontSize: "1rem", borderBottom: "1px solid #ede0d4", paddingBottom: "0.5rem" }}>📞 Contact Info</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0.8rem" }}>
                  <input style={inputStyle} placeholder="Phone (e.g. +91 88663 37539)" value={formData.contactPhone || ''} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
                  <input style={inputStyle} placeholder="Email" value={formData.contactEmail || ''} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                  <input style={inputStyle} placeholder="Address" value={formData.contactAddress || ''} onChange={e => setFormData({ ...formData, contactAddress: e.target.value })} />
                  <input style={inputStyle} placeholder="Languages (e.g. Gujarati · Hindi · English)" value={formData.languages || ''} onChange={e => setFormData({ ...formData, languages: e.target.value })} />
                </div>
              </div>

              {/* Security Section */}
              <div style={{ background: "#faf7f3", border: "1.5px solid #d1c1b1", borderRadius: 12, padding: "1.2rem" }}>
                <h4 style={{ margin: "0 0 1rem", color: "#b07d62", fontFamily: "var(--font-serif, serif)", fontSize: "1rem", borderBottom: "1px solid #d1c1b1", paddingBottom: "0.5rem" }}>🔐 Security & Account (Change Credentials)</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.8rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6d5a4d', marginBottom: '0.4rem' }}>Current Username</label>
                    <input style={inputStyle} type="text" placeholder="Verify current user" value={securityData.currentUsername} onChange={e => setSecurityData({...securityData, currentUsername: e.target.value})} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6d5a4d', marginBottom: '0.4rem' }}>Current Password</label>
                    <input style={inputStyle} type="password" placeholder="Verify current pass" value={securityData.currentPassword} onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>New Username</label>
                    <input style={inputStyle} type="text" placeholder="Enter new user" value={securityData.newUsername} onChange={e => setSecurityData({...securityData, newUsername: e.target.value})} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b07d62', marginBottom: '0.4rem' }}>New Password</label>
                    <input style={inputStyle} type="password" placeholder="Enter new pass" value={securityData.newPassword} onChange={e => setSecurityData({...securityData, newPassword: e.target.value})} />
                  </div>
                </div>
                {securityMsg && <p style={{ fontSize: "0.85rem", fontWeight: 600, margin: "0 0 1rem", color: securityMsg.includes("Success") ? "#2f855a" : "#c53030" }}>{securityMsg}</p>}
                <button 
                  onClick={handleChangeCredentials} 
                  disabled={securityLoading} 
                  style={{ padding: "0.6rem 1.4rem", background: "#2d231d", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}
                >
                  {securityLoading ? "Updating..." : "Update Credentials"}
                </button>
              </div>

              <button onClick={handleSave} disabled={saving} style={{ padding: "0.9rem 2.5rem", background: "#2d231d", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", alignSelf: "flex-start" }}>{saving ? "Saving..." : "💾 Save All Settings"}</button>
            </div>
          </div>
        )}

        {/* List — content tabs only */}
        {tab !== 'settings' && (
        loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#b07d62" }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6d5a4d", background: "white", borderRadius: 16 }}>No items yet. Click "+ Add New" to start.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {items.map((item: any) => {
              const displayTitle = item.title || item.name || item.degree || item.categoryTitle || "Untitled";
              const displaySub = item.category || item.schoolName || item.subtitle || item.role || (item.skills ? item.skills.join(', ') : "");
              const displayImg = item.image || item.thumbnail || item.avatar;

              return (
                <div key={item._id} style={{
                  background: "white", borderRadius: 12, padding: "1rem 1.4rem",
                  display: "flex", alignItems: "center", gap: "1rem",
                  boxShadow: "0 2px 10px rgba(45,35,29,0.06)"
                }}>
                  {displayImg ? (
                    <img src={displayImg} alt="" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8, flexShrink: 0, background: "#f5efe6" }} />
                  ) : (
                    <div style={{ width: 50, height: 50, borderRadius: 8, background: "#f5efe6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                      {item.icon ? "✨" : "📄"}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayTitle}</p>
                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "#b07d62", textTransform: "uppercase", letterSpacing: "0.1em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displaySub}</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => openEdit(item)} style={{ padding: "0.45rem 1rem", border: "1.5px solid #d1c1b1", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", background: "transparent", fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDelete(item._id!)} style={{ padding: "0.45rem 1rem", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", background: "#fee2e2", color: "#c53030", fontWeight: 600 }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
        )}
      </div>
    </div>
  );
}
