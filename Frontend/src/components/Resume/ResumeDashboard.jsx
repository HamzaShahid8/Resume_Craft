import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/apiClient";
import { BookOpen } from "lucide-react";

export default function ResumeDashboard() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token"),
  );

  // =========================
  // GET RESUMES (FIXED)
  // =========================
  useEffect(() => {
    if (!isLoggedIn) return;

    setLoading(true);

    axiosInstance
      .get("/api/resumes/resume/")
      .then((res) => {
        const data = res.data;

        // works for both paginated & normal API
        setResumes(data.results ? data.results : data);
      })
      .catch((err) => {
        console.error("Fetch error:", err.response || err);
        setError("Failed to load resumes");
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Loading resumes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-blue-950 text-3xl font-extrabold">Resume Craft</p>

          <div className="flex gap-3">
            <Link
              to="/resume/new"
              className="bg-blue-950 text-white px-4 py-2 rounded"
            >
              + New Resume
            </Link>

            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="bg-blue-950 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            )}
          </div>
        </div>
        <div className="mb-6">
          <img
            src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1400&q=80"
            alt="Resume Builder"
            className="w-full h-48 object-cover rounded-xl shadow"
          />
        </div>

        {/* ERROR */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* RESUME LIST */}
        {isLoggedIn && resumes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((r) => (
              <div key={r.id} className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-bold">{r.title}</h2>

                <p className="text-gray-600 mb-2">{r.summary}</p>

                {/* PERSONAL */}
                {r.personal && (
                  <div className="text-sm text-gray-500 mb-2">
                    <p>📞 {r.personal.phone}</p>
                    <p>📍 {r.personal.address}</p>
                  </div>
                )}

                {/* EDUCATION */}
                {r.education?.length > 0 && (
                  <div className="mb-2">
                    <p className="font-semibold">Education</p>
                    {r.education.map((edu, i) => (
                      <p key={i} className="text-sm text-gray-600">
                        {edu.degree} - {edu.institute}
                      </p>
                    ))}
                  </div>
                )}

                {/* EXPERIENCE */}
                {r.experience?.length > 0 && (
                  <div className="mb-2">
                    <p className="font-semibold">Experience</p>
                    {r.experience.map((exp, i) => (
                      <p key={i} className="text-sm text-gray-600">
                        {exp.role} at {exp.company}
                      </p>
                    ))}
                  </div>
                )}

                {/* SKILLS */}
                {r.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {r.skills.map((s, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* ACTION */}
                <Link to={`/resume/${r.id}`} className="text-blue-500 text-sm">
                  Edit Resume
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No resumes found</p>
        )}

        {/* NOT LOGGED IN */}
        {!isLoggedIn && (
          <p className="text-center text-gray-500 mt-10">
            Please login to view resumes
          </p>
        )}
      </div>
    </div>
  );
}
