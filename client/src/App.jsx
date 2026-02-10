import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isRegistering ? "/register" : "/login";

    const payload = isRegistering
      ? { username, password, confirm: confirmPassword }
      : { username, password };

    try {
      const res = await api.post(endpoint, payload);

      if (res.data.success) {

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
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-2">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h1>

        <p className="text-center text-gray-500 mb-6">
          {isRegistering
            ? "Register to get started"
            : "Please login to your account"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            className="w-full px-4 py-2 border rounded-lg outline-none"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg outline-none"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {isRegistering && (
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg outline-none"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          )}

          <button
            className="w-full py-2 rounded-lg text-white font-semibold
                       bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            {isRegistering ? "Register" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {isRegistering ? "Already have an account?" : "No account yet?"}{" "}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-indigo-600 font-semibold"
            type="button"
          >
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>

      </div>
    </div>
  );
}

export default App;
