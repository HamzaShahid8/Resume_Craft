import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { Link } from "@react-pdf/renderer";

import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export default function ResumeForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const emptyEducation = {
    institute: "",
    degree: "",
    start_year: "",
    end_year: "",
  };

  const emptyExperience = {
    company: "",
    role: "",
    start_date: "",
    end_date: "",
    description: "",
  };

  const emptySkill = { name: "" };

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    personal: {
      phone: "",
      address: "",
      linkedin: "",
      github: "",
    },
    education: [emptyEducation],
    experience: [emptyExperience],
    skills: [emptySkill],
  });

  // LOAD DATA
  useEffect(() => {
    if (id !== "new") {
      apiClient.get(`resume/${id}/`).then((res) => {
        const data = res.data;

        setFormData({
          title: data.title || "",
          summary: data.summary || "",
          personal: data.personal || {
            phone: "",
            address: "",
            linkedin: "",
            github: "",
          },
          education: data.education?.length ? data.education : [emptyEducation],
          experience: data.experience?.length
            ? data.experience
            : [emptyExperience],
          skills: data.skills?.length ? data.skills : [emptySkill],
        });
      });
    }
  }, [id]);

  // BASIC
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // PERSONAL
  const handlePersonalChange = (e) => {
    setFormData({
      ...formData,
      personal: {
        ...formData.personal,
        [e.target.name]: e.target.value,
      },
    });
  };

  // LISTS
  const handleListChange = (e, index, section) => {
    const list = [...formData[section]];
    list[index][e.target.name] = e.target.value;

    setFormData({ ...formData, [section]: list });
  };

  const addItem = (section) => {
    const templates = {
      education: emptyEducation,
      experience: emptyExperience,
      skills: emptySkill,
    };

    setFormData({
      ...formData,
      [section]: [...formData[section], templates[section]],
    });
  };

  const removeItem = (section, index) => {
    const list = formData[section].filter((_, i) => i !== index);

    setFormData({
      ...formData,
      [section]: list.length
        ? list
        : [section === "skills" ? emptySkill : emptyEducation],
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      experience: formData.experience.map((exp) => ({
        ...exp,
        start_date: exp.start_date || null,
        end_date: exp.end_date || null,
      })),
    };

    try {
      if (id === "new") {
        await apiClient.post("/api/resumes/resume/", payload);
      } else {
        await apiClient.put(`/api/resumes/resume/${id}/`, payload);
      }

      alert("Saved Successfully");
      navigate("/dashboard");
    } catch (err) {
      console.log(err.response?.data);
      alert("Error saving resume");
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex justify-center text-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl bg-gray-200 text-gray-700 p-8 rounded-4xl space-y-6"
      >
        <p className="text-gray-700 text-3xl font-bold p-2 text-center">
          Resume Craft
        </p>

        {/* TITLE */}
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full p-3 bg-gray-100 rounded mb-2"
        />

        <textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          placeholder="Summary"
          className="w-full p-3 bg-gray-100 rounded mb-2"
        />

        {/* PERSONAL */}
        <p className="text-gray-700 text-xl p-3 font-extrabold">
          Personal Info
        </p>

        <div className="grid grid-cols-2 gap-2">
          <input
            name="phone"
            value={formData.personal.phone}
            onChange={handlePersonalChange}
            placeholder="Phone"
            className="p-2 bg-gray-100 rounded"
          />
          <input
            name="address"
            value={formData.personal.address}
            onChange={handlePersonalChange}
            placeholder="Address"
            className="p-2 bg-gray-100 rounded"
          />
          <input
            name="linkedin"
            value={formData.personal.linkedin}
            onChange={handlePersonalChange}
            placeholder="LinkedIn"
            className="p-2 bg-gray-100 rounded"
          />
          <input
            name="github"
            value={formData.personal.github}
            onChange={handlePersonalChange}
            placeholder="GitHub"
            className="p-2 bg-gray-100 rounded"
          />
        </div>

        <p className="text-gray-700 text-xl p-3 font-extrabold">Education</p>
        {/* EDUCATION */}
        <div className="bg-gray-100 text-gray-700 gap-1 rounded">
          {formData.education.map((edu, i) => (
            <Card key={i}>
              <input
                name="institute"
                value={edu.institute}
                onChange={(e) => handleListChange(e, i, "education")}
                className="p-2 bg-gray-200 rounded ml-1"
                placeholder="Institute"
              />
              <input
                name="degree"
                value={edu.degree}
                onChange={(e) => handleListChange(e, i, "education")}
                className="p-2 bg-gray-200 rounded ml-1"
                placeholder="Degree"
              />
              <input
                name="start_year"
                value={edu.start_year}
                onChange={(e) => handleListChange(e, i, "education")}
                className="p-2 bg-gray-200 rounded ml-1"
                placeholder="Start Year"
              />
              <input
                name="end_year"
                value={edu.end_year}
                onChange={(e) => handleListChange(e, i, "education")}
                className="p-2 bg-gray-200 rounded ml-1"
                placeholder="End Year"
              />

              <button
                type="button"
                onClick={() => removeItem("education", i)}
                className="text-gray-100 ml-1 mt-3 p-1 bg-gray-500 rounded"
              >
                Remove
              </button>
            </Card>
          ))}
          <Btn onClick={() => addItem("education")}>Add Education</Btn>
        </div>

        {/* EXPERIENCE */}
        <p className="text-gray-700 font-extrabold text-xl p-3">Experience</p>
        <Section>
          {formData.experience.map((exp, i) => (
            <Card key={i}>
              <input
                name="company"
                value={exp.company}
                onChange={(e) => handleListChange(e, i, "experience")}
                className="p-2 bg-gray-200 rounded ml-1"
                placeholder="Company"
              />
              <input
                name="role"
                value={exp.role}
                onChange={(e) => handleListChange(e, i, "experience")}
                className="p-2 bg-gray-200 ml-1 rounded"
                placeholder="Role"
              />
              <textarea
                name="description"
                value={exp.description}
                onChange={(e) => handleListChange(e, i, "experience")}
                className="p-2 bg-gray-200 ml-1 rounded"
                placeholder="Description"
              />

              <button
                type="button"
                onClick={() => removeItem("experience", i)}
                className="text-gray-100 bg-gray-500 rounded ml-5 p-2"
              >
                Remove
              </button>
            </Card>
          ))}
          <Btn onClick={() => addItem("experience")}>Add Experience</Btn>
        </Section>

        {/* SKILLS */}
        <p className="text-gray-700 font-extrabold text-xl p-3">Skills</p>
        <Section>
          {formData.skills.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                name="name"
                value={s.name}
                onChange={(e) => handleListChange(e, i, "skills")}
                className="p-2 bg-gray-100 text-gray-700 flex-1"
              />
              <button
                type="button"
                onClick={() => removeItem("skills", i)}
                className="text-gray-500"
              >
                X
              </button>
            </div>
          ))}
          <Btn onClick={() => addItem("skills")}>Add Skill</Btn>
        </Section>

        {/* SUBMIT */}
        <button className="w-30 bg-gray-500 text-gray-100 p-3 rounded">
          Save Resume
        </button>
        <div className="flex justify-end mt-4">
          <PDFDownloadLink
            document={<ResumePDF data={formData} />}
            fileName="resume.pdf"
          >
            {({ loading, error }) => (
              <span className="bg-gray-600 text-white px-4 py-2 rounded cursor-pointer inline-block">
                {error
                  ? "Error generating PDF"
                  : loading
                    ? "Generating PDF..."
                    : "Download PDF"}
              </span>
            )}
          </PDFDownloadLink>
        </div>
      </form>
    </div>
  );
}

