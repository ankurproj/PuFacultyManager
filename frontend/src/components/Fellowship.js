import React, { useState, useEffect } from "react";
import Layout from "./Layout";

import { getApiUrl } from '../config/api';
function Fellowship() {
  const [fellowships, setFellowships] = useState({
    fellowship_details: [
      {
        fellowship_name: "",
        financial_support: "",
        purpose_of_grant: "",
        stature: "",
        awarding_agency: "",
        year_of_award: "",
        grant_letter: null,
        grant_letter_filename: "",
      },
    ],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        return;
      }

      // Send fellowship data to backend
      const response = await fetch(getApiUrl("/api/professor/fellowship"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(fellowships)
      });

      if (response.ok) {
        const data = await response.json();
        alert("Fellowship details updated successfully!");
        console.log("Fellowship saved:", data.fellowship);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error updating fellowship details");
      }
    } catch (error) {
      console.error("Error saving fellowship details:", error);
      alert("Error saving fellowship details. Please try again.");
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFellowships((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleFileChange = (arrayName, index, field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFellowships((prev) => ({
          ...prev,
          [arrayName]: prev[arrayName].map((item, i) =>
            i === index
              ? {
                  ...item,
                  [field]: reader.result,
                  [`${field}_filename`]: file.name
                }
              : item
          ),
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      fellowship_details: {
        fellowship_name: "",
        financial_support: "",
        purpose_of_grant: "",
        stature: "",
        awarding_agency: "",
        year_of_award: "",
        grant_letter: null,
        grant_letter_filename: "",
      },
    };

    setFellowships((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName]],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFellowships((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    const fetchFellowships = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(getApiUrl("/api/professor/fellowship"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFellowships({
            fellowship_details: data.fellowship_details || [
              {
                fellowship_name: "",
                financial_support: "",
                purpose_of_grant: "",
                stature: "",
                awarding_agency: "",
                year_of_award: "",
                grant_letter: null,
                grant_letter_filename: "",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching fellowship data:", error);
      }
    };

    fetchFellowships();
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
            Fellowship Details
          </h1>
          <p style={{
            fontSize: "1.1rem",
            opacity: 0.8,
            marginBottom: "30px",
            marginTop: "0px"
          }}>
            Update your fellowship and grant information
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              marginBottom: "30px",
            }}>

              {/* Fellowship Details Section */}
              <div style={{ marginTop: "0px" }}>
                <h2 style={{
                  color: "#2d3748",
                  marginBottom: "25px",
                  fontSize: "1.8rem",
                  marginTop: "0px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "Segoe UI, Arial, sans-serif",
                  letterSpacing: "0.5px",
                }}>
                  Fellowship Information
                </h2>

                <div style={{ overflowX: "auto" }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "10px"
                  }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                        <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Fellowship Name</th>
                        <th style={{ width: "150px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Financial Support (INR)</th>
                        <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Purpose of Grant</th>
                        <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Stature</th>
                        <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Awarding Agency</th>
                        <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year of Award</th>
                        <th style={{ width: "150px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Grant/Award Letter</th>
                        <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fellowships.fellowship_details?.map((fellowship, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={fellowship.fellowship_name}
                              onChange={(e) => handleArrayChange("fellowship_details", idx, "fellowship_name", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                fontSize: "0.9rem"
                              }}
                              placeholder="Fellowship Name"
                            />
                          </td>
                          <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="number"
                              value={fellowship.financial_support}
                              onChange={(e) => handleArrayChange("fellowship_details", idx, "financial_support", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                fontSize: "0.9rem"
                              }}
                              placeholder="Amount in INR"
                            />
                          </td>
                          <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                            <textarea
                              value={fellowship.purpose_of_grant}
                              onChange={(e) => handleArrayChange("fellowship_details", idx, "purpose_of_grant", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                fontSize: "0.9rem",
                                minHeight: "60px",
                                resize: "vertical"
                              }}
                              placeholder="Purpose of Grant"
                            />
                          </td>
                          <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                            <select
                              value={fellowship.stature}
                              onChange={(e) => handleArrayChange("fellowship_details", idx, "stature", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                fontSize: "0.9rem"
                              }}
                            >
                              <option value="">Select Stature</option>
                              <option value="National">National</option>
                              <option value="International">International</option>
                            </select>
                          </td>
                          <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="text"
                              value={fellowship.awarding_agency}
                              onChange={(e) => handleArrayChange("fellowship_details", idx, "awarding_agency", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                fontSize: "0.9rem"
                              }}
                              placeholder="Awarding Agency"
                            />
                          </td>
                          <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                            <input
                              type="number"
                              value={fellowship.year_of_award}
                              onChange={(e) => handleArrayChange("fellowship_details", idx, "year_of_award", e.target.value)}
                              style={{
                                width: "90%",
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                fontSize: "0.9rem"
                              }}
                              placeholder="Year"
                            />
                          </td>
                          <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange("fellowship_details", idx, "grant_letter", e.target.files[0])}
                                style={{
                                  width: "100%",
                                  padding: "4px",
                                  fontSize: "0.8rem",
                                  borderRadius: "4px",
                                  border: "1px solid #e2e8f0"
                                }}
                              />
                              {fellowship.grant_letter_filename && (
                                <span style={{
                                  fontSize: "0.7rem",
                                  color: "#059669",
                                  wordBreak: "break-word"
                                }}>
                                  📎 {fellowship.grant_letter_filename}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeArrayItem("fellowship_details", idx)}
                              style={{
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                fontSize: "0.7rem",
                                cursor: "pointer",
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
                  onClick={() => addArrayItem("fellowship_details")}
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  + Add Fellowship Entry
                </button>
              </div>

              {/* Submit Button */}
              <div style={{
                marginTop: "50px",
                display: "flex",
                justifyContent: "center",
              }}>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "16px 40px",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 12px 35px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.3)";
                  }}
                >
                  Update Fellowship Details
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default Fellowship;