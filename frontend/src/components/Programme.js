import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";

import { getApiUrl } from '../config/api';
function Programme() {
  const [programmeData, setProgrammeData] = useState({
    faculty_development_programme: [
      {
        title_fdp: "",
        organiser: "",
        venue: "",
        duration: "",
        from_date: "",
        to_date: "",
        year: "",
      },
    ],
    executive_development_programme: [
      {
        name_programme: "",
        no_participants: "",
        venue: "",
        duration: "",
        from_date: "",
        to_date: "",
        year: "",
        revenue_generated: "",
      },
    ],
    participation_impress_imprint: [
      {
        programme_type: "",
        place: "",
        from_date: "",
        to_date: "",
        year: "",
      },
    ],
    enrolment_arpit_programme: [
      {
        name_programme: "",
        period_from: "",
        period_to: "",
      },
    ],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      const response = await fetch(getApiUrl(`/api/professor/programme/${userId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(programmeData),
      });

      if (response.ok) {
        alert("Programme data updated successfully!");
      } else {
        throw new Error("Failed to update programme data");
      }
    } catch (error) {
      console.error("Error updating programme data:", error);
      alert("Error updating programme data");
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setProgrammeData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      faculty_development_programme: {
        title_fdp: "",
        organiser: "",
        venue: "",
        duration: "",
        from_date: "",
        to_date: "",
        year: "",
      },
      executive_development_programme: {
        name_programme: "",
        no_participants: "",
        venue: "",
        duration: "",
        from_date: "",
        to_date: "",
        year: "",
        revenue_generated: "",
      },
      participation_impress_imprint: {
        programme_type: "",
        place: "",
        from_date: "",
        to_date: "",
        year: "",
      },
      enrolment_arpit_programme: {
        name_programme: "",
        period_from: "",
        period_to: "",
      },
    };

    setProgrammeData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName]],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setProgrammeData((prev) => ({
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

        const response = await fetch(getApiUrl(`/api/professor/programme/${userId}`), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProgrammeData({
            faculty_development_programme: data.faculty_development_programme || [
              {
                title_fdp: "",
                organiser: "",
                venue: "",
                duration: "",
                from_date: "",
                to_date: "",
                year: "",
              },
            ],
            executive_development_programme: data.executive_development_programme || [
              {
                name_programme: "",
                no_participants: "",
                venue: "",
                duration: "",
                from_date: "",
                to_date: "",
                year: "",
                revenue_generated: "",
              },
            ],
            participation_impress_imprint: data.participation_impress_imprint || [
              {
                programme_type: "",
                place: "",
                from_date: "",
                to_date: "",
                year: "",
              },
            ],
            enrolment_arpit_programme: data.enrolment_arpit_programme || [
              {
                name_programme: "",
                period_from: "",
                period_to: "",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching programme data:", error);
      }
    };

    fetchData();
  }, []);

  const programmeTypeOptions = [
    "IMPRESS",
    "IMPRINT",
    "SPARC",
    "STARS",
    "LEAP",
    "Others"
  ];

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
            Programme Details
          </h1>

          <p style={{ marginBottom: "20px", opacity: 0.8, marginTop: '0px' }}>Update the details of the programmes you have attended.</p>

          <form onSubmit={handleSubmit}>
            <div style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              marginBottom: "30px",
            }}>

              {/* Faculty Development Programme Section */}
              <div style={{ marginTop: "0px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem", marginTop: '0px' }}>
                  Faculty Development Programme Attended (Professional Development Programmes, Orientation, Induction Programmes, Refresher Course, Other Short Term Courses)
                </h2>
                <div style={{  }}>
                  <table style={{ width: "100%", borderCollapse: "collapse",  }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Title of the FDP</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Organiser</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Venue</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Duration</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>From Date</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>To Date</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Year</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programmeData.faculty_development_programme.map((programme, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={programme.title_fdp}
                              onChange={(e) => handleArrayChange("faculty_development_programme", idx, "title_fdp", e.target.value)}
                              placeholder="e.g., Orientation Programme, Refresher Course"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={programme.organiser}
                              onChange={(e) => handleArrayChange("faculty_development_programme", idx, "organiser", e.target.value)}
                              placeholder="Organizing Institution/Body"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={programme.venue}
                              onChange={(e) => handleArrayChange("faculty_development_programme", idx, "venue", e.target.value)}
                              placeholder="Programme Venue"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={programme.duration}
                              onChange={(e) => handleArrayChange("faculty_development_programme", idx, "duration", e.target.value)}
                              placeholder="e.g., 5 days, 2 weeks"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={programme.from_date}
                              onChange={(e) => handleArrayChange("faculty_development_programme", idx, "from_date", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={programme.to_date}
                              onChange={(e) => handleArrayChange("faculty_development_programme", idx, "to_date", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="number"
                              value={programme.year}
                              onChange={(e) => handleArrayChange("faculty_development_programme", idx, "year", e.target.value)}
                              placeholder="YYYY"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeArrayItem("faculty_development_programme", idx)}
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
                  onClick={() => addArrayItem("faculty_development_programme")}
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
                  + Add FDP Entry
                </button>
              </div>

              {/* Executive Development Programme Section */}
              <div style={{ marginTop: "60px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                  Details of Executive Development Prog/Management Development Prog. Conducted
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1600px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Name of the Programme</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>No. of Participants</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Venue</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Duration</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>From Date</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>To Date</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Year</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Revenue Generated</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programmeData.executive_development_programme.map((programme, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={programme.name_programme}
                              onChange={(e) => handleArrayChange("executive_development_programme", idx, "name_programme", e.target.value)}
                              placeholder="Executive/Management Development Programme Name"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="number"
                              value={programme.no_participants}
                              onChange={(e) => handleArrayChange("executive_development_programme", idx, "no_participants", e.target.value)}
                              placeholder="Number"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={programme.venue}
                              onChange={(e) => handleArrayChange("executive_development_programme", idx, "venue", e.target.value)}
                              placeholder="Programme Venue"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={programme.duration}
                              onChange={(e) => handleArrayChange("executive_development_programme", idx, "duration", e.target.value)}
                              placeholder="e.g., 3 days, 1 week"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={programme.from_date}
                              onChange={(e) => handleArrayChange("executive_development_programme", idx, "from_date", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={programme.to_date}
                              onChange={(e) => handleArrayChange("executive_development_programme", idx, "to_date", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="number"
                              value={programme.year}
                              onChange={(e) => handleArrayChange("executive_development_programme", idx, "year", e.target.value)}
                              placeholder="YYYY"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="number"
                              value={programme.revenue_generated}
                              onChange={(e) => handleArrayChange("executive_development_programme", idx, "revenue_generated", e.target.value)}
                              placeholder="Amount in ₹"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeArrayItem("executive_development_programme", idx)}
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
                  onClick={() => addArrayItem("executive_development_programme")}
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
                  + Add Executive Development Programme Entry
                </button>
              </div>

              {/* Participation in IMPRESS, IMPRINT, etc. Section */}
              <div style={{ marginTop: "60px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                  Participation in IMPRESS, IMPRINT, SPARC, STARS, LEAP Programme etc and DSF Funding Programme
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>IMPRESS/IMPRINT/SPARC/STARS/LEAP/Others</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Place</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>From Date</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>To Date</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Year</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programmeData.participation_impress_imprint.map((programme, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <select
                              value={programme.programme_type}
                              onChange={(e) => handleArrayChange("participation_impress_imprint", idx, "programme_type", e.target.value)}
                              style={{
                                width: "95%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            >
                              <option value="">Select Programme Type</option>
                              {programmeTypeOptions.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={programme.place}
                              onChange={(e) => handleArrayChange("participation_impress_imprint", idx, "place", e.target.value)}
                              placeholder="Place/Location"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={programme.from_date}
                              onChange={(e) => handleArrayChange("participation_impress_imprint", idx, "from_date", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={programme.to_date}
                              onChange={(e) => handleArrayChange("participation_impress_imprint", idx, "to_date", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="number"
                              value={programme.year}
                              onChange={(e) => handleArrayChange("participation_impress_imprint", idx, "year", e.target.value)}
                              placeholder="YYYY"
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeArrayItem("participation_impress_imprint", idx)}
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
                  onClick={() => addArrayItem("participation_impress_imprint")}
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
                  + Add Programme Participation Entry
                </button>
              </div>

              {/* Enrolment under ARPIT Programme Section */}
              <div style={{ marginTop: "60px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                  Enrolment under ARPIT Programme
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Name of the Programme</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Period From Date</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Period To Date</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programmeData.enrolment_arpit_programme.map((programme, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={programme.name_programme}
                              onChange={(e) => handleArrayChange("enrolment_arpit_programme", idx, "name_programme", e.target.value)}
                              placeholder="ARPIT Programme Name"
                              style={{
                                width: "95%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={programme.period_from}
                              onChange={(e) => handleArrayChange("enrolment_arpit_programme", idx, "period_from", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={programme.period_to}
                              onChange={(e) => handleArrayChange("enrolment_arpit_programme", idx, "period_to", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "1rem"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeArrayItem("enrolment_arpit_programme", idx)}
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
                  onClick={() => addArrayItem("enrolment_arpit_programme")}
                  style={{
                    background: "#f59e0b",
                    color: "#fff",
                    border: "none",
                    padding: "12px 24px",
                    marginTop: "15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  + Add ARPIT Programme Entry
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

export default Programme;