import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); // updated to username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/accounts/login/", {
        username: username,
        password: password
      });
      console.log("login res",res)
      // store JWT tokens
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err);
      setError("Invalid username or password"); // updated message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        
        {/* Left side: hero image */}
        <div className="md:w-1/2 hidden md:block relative group overflow-hidden">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFF0gHb9XeDqzk1f5JJxiCHE_mQjjZFYEmLw&s"
            alt="Resume Maker Hero"
            className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Right side: form */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <p className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Welcome Back!
          </p>
          <p className="text-center text-gray-600 mb-6">
            Login with your username to manage resumes and create professional CVs
          </p>

          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded text-white font-bold transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-500 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}