/* UI HELPERS */
function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Card({ children }) {
  return <div className="bg-gray-100 p-2 ml-1  rounded mb-1">{children}</div>;
}
function Btn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-gray-500 text-gray-100 rounded px-3 py-1 mt-1 mb-2"
    >
      {children}
    </button>
  );
}

/* PDF FIXED */
function ResumePDF({ data }) {
  return (
    <Document>
      <Page style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 22,
            color: "black",
            fontWeight: "bold",
            marginBottom: 6,
          }}
        >
          {data.title}
        </Text>

        <View
          style={{
            borderBottomWidth: 2,
            borderBottomColor: "#000",
            marginBottom: 8,
          }}
        />

        <Text style={{ fontSize: 12, marginBottom: 10, color: "#333" }}>
          {data.summary}
        </Text>

        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#999",
            marginBottom: 12,
          }}
        />

        <Text style={{ marginBottom: 7 }}>Phone: {data.personal.phone}</Text>
        <Text style={{ marginBottom: 7 }}>
          Address: {data.personal.address}
        </Text>
        <Text style={{ marginBottom: 5 }}>LinkedIn:</Text>

        <Link
          src={data.personal.linkedin}
          style={{
            color: "blue",
            textDecoration: "underline",
            marginBottom: 10,
            fontSize: 5,
          }}
        >
          {data.personal.linkedin}
        </Link>

        <Text style={{ marginBottom: 5 }}>GitHub:</Text>

        <Link
          src={data.personal.github}
          style={{
            color: "blue",
            textDecoration: "underline",
            marginBottom: 10,
            fontSize: 5,
          }}
        >
          {data.personal.github}
        </Link>

        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#999",
            marginVertical: 10,
          }}
        />

        <Text style={{ color: "black", fontWeight: "bold", marginBottom: 20 }}>
          Education:
        </Text>
        {data.education.map((e, i) => (
          <Text style={{ marginBottom: 10 }} key={i}>
            {e.institute} - {e.degree}
          </Text>
        ))}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#999",
            marginVertical: 10,
          }}
        />

        <Text style={{ color: "black", fontWeight: "bold", marginBottom: 20 }}>
          Experience:
        </Text>
        {data.experience.map((e, i) => (
          <Text style={{ marginBottom: 10 }} key={i}>
            {e.company} - {e.role}
          </Text>
        ))}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#999",
            marginVertical: 10,
          }}
        />

        <Text style={{ color: "black", fontWeight: "bold", marginBottom: 20 }}>
          Skills:
        </Text>
        {data.skills.map((s, i) => (
          <Text style={{ marginBottom: 10 }} key={i}>
            {s.name}
          </Text>
        ))}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#999",
            marginVertical: 10,
          }}
        />
      </Page>
    </Document>
  );
}
