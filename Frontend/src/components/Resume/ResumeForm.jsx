import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/resumes/",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
});

export default function ResumeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfRef = useRef();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    personal: {
      phone: "",
      address: "",
      linkedin: "",
      github: "",
    },
    education: [],
    experience: [],
    skills: [],
  });

  
  useEffect(() => {
    if (id && id !== "new") {
      setLoading(true);
      api
        .get(`resume/${id}/`)
        .then((res) => setFormData(res.data))
        .catch(() => alert("Failed to load resume"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  
  const handleTitle = (e) => {
    setFormData({ ...formData, title: e.target.value });
  };

  const handleSummary = (e) => {
    setFormData({ ...formData, summary: e.target.value });
  };

  const handlePersonal = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [name]: value,
      },
    }));
  };

  
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { institute: "", degree: "", start_year: "", end_year: "" },
      ],
    });
  };

  const updateEducation = (i, key, value) => {
    const updated = [...formData.education];
    updated[i][key] = value;
    setFormData({ ...formData, education: updated });
  };

  const removeEducation = (i) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, idx) => idx !== i),
    });
  };

  
  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        {
          company: "",
          role: "",
          start_date: "",
          end_date: "",
          description: "",
        },
      ],
    });
  };

  const updateExperience = (i, key, value) => {
    const updated = [...formData.experience];
    updated[i][key] = value;
    setFormData({ ...formData, experience: updated });
  };

  const removeExperience = (i) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, idx) => idx !== i),
    });
  };

  
  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, ""],
    });
  };

  const updateSkill = (i, value) => {
    const updated = [...formData.skills];
    updated[i] = value;
    setFormData({ ...formData, skills: updated });
  };

  const removeSkill = (i) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, idx) => idx !== i),
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id === "new") {
        await api.post("resume/", formData);
      } else {
        await api.put(`resume/${id}/`, formData);
      }

      navigate("/dashboard");
    } catch (err) {
      console.log(err.response?.data || err);
      alert("Save failed - check backend");
    } finally {
      setLoading(false);
    }
  };

  
  const exportPDF = async () => {
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("resume.pdf");
  };

  if (loading) return <p className="p-10">Loading...</p>;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="text-gray-600 grid md:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow"
        >
          <p className="text-xl text-gray-600 font-bold p-2">
            {id === "new" ? "Create Resume" : "Edit Resume"}
          </p>

          {/* TITLE */}
          <input
            value={formData.title}
            onChange={handleTitle}
            placeholder="Resume Title"
            className="w-full border p-2 rounded mb-2"
          />

          {/* SUMMARY (FIXED) */}
          <textarea
            value={formData.summary}
            onChange={handleSummary}
            placeholder="Professional Summary"
            className="w-full border p-2 rounded mb-3"
            rows={3}
          />

          {/* PERSONAL */}
          <h3 className="font-semibold">Personal Info</h3>

          {Object.keys(formData.personal).map((key) => (
            <input
              key={key}
              name={key}
              value={formData.personal[key]}
              onChange={handlePersonal}
              placeholder={key}
              className="w-full border p-2 rounded mb-2"
            />
          ))}

          {/* EDUCATION */}
          <h3 className="font-semibold mt-3">Education</h3>

          {formData.education.map((ed, i) => (
            <div key={i} className="border p-2 mb-2 rounded">
              <input
                placeholder="Institute"
                value={ed.institute}
                onChange={(e) =>
                  updateEducation(i, "institute", e.target.value)
                }
                className="w-full border p-1 mb-1"
              />

              <input
                placeholder="Degree"
                value={ed.degree}
                onChange={(e) => updateEducation(i, "degree", e.target.value)}
                className="w-full border p-1 mb-1"
              />

              <button type="button" onClick={() => removeEducation(i)}>
                Remove
              </button>
            </div>
          ))}

          <button type="button" onClick={addEducation}>
            + Add Education
          </button>

          {/* EXPERIENCE */}
          <h3 className="font-semibold mt-3">Experience</h3>

          {formData.experience.map((ex, i) => (
            <div key={i} className="border p-2 mb-2 rounded">
              <input
                placeholder="Company"
                value={ex.company}
                onChange={(e) => updateExperience(i, "company", e.target.value)}
                className="w-full border p-1 mb-1"
              />

              <input
                placeholder="Role"
                value={ex.role}
                onChange={(e) => updateExperience(i, "role", e.target.value)}
                className="w-full border p-1 mb-1"
              />

              <button type="button" onClick={() => removeExperience(i)}>
                Remove
              </button>
            </div>
          ))}

          <button type="button" onClick={addExperience}>
            + Add Experience
          </button>

          {/* SKILLS */}
          <h3 className="font-semibold mt-3">Skills</h3>

          {formData.skills.map((sk, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <input
                value={sk}
                onChange={(e) => updateSkill(i, e.target.value)}
                className="w-full border p-1"
              />
              <button type="button" onClick={() => removeSkill(i)}>
                ❌
              </button>
            </div>
          ))}

          <button type="button" onClick={addSkill}>
            + Add Skill
          </button>

          {/* BUTTONS */}
          <div className="mt-4 flex gap-2">
            <button className="bg-blue-950 text-white px-4 py-2 rounded">
              Save
            </button>

            <button
              type="button"
              onClick={exportPDF}
              className="bg-blue-950 text-white px-4 py-2 rounded"
            >
              Download PDF
            </button>
          </div>
        </form>

        {/* ================= PREVIEW ================= */}
        <div ref={pdfRef} className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold">{formData.title}</h2>

          <p className="mt-2">{formData.summary}</p>

          <h3 className="font-bold mt-3">Education</h3>
          {formData.education.map((e, i) => (
            <p key={i}>
              {e.degree} - {e.institute}
            </p>
          ))}

          <h3 className="font-bold mt-3">Experience</h3>
          {formData.experience.map((e, i) => (
            <p key={i}>
              {e.role} - {e.company}
            </p>
          ))}

          <h3 className="font-bold mt-3">Skills</h3>
          {formData.skills.map((s, i) => (
            <span key={i} className="mr-2">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
