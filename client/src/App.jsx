import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api"; // Siguraduhin na ang api.js ay nasa kaparehong folder ng App.jsx

function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const showToast = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? "/register" : "/login";
    try {
      const res = await api.post(endpoint, { username, password });
      if (res.data.success) {
        if (isRegistering) {
          showToast("Registered! Please login. ✨");
          setIsRegistering(false);
        } else {
          showToast("Welcome to Focus Hub! 🚀");
          setTimeout(() => navigate("/home"), 1000);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Maling login info", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 font-sans relative">
      
      {/* BAGONG TOAST (Centered) */}
      {msg.text && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl font-bold text-white whitespace-nowrap ${msg.type === 'error' ? 'bg-rose-500' : 'bg-slate-800'}`}>
          {msg.text}
        </div>
      )}

      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Focus Hub</h1>
          <p className="text-slate-400 font-medium">{isRegistering ? "Create account" : "Welcome back"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-slate-200" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-slate-200" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg mt-4 shadow-lg active:scale-95 transition-all">
            {isRegistering ? "Sign Up" : "Login"}
          </button>
        </form>
        
        <p className="text-center mt-6">
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-slate-500 font-medium hover:text-slate-900 transition-colors">
            {isRegistering ? "May account na? Login" : "Wala pang account? Register"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default App;