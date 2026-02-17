import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New State
  const [msg, setMsg] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const showToast = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for Registration
    if (isRegistering && password !== confirmPassword) {
      return showToast("Passwords do not match!", "error");
    }

    const endpoint = isRegistering ? "/register" : "/login";
    try {
      const res = await api.post(endpoint, { username, password });
      
      if (res.data.success) {
        if (isRegistering) {
          showToast("Account created! Please login. ✨");
          setIsRegistering(false);
          setConfirmPassword(""); // Reset
        } else {
          showToast("Welcome back! 🚀");
          setTimeout(() => navigate("/home"), 1000);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Authentication failed.";
      showToast(errorMsg, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 font-sans">
      
      {/* NOTIFICATION TOAST */}
      {msg.text && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl font-bold text-white whitespace-nowrap ${msg.type === 'error' ? 'bg-rose-500' : 'bg-slate-800'} animate-in fade-in zoom-in duration-300`}>
          {msg.text}
        </div>
      )}

      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Focus Hub</h1>
          <p className="text-slate-400 font-medium">
            {isRegistering ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-1 block">Username</label>
            <input 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-200 transition-all" 
              placeholder="Enter username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-1 block">Password</label>
            <input 
              type="password" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-200 transition-all" 
              placeholder="Enter password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          {/* CONFIRM PASSWORD - Only shows when registering */}
          {isRegistering && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-1 block">Confirm Password</label>
              <input 
                type="password" 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-200 transition-all" 
                placeholder="Repeat password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
          )}

          <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg mt-4 shadow-lg hover:bg-black active:scale-95 transition-all">
            {isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>
        
        <p className="text-center mt-8">
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setConfirmPassword(""); // Clear confirm field when toggling
            }} 
            className="text-slate-500 font-semibold hover:text-slate-900 transition-colors"
          >
            {isRegistering ? "Already have an account? Log in" : "Don't have an account? Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default App;