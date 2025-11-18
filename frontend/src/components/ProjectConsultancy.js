import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";

import { getApiUrl } from '../config/api';
function ProjectConsultancy() {
  const [projectConsultancy, setProjectConsultancy] = useState({
    ongoing_projects: [
      {
        title_of_project: "",
        sponsored_by: "",
        period: "",
        sanctioned_amount: "",
        year: "",
      },
    ],
    ongoing_consultancy_works: [
      {
        title_of_consultancy_work: "",
        sponsored_by: "",
        period: "",
        sanctioned_amount: "",
        year: "",
      },
    ],
    completed_projects: [
      {
        title_of_project: "",
        sponsored_by: "",
        period: "",
        sanctioned_amount: "",
        year: "",
      },
    ],
    completed_consultancy_works: [
      {
        title_of_consultancy_work: "",
        sponsored_by: "",
        period: "",
        sanctioned_amount: "",
        year: "",
      },
    ],
    research_projects_funded: [
      {
        pi_name: "",
        project_title: "",
        funding_agency: "",
        duration: "",
        year_of_award: "",
        amount: "",
      },
    ],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      const response = await fetch(getApiUrl(`/api/professor/project-consultancy/${userId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectConsultancy),
      });

      if (response.ok) {
        alert("Project & Consultancy updated successfully!");
      } else {
        throw new Error("Failed to update project & consultancy");
      }
    } catch (error) {
      console.error("Error updating project & consultancy:", error);
      alert("Error updating project & consultancy");
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setProjectConsultancy((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      ongoing_projects: {
        title_of_project: "",
        sponsored_by: "",
        period: "",
        sanctioned_amount: "",
        year: "",
      },
      ongoing_consultancy_works: {
        title_of_consultancy_work: "",
        sponsored_by: "",
        period: "",
        sanctioned_amount: "",
        year: "",
      },
      completed_projects: {
        title_of_project: "",
        sponsored_by: "",
        period: "",
        sanctioned_amount: "",
        year: "",
      },
      completed_consultancy_works: {
        title_of_consultancy_work: "",
        sponsored_by: "",
        period: "",
        sanctioned_amount: "",
        year: "",
      },
      research_projects_funded: {
        pi_name: "",
        project_title: "",
        funding_agency: "",
        duration: "",
        year_of_award: "",
        amount: "",
      },
    };

    setProjectConsultancy((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName]],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setProjectConsultancy((prev) => ({
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

        const response = await fetch(getApiUrl(`/api/professor/project-consultancy/${userId}`), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Project Consultancy API Response:', data);
          console.log('📚 Ongoing Projects:', data.ongoing_projects?.length || 0);
          console.log('📚 Completed Projects:', data.completed_projects?.length || 0);
          console.log('💼 Ongoing Consultancy:', data.ongoing_consultancy_works?.length || 0);
          console.log('💼 Completed Consultancy:', data.completed_consultancy_works?.length || 0);
          console.log('🔍 First ongoing project:', data.ongoing_projects?.[0]);
          console.log('🔍 Project title:', data.ongoing_projects?.[0]?.title_of_project);
          setProjectConsultancy({
            ongoing_projects: data.ongoing_projects || [
              { title_of_project: "", sponsored_by: "", period: "", sanctioned_amount: "", year: "" },
            ],
            ongoing_consultancy_works: data.ongoing_consultancy_works || [
              { title_of_consultancy_work: "", sponsored_by: "", period: "", sanctioned_amount: "", year: "" },
            ],
            completed_projects: data.completed_projects || [
              { title_of_project: "", sponsored_by: "", period: "", sanctioned_amount: "", year: "" },
            ],
            completed_consultancy_works: data.completed_consultancy_works || [
              { title_of_consultancy_work: "", sponsored_by: "", period: "", sanctioned_amount: "", year: "" },
            ],
            research_projects_funded: data.research_projects_funded || [
              { pi_name: "", project_title: "", funding_agency: "", duration: "", year_of_award: "", amount: "" },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching project consultancy data:", error);
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
            marginTop: "0px"
          }}>
            Project & Consultancy
          </h1>

          <p style={{ opacity: 0.8, marginTop: '0px', marginBottom: "30px", fontSize: "1.1rem" }}>
            Manage your ongoing and completed projects and consultancy works here.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              marginBottom: "30px",
            }}>

              {/* Ongoing Projects Section */}
              <div style={{ marginTop: "0px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem", marginTop: '0px' }}>
                  Ongoing Projects
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Title of the Project</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Sponsored By</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Period</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Sanctioned Amount (Rs. Lakh)</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Year</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {console.log('🎨 Rendering ongoing projects table:', projectConsultancy.ongoing_projects?.length, 'items')}
                      {console.log('🔍 First ongoing project in state:', projectConsultancy.ongoing_projects?.[0])}
                      {projectConsultancy.ongoing_projects.map((project, idx) => (
                        console.log(`🔢 Rendering ongoing project row ${idx}:`, project?.title_of_project),
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={project.title_of_project || ''}
                              onChange={(e) => handleArrayChange("ongoing_projects", idx, "title_of_project", e.target.value)}
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
                              value={project.sponsored_by}
                              onChange={(e) => handleArrayChange("ongoing_projects", idx, "sponsored_by", e.target.value)}
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
                              value={project.period}
                              onChange={(e) => handleArrayChange("ongoing_projects", idx, "period", e.target.value)}
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
                              step="0.01"
                              value={project.sanctioned_amount}
                              onChange={(e) => handleArrayChange("ongoing_projects", idx, "sanctioned_amount", e.target.value)}
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
                              value={project.year}
                              onChange={(e) => handleArrayChange("ongoing_projects", idx, "year", e.target.value)}
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
                              onClick={() => removeArrayItem("ongoing_projects", idx)}
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
                  onClick={() => addArrayItem("ongoing_projects")}
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
                  + Add Ongoing Project
                </button>
              </div>

              {/* Ongoing Consultancy Works Section */}
              <div style={{ marginTop: "60px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                 Ongoing Consultancy Works
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Title of the Consultancy Work</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Sponsored By</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Period</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Sanctioned Amount (Rs. Lakh)</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Year</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectConsultancy.ongoing_consultancy_works.map((consultancy, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={consultancy.title_of_consultancy_work}
                              onChange={(e) => handleArrayChange("ongoing_consultancy_works", idx, "title_of_consultancy_work", e.target.value)}
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
                              value={consultancy.sponsored_by}
                              onChange={(e) => handleArrayChange("ongoing_consultancy_works", idx, "sponsored_by", e.target.value)}
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
                              value={consultancy.period}
                              onChange={(e) => handleArrayChange("ongoing_consultancy_works", idx, "period", e.target.value)}
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
                              step="0.01"
                              value={consultancy.sanctioned_amount}
                              onChange={(e) => handleArrayChange("ongoing_consultancy_works", idx, "sanctioned_amount", e.target.value)}
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
                              value={consultancy.year}
                              onChange={(e) => handleArrayChange("ongoing_consultancy_works", idx, "year", e.target.value)}
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
                              onClick={() => removeArrayItem("ongoing_consultancy_works", idx)}
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
                  onClick={() => addArrayItem("ongoing_consultancy_works")}
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
                  + Add Ongoing Consultancy Work
                </button>
              </div>

              {/* Completed Projects Section */}
              <div style={{ marginTop: "60px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                  Completed Projects
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Title of the Project</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Sponsored By</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Period</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Sanctioned Amount (Rs. Lakh)</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Year</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectConsultancy.completed_projects.map((project, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={project.title_of_project}
                              onChange={(e) => handleArrayChange("completed_projects", idx, "title_of_project", e.target.value)}
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
                              value={project.sponsored_by}
                              onChange={(e) => handleArrayChange("completed_projects", idx, "sponsored_by", e.target.value)}
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
                              value={project.period}
                              onChange={(e) => handleArrayChange("completed_projects", idx, "period", e.target.value)}
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
                              step="0.01"
                              value={project.sanctioned_amount}
                              onChange={(e) => handleArrayChange("completed_projects", idx, "sanctioned_amount", e.target.value)}
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
                              value={project.year}
                              onChange={(e) => handleArrayChange("completed_projects", idx, "year", e.target.value)}
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
                              onClick={() => removeArrayItem("completed_projects", idx)}
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
                  onClick={() => addArrayItem("completed_projects")}
                  style={{
                    background: "#059669",
                    color: "#fff",
                    border: "none",
                    padding: "12px 24px",
                    marginTop: "15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  + Add Completed Project
                </button>
              </div>

              {/* Completed Consultancy Works Section */}
              <div style={{ marginTop: "60px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                  Completed Consultancy Works
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Title of the Consultancy Work</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Sponsored By</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Period</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Sanctioned Amount (Rs. Lakh)</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Year</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectConsultancy.completed_consultancy_works.map((consultancy, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={consultancy.title_of_consultancy_work}
                              onChange={(e) => handleArrayChange("completed_consultancy_works", idx, "title_of_consultancy_work", e.target.value)}
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
                              value={consultancy.sponsored_by}
                              onChange={(e) => handleArrayChange("completed_consultancy_works", idx, "sponsored_by", e.target.value)}
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
                              value={consultancy.period}
                              onChange={(e) => handleArrayChange("completed_consultancy_works", idx, "period", e.target.value)}
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
                              step="0.01"
                              value={consultancy.sanctioned_amount}
                              onChange={(e) => handleArrayChange("completed_consultancy_works", idx, "sanctioned_amount", e.target.value)}
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
                              value={consultancy.year}
                              onChange={(e) => handleArrayChange("completed_consultancy_works", idx, "year", e.target.value)}
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
                              onClick={() => removeArrayItem("completed_consultancy_works", idx)}
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
                  onClick={() => addArrayItem("completed_consultancy_works")}
                  style={{
                    background: "#7c3aed",
                    color: "#fff",
                    border: "none",
                    padding: "12px 24px",
                    marginTop: "15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  + Add Completed Consultancy Work
                </button>
              </div>

              {/* Research Projects Funded Table */}
              <div style={{ marginTop: "40px" }}>
                <h2 style={{ color: "#2d3748",marginBottom: "20px", fontSize: "1.8rem", fontWeight: "700" }}>
                  Research Projects funded by Government, Non-Government, Industry, Corporate Houses, International Bodies
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Name of PI/Co-PI/Chair Holder</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Title of Research Project/Endowments/Research Chairs</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Name of Funding Agency</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Duration</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Year of Award/Sanction</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Amount (INR)</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(projectConsultancy.research_projects_funded || []).map((project, index) => (
                        <tr key={index} style={{ background: index % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{index + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={project.pi_name}
                              onChange={(e) => handleArrayChange("research_projects_funded", index, "pi_name", e.target.value)}
                              style={{
                                width: "90%",
                                height: "60px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                padding: "8px",
                                resize: "vertical",
                                overflow: "auto",
                                fontFamily: "inherit",
                                fontSize: "1rem"
                              }}
                              placeholder="Enter PI/Co-PI/Chair holder name"
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={project.project_title}
                              onChange={(e) => handleArrayChange("research_projects_funded", index, "project_title", e.target.value)}
                              style={{
                                width: "95%",
                                height: "60px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                padding: "8px",
                                resize: "vertical",
                                overflow: "auto",
                                fontFamily: "inherit",
                                fontSize: "1rem"
                              }}
                              placeholder="Enter project title"
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={project.funding_agency}
                              onChange={(e) => handleArrayChange("research_projects_funded", index, "funding_agency", e.target.value)}
                              style={{
                                width: "90%",
                                height: "60px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                padding: "8px",
                                resize: "vertical",
                                overflow: "auto",
                                fontFamily: "inherit",
                                fontSize: "1rem"
                              }}
                              placeholder="Enter funding agency"
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={project.duration}
                              onChange={(e) => handleArrayChange("research_projects_funded", index, "duration", e.target.value)}
                              style={{
                                width: "90%",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                padding: "8px"
                              }}
                              placeholder="e.g., 2 years"
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={project.year_of_award}
                              onChange={(e) => handleArrayChange("research_projects_funded", index, "year_of_award", e.target.value)}
                              style={{
                                width: "90%",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                padding: "8px"
                              }}
                              placeholder="Enter year"
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={project.amount}
                              onChange={(e) => handleArrayChange("research_projects_funded", index, "amount", e.target.value)}
                              style={{
                                width: "90%",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                padding: "8px"
                              }}
                              placeholder="Enter amount in INR"
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeArrayItem("research_projects_funded", index)}
                              style={{
                                background: "#dc2626",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 12px",
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
                  onClick={() => addArrayItem("research_projects_funded")}
                  style={{
                    background: "#7c3aed",
                    color: "#fff",
                    border: "none",
                    padding: "12px 24px",
                    marginTop: "15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  + Add Research Project
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

export default ProjectConsultancy;