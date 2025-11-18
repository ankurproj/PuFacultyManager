import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";

import { getApiUrl } from '../config/api';
function MOU() {
  const [mou, setMou] = useState({
    functional_mous: [
      {
        organization_name: "",
        duration: "",
        purpose: "",
        activities: "",
        date: "",
      },
    ],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setMou((prev) => ({
          ...prev,
          name: decoded.name || "",
          email: decoded.email || "",
        }));
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    fetchMouData();
  }, []);

  const fetchMouData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl("/api/professor/mou"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMou(data);
      }
    } catch (error) {
      console.error("Error fetching MOU data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl("/api/professor/mou"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mou),
      });

      if (response.ok) {
        alert("MOU data updated successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update MOU data");
      }
    } catch (error) {
      console.error("Error updating MOU:", error);
      alert("Error updating MOU data");
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setMou((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      functional_mous: {
        organization_name: "",
        duration: "",
        purpose: "",
        activities: "",
        date: "",
      },
    };

    setMou((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName] || {}],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setMou((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  return (
    <Layout>
      <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
        <div style={{ padding: "10px 30px 30px" }}>
            <h1
                style={{
                            fontSize: "2.5rem",
                            fontWeight: 800,
                            color: "#1a202c",
                            marginBottom: "10px",
                            fontFamily: "Segoe UI, Arial, sans-serif",
                            letterSpacing: "1px",
                            marginBottom: "10px",
                            marginTop: "0px"
                        }}
            >
                Functional MOUs with Institutions/Industries (India/Abroad)
            </h1>
            <p
                style={{
                            fontSize: "1.1rem",
                            opacity: 0.8,
                            marginBottom: "30px",
                            marginTop: "0px"
                        }}
            >
                Manage your MOU and collaboration agreements
            </p>
            <form onSubmit={handleSubmit}>
            <div
                style={{
                backgroundColor: "#fff",
                borderRadius: "15px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "40px",
                marginBottom: "30px",
                }}
            >


                {/* Functional MOUs Section */}
                <div style={{ marginTop: "0px" }}>
                <h2
                    style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: "25px",
                    marginTop: "0px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "Segoe UI, Arial, sans-serif",
                    letterSpacing: "0.5px",
                    }}
                >
                    Functional MOUs
                </h2>
                <table
                    style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "10px",
                    }}
                >
                    <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                        <th style={{ width: "250px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Name of the organization with whom MOU/Collaboration being signed</th>
                        <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Duration</th>
                        <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Purpose of MOU/Collaboration</th>
                        <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Activities</th>
                        <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Date</th>
                        <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}></th>
                    </tr>
                    </thead>
                    <tbody>
                    {mou.functional_mous.map((item, idx) => (
                        <tr key={idx}>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                            <input
                            type="text"
                            value={item.organization_name}
                            onChange={(e) => handleArrayChange("functional_mous", idx, "organization_name", e.target.value)}
                            style={{ width: "95%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            placeholder="Organization Name"
                            />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                            <input
                            type="text"
                            value={item.duration}
                            onChange={(e) => handleArrayChange("functional_mous", idx, "duration", e.target.value)}
                            style={{ width: "90%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            placeholder="Duration"
                            />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                            <textarea
                            value={item.purpose}
                            onChange={(e) => handleArrayChange("functional_mous", idx, "purpose", e.target.value)}
                            style={{ width: "95%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem", minHeight: "60px", resize: "vertical" }}
                            placeholder="Purpose of MOU/Collaboration"
                            />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                            <textarea
                            value={item.activities}
                            onChange={(e) => handleArrayChange("functional_mous", idx, "activities", e.target.value)}
                            style={{ width: "95%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem", minHeight: "60px", resize: "vertical" }}
                            placeholder="Activities"
                            />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                            <input
                            type="date"
                            value={item.date}
                            onChange={(e) => handleArrayChange("functional_mous", idx, "date", e.target.value)}
                            style={{ width: "90%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            <button
                            type="button"
                            onClick={() => removeArrayItem("functional_mous", idx)}
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
                <button
                    type="button"
                    onClick={() => addArrayItem("functional_mous")}
                    style={{
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    marginTop: "10px",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                    e.target.style.background = "#059669";
                    e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseOut={(e) => {
                    e.target.style.background = "#10b981";
                    e.target.style.transform = "translateY(0)";
                    }}
                >
                    + Add MOU
                </button>
                </div>

                <div style={{ textAlign: "center", marginTop: "40px" }}>
                <button
                    type="submit"
                    style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "15px 40px",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.3s ease",
                    letterSpacing: "0.5px",
                    }}
                    onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
                    }}
                    onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
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

export default MOU;