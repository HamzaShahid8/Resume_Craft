import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/apiClient";

export default function ResumeDashboard() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  // Fetch resumes if logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    setLoading(true);
    axiosInstance
      .get("resumes/")
      .then((res) => setResumes(res.data))
      .catch((err) => {
        console.error("Failed to fetch resumes:", err.response || err);
        setError("Failed to load resumes. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
    navigate("/login"); // navigate to login page
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium text-white">Loading resumes...</p>
      </div>
    );

  return (
  <div className="bg-white min-h-screen">
    
    {/* Hero Section */}
    <div
      className="h-64 flex items-center justify-center text-center text-white relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1400&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-black/60 absolute inset-0"></div>

      <div className="relative z-10">
        <h1 className="text-black text-4xl font-bold">ResumeCraft</h1>
        <p className="text-gray-200 mt-2">
          Create professional resumes in minutes
        </p>
      </div>
    </div>

    {/* Main Container */}
    <div className="p-6 max-w-6xl mx-auto">

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        
        <p className="text-2xl font-semibold text-gray-800">
          ResumeCraft
        </p>

        <div className="flex gap-3">

          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="bg-green-500 text-white px-5 py-2 rounded-lg shadow hover:bg-green-600 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-yellow-500 text-white px-5 py-2 rounded-lg shadow hover:bg-yellow-600 transition"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/resume/new"
                className="bg-white text-gray-800 px-5 py-2 rounded-lg shadow hover:bg-blue-950 hover:text-white transition font-semibold"
              >
                + New Resume
              </Link>

              <button
                onClick={handleLogout}
                className="bg-white text-black px-5 py-2 rounded-lg shadow hover:bg-blue-950 hover:text-white transition"
              >
                Logout
              </button>
            </>
          )}

        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Resume List */}
      {isLoggedIn && resumes.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {resumes.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden group"
            >

              {/* Card Image */}
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80"
                alt="resume"
                className="h-40 w-full object-cover group-hover:scale-105 transition"
              />

              <div className="p-4">

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {r.title}
                </h3>

                <div className="flex justify-between items-center">

                  <Link
                    to={`/resume/${r.id}`}
                    className="text-blue-500 font-medium hover:underline"
                  >
                    Edit
                  </Link>

                  <span className="text-sm text-gray-400">
                    ID: {r.id}
                  </span>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* Empty state */}
      {isLoggedIn && resumes.length === 0 && !loading && (

        <div className="text-center mt-10">

          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076507.png"
            alt="empty"
            className="w-40 mx-auto mb-4 opacity-80"
          />

          <p className="text-gray-300 text-lg">
            No resumes yet
          </p>

          <Link
            to="/resume/new"
            className="inline-block mt-4 bg-white text-black px-6 py-2 rounded-lg shadow hover:bg-blue-950 hover:text-white transition"
          >
            Create your first resume
          </Link>

        </div>

      )}

      {/* Not logged in */}
      {!isLoggedIn && (

        <div className="text-center mt-10">

          <img
            src="https://cdn-icons-png.flaticon.com/512/5087/5087579.png"
            alt="login required"
            className="w-40 mx-auto mb-4 opacity-80"
          />

          <p className="text-gray-300 text-lg">
            Please login to manage your resumes
          </p>

        </div>

      )}

    </div>

  </div>
);
}