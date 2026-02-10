import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const endpoint = isRegistering ? "/register" : "/login";

    const payload = isRegistering
      ? { username, password, confirm: confirmPassword }
      : { username, password };

    try {
      setLoading(true);

      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        if (isRegistering) {
          alert("Registered successfully. Please login.");
          setIsRegistering(false);
          setUsername("");
          setPassword("");
          setConfirmPassword("");
        } else {
          navigate("/home");
        }
      }

    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h1>

        <p className="text-center text-white/80 mb-8">
          {isRegistering
            ? "Create your account to start managing your tasks"
            : "Login to your to-do dashboard"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-white text-sm">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-xl bg-white/90 outline-none
                         focus:ring-4 focus:ring-purple-300"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="text-white text-sm">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-xl bg-white/90 outline-none
                         focus:ring-4 focus:ring-purple-300"
              placeholder="Enter password"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="text-white text-sm">
                Confirm password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-xl bg-white/90 outline-none
                           focus:ring-4 focus:ring-purple-300"
                placeholder="Confirm password"
              />
            </div>
          )}

          <button
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold
                       bg-gradient-to-r from-indigo-500 to-purple-600
                       hover:scale-105 transition disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isRegistering
                ? "Register"
                : "Login"}
          </button>

        </form>

        <p className="text-center text-white/80 text-sm mt-8">
          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-white font-semibold underline"
          >
            {isRegistering ? "Login here" : "Register here"}
          </button>
        </p>

      </div>
    </div>
  );
}

export default App;
