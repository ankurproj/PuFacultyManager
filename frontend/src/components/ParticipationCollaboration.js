import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";

import { getApiUrl } from '../config/api';
function ParticipationCollaboration() {
    const [participationData, setParticipationData] = useState({
        participation_extension_academic: [
            {
                position_name: "",
                duration: "",
                nature_of_duties: "",
            },
        ],
        participation_extension_cocurricular: [
            {
                position_name: "",
                duration: "",
                nature_of_duties: "",
            },
        ],
        collaboration_institution_industry: [
            {
                collaborator_name: "",
                designation: "",
                institution_industry: "",
                type: "",
                nature_of_collaboration: "",
                period_from: "",
                period_to: "",
                visits_from: "",
                visits_to: "",
                details_collaborative_research: "",
            },
        ],
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;

            const response = await fetch(getApiUrl(`/api/professor/participation-collaboration/${userId}`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(participationData),
            });

            if (response.ok) {
                alert("Participation & Collaboration updated successfully!");
            } else {
                throw new Error("Failed to update participation & collaboration");
            }
        } catch (error) {
            console.error("Error updating participation & collaboration:", error);
            alert("Error updating participation & collaboration");
        }
    };

    const handleArrayChange = (arrayName, index, field, value) => {
        setParticipationData((prev) => ({
            ...prev,
            [arrayName]: prev[arrayName].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const addArrayItem = (arrayName) => {
        const defaultItems = {
            participation_extension_academic: {
                position_name: "",
                duration: "",
                nature_of_duties: "",
            },
            participation_extension_cocurricular: {
                position_name: "",
                duration: "",
                nature_of_duties: "",
            },
            collaboration_institution_industry: {
                collaborator_name: "",
                designation: "",
                institution_industry: "",
                type: "",
                nature_of_collaboration: "",
                period_from: "",
                period_to: "",
                visits_from: "",
                visits_to: "",
                details_collaborative_research: "",
            },
        };

        setParticipationData((prev) => ({
            ...prev,
            [arrayName]: [...prev[arrayName], defaultItems[arrayName]],
        }));
    };

    const removeArrayItem = (arrayName, index) => {
        setParticipationData((prev) => ({
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

                const response = await fetch(getApiUrl(`/api/professor/participation-collaboration/${userId}`), {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setParticipationData({
                        participation_extension_academic: data.participation_extension_academic || [
                            {
                                position_name: "",
                                duration: "",
                                nature_of_duties: "",
                            },
                        ],
                        participation_extension_cocurricular: data.participation_extension_cocurricular || [
                            {
                                position_name: "",
                                duration: "",
                                nature_of_duties: "",
                            },
                        ],
                        collaboration_institution_industry: data.collaboration_institution_industry || [
                            {
                                collaborator_name: "",
                                designation: "",
                                institution_industry: "",
                                type: "",
                                nature_of_collaboration: "",
                                period_from: "",
                                period_to: "",
                                visits_from: "",
                                visits_to: "",
                                details_collaborative_research: "",
                            },
                        ],
                    });
                }
            } catch (error) {
                console.error("Error fetching participation & collaboration data:", error);
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
                        marginTop: "0px",
                    }}>
                        Participation & Collaboration
                    </h1>
                    <p style={{
                        fontSize: "1.1rem",
                        marginBottom: "30px",
                        marginTop: "0px",
                        opacity: 0.8,
                    }}>Update Participation & Collaboration Details</p>

                    <form onSubmit={handleSubmit}>
                        <div style={{
                            background: "#fff",
                            padding: "40px",
                            borderRadius: "20px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                            marginBottom: "30px",
                        }}>

                            {/* Participation & Extension Activities (Academic/Administration) Section */}
                            <div style={{ marginTop: "0px" }}>
                                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem", marginTop: '0px' }}>
                                    Participation & Extension Activities (Academic/Administration)
                                </h2>
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ background: "#f1f5f9" }}>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Name of the Position (Head, Dean, Co-ordinator, Director, etc.)</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Duration</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Nature of Duties</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {participationData.participation_extension_academic.map((activity, idx) => (
                                                <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                                                    <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                                    <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                                                        <input
                                                            type="text"
                                                            value={activity.position_name}
                                                            onChange={(e) => handleArrayChange("participation_extension_academic", idx, "position_name", e.target.value)}
                                                            placeholder="e.g., Head of Department, Dean, Coordinator"
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
                                                            type="text"
                                                            value={activity.duration}
                                                            onChange={(e) => handleArrayChange("participation_extension_academic", idx, "duration", e.target.value)}
                                                            placeholder="e.g., 2020-2023"
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
                                                        <textarea
                                                            value={activity.nature_of_duties}
                                                            onChange={(e) => handleArrayChange("participation_extension_academic", idx, "nature_of_duties", e.target.value)}
                                                            placeholder="Description of duties and responsibilities"
                                                            rows="2"
                                                            style={{
                                                                width: "90%",
                                                                padding: "8px",
                                                                border: "1px solid #d1d5db",
                                                                borderRadius: "6px",
                                                                resize: "vertical",
                                                                fontSize: "1rem"
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeArrayItem("participation_extension_academic", idx)}
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
                                    onClick={() => addArrayItem("participation_extension_academic")}
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
                                    + Add Academic/Administration Entry
                                </button>
                            </div>

                            {/* Participation & Extension Activities (Co-Curricular) Section */}
                            <div style={{ marginTop: "60px" }}>
                                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                                    Participation & Extension Activities (Co-Curricular)
                                </h2>
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                                        <thead>
                                            <tr style={{ background: "#f1f5f9" }}>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Name of the Position (NSS, NCC, Warden etc.)</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Duration</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Nature of Duties</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {participationData.participation_extension_cocurricular.map((activity, idx) => (
                                                <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                                                    <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                                    <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                                                        <input
                                                            type="text"
                                                            value={activity.position_name}
                                                            onChange={(e) => handleArrayChange("participation_extension_cocurricular", idx, "position_name", e.target.value)}
                                                            placeholder="e.g., NSS Program Officer, NCC Officer, Warden"
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
                                                            type="text"
                                                            value={activity.duration}
                                                            onChange={(e) => handleArrayChange("participation_extension_cocurricular", idx, "duration", e.target.value)}
                                                            placeholder="e.g., 2021-2024"
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
                                                        <textarea
                                                            value={activity.nature_of_duties}
                                                            onChange={(e) => handleArrayChange("participation_extension_cocurricular", idx, "nature_of_duties", e.target.value)}
                                                            placeholder="Description of co-curricular duties and activities"
                                                            rows="2"
                                                            style={{
                                                                width: "90%",
                                                                padding: "8px",
                                                                border: "1px solid #d1d5db",
                                                                borderRadius: "6px",
                                                                resize: "vertical",
                                                                fontSize: "1rem"
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeArrayItem("participation_extension_cocurricular", idx)}
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
                                    onClick={() => addArrayItem("participation_extension_cocurricular")}
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
                                    + Add Co-Curricular Entry
                                </button>
                            </div>

                            {/* Collaboration with Institution/Industry Section */}
                            <div style={{ marginTop: "60px" }}>
                                <h2 style={{ color: "#2d3748", marginBottom: "20px", fontSize: "1.8rem" }}>
                                    Collaboration with Institution/Industry/Organization
                                </h2>
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1600px" }}>
                                        <thead>
                                            <tr style={{ background: "#f1f5f9" }}>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>S.No</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Collaborator Name</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Designation</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Institution/Industry</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Type</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Nature of Collaboration</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Period From</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Period To</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Visits From</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Visits To</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Details of Collaborative Research/Teaching</th>
                                                <th style={{ padding: "12px", border: "1px solid #e2e8f0", fontWeight: "600" }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {participationData.collaboration_institution_industry.map((collaboration, idx) => (
                                                <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                                                    <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                                    <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                                                        <input
                                                            type="text"
                                                            value={collaboration.collaborator_name}
                                                            onChange={(e) => handleArrayChange("collaboration_institution_industry", idx, "collaborator_name", e.target.value)}
                                                            style={{
                                                                width: "85%",
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
                                                            value={collaboration.designation}
                                                            onChange={(e) => handleArrayChange("collaboration_institution_industry", idx, "designation", e.target.value)}
                                                            style={{
                                                                width: "85%",
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
                                                            value={collaboration.institution_industry}
                                                            onChange={(e) => handleArrayChange("collaboration_institution_industry", idx, "institution_industry", e.target.value)}
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
                                                        <select
                                                            value={collaboration.type}
                                                            onChange={(e) => handleArrayChange("collaboration_institution_industry", idx, "type", e.target.value)}
                                                            style={{
                                                                width: "90%",
                                                                padding: "8px",
                                                                border: "1px solid #d1d5db",
                                                                borderRadius: "6px",
                                                                fontSize: "1rem"
                                                            }}
                                                        >
                                                            <option value="">Select Type</option>
                                                            <option value="Institution">Institution</option>
                                                            <option value="Industry">Industry</option>
                                                            <option value="Government">Government</option>
                                                            <option value="NGO">NGO</option>
                                                            <option value="International">International</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: "10px", border: "1px solid #e2e8f0" }}>
                                                        <input
                                                            type="text"
                                                            value={collaboration.nature_of_collaboration}
                                                            onChange={(e) => handleArrayChange("collaboration_institution_industry", idx, "nature_of_collaboration", e.target.value)}
                                                            style={{
                                                                width: "85%",
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
                                                            value={collaboration.period_from}
                                                            onChange={(e) => handleArrayChange("collaboration_institution_industry", idx, "period_from", e.target.value)}
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
                                                            value={collaboration.period_to}
                                                            onChange={(e) => handleArrayChange("collaboration_institution_industry", idx, "period_to", e.target.value)}
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
                                                            value={collaboration.visits_from}
                                                            onChange={(e) => handleArrayChange("collaboration_institution_industry", idx, "visits_from", e.target.value)}
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
                                                            value={collaboration.visits_to}
                                                            onChange={(e) => handleArrayChange("collaboration_institution_industry", idx, "visits_to", e.target.value)}
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
                                                        <textarea
                                                            value={collaboration.details_collaborative_research}
                                                            onChange={(e) => handleArrayChange("collaboration_institution_industry", idx, "details_collaborative_research", e.target.value)}
                                                            placeholder="Details of collaborative research or teaching activities"
                                                            rows="2"
                                                            style={{
                                                                width: "90%",
                                                                padding: "8px",
                                                                border: "1px solid #d1d5db",
                                                                borderRadius: "6px",
                                                                resize: "vertical",
                                                                fontSize: "1rem"
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeArrayItem("collaboration_institution_industry", idx)}
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
                                    onClick={() => addArrayItem("collaboration_institution_industry")}
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
                                    + Add Collaboration Entry
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

export default ParticipationCollaboration;