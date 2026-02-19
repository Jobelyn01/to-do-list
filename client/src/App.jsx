import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api"; 

function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const showToast = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    if (isRegistering && password !== confirmPassword) {
      return showToast("Passwords do not match!", "error");
    }

    const endpoint = isRegistering ? "/register" : "/login";
    
    
    const payload = isRegistering 
      ? { username, password, confirm: confirmPassword } 
      : { username, password };

    try {
      const res = await api.post(endpoint, payload);
      if (res.data.success) {
        if (isRegistering) {
          showToast("Account created! Please login. ✨");
          setIsRegistering(false);
          setConfirmPassword("");
          setUsername("");
          setPassword("");
        } else {
          showToast("Welcome back! 🚀");
          setTimeout(() => navigate("/home"), 1000);
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Action failed.";
      showToast(errMsg, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 font-sans">
      {msg.text && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl font-bold text-white ${msg.type === 'error' ? 'bg-rose-500' : 'bg-slate-800'} animate-bounce`}>
          {msg.text}
        </div>
      )}
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h1 className="text-4xl font-black text-center text-slate-900 mb-8 tracking-tight">My Tasks</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-200" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-200" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          
          {isRegistering && (
            <input type="password" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-200" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          )}
          
          <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg mt-4 shadow-lg hover:bg-black transition-all active:scale-95">
            {isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>
        <button onClick={() => { setIsRegistering(!isRegistering); setConfirmPassword(""); }} className="w-full mt-8 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900">
          {isRegistering ? "Already have an account? Login" : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}
export default App;