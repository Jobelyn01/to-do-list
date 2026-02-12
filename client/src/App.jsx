import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    const endpoint = isRegistering ? "/register" : "/login";

    try {
      const payload = isRegistering ? { username, password, confirm } : { username, password };
      const res = await api.post(endpoint, payload);

      if (res.data.success) {
        if (isRegistering) {
          setMessage({ text: "Registered Successfully!", type: "success" });
          setIsRegistering(false);
          setUsername(""); setPassword(""); setConfirm("");
        } else {
          setMessage({ text: "Login Successful! Welcome back.", type: "success" });
          setTimeout(() => navigate("/home"), 1500);
        }
      }
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "Authentication failed. Please try again.", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-200 rounded-full blur-[120px] opacity-40"></div>

      {/* Custom Modal Alert */}
      {message.text && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-sm w-full text-center animate-in zoom-in duration-300">
            <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${
              message.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
            }`}>
              <span className="text-3xl font-bold">{message.type === "success" ? "✓" : "!"}</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
              {message.type === "success" ? "Success!" : "Wait!"}
            </h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              {message.text}
            </p>
            <button
              onClick={() => setMessage({ text: "", type: "" })}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-lg ${
                message.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-md px-6 z-10">
        <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] shadow-xl border border-white">
          
          <div className="text-center mb-10">
            <div className="inline-block p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4 text-white text-3xl">
              {isRegistering ? "✨" : "🔑"}
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {isRegistering ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {isRegistering ? "Register to get started" : "Please login to your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 text-left block">Username</label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                placeholder="Username" required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 text-left block">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                placeholder="••••••••" required
              />
            </div>

            {isRegistering && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-bold text-slate-700 ml-1 text-left block">Confirm Password</label>
                <input
                  type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-6 py-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                  placeholder="••••••••" required
                />
              </div>
            )}

            <button
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 font-extrabold py-5 rounded-2xl shadow-xl transition-all transform active:scale-95 mt-4 ${
                isLoading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isLoading ? "Processing..." : (isRegistering ? "Register Now" : "Login")}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => { setIsRegistering(!isRegistering); setMessage({ text: "", type: "" }); }}
              className="text-slate-500 font-bold hover:text-indigo-600 transition-colors"
            >
              {isRegistering ? "Already have an account? Login here" : "No account yet? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;