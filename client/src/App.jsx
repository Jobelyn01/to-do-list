import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const endpoint = isRegistering ? "/register" : "/login";
    const payload = isRegistering
      ? { username, password, confirm: confirmPassword }
      : { username, password };

    try {
      const res = await api.post(endpoint, payload);
      if (res.data.success) {
        setMessage({ text: res.data.message, type: "success" });

        if (isRegistering) {
          // Switch to login form after successful registration
          setIsRegistering(false);
          setUsername("");
          setPassword("");
          setConfirmPassword("");
        } else {
          // Redirect to dashboard after login
          setTimeout(() => navigate("/home"), 800);
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Something went wrong";
      setMessage({ text: errMsg, type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-center text-gray-500 mb-6">
          {isRegistering
            ? "Register to get started"
            : "Login to your account"}
        </p>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-400 to-pink-600 text-white py-2 rounded-xl font-semibold hover:opacity-90 transition"
          >
            {isRegistering ? "Register Now" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isRegistering ? "Already have an account?" : "No account yet?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMessage({ text: "", type: "" });
            }}
            className="text-pink-600 font-medium hover:underline"
          >
            {isRegistering ? "Login here" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default App;
