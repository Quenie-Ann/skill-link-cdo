import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { localAuth } from "../../services/auth";

// Minimal icon set (inline SVG paths)
const ICONS = {
  lock:     "M12 17v-2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11-3a3 3 0 100 6 3 3 0 000-6z",
  eyeOff:   "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
  help:     "M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z",
  mail:     "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5L4 6",
  bell:     "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9m-4.27 13a2 2 0 01-3.46 0",
  device:   "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
  monitor:  "M8 21h8m-4-4v4M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z",
  trash:    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18",
  check:    "M5 13l4 4L19 7",
  x:        "M18 6L6 18M6 6l12 12",
  chevronR: "M9 18l6-6-6-6",
  chevronD: "M6 9l6 6 6-6",
  logout:   "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  map:      "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  clock:    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  warn:     "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  info:     "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  file:     "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  send:     "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
};

function Ico({ name, size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round"
      className={`flex-shrink-0 ${className}`}>
      <path d={ICONS[name]} />
    </svg>
  );
}

// Reusable atoms ─────
function Pill({ label, variant = "primary" }) {
  const styles = {
    primary: "bg-skill-light text-skill-dark dark:bg-skill-dark/20 dark:text-skill-primary",
    danger: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
  };
  return (
    <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded font-mono ${styles[variant]}`}>
      {label}
    </span>
  );
}

function Toggle({ on, onChange, disabled }) {
  return (
    <button
      role="switch" aria-checked={on} disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className={`w-10 height-5.5 h-[22px] rounded-full relative transition-colors duration-200 p-0 flex-shrink-0 border-none ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${on ? "bg-skill-primary" : "bg-slate-300 dark:bg-slate-700"}`}>
      <span className={`absolute top-[3px] w-4 height-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm block ${
        on ? "left-[21px]" : "left-[3px]"
      }`} />
    </button>
  );
}

function Btn({ label, onClick, variant = "primary", icon, loading, full, small, disabled }) {
  const styles = {
    primary: "bg-skill-primary text-white hover:bg-skill-primary/90 border-none",
    ghost:   "bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger:  "bg-red-600 text-white hover:bg-red-700 border-none",
    teal:    "bg-emerald-600 text-white hover:bg-emerald-700 border-none",
  };
  return (
    <button
      onClick={onClick} disabled={loading || disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold transition-all rounded-lg ${
        small ? "py-1.5 px-3.5 text-xs" : "py-2.5 px-5 text-sm"
      } ${full ? "w-full" : "w-auto"} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${styles[variant]}`}>
      {loading ? <SpinRing size={14} /> : icon && <Ico name={icon} size={14} />}
      {label}
    </button>
  );
}

function SpinRing({ size = 16 }) {
  return (
    <span style={{ width: size, height: size }} className="border-2 border-current border-t-transparent rounded-full inline-block flex-shrink-0 animate-spin" />
  );
}

function Divider() {
  return <div className="h-[1px] bg-slate-200 dark:bg-slate-700 m-0" />;
}

