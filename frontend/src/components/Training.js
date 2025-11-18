import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";

import { getApiUrl } from '../config/api';
function Training() {
    const [training, setTraining] = useState({
        revenue_consultancy_training: [
            {
                organization: "",
                from_date: "",
                to_date: "",
                amount_generated: "",
            },
        ],
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setTraining((prev) => ({
                    ...prev,
                    name: decoded.name || "",
                    email: decoded.email || "",
                }));
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }

        fetchTrainingData();
    }, []);

    const fetchTrainingData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(getApiUrl("/api/professor/training"), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTraining(data);
            }
        } catch (error) {
            console.error("Error fetching training data:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(getApiUrl("/api/professor/training"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(training),
            });

            if (response.ok) {
                alert("Training data updated successfully!");
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update training data");
            }
        } catch (error) {
            console.error("Error updating training:", error);
            alert("Error updating training data");
        }
    };

    const handleArrayChange = (arrayName, index, field, value) => {
        setTraining((prev) => ({
            ...prev,
            [arrayName]: prev[arrayName].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const addArrayItem = (arrayName) => {
        const defaultItems = {
            revenue_consultancy_training: {
                organization: "",
                from_date: "",
                to_date: "",
                amount_generated: "",
            },
        };

        setTraining((prev) => ({
            ...prev,
            [arrayName]: [...prev[arrayName], defaultItems[arrayName] || {}],
        }));
    };

    const removeArrayItem = (arrayName, index) => {
        setTraining((prev) => ({
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
                        Training & Consultancy Revenue
                    </h1>
                    <p
                        style={{
                            fontSize: "1.1rem",
                            opacity: 0.8,
                            marginBottom: "30px",
                            marginTop: "0px"
                        }}
                    >
                        Manage your consultancy and corporate training revenue data
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
                            {/* Revenue from Consultancy and Corporate Training Section */}
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
                                    Revenue generated from consultancy and corporate training
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
                                            <th style={{ width: "300px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Organization to which consultancy or corporate training provided</th>
                                            <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>From Date</th>
                                            <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>To Date</th>
                                            <th style={{ width: "150px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Amount generated (INR)</th>
                                            <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {training.revenue_consultancy_training.map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                                    <input
                                                        type="text"
                                                        value={item.organization}
                                                        onChange={(e) => handleArrayChange("revenue_consultancy_training", idx, "organization", e.target.value)}
                                                        style={{ width: "95%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                                                        placeholder="Organization Name"
                                                    />
                                                </td>
                                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                                    <input
                                                        type="date"
                                                        value={item.from_date}
                                                        onChange={(e) => handleArrayChange("revenue_consultancy_training", idx, "from_date", e.target.value)}
                                                        style={{ width: "90%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                                                    />
                                                </td>
                                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                                    <input
                                                        type="date"
                                                        value={item.to_date}
                                                        onChange={(e) => handleArrayChange("revenue_consultancy_training", idx, "to_date", e.target.value)}
                                                        style={{ width: "90%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                                                    />
                                                </td>
                                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                                    <input
                                                        type="number"
                                                        value={item.amount_generated}
                                                        onChange={(e) => handleArrayChange("revenue_consultancy_training", idx, "amount_generated", e.target.value)}
                                                        style={{ width: "90%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                                                        placeholder="Amount in INR"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayItem("revenue_consultancy_training", idx)}
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
                                    onClick={() => addArrayItem("revenue_consultancy_training")}
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
                                    + Add Entry
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

export default Training;