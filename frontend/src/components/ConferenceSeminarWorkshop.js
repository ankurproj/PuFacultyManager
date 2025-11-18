import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";

import { getApiUrl } from '../config/api';
function ConferenceSeminarWorkshop() {
  const [conferenceData, setConferenceData] = useState({
    invited_talks: [
      {
        title_of_paper: "",
        conferences_seminar_workshop_training: "",
        organized_by: "",
        level: "",
        from_date: "",
        to_date: "",
        year: "",
      },
    ],
    conferences_seminars_workshops_organized: [
      {
        title_of_programme: "",
        type: "",
        sponsors: "",
        venue_duration: "",
        level: "",
        from_date: "",
        to_date: "",
        year: "",
      },
    ],
    conferences_seminars_workshops_participated: [
      {
        title_of_programme: "",
        type: "",
        organized_by: "",
        venue_duration: "",
        level: "",
        from_date: "",
        to_date: "",
        year: "",
      },
    ],
    financial_support: [
      {
        title_conference_workshop: "",
        amount_provided: "",
        purpose: "",
        from_date: "",
        to_date: "",
      },
    ],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      const response = await fetch(getApiUrl(`/api/professor/conference-seminar-workshop/${userId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(conferenceData),
      });

      if (response.ok) {
        alert("Conference/Seminar/Workshop updated successfully!");
      } else {
        throw new Error("Failed to update conference/seminar/workshop");
      }
    } catch (error) {
      console.error("Error updating conference/seminar/workshop:", error);
      alert("Error updating conference/seminar/workshop");
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setConferenceData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      invited_talks: {
        title_of_paper: "",
        conferences_seminar_workshop_training: "",
        organized_by: "",
        level: "",
        from_date: "",
        to_date: "",
        year: "",
      },
      conferences_seminars_workshops_organized: {
        title_of_programme: "",
        type: "",
        sponsors: "",
        venue_duration: "",
        level: "",
        from_date: "",
        to_date: "",
        year: "",
      },
      conferences_seminars_workshops_participated: {
        title_of_programme: "",
        type: "",
        organized_by: "",
        venue_duration: "",
        level: "",
        from_date: "",
        to_date: "",
        year: "",
      },
      financial_support: {
        title_conference_workshop: "",
        amount_provided: "",
        purpose: "",
        from_date: "",
        to_date: "",
      },
    };

    setConferenceData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName]],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setConferenceData((prev) => ({
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

        const response = await fetch(getApiUrl(`/api/professor/conference-seminar-workshop/${userId}`), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setConferenceData({
            invited_talks: data.invited_talks || [
              {
                title_of_paper: "",
                conferences_seminar_workshop_training: "",
                organized_by: "",
                level: "",
                from_date: "",
                to_date: "",
                year: "",
              },
            ],
            conferences_seminars_workshops_organized: data.conferences_seminars_workshops_organized || data.conferences_seminars_organized || [
              {
                title_of_programme: "",
                type: "",
                sponsors: "",
                venue_duration: "",
                level: "",
                from_date: "",
                to_date: "",
                year: "",
              },
            ],
            conferences_seminars_workshops_participated: data.conferences_seminars_workshops_participated || [
              {
                title_of_programme: "",
                type: "",
                organized_by: "",
                venue_duration: "",
                level: "",
                from_date: "",
                to_date: "",
                year: "",
              },
            ],
            financial_support: data.financial_support || [
              {
                title_conference_workshop: "",
                amount_provided: "",
                purpose: "",
                from_date: "",
                to_date: "",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching conference/seminar/workshop data:", error);
      }
    };

    fetchData();
  }, []);

  const levelOptions = [
    "International",
    "National",
    "State",
    "Regional",
    "College",
    "University"
  ];

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
            Conference/Seminar/Workshop
          </h1>
          <p style={{ fontSize: "1rem", opacity:0.8, marginBottom: "30px", marginTop: "0px" }}>Update your details for the Conference/Seminar/Workshop</p>

          <form onSubmit={handleSubmit}>
            <div style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              marginBottom: "30px",
            }}>

              {/* Invited Talks Section */}
              <div style={{ marginTop: "0px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem", marginTop: "0px" }}>
                  Invited Talks in Conference/Seminar/Workshop/Training Programme
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Title of the Paper</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "15%" }}>Conferences/ Seminar/ Workshop/  Training Programme</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Organized by</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: "10%" }}>Level</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>From</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>To</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600", width: '7%' }}>Year</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conferenceData.invited_talks.map((talk, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={talk.title_of_paper}
                              onChange={(e) => handleArrayChange("invited_talks", idx, "title_of_paper", e.target.value)}
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
                              value={talk.conferences_seminar_workshop_training}
                              onChange={(e) => handleArrayChange("invited_talks", idx, "conferences_seminar_workshop_training", e.target.value)}
                              style={{
                                width: "95%",
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
                              value={talk.organized_by}
                              onChange={(e) => handleArrayChange("invited_talks", idx, "organized_by", e.target.value)}
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
                            <select
                              value={talk.level}
                              onChange={(e) => handleArrayChange("invited_talks", idx, "level", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            >
                              <option value="">Select Level</option>
                              {levelOptions.map(level => (
                                <option key={level} value={level}>{level}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={talk.from_date}
                              onChange={(e) => handleArrayChange("invited_talks", idx, "from_date", e.target.value)}
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
                              value={talk.to_date}
                              onChange={(e) => handleArrayChange("invited_talks", idx, "to_date", e.target.value)}
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
                              value={talk.year}
                              onChange={(e) => handleArrayChange("invited_talks", idx, "year", e.target.value)}
                              style={{
                                width: "85%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeArrayItem("invited_talks", idx)}
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
                  onClick={() => addArrayItem("invited_talks")}
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
                  + Add Invited Talk Entry
                </button>
              </div>

              {/* Conferences/Seminars Organized Section */}
              <div style={{ marginTop: "60px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                  Conferences/Seminars/Workshop Organized
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Title of the Programme</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Type</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Sponsors</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Venue & Duration</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Level</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>From</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>To</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Year</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conferenceData.conferences_seminars_workshops_organized.map((conference, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={conference.title_of_programme}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_organized", idx, "title_of_programme", e.target.value)}
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
                              value={conference.type}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_organized", idx, "type", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            >
                              <option value="">Select Type</option>
                              <option value="Conference">Conference</option>
                              <option value="Seminar">Seminar</option>
                              <option value="Workshop">Workshop</option>
                            </select>
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={conference.sponsors}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_organized", idx, "sponsors", e.target.value)}
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
                              value={conference.venue_duration}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_organized", idx, "venue_duration", e.target.value)}
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
                              value={conference.level}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_organized", idx, "level", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            >
                              <option value="">Select Level</option>
                              {levelOptions.map(level => (
                                <option key={level} value={level}>{level}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={conference.from_date}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_organized", idx, "from_date", e.target.value)}
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
                              value={conference.to_date}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_organized", idx, "to_date", e.target.value)}
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
                              value={conference.year}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_organized", idx, "year", e.target.value)}
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
                              onClick={() => removeArrayItem("conferences_seminars_workshops_organized", idx)}
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
                  onClick={() => addArrayItem("conferences_seminars_workshops_organized")}
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
                  + Add Conference/Seminar Entry
                </button>
              </div>

              {/* Workshop Organized Section */}
              <div style={{ marginTop: "60px" }}>
                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                  Conferences/Seminars/Workshop Participated
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1300px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Title of the Programme</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Type</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Organized By</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Venue & Duration</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Level</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>From</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>To</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Year</th>
                        <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conferenceData.conferences_seminars_workshops_participated.map((conference, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={conference.title_of_programme}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_participated", idx, "title_of_programme", e.target.value)}
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
                              value={conference.type}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_participated", idx, "type", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            >
                              <option value="">Select Type</option>
                              <option value="Conference">Conference</option>
                              <option value="Seminar">Seminar</option>
                              <option value="Workshop">Workshop</option>
                            </select>
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={conference.organized_by}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_participated", idx, "organized_by", e.target.value)}
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
                              value={conference.venue_duration}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_participated", idx, "venue_duration", e.target.value)}
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
                              value={conference.level}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_participated", idx, "level", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                            >
                              <option value="">Select Level</option>
                              {levelOptions.map(level => (
                                <option key={level} value={level}>{level}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={conference.from_date}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_participated", idx, "from_date", e.target.value)}
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
                              value={conference.to_date}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_participated", idx, "to_date", e.target.value)}
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
                              value={conference.year}
                              onChange={(e) => handleArrayChange("conferences_seminars_workshops_participated", idx, "year", e.target.value)}
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
                              onClick={() => removeArrayItem("conferences_seminars_workshops_participated", idx)}
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
                  onClick={() => addArrayItem("conferences_seminars_workshops_participated")}
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
                  + Add Participated Entry
                </button>
              </div>

              {/* Financial Support Section */}
              <div style={{ marginTop: "40px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px", color: "#2d3748" }}>
                  Financial Support
                </h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                    <thead>
                      <tr style={{ background: "#f8f9fa" }}>
                        <th style={{ padding: "15px", border: "1px solid #e2e8f0", fontWeight: "600", textAlign: "left" }}>S.No</th>
                        <th style={{ padding: "15px", border: "1px solid #e2e8f0", fontWeight: "600", textAlign: "left" }}>Title of the Conference/Workshop/Professional Body</th>
                        <th style={{ padding: "15px", border: "1px solid #e2e8f0", fontWeight: "600", textAlign: "left" }}>Amount provided by the HEI</th>
                        <th style={{ padding: "15px", border: "1px solid #e2e8f0", fontWeight: "600", textAlign: "left" }}>Purpose</th>
                        <th style={{ padding: "15px", border: "1px solid #e2e8f0", fontWeight: "600", textAlign: "left" }}>From</th>
                        <th style={{ padding: "15px", border: "1px solid #e2e8f0", fontWeight: "600", textAlign: "left" }}>To</th>
                        <th style={{ padding: "15px", border: "1px solid #e2e8f0", fontWeight: "600", textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conferenceData.financial_support.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={item.title_conference_workshop}
                              onChange={(e) => handleArrayChange("financial_support", idx, "title_conference_workshop", e.target.value)}
                              style={{
                                width: "95%",
                                height: "60px",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                resize: "vertical",
                                overflow: "auto",
                                fontFamily: "inherit",
                                fontSize: "1rem"
                              }}
                              placeholder="Conference/Workshop/Professional Body Title"
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="number"
                              value={item.amount_provided}
                              onChange={(e) => handleArrayChange("financial_support", idx, "amount_provided", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px"
                              }}
                              placeholder="Amount in INR"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <select
                              value={item.purpose}
                              onChange={(e) => handleArrayChange("financial_support", idx, "purpose", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                backgroundColor: "white"
                              }}
                            >
                              <option value="">Select Purpose</option>
                              <option value="Membership Fee">Membership Fee</option>
                              <option value="Travel and Other Expenses">Travel and Other Expenses</option>
                              <option value="Registration Fee">Registration Fee</option>
                            </select>
                          </td>
                          <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="date"
                              value={item.from_date}
                              onChange={(e) => handleArrayChange("financial_support", idx, "from_date", e.target.value)}
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
                              value={item.to_date}
                              onChange={(e) => handleArrayChange("financial_support", idx, "to_date", e.target.value)}
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
                              onClick={() => removeArrayItem("financial_support", idx)}
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
                  onClick={() => addArrayItem("financial_support")}
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
                  + Add Financial Support Entry
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

export default ConferenceSeminarWorkshop;