function Alert({ type, children }) {
  const map = {
    error:   "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900/50 icon-warn",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 icon-check",
    info:    "bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400 border-sky-200 dark:border-sky-900/50 icon-info",
    warn:    "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 icon-warn",
  };
  const iconMap = { error: "warn", success: "check", info: "info", warn: "warn" };
  return (
    <div className={`flex items-start gap-2.5 border rounded-lg p-3 text-sm leading-relaxed ${map[type]}`}>
      <Ico name={iconMap[type]} size={15} className="mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, hint }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div className="mb-3.5">
      {label && (
        <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5 font-mono">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPass && !show ? "password" : "text"}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full box-sizing border-box py-2.5 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border focus:border-skill-primary focus:ring-2 focus:ring-skill-primary/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
            isPass ? "pl-3 pr-9" : "px-3"
          } border-slate-300 dark:border-slate-700`}
        />
        {isPass && (
          <button
            type="button" onClick={() => setShow(s => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-slate-400 dark:text-slate-500 p-0.5">
            <Ico name={show ? "eyeOff" : "eye"} size={15} />
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

function StrengthMeter({ password }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "text-red-500", "text-amber-500", "text-sky-500", "text-skill-primary"];
  const bgColors = ["", "bg-red-500", "bg-amber-500", "bg-sky-500", "bg-skill-primary"];
  return (
    <div className="-mt-1.5 mb-3.5">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`flex-1 h-0.5 rounded transition-colors duration-200 ${
            i <= score ? bgColors[score] : "bg-slate-200 dark:bg-slate-700"
          }`} />
        ))}
      </div>
      <span className={`text-[11px] font-mono ${colors[score]}`}>{labels[score]}</span>
    </div>
  );
}

function Row({ icon, label, sub, onClick, right, danger, first, last }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3.5 bg-white dark:bg-dark-card transition-colors duration-150 ${
        onClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" : "cursor-default"
      } ${first ? "rounded-t-xl" : ""} ${last ? "rounded-b-xl" : ""}`}>
      <div className={`w-[34px] h-[34px] rounded-lg flex-shrink-0 flex items-center justify-center ${
        danger ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400" : "bg-skill-light dark:bg-slate-800 text-skill-dark dark:text-skill-primary"
      }`}>
        <Ico name={icon} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${danger ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-slate-100"}`}>{label}</div>
        {sub && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">{sub}</div>}
      </div>
      {right !== undefined ? right : onClick && (
        <Ico name="chevronR" size={14} className="text-slate-400 dark:text-slate-500" />
      )}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-1.5 pl-0.5 font-mono">
      {label}
    </div>
  );
}

function PanelHeader({ label, onBack }) {
  return (
    <div className="flex items-center gap-2.5 p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-card">
      <button onClick={onBack} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-7.5 h-7.5 w-[30px] h-[30px] cursor-pointer flex items-center justify-center flex-shrink-0 hover:bg-slate-100 dark:hover:bg-slate-700">
        <Ico name="chevronR" size={14} className="text-slate-700 dark:text-slate-300 rotate-180" />
      </button>
      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{label}</span>
    </div>
  );
}

// PANELS (ChangePasswordPanel, SessionsPanel, PrivacyPanel, FAQPanel, LoginAlertScreen)

function ChangePasswordPanel({ onBack }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [conf, setConf] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const submit = async () => {
    setResult(null);
    if (!cur) { setResult("error"); setErrMsg("Enter your current password."); return; }
    if (next.length < 8) { setResult("error"); setErrMsg("New password must be at least 8 characters."); return; }
    if (next !== conf) { setResult("error"); setErrMsg("Passwords do not match."); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    if (cur === "wrong") { setResult("error"); setErrMsg("Current password is incorrect."); return; }
    setResult("success");
  };

  return (
    <div>
      <PanelHeader label="Change password" onBack={onBack} />
      <div className="p-5 pb-7">
        {result === "success" ? (
          <div className="text-center py-5">
            <div className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-emerald-50 dark:bg-emerald-950/30 mx-auto mb-3.5 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Ico name="check" size={24} />
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">Password updated</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              All other active sessions have been signed out for your security.
            </div>
            <Btn label="Done" onClick={onBack} full />
          </div>
        ) : (
          <>
            {result === "error" && <div className="mb-3.5"><Alert type="error">{errMsg}</Alert></div>}
            <Field label="Current password" type="password" value={cur} onChange={setCur} placeholder="Enter current password" />
            <Field label="New password" type="password" value={next} onChange={setNext} placeholder="Min. 8 characters" />
            <StrengthMeter password={next} />
            <Field label="Confirm new password" type="password" value={conf} onChange={setConf} placeholder="Re-enter new password" />
            <div className="mt-1 flex gap-2.5">
              <Btn label="Cancel" onClick={onBack} variant="ghost" full />
              <Btn label="Update password" onClick={submit} loading={loading} full />
            </div>
            <p className="mt-3.5 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed text-center">
              Updating your password will sign you out of all other devices.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const MOCK_SESSIONS = [
  { id: "s1", device: "Chrome on Android",  os: "Android 13",    location: "Cagayan de Oro, PH", ip: "136.158.x.x", time: "Active now",       current: true  },
  { id: "s2", device: "Safari on iPhone",   os: "iOS 17",         location: "Cagayan de Oro, PH", ip: "136.159.x.x", time: "2 hours ago",      current: false },
  { id: "s3", device: "Chrome on Windows",  os: "Windows 11",     location: "Iligan City, PH",    ip: "202.92.x.x",  time: "Yesterday, 9:14 AM", current: false },
];

function SessionsPanel({ onBack, sessionsList = [] }) {
  const [sessions, setSessions] = useState(sessionsList);

  const handleRevoke = async (id) => {
    try {
      await localAuth.revokeSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Failed to drop remote event session entry framework: " + err.message);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Logged Devices Log</h3>
      <div className="space-y-3">
        {sessions.map(s => (
          <div key={s.id} className="p-3 border rounded-xl flex justify-between items-center dark:bg-slate-800">
            <div>
              <p className="text-xs font-bold">{s.device} {s.current && "(Current Device)"}</p>
              <p className="text-[10px] text-slate-400">{s.ip} • {s.last_active}</p>
            </div>
            {!s.current && (
              <button 
                onClick={() => handleRevoke(s.id)}
                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded"
              >
                Revoke Device
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={onBack} className="mt-4 text-xs font-bold text-skill-primary">Back to Overview</button>
    </div>
  );
}

function PrivacyPanel({ onBack }) {
  const handlePurge = async () => {
    if (window.confirm("Are you absolutely sure you want to queue your account profile for absolute deletion under RA 10173 guidelines? This process locks you out instantly.")) {
      try {
        await localAuth.executePrivacyErasure();
        alert("Your request data erasure has been processed. Logging you out.");
        localAuth.logout();
        window.location.reload();
      } catch (err) {
        alert("Privacy compliance runtime dropped error state: " + err.message);
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-bold text-slate-800 dark:text-white">RA 10173 Rights & Data Controls</h3>
      <p className="text-xs text-slate-500 leading-relaxed">
        Under the Philippine Data Privacy Act of 2012 (RA 10173), you maintain complete baseline operational authority over the storage architecture vectors of your labor registry metrics.
      </p>
      <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
        <h4 className="text-xs font-bold text-red-700 mb-1">Danger Zone Area</h4>
        <p className="text-[11px] text-red-600/80 mb-2">Once wiped, your historical skill records and verified barangay credentials will be lost permanently.</p>
        <button 
          onClick={handlePurge}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg"
        >
          Execute Complete Data Erasure
        </button>
      </div>
      <button onClick={onBack} className="text-xs font-bold text-skill-primary block">Back to Overview</button>
    </div>
  );
}
const FAQ = [
  {
    category: "Verification",
    items: [
      { q: "How long does profile verification take?", a: "The Barangay Administrator typically reviews profiles within 1–3 business days. You will receive an in-app notification and email when your status changes." },
      { q: "Why was my profile rejected?", a: "A rejection reason will be shown on your dashboard and sent to your registered email. Common reasons include incomplete documents or mismatched information. Correct the issues and resubmit." },
    ],
  },
  {
    category: "Rates & matching",
    items: [
      { q: "How does the job matching algorithm work?", a: "The system uses a machine learning engine that scores workers across four factors: skill relevance to the job description, geographic proximity to the job site, price compatibility with the resident's budget, and the worker's average rating." },
    ],
  }
];

function FAQPanel({ onBack }) {
  const [open, setOpen] = useState(null);
  const [query, setQuery] = useState("");
  const [msgTab, setMsgTab] = useState(false);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const filtered = FAQ.map(cat => ({
    ...cat,
    items: cat.items.filter(i =>
      !query || i.q.toLowerCase().includes(query.toLowerCase()) || i.a.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  const sendMsg = async () => {
    if (!msg.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  };

  return (
    <div>
      <PanelHeader label="Help & Support" onBack={onBack} />
      <div className="p-4 pb-7">
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 mb-4 gap-0.5">
          {["FAQ", "Contact support"].map(tab => (
            <button key={tab} onClick={() => setMsgTab(tab === "Contact support")} className={`flex-1 py-1.5 rounded-md border-none text-xs font-semibold cursor-pointer transition-all ${
              (tab === "Contact support") === msgTab ? "bg-white dark:bg-dark-card text-slate-900 dark:text-slate-100 shadow-sm" : "bg-transparent text-slate-400 dark:text-slate-500"
            }`}>{tab}</button>
          ))}
        </div>

        {!msgTab ? (
          <>
            <div className="relative mb-4">
              <Ico name="help" size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query} onChange={e => setQuery(e.target.value)} placeholder="Search FAQ..."
                className="w-full box-sizing border-box py-2 pl-8 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-7 text-slate-400 text-sm">No results for "{query}".</div>
            ) : (
              filtered.map((cat, ci) => (
                <div key={ci} className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full bg-skill-primary flex-shrink-0" />
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 font-mono">{cat.category}</span>
                  </div>
                  <Card>
                    {cat.items.map((item, ii) => {
                      const key = `${ci}-${ii}`;
                      const isOpen = open === key;
                      return (
                        <div key={ii}>
                          {ii > 0 && <Divider />}
                          <div onClick={() => setOpen(isOpen ? null : key)} className="p-3.5 cursor-pointer flex items-start gap-2.5">
                            <Ico name={isOpen ? "chevronD" : "chevronR"} size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-normal">{item.q}</div>
                              {isOpen && <div className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{item.a}</div>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                </div>
              ))
            )}
          </>
        ) : sent ? (
          <div className="text-center py-7 text-slate-700 dark:text-slate-300">
            <div className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-emerald-50 dark:bg-emerald-950/20 mx-auto mb-3.5 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Ico name="send" size={22} />
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">Message sent</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              The Barangay Admin support team will respond to your registered email within 2 business days.
            </div>
          </div>
        ) : (
          <>
            <p className="margin-0 mb-3.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Describe your issue. Responses are sent to your registered email address.
            </p>
            <div className="mb-3">
              <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5 font-mono">Your message</label>
              <textarea
                value={msg} onChange={e => setMsg(e.target.value)} placeholder="Describe your issue or question in detail..." rows={5}
                className="w-full box-sizing border-box p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none resize-vertical"
              />
            </div>
            <Btn label="Send message" icon="send" onClick={sendMsg} loading={sending} full disabled={!msg.trim()} />
          </>
        )}
      </div>
    </div>
  );
}

function LoginAlertScreen({ onDismiss, onSecureAccount }) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const loginEvent = {
    device:   "Chrome on Windows 11",
    location: "Iligan City, PH",
    ip:       "202.92.x.x",
    time:     new Date().toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }),
  };

  return (
    <div className={`min-h-[420px] flex flex-col items-center justify-center py-8 px-5 transition-opacity duration-200 ${dismissed ? "opacity-0" : "opacity-100"}`}>
      <div className="w-full max-w-[400px] bg-white dark:bg-dark-card rounded-2xl border border-amber-500/30 shadow-md overflow-hidden">
        <div className="bg-amber-50 dark:bg-amber-950/20 p-3.5 px-4 flex items-center gap-2.5 border-b border-amber-500/15">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
            <Ico name="bell" size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-amber-700 dark:text-amber-400">New sign-in detected</div>
            <div className="text-[11px] text-amber-600/70 dark:text-amber-500/50 font-mono">Skill-Link CDO Security Alert</div>
          </div>
        </div>

        <div className="p-4">
          <p className="margin-0 mb-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Your account was just signed into from a new device. If this was you, no action is needed. If you don't recognise this, secure your account immediately.
          </p>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden mb-4">
            {[
              { icon: "device",  label: "Device",   value: loginEvent.device },
              { icon: "map",     label: "Location", value: loginEvent.location },
              { icon: "info",    label: "IP address", value: loginEvent.ip },
              { icon: "clock",   label: "Time",     value: loginEvent.time },
            ].map((row, i, arr) => (
              <div key={i} className={`flex items-center gap-2.5 p-2.5 px-3 ${i < arr.length - 1 ? "border-b border-slate-200 dark:border-slate-800" : ""}`}>
                <Ico name={row.icon} size={13} className="text-slate-400 flex-shrink-0" />
                <span className="text-[11px] text-slate-400 w-16 flex-shrink-0 font-mono">{row.label}</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Btn label="Secure my account" icon="shield" onClick={async () => { setLoading(true); await new Promise(r => setTimeout(r, 1000)); setLoading(false); onSecureAccount(); }} loading={loading} variant="danger" full />
            <Btn label="This was me — dismiss" onClick={() => { setDismissed(true); setTimeout(onDismiss, 300); }} variant="ghost" full />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsHome({ setPanel, user }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <div className="px-5 py-4 pb-8">
      {/* Profile and Theme Control card */}
      <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-slate-700/80 mb-5">
        <div className="w-11 h-11 rounded-full bg-skill-dark dark:bg-skill-primary flex items-center justify-center text-base font-bold text-white dark:text-dark-bg tracking-tight flex-shrink-0">
          {user.name.split(" ").map(n => n[0]).join("").slice(0,2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.name}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{user.email}</div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
            <Ico name={isDarkMode ? "eye" : "eyeOff"} size={16} />
          </button>
          <Pill label={user.role} />
        </div>
      </div>

      <SectionLabel label="Security" />
      <Card className="mb-4">
        <Row first icon="lock" label="Change password" sub="Update your login credentials" onClick={() => setPanel("password")} />
        <Divider />
        <Row icon="device" label="Active sessions" sub="View and revoke signed-in devices" onClick={() => setPanel("sessions")} />
        <Divider />
        <Row icon="bell" label="Login alert emails" sub="Notified when a new device signs in" right={<Toggle on={true} onChange={() => {}} />} />
        <Divider />
        <Row last icon="mail" label="Activity emails" sub="Offers, verifications, ratings" right={<Toggle on={true} onChange={() => {}} />} />
      </Card>

      <SectionLabel label="Privacy" />
      <Card className="mb-4">
        <Row first icon="shield" label="Privacy & data" sub="Consent record, RA 10173 data use, account deletion" onClick={() => setPanel("privacy")} />
        <Divider />
        <Row last icon="file" label="Privacy Policy" sub="How your personal data is handled" onClick={() => {}} />
      </Card>

      <SectionLabel label="Help & Support" />
      <Card className="mb-5">
        <Row first icon="help" label="FAQ & Help Center" sub="Verification, matching, rates, jobs" onClick={() => setPanel("faq")} />
        <Divider />
        <Row last icon="mail" label="Contact support" sub="Send a message to the Barangay Admin team" onClick={() => setPanel("faq")} />
      </Card>

      <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-6 font-mono tracking-widest">
        SKILL-LINK CDO · v1.0 PILOT · CDO 2026
      </p>
    </div>
  );
}

// Top-level app: screen router
export default function SecurityScreens() {
  const [panel, setPanel] = useState("home");
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMeta() {
      try {
        const data = await localAuth.getSecurityOverview();
        setSecurityData(data);
      } catch (err) {
        console.error("Failed loading data telemetry logs: ", err);
      } finally {
        setLoading(false);
      }
    }
    loadMeta();
  }, [panel]); // Re-fetch data whenever a user changes views or completes an entry field

  if (loading || !securityData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg p-8">
        <div className="text-center text-xs font-bold text-slate-500 tracking-wider animate-pulse">
          SYNCING SKILL-LINK CDO SECURITY TELEMETRY...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Navbar Header */}
      <div className="bg-skill-dark dark:bg-slate-900 px-5 flex items-center justify-between h-[54px] sticky top-0 z-20 border-b border-white/5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-6.5 h-6.5 w-[26px] h-[26px] rounded-lg bg-skill-primary flex items-center justify-center text-white">
            <Ico name="shield" size={14} />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">
            {panel === "home"        ? "Account Settings"
             : panel === "password" ? "Security"
             : panel === "sessions" ? "Security"
             : panel === "privacy"  ? "Privacy"
             : panel === "faq"      ? "Help & Support"
             : "Security Alert"}
          </span>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-[10px] text-white/40 font-mono">DEMO</span>
          <button
            onClick={() => setShowLoginAlert(s => !s)}
            className={`text-xs font-semibold text-white border border-white/20 rounded-md px-2.5 py-1 cursor-pointer transition-colors ${
              showLoginAlert ? "bg-red-600" : "bg-skill-primary/40 hover:bg-skill-primary/60"
            }`}>
            {showLoginAlert ? "Hide alert" : "Show alert"}
          </button>
        </div>
      </div>

      {/* Container Context Box */}
      <div className="max-w-[480px] mx-auto pb-15 px-3 pt-3">
        {showLoginAlert ? (
          <LoginAlertScreen onDismiss={() => setShowLoginAlert(false)} onSecureAccount={() => { setShowLoginAlert(false); setPanel("password"); }} />
        ) : (
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {panel === "home"     && <SettingsHome setPanel={setPanel} user={securityData} />}
            {panel === "password" && <ChangePasswordPanel onBack={() => setPanel("home")} />}
            {panel === "sessions" && <SessionsPanel onBack={() => setPanel("home")} />}
            {panel === "privacy"  && <PrivacyPanel onBack={() => setPanel("home")} />}
            {panel === "faq"      && <FAQPanel onBack={() => setPanel("home")} />}
          </div>
        )}
      </div>
    </div>
  );
}