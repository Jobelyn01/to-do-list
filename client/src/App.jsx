import { useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? "/register" : "/login";
    try {
      const res = await api.post(endpoint, { username, password, confirm });
      if (res.data.success) {
        if (isRegistering) {
          setMessage({ text: "Account created! You can now login.", type: "success" });
          setIsRegistering(false);
        } else {
          navigate("/home");
        }
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Something went wrong", type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] relative overflow-hidden font-sans">
      {/* Decorative Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-200 rounded-full blur-[120px] opacity-50"></div>

      <div className="w-full max-w-md px-6 z-10">
        <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white">
          
          <div className="text-center mb-10">
            <div className="inline-block p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {isRegistering ? "Join Us" : "Welcome"}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {isRegistering ? "Create your productivity hub." : "Sign in to manage your lists."}
            </p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl text-sm font-bold text-center animate-bounce ${
              message.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm"
                placeholder="Your cool name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {isRegistering && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 transform">
              {isRegistering ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setMessage({ text: "", type: "" });
              }}
              className="text-slate-500 font-bold hover:text-indigo-600 transition-colors"
            >
              {isRegistering ? "Already have an account? Login" : "New here? Create an account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;