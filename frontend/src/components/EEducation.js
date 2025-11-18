import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";

import { getApiUrl } from '../config/api';
function EEducation() {
  const [eEducation, setEEducation] = useState({
    e_lecture_details: [
      {
        e_lecture_title: "",
        content_module_title: "",
        institution_platform: "",
        year: "",
        weblink: "",
        member_of_editorial_bodies: "",
        reviewer_referee_of: "",
      },
    ],
    online_education_conducted: [
      {
        nature_of_online_course: "",
        no_of_sessions: "",
        target_group: "",
        date: "",
      },
    ],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      const response = await fetch(getApiUrl(`/api/professor/e-education/${userId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eEducation),
      });

      if (response.ok) {
        alert("E-Education updated successfully!");
      } else {
        throw new Error("Failed to update e-education");
      }
    } catch (error) {
      console.error("Error updating e-education:", error);
      alert("Error updating e-education");
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setEEducation((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      e_lecture_details: {
        e_lecture_title: "",
        content_module_title: "",
        institution_platform: "",
        year: "",
        weblink: "",
        member_of_editorial_bodies: "",
        reviewer_referee_of: "",
      },
      online_education_conducted: {
        nature_of_online_course: "",
        no_of_sessions: "",
        target_group: "",
        date: "",
      },
    };

    setEEducation((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName]],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setEEducation((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        const response = await fetch(getApiUrl(`/api/professor/e-education/${userId}`), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEEducation({
            e_lecture_details: data.e_lecture_details || [
              {
                e_lecture_title: "",
                content_module_title: "",
                institution_platform: "",
                year: "",
                weblink: "",
                member_of_editorial_bodies: "",
                reviewer_referee_of: "",
              },
            ],
            online_education_conducted: data.online_education_conducted || [
              {
                nature_of_online_course: "",
                no_of_sessions: "",
                target_group: "",
                date: "",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching e-education data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
        <div style={{ padding: "10px 30px 30px" }}>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            color: "#1a202c",
            marginBottom: "10px",
            marginTop: "0px"
          }}>
            E-Education (MOOC/Swayam/e-Pathshala/CEC/Institutional LMS)
          </h1>
          <p style={{ fontSize: "1rem", opacity:0.8, marginBottom: "30px", marginTop: "0px" }}>
            Update your E-Education details below. Please ensure all information is accurate before submitting.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              marginBottom: "30px",

            }}>

              {/* E-Lecture Details Section */}
              <div style={{ marginTop: "0px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem", marginTop: "0px" }}>
                  E-Lecture Details
                </h2>
                <div style={{  }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>E-Lecture Title</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Content/Module Title</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Institution/Platform</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Year</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Weblink</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Member of Editorial Bodies</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Reviewer/Referee of</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eEducation.e_lecture_details.map((lecture, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={lecture.e_lecture_title}
                              onChange={(e) => handleArrayChange("e_lecture_details", idx, "e_lecture_title", e.target.value)}
                              style={{
                                width: "85%",
                                height: "60px",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                resize: "vertical",
                                overflow: "auto",
                                fontFamily: "inherit",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={lecture.content_module_title}
                              onChange={(e) => handleArrayChange("e_lecture_details", idx, "content_module_title", e.target.value)}
                              style={{
                                width: "90%",
                                height: "60px",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                resize: "vertical",
                                overflow: "auto",
                                fontFamily: "inherit",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <select
                              value={lecture.institution_platform}
                              onChange={(e) => handleArrayChange("e_lecture_details", idx, "institution_platform", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                backgroundColor: "white"
                              }}
                            >
                              <option value="">Select Institution/Platform</option>
                              <option value="MOOC">MOOC</option>
                              <option value="Swayam">Swayam</option>
                              <option value="e-Pathshala">e-Pathshala</option>
                              <option value="CEC">CEC</option>
                              <option value="Institutional LMS">Institutional LMS</option>
                            </select>
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="number"
                              value={lecture.year}
                              onChange={(e) => handleArrayChange("e_lecture_details", idx, "year", e.target.value)}
                              style={{
                                width: "85%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={lecture.weblink}
                              onChange={(e) => handleArrayChange("e_lecture_details", idx, "weblink", e.target.value)}
                              placeholder="https://"
                              style={{
                                width: "90%",
                                height: "60px",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                resize: "vertical",
                                overflow: "auto",
                                fontFamily: "inherit",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={lecture.member_of_editorial_bodies}
                              onChange={(e) => handleArrayChange("e_lecture_details", idx, "member_of_editorial_bodies", e.target.value)}
                              style={{
                                width: "90%",
                                height: "60px",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                resize: "vertical",
                                overflow: "auto",
                                fontFamily: "inherit",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={lecture.reviewer_referee_of}
                              onChange={(e) => handleArrayChange("e_lecture_details", idx, "reviewer_referee_of", e.target.value)}
                              style={{
                                width: "90%",
                                height: "60px",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                resize: "vertical",
                                overflow: "auto",
                                fontFamily: "inherit",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeArrayItem("e_lecture_details", idx)}
                              style={{
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("e_lecture_details")}
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    padding: "12px 24px",
                    marginTop: "15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  + Add E-Lecture Entry
                </button>
              </div>

              {/* Online Education Conducted Section */}
              <div style={{ marginTop: "60px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                  Details of Online Education Conducted
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Nature of Online Course</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>No. of Sessions</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Target Group</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Date</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eEducation.online_education_conducted.map((course, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={course.nature_of_online_course}
                              onChange={(e) => handleArrayChange("online_education_conducted", idx, "nature_of_online_course", e.target.value)}
                              style={{
                                width: "90%",
                                height: "60px",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                resize: "vertical",
                                overflow: "auto",
                                fontFamily: "inherit",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="number"
                              value={course.no_of_sessions}
                              onChange={(e) => handleArrayChange("online_education_conducted", idx, "no_of_sessions", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={course.target_group}
                              onChange={(e) => handleArrayChange("online_education_conducted", idx, "target_group", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={course.date}
                              onChange={(e) => handleArrayChange("online_education_conducted", idx, "date", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeArrayItem("online_education_conducted", idx)}
                              style={{
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem("online_education_conducted")}
                  style={{
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    padding: "12px 24px",
                    marginTop: "15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  + Add Online Education Entry
                </button>
              </div>

              <div style={{ marginTop: "50px", textAlign: "center" }}>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "16px 40px",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    fontWeight: "600",
                    boxShadow: "0 10px 25px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default EEducation;