import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../services/apiClient";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axiosInstance.post("api/accounts/register/", formData);
      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err.response || err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="text-black min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div className="bg-white rounded-lg shadow-lg flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
      
      {/* Left side: image */}
      <div className="md:w-1/2 hidden md:block relative group overflow-hidden">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScBe0ijVuN5xnCeOUhcWWe1sO-aao9AYHQEg&s"
          alt="Resume Maker Hero"
          className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
        />
      </div> {/* <-- closed the left image div */}

      {/* Right side: form */}
      <div className="md:w-1/2 p-8 flex flex-col justify-center">
        <p className="text-3xl font-bold text-black p-2 text-center">
          Create Your Account
        </p>
        <p className="text-center text-gray-600 p-2">
          Register now and start building professional resumes
        </p>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white font-bold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  </div>
);
}