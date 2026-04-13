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
          <p className="text-blue-950 text-3xl font-extrabold flex items-center gap-2">
            🚀 Resume Craft
          </p>

          <div className="flex gap-3">
            <Link
              to="/resume/new"
              className="bg-blue-950 text-white hover:bg-blue-900 px-4 py-2 rounded"
            >
              + New Resume
            </Link>

            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="bg-blue-950 text-white hover:bg-blue-900 px-4 py-2 rounded"
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
            className="w-full h-48 object-cover shadow"
          />
          {/* WhatsApp CTA Section */}
          <div className="mb-6 bg-gray-100 p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-bold text-lg">
                Need a Professional Resume / Website?
              </p>
              <p className="text-gray-600 text-sm">
                Contact us on WhatsApp for custom Resume Builder, or
                Portfolio website.
              </p>
            </div>
            <a
              href="https://wa.me/923098500908?text=Hi%20I%20want%20a%20professional%20Resume%20Builder%20or%20Website"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>

        {/* ERROR */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* RESUME LIST */}
        {isLoggedIn && resumes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((r) => (
              <div
                key={r.id}
                className="bg-white p-5 rounded-2xl text-left shadow-md hover:shadow-xl transition border border-gray-100"
              >
                <h2 className="text-xl font-bold text-black text-left">{r.title}</h2>
                <hr className="border-gray-300 my-2" />

                <p className="text-gray-600 mb-2 text-left">{r.summary}</p>
                <hr className="border-gray-300 my-2" />

                {/* PERSONAL */}
                {r.personal && (
                  <div className="text-sm text-gray-500 mb-2 text-left">
                    <p>{r.personal.phone}</p>
                    <p>{r.personal.address}</p>
                  </div>
                )}
                <hr className="border-gray-300 my-2" />

                {/* EDUCATION */}
                {r.education?.length > 0 && (
                  <div className="mb-2">
                    <p className="font-semibold text-left">Education</p>
                    {r.education.map((edu, i) => (
                      <p key={i} className="text-sm text-gray-600 text-left">
                        {edu.degree} - {edu.institute}
                      </p>
                    ))}
                  </div>
                )}
                <hr className="border-gray-300 my-2" />

                {/* EXPERIENCE */}
                {r.experience?.length > 0 && (
                  <div className="mb-2">
                    <p className="font-semibold text-left">Experience</p>
                    {r.experience.map((exp, i) => (
                      <p key={i} className="text-sm text-gray-600 text-left">
                        {exp.role} at {exp.company}
                      </p>
                    ))}
                  </div>
                )}
                <hr className="border-gray-300 my-2" />

                {/* SKILLS */}
                {r.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 text-left">
                    {r.skills.map((s, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded text-left"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
                <hr className="border-gray-300 my-2" />

                {/* ACTION */}
                <Link
                  to={`/resume/${r.id}`}
                  className="bg-blue-950 hover:bg-blue-900 text-white px-4 py-2 rounded-xl text-sm font-medium shadow"
                >
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
