import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";

import { getApiUrl } from '../config/api';
function ResearchGuidanceStudents() {
  const [researchGuidance, setResearchGuidance] = useState({
    pg_guidance: [
      {
        year: "",
        degree: "",
        students_awarded: "",
        student_names: "",
        student_roll_no: "",
        department_centre: "",
      },
    ],
    phd_guidance: [
      {
        student_name: "",
        registration_date: "",
        registration_no: "",
        thesis_title: "",
        thesis_submitted_status: "",
        thesis_submitted_date: "",
        vivavoce_completed_status: "",
        date_awarded: "",
      },
    ],
    postdoc_guidance: [
      {
        scholar_name: "",
        designation: "",
        funding_agency: "",
        fellowship_title: "",
        year_of_joining: "",
        year_of_completion: "",
      },
    ],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      const response = await fetch(getApiUrl(`/api/professor/research-guidance/${userId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(researchGuidance),
      });

      if (response.ok) {
        alert("Research Guidance updated successfully!");
      } else {
        throw new Error("Failed to update research guidance");
      }
    } catch (error) {
      console.error("Error updating research guidance:", error);
      alert("Error updating research guidance");
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setResearchGuidance((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      pg_guidance: {
        year: "",
        degree: "",
        students_awarded: "",
        student_names: "",
        student_roll_no: "",
        department_centre: "",
      },
      phd_guidance: {
        student_name: "",
        registration_date: "",
        registration_no: "",
        thesis_title: "",
        thesis_submitted_status: "",
        thesis_submitted_date: "",
        vivavoce_completed_status: "",
        date_awarded: "",
      },
      postdoc_guidance: {
        scholar_name: "",
        designation: "",
        funding_agency: "",
        fellowship_title: "",
        year_of_joining: "",
        year_of_completion: "",
      },
    };

    setResearchGuidance((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName]],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setResearchGuidance((prev) => ({
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

        const response = await fetch(getApiUrl(`/api/professor/research-guidance/${userId}`), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setResearchGuidance({
            pg_guidance: data.pg_guidance || [
              { year: "", degree: "", students_awarded: "", department_centre: "" },
            ],
            phd_guidance: data.phd_guidance || [
              {
                student_name: "",
                registration_date: "",
                registration_no: "",
                thesis_title: "",
                thesis_submitted_status: "",
                thesis_submitted_date: "",
                vivavoce_completed_status: "",
                date_awarded: "",
              },
            ],
            postdoc_guidance: data.postdoc_guidance || [
              {
                scholar_name: "",
                designation: "",
                funding_agency: "",
                fellowship_title: "",
                year_of_joining: "",
                year_of_completion: "",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching research guidance data:", error);
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
            marginBottom: "10px",
            marginTop: '0px'
          }}>
            Research Guidance
          </h1>

          <p style={{ fontSize: "1rem", opacity: 0.8, marginBottom: "30px", marginTop: '0px' }}>
            Manage your research guidance details for postgraduate, Ph.D., and postdoctoral students.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              marginBottom: "30px",
            }}>

              {/* PG Guidance Section */}
              <div style={{ marginTop: "0px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem", marginTop: '0px' }}>
                  Research Guidance - PG
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "5%" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "10%" }}>Year</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "20%" }}>Degree</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "10%" }}>No. of Students Awarded</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "20%" }}>Student Names</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "15%" }}>Student Roll No.</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "15%" }}>Department/Centre</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "5%" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {researchGuidance.pg_guidance.map((pg, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="number"
                              value={pg.year}
                              onChange={(e) => handleArrayChange("pg_guidance", idx, "year", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={pg.degree}
                              onChange={(e) => handleArrayChange("pg_guidance", idx, "degree", e.target.value)}
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
                              value={pg.students_awarded}
                              onChange={(e) => handleArrayChange("pg_guidance", idx, "students_awarded", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={pg.student_names}
                              onChange={(e) => handleArrayChange("pg_guidance", idx, "student_names", e.target.value)}
                              placeholder="Enter student names (comma separated)"
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
                              value={pg.student_roll_no}
                              onChange={(e) => handleArrayChange("pg_guidance", idx, "student_roll_no", e.target.value)}
                              placeholder="Enter roll numbers (comma separated)"
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
                              type="text"
                              value={pg.department_centre}
                              onChange={(e) => handleArrayChange("pg_guidance", idx, "department_centre", e.target.value)}
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
                              onClick={() => removeArrayItem("pg_guidance", idx)}
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
                  onClick={() => addArrayItem("pg_guidance")}
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
                  + Add PG Guidance
                </button>
              </div>

              {/* PhD Guidance Section */}
              <div style={{ marginTop: "60px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                  Research Guidance - Ph.D
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "5%" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "20%" }}>Student Name</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "5%" }}>Registration Date</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "5%" }}>Registration No.</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "40%" }}>Thesis Title</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "5%" }}>Thesis Submitted Status</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "5%" }}>Thesis Submitted Date</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "5%" }}>Vivavoce Completed Status</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "5%" }}>Date Awarded</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "5%" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {researchGuidance.phd_guidance.map((phd, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={phd.student_name}
                              onChange={(e) => handleArrayChange("phd_guidance", idx, "student_name", e.target.value)}
                              style={{
                                width: "80%",
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
                              type="date"
                              value={phd.registration_date}
                              onChange={(e) => handleArrayChange("phd_guidance", idx, "registration_date", e.target.value)}
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
                              value={phd.registration_no}
                              onChange={(e) => handleArrayChange("phd_guidance", idx, "registration_no", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={phd.thesis_title}
                              onChange={(e) => handleArrayChange("phd_guidance", idx, "thesis_title", e.target.value)}
                              style={{
                                width: "80%",
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
                              value={phd.thesis_submitted_status}
                              onChange={(e) => handleArrayChange("phd_guidance", idx, "thesis_submitted_status", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            >
                              <option value="">Select Status</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                              <option value="In Progress">In Progress</option>
                            </select>
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={phd.thesis_submitted_date}
                              onChange={(e) => handleArrayChange("phd_guidance", idx, "thesis_submitted_date", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <select
                              value={phd.vivavoce_completed_status}
                              onChange={(e) => handleArrayChange("phd_guidance", idx, "vivavoce_completed_status", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            >
                              <option value="">Select Status</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                              <option value="Scheduled">Scheduled</option>
                            </select>
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={phd.date_awarded}
                              onChange={(e) => handleArrayChange("phd_guidance", idx, "date_awarded", e.target.value)}
                              style={{
                                width: "80%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeArrayItem("phd_guidance", idx)}
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
                  onClick={() => addArrayItem("phd_guidance")}
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
                  + Add Ph.D Guidance
                </button>
              </div>

              {/* Post-Doctoral Guidance Section */}
              <div style={{ marginTop: "60px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                  Research Guidance - Post Doctoral
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "5%" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "15%" }}>Scholar Name</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "12%" }}>Designation</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "18%" }}>Funding Agency</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "20%" }}>Fellowship Title</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "10%" }}>Year of Joining</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "10%" }}>Year of Completion</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "10%" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {researchGuidance.postdoc_guidance.map((postdoc, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={postdoc.scholar_name}
                              onChange={(e) => handleArrayChange("postdoc_guidance", idx, "scholar_name", e.target.value)}
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
                              type="text"
                              value={postdoc.designation}
                              onChange={(e) => handleArrayChange("postdoc_guidance", idx, "designation", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={postdoc.funding_agency}
                              onChange={(e) => handleArrayChange("postdoc_guidance", idx, "funding_agency", e.target.value)}
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
                              value={postdoc.fellowship_title}
                              onChange={(e) => handleArrayChange("postdoc_guidance", idx, "fellowship_title", e.target.value)}
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
                              value={postdoc.year_of_joining}
                              onChange={(e) => handleArrayChange("postdoc_guidance", idx, "year_of_joining", e.target.value)}
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
                              type="number"
                              value={postdoc.year_of_completion}
                              onChange={(e) => handleArrayChange("postdoc_guidance", idx, "year_of_completion", e.target.value)}
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
                              onClick={() => removeArrayItem("postdoc_guidance", idx)}
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
                  onClick={() => addArrayItem("postdoc_guidance")}
                  style={{
                    background: "#8b5cf6",
                    color: "#fff",
                    border: "none",
                    padding: "12px 24px",
                    marginTop: "15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  + Add Post-Doctoral Guidance
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

export default ResearchGuidanceStudents;
