import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:4000/api";

export default function App() {
  const [page, setPage] = useState("register");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    role: "",
    studentCode: "",
    name: "",
    email: "",
    password: "",
    major: "",
    gender: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isHappy, setIsHappy] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [chatSentNote, setChatSentNote] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const [librarianData, setLibrarianData] = useState({
    totalStudents: 0,
    borrowersCount: 0,
    borrowersList: [],
    allStudents: [],
    messages: [],
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const fetchLibrarianStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/librarian/students`);
      if (res.ok) {
        const data = await res.json();
        setLibrarianData({
          totalStudents: data.totalStudents || 0,
          borrowersCount: data.borrowersCount || 0,
          borrowersList: data.borrowersList || [],
          allStudents: data.allStudents || [],
          messages: data.messages || [],
        });
      }
    } catch {
    }
  };

  useEffect(() => {
    fetchLibrarianStudents();
  }, []);

  const triggerPageTurn = (targetPage, celebrate = false) => {
    setIsFlipping(true);
    if (celebrate) setIsHappy(true);

    setTimeout(() => {
      setPage(targetPage);
    }, 450);

    setTimeout(() => {
      setIsFlipping(false);
    }, 1100);

    if (celebrate) {
      setTimeout(() => {
        setIsHappy(false);
      }, 3200);
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        major: form.role === "librarian" ? "" : form.major,
        studentCode: form.role === "student" ? form.studentCode : "",
      };
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Registration failed");

      if (data.librarianOverview) {
        setLibrarianData((prev) => ({
          ...prev,
          ...data.librarianOverview,
        }));
      }
      setMsg("Account created successfully! Please sign in.");
      triggerPageTurn("login", true);
    } catch {
      setError("Unable to connect to server on port 4000");
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Invalid credentials");

      const signedUser = data.user || {
        name: form.name || "Member",
        email: form.email,
        role: form.role || "student",
        studentCode: form.studentCode || "",
        major: form.major || "General",
        gender: form.gender || "male",
      };
      setUser(signedUser);
      if (signedUser.gender) {
        setForm((prev) => ({ ...prev, gender: signedUser.gender }));
      }
      if (signedUser.role) {
        setForm((prev) => ({ ...prev, role: signedUser.role }));
      }
      if (signedUser.role === "librarian") {
        setChatOpen(false);
        await fetchLibrarianStudents();
      }
      triggerPageTurn("profile", true);
    } catch {
      setError("Unable to connect to server on port 4000");
    } finally {
      setLoading(false);
    }
  };

  const onToggleBorrow = async (studentId) => {
    try {
      const res = await fetch(`${API_URL}/librarian/toggle-borrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.librarianOverview) {
          setLibrarianData((prev) => ({
            ...prev,
            ...data.librarianOverview,
          }));
        }
      }
    } catch {
      setError("Unable to connect to server on port 4000");
    }
  };

  const onSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    setSendingChat(true);
    setChatSentNote("");
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: user?.name || form.name || "Student",
          studentCode: user?.studentCode || form.studentCode || "",
          text: chatText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChatSentNote(data.error || "Could not send message");
      } else {
        setChatText("");
        setChatSentNote("Sent to librarian!");
        if (data.librarianOverview) {
          setLibrarianData((prev) => ({
            ...prev,
            ...data.librarianOverview,
          }));
        }
      }
    } catch {
      setChatSentNote("Unable to connect to server on port 4000");
    } finally {
      setSendingChat(false);
    }
  };

  const currentRole = user?.role || form.role;
  const isLibrarian = currentRole === "librarian";
  const isStudent = form.role === "student";
  const currentGender = user?.gender || form.gender;
  const isFemale = currentGender === "female";

  return (
    <div
      className="scene-wrapper"
      dir="ltr"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <style>{`
        .book-cover {
          background: linear-gradient(145deg, #c8a97e, #9c7a54) !important;
          border-radius: 18px !important;
          padding: 12px !important;
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.42), 0 4px 12px rgba(120, 83, 42, 0.25) !important;
          border: 1px solid rgba(254, 243, 199, 0.45) !important;
        }
        .book-pages-container {
          border-radius: 13px !important;
          overflow: hidden !important;
          background: #fdf8ef !important;
        }
        .book-spine {
          background: linear-gradient(90deg, #8a6943, #b59267, #8a6943) !important;
        }
        .page-side.page-right {
          background: linear-gradient(160deg, #fffdf9 0%, #f5ead6 100%) !important;
          color: #2b2118 !important;
        }
        .page-side.page-left {
          background: linear-gradient(160deg, #fffdf9 0%, #f8f0e1 100%) !important;
          color: #2b2118 !important;
        }
        .bookmark-ribbon {
          background: linear-gradient(180deg, #c28840, #9a6528) !important;
        }
        .page-tab-btn.active {
          background: #8c6239 !important;
          color: #fffdf9 !important;
        }
        .book-input {
          background: #ffffff !important;
          color: #1f2937 !important;
          border: 1.5px solid #d6c2a5 !important;
          border-radius: 10px !important;
        }
        .book-input:focus {
          outline: none !important;
          border-color: #8c6239 !important;
          box-shadow: 0 0 0 3px rgba(140, 98, 57, 0.16) !important;
        }
        .book-btn {
          background: linear-gradient(135deg, #8c6239, #6e4b2a) !important;
          color: #fffdf9 !important;
          border-radius: 10px !important;
          box-shadow: 0 6px 16px rgba(110, 75, 42, 0.28) !important;
        }
        .profile-card-paper {
          background: #fffdf8 !important;
          border: 1.5px solid #e2d1b5 !important;
          border-radius: 12px !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 6px 16px rgba(43, 33, 24, 0.08) !important;
        }
        .member-badge {
          background: #efe2cb !important;
          color: #6e4b2a !important;
        }
        .bottom-chat-trigger {
          margin-top: 16px;
          align-self: center;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1.5px solid #c8a97e;
          background: #fffdf8;
          color: #5c3d20;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(43, 33, 24, 0.1);
        }
        .bottom-chat-popover {
          margin-top: 10px;
          padding: 10px;
          border-radius: 12px;
          background: #fffdf8;
          border: 1.5px solid #d6c2a5;
          box-shadow: 0 8px 20px rgba(43, 33, 24, 0.14);
        }
        .librarian-inbox-box {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px dashed #d6c2a5;
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.32), rgba(15, 23, 42, 0.42)), url("/cairo-university-library.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        className="library-quote-banner"
        style={{
          position: "fixed",
          top: "18px",
          left: "24px",
          zIndex: 20,
          padding: "8px 16px",
          borderRadius: "999px",
          backgroundColor: "rgba(15, 23, 42, 0.68)",
          color: "#fef3c7",
          fontWeight: 600,
          letterSpacing: "0.02em",
          backdropFilter: "blur(4px)",
        }}
      >
        Where Every Page Opens a World
      </div>

      {isLibrarian ? (
        <aside className="librarian-standing-figure" aria-label="Librarian standing on the edge of the book">
          <div className="student-bubble">
            {isHappy ? "All set at the desk! 📚" : "Librarian ready at the edge 📖"}
          </div>

          <svg className="student-svg" viewBox="0 0 180 210">
            <ellipse cx="90" cy="198" rx="34" ry="6" fill="#0f172a" opacity="0.22" />

            {isFemale ? (
              <>
                <path
                  d="M62 46 C50 72, 49 112, 58 138 C64 141, 69 135, 67 125 C63 102, 64 74, 70 50 Z"
                  fill="#3b1808"
                />
                <path
                  d="M118 46 C130 72, 131 112, 122 138 C116 141, 111 135, 113 125 C117 102, 116 74, 110 50 Z"
                  fill="#3b1808"
                />
                <path d="M58 64 C55 90, 56 116, 61 132" fill="none" stroke="#6b2e12" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M122 64 C125 90, 124 116, 119 132" fill="none" stroke="#6b2e12" strokeWidth="2.2" strokeLinecap="round" />

                <rect x="75" y="138" width="11" height="44" rx="5" fill="#1e293b" />
                <rect x="94" y="138" width="11" height="44" rx="5" fill="#1e293b" />
                <path d="M71 180 Q78 176 86 182 L86 192 L70 192 Z" fill="#831843" />
                <path d="M94 182 Q102 176 109 180 L110 192 L94 192 Z" fill="#831843" />

                <path d="M58 142 L64 83 L116 83 L122 142 Z" fill="#9d174d" />
                <polygon points="81,83 90,115 99,83" fill="#ffffff" />
                <polygon points="78,82 87,100 81,103" fill="#be185d" />
                <polygon points="102,82 93,100 99,103" fill="#be185d" />
                <polygon points="90,89 87,96 90,104 93,96" fill="#f43f5e" />

                <path d="M62 89 L48 116 L76 122" fill="none" stroke="#9d174d" strokeWidth="10.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M118 89 L130 114 L104 122" fill="none" stroke="#9d174d" strokeWidth="10.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="78" cy="122" r="5.8" fill="#fed7aa" />
                <circle cx="102" cy="122" r="5.8" fill="#fed7aa" />

                <rect x="72" y="108" width="36" height="24" rx="3" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
                <line x1="90" y1="108" x2="90" y2="132" stroke="#78350f" strokeWidth="1.8" />

                <rect x="83" y="67" width="14" height="17" rx="7" fill="#fed7aa" />
                <circle cx="90" cy="47" r="23" fill="#fed7aa" />
                <path
                  d="M66 46 C65 18, 115 18, 114 46 C106 33, 96 35, 90 40 C84 35, 74 33, 66 46 Z"
                  fill="#3b1808"
                />
                <circle cx="72" cy="60" r="3" fill="#fda4af" opacity="0.6" />
                <circle cx="108" cy="60" r="3" fill="#fda4af" opacity="0.6" />
              </>
            ) : (
              <>
                <rect x="74" y="138" width="12" height="44" rx="5" fill="#1e293b" />
                <rect x="94" y="138" width="12" height="44" rx="5" fill="#1e293b" />

                <path d="M70 180 Q78 176 87 182 L87 192 L69 192 Z" fill="#0f172a" />
                <path d="M93 182 Q102 176 110 180 L111 192 L93 192 Z" fill="#0f172a" />

                <path d="M56 142 L62 82 L118 82 L124 142 Z" fill="#1e3a8a" />
                <polygon points="81,82 90,118 99,82" fill="#ffffff" />
                <polygon points="78,81 87,102 81,105" fill="#172554" />
                <polygon points="102,81 93,102 99,105" fill="#172554" />
                <polygon points="90,88 86,96 90,116 94,96" fill="#dc2626" />

                <path d="M60 88 L46 116 L76 122" fill="none" stroke="#1e3a8a" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M120 88 L132 114 L104 122" fill="none" stroke="#1e3a8a" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="78" cy="122" r="6" fill="#fed7aa" />
                <circle cx="102" cy="122" r="6" fill="#fed7aa" />

                <rect x="72" y="108" width="36" height="24" rx="3" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
                <line x1="90" y1="108" x2="90" y2="132" stroke="#78350f" strokeWidth="1.8" />

                <rect x="82" y="66" width="16" height="18" rx="7" fill="#fed7aa" />
                <circle cx="90" cy="46" r="24" fill="#fed7aa" />
                <path
                  d="M65 44 C64 17, 116 17, 115 44 C109 31, 71 31, 65 44 Z"
                  fill="#0f172a"
                />
              </>
            )}

            <circle cx="80" cy="46" r="6.5" fill="#ffffff" stroke="#334155" strokeWidth="2" />
            <circle cx="100" cy="46" r="6.5" fill="#ffffff" stroke="#334155" strokeWidth="2" />
            <line x1="86.5" y1="46" x2="93.5" y2="46" stroke="#334155" strokeWidth="2" />
            <circle cx="80" cy="46" r="2.6" fill="#0f172a" />
            <circle cx="100" cy="46" r="2.6" fill="#0f172a" />
            <path d="M83 57 Q90 63 97 57" fill="none" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </aside>
      ) : (
        <div className={`student-stage ${isHappy ? "celebrating" : ""}`}>
          <div className="student-bubble">
            {isHappy
              ? "Awesome! Page turned ✨📖"
              : page === "register"
              ? "Pick your role & fill your details!"
              : page === "login"
              ? "Sign in to view your card"
              : `Welcome, ${user?.name || "Member"}!`}
          </div>

          <svg className="student-svg" viewBox="0 0 180 150">
            {isFemale ? (
              <>
                <path
                  d="M55 52 C44 74, 43 106, 52 128 C58 131, 63 126, 61 118 C57 98, 58 74, 64 56 Z"
                  fill="#3b1808"
                />
                <path
                  d="M125 52 C136 74, 137 106, 128 128 C122 131, 117 126, 119 118 C123 98, 122 74, 116 56 Z"
                  fill="#3b1808"
                />
                <path d="M51 66 C48 88, 49 108, 54 122" fill="none" stroke="#6b2e12" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M129 66 C132 88, 131 108, 126 122" fill="none" stroke="#6b2e12" strokeWidth="2.4" strokeLinecap="round" />

                <path d="M46 135 C46 100, 134 100, 134 135 Z" fill="#9d174d" />
                <path d="M77 102 L90 124 L103 102 Z" fill="#ffffff" />
                <polygon points="75,101 86,120 79,123" fill="#be185d" />
                <polygon points="105,101 94,120 101,123" fill="#be185d" />
                <polygon points="90,108 87,115 90,122 93,115" fill="#f43f5e" />

                <rect x="82" y="84" width="16" height="20" rx="8" fill="#fed7aa" />
                <circle cx="90" cy="60" r="29" fill="#fed7aa" />

                <path
                  d="M59 54 C58 24, 122 24, 121 54 C112 39, 98 41, 90 47 C82 41, 68 39, 59 54 Z"
                  fill="#3b1808"
                />
                <path d="M68 35 Q90 27 112 35" fill="none" stroke="#6b2e12" strokeWidth="2.6" strokeLinecap="round" />

                <g transform="translate(118, 32) rotate(18)">
                  <polygon points="0,0 -11,-7 -11,7" fill="#f43f5e" />
                  <polygon points="0,0 11,-7 11,7" fill="#f43f5e" />
                  <circle cx="0" cy="0" r="3.5" fill="#ffe4e6" />
                </g>
                <line x1="68" y1="53" x2="65" y2="50" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="112" y1="53" x2="115" y2="50" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M44 135 C44 99, 136 99, 136 135 Z" fill="#1e293b" />
                <path d="M77 101 L90 125 L103 101 Z" fill="#ffffff" />
                <polygon points="75,100 86,120 78,124" fill="#0f172a" />
                <polygon points="105,100 94,120 102,124" fill="#0f172a" />
                <polygon points="90,107 86,113 90,126 94,113" fill="#dc2626" />

                <rect x="81" y="84" width="18" height="22" rx="8" fill="#fed7aa" />
                <circle cx="90" cy="60" r="32" fill="#fed7aa" />

                <path
                  d="M57 57 C55 21, 125 21, 123 57 C118 42, 114 38, 108 42 C98 35, 82 35, 72 42 C66 38, 62 42, 57 57 Z"
                  fill="#0f172a"
                />
                <path d="M67 34 Q90 23 113 34" fill="none" stroke="#334155" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M63 45 Q72 38 82 43" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                <path d="M98 43 Q108 38 117 45" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
              </>
            )}

            <circle cx="77" cy="58" r="9" fill="#ffffff" stroke="#334155" strokeWidth="2.5" />
            <circle cx="103" cy="58" r="9" fill="#ffffff" stroke="#334155" strokeWidth="2.5" />
            <line x1="86" y1="58" x2="94" y2="58" stroke="#334155" strokeWidth="2.5" />

            {isHappy ? (
              <>
                <path d="M73 59 Q77 53 81 59" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M99 59 Q103 53 107 59" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="68" cy="68" r="4" fill="#fb7185" opacity="0.7" />
                <circle cx="112" cy="68" r="4" fill="#fb7185" opacity="0.7" />
                <path d="M78 72 Q90 86 102 72 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
              </>
            ) : (
              <>
                <circle cx="77" cy="58" r="3.2" fill="#0f172a" />
                <circle cx="103" cy="58" r="3.2" fill="#0f172a" />
                {isFemale && <circle cx="69" cy="67" r="3.2" fill="#fda4af" opacity="0.55" />}
                {isFemale && <circle cx="111" cy="67" r="3.2" fill="#fda4af" opacity="0.55" />}
                <path d="M82 73 Q90 79 98 73" fill="none" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}

            <g transform={isFlipping ? "translate(0, -6) rotate(-3 90 120)" : "translate(0, 0)"}>
              <polygon points="48,112 90,120 90,145 48,137" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
              <polygon points="132,112 90,120 90,145 132,137" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
              <polygon points="53,115 90,122 90,141 53,134" fill="#fffbeb" />
              <polygon points="127,115 90,122 90,141 127,134" fill="#fef3c7" />
            </g>

            <circle cx="50" cy="126" r="7" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
            <circle cx="130" cy="126" r="7" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      <div className="book-cover" style={{ position: "relative", zIndex: 5 }}>
        <div className="book-pages-container">
          <div className="book-spine"></div>
          <div className={`flipping-sheet ${isFlipping ? "flip-active" : ""}`}></div>

          <section className="page-side page-right">
            <div className="bookmark-ribbon"></div>
            <div className="library-emblem">📖</div>
            <h1>Smart Library</h1>

            <div className="page-tabs">
              <button
                type="button"
                className={`page-tab-btn ${page === "register" ? "active" : ""}`}
                onClick={() => { setError(""); setMsg(""); triggerPageTurn("register"); }}
              >
                Register
              </button>
              <button
                type="button"
                className={`page-tab-btn ${page === "login" ? "active" : ""}`}
                onClick={() => { setError(""); setMsg(""); triggerPageTurn("login"); }}
              >
                Login
              </button>
              {user && (
                <button
                  type="button"
                  className={`page-tab-btn ${page === "profile" ? "active" : ""}`}
                  onClick={() => { setError(""); setMsg(""); triggerPageTurn("profile"); }}
                >
                  Profile
                </button>
              )}
            </div>

            {!isLibrarian && (
              <>
                <button
                  type="button"
                  className="bottom-chat-trigger"
                  aria-label="Message librarian"
                  onClick={() => {
                    setChatSentNote("");
                    setChatOpen((prev) => !prev);
                  }}
                >
                  <span>💬</span>
                  <span>Ask Librarian</span>
                </button>

                {chatOpen && (
                  <form onSubmit={onSendChatMessage} className="bottom-chat-popover">
                    <input
                      className="book-input"
                      placeholder="Write a message to librarian..."
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="book-btn"
                      style={{ marginTop: "8px", width: "100%" }}
                      disabled={sendingChat}
                    >
                      {sendingChat ? "Sending..." : "Send"}
                    </button>
                    {chatSentNote && (
                      <div style={{ marginTop: "6px", fontSize: "12px", fontWeight: 600 }}>
                        {chatSentNote}
                      </div>
                    )}
                  </form>
                )}
              </>
            )}
          </section>

          <section className="page-side page-left">
            {error && <div className="book-alert book-error">{error}</div>}
            {msg && <div className="book-alert book-success">{msg}</div>}

            {page === "register" && (
              <>
                <h2>✍️ Register</h2>
                <form onSubmit={onRegister} className="book-form">
                  <select className="book-input" name="role" value={form.role} onChange={onChange} required>
                    <option value="" disabled>Select Role (Student / Librarian)</option>
                    <option value="student">Student</option>
                    <option value="librarian">Librarian</option>
                  </select>
                  {isStudent && (
                    <input
                      className="book-input"
                      name="studentCode"
                      placeholder="Student Code / ID"
                      value={form.studentCode}
                      onChange={onChange}
                      required
                    />
                  )}
                  <input className="book-input" name="name" placeholder="Full Name" value={form.name} onChange={onChange} required />
                  <input className="book-input" name="email" type="email" placeholder="Email Address" value={form.email} onChange={onChange} required />
                  <input className="book-input" name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
                  {form.role !== "librarian" && (
                    <input className="book-input" name="major" placeholder="Major / Department" value={form.major} onChange={onChange} />
                  )}
                  <select className="book-input" name="gender" value={form.gender} onChange={onChange} required>
                    <option value="" disabled>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <button type="submit" className="book-btn" disabled={loading}>
                    {loading ? "Saving..." : "Register"}
                  </button>
                </form>
              </>
            )}

            {page === "login" && (
              <>
                <h2>🔑 Login</h2>
                <form onSubmit={onLogin} className="book-form">
                  <input className="book-input" name="email" type="email" placeholder="Email Address" value={form.email} onChange={onChange} required />
                  <input className="book-input" name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
                  <button type="submit" className="book-btn" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                  </button>
                </form>
              </>
            )}

            {page === "profile" && user && (
              <>
                <h2>🎓 Profile</h2>
                <div className="profile-card-paper">
                  <span className="member-badge">
                    ID: #{user.id || "SL-101"} • {(user.role || form.role || "student").toUpperCase()}
                  </span>
                  <p><span>Name</span><strong>{user.name}</strong></p>
                  <p><span>Email</span><strong>{user.email}</strong></p>
                  {!isLibrarian && (user.studentCode || form.studentCode) && (
                    <p><span>Student Code</span><strong>{user.studentCode || form.studentCode}</strong></p>
                  )}
                  <p><span>Gender</span><strong>{currentGender === "female" ? "Female" : "Male"}</strong></p>
                  {!isLibrarian && (
                    <p><span>Major</span><strong>{user.major || "General"}</strong></p>
                  )}

                  {isLibrarian && (
                    <div className="librarian-students-box">
                      <p>
                        <span>Students with Books</span>
                        <strong>{librarianData.borrowersCount}</strong>
                      </p>

                      <div>
                        <strong>Borrowers (Code &amp; Name):</strong>
                        {librarianData.borrowersList.length === 0 ? (
                          <p><span>None yet</span><strong>0</strong></p>
                        ) : (
                          librarianData.borrowersList.map((b) => (
                            <p key={b.id}>
                              <span>{b.studentCode}</span>
                              <strong>{b.name}</strong>
                            </p>
                          ))
                        )}
                      </div>

                      {librarianData.allStudents.length > 0 && (
                        <div>
                          <strong>Registered Students:</strong>
                          {librarianData.allStudents.map((st) => (
                            <p key={st.id}>
                              <span>{st.studentCode} — {st.name}</span>
                              <button
                                type="button"
                                className="page-tab-btn"
                                onClick={() => onToggleBorrow(st.id)}
                              >
                                {st.borrowedBooks > 0 ? "Return Book" : "Borrow Book"}
                              </button>
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="librarian-inbox-box">
                        <strong>Messages:</strong>
                        {(librarianData.messages || []).length === 0 ? (
                          <p><span>No messages yet</span><strong>0</strong></p>
                        ) : (
                          (librarianData.messages || []).map((m) => (
                            <p key={m.id}>
                              <span>
                                {m.senderName}
                                {m.studentCode ? ` (${m.studentCode})` : ""}: {m.text}
                              </span>
                              <strong>{m.createdAt}</strong>
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="exit-btn"
                  onClick={() => {
                    setUser(null);
                    setMsg("");
                    triggerPageTurn("login");
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
