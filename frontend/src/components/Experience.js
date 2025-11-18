import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";
import { getApiUrl } from "../config/api";
import { useComponentRefresh } from "../hooks/useDataRefresh";

function Experience() {
  const [experience, setExperience] = useState({
    // Teaching Experience
    teaching_experience: [
      {
        designation: "",
        institution: "",
        department: "",
        from: "",
        to: "",
      },
    ],
    // Research Experience
    research_experience: [
      {
        position: "",
        organization: "",
        project: "",
        from: "",
        to: "",
      },
    ],
    // Industry Experience
    industry_experience: [
      {
        designation: "",
        company: "",
        sector: "",
        from: "",
        to: "",
      },
    ],
  });

  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setExperience((prev) => ({
          ...prev,
          name: decoded.name || "",
          email: decoded.email || "",
        }));
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    fetchExperience();
  }, []);

  const fetchExperience = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      console.log('🔄 Fetching experience data...');
      const response = await fetch(
        getApiUrl("/api/professor/experience"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Experience API Response:', data);
        console.log('Teaching Experience Count:', data.teaching_experience?.length || 0);
        console.log('Research Experience Count:', data.research_experience?.length || 0);
        setExperience(data);
      } else {
        console.error('❌ Experience API Failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching experience:", error);
    }
  }, []);

  // Register this component for automatic refresh
  useComponentRefresh('experience', fetchExperience);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        return;
      }

      // Send experience data directly to backend for immediate saving
      const response = await fetch(getApiUrl("/api/professor/experience"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(experience)
      });

      if (response.ok) {
        const data = await response.json();
        alert("Experience updated successfully!");
        console.log("Experience saved:", data.experience);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error updating experience");
      }
    } catch (error) {
      console.error("Error saving experience:", error);
      alert("Error saving experience. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setExperience((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setExperience((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      teaching_experience: {
        designation: "",
        institution: "",
        department: "",
        from: "",
        to: "",
      },
      research_experience: {
        position: "",
        organization: "",
        project: "",
        from: "",
        to: "",
      },
      industry_experience: {
        designation: "",
        company: "",
        sector: "",
        from: "",
        to: "",
      },
    };

    setExperience((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName] || {}],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setExperience((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  return (
    <Layout>
      <div
        style={{
          minHeight: "100vh",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            padding: "10px 30px 30px",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              color: "#1a202c",
              marginTop: "0px",
              marginBottom: "0px",
            }}
          >
            Experience Details
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              marginBottom: "30px",
              opacity: 0.8,
              marginTop: "10px",
            }}
          >
            Update your teaching, research, and industry experience information
          </p>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                background: "#fff",
                padding: "40px",
                borderRadius: "20px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                marginBottom: "30px",
              }}
            >
              {/* Teaching Experience Section */}
              <div style={{ marginTop: "5px" }}>
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
                  Teaching Experience
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
                      <th
                        style={{
                          width: "60px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        S.No
                      </th>
                      <th
                        style={{
                          width: "180px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Designation
                      </th>
                      <th
                        style={{
                          width: "200px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Institution
                      </th>
                      <th
                        style={{
                          width: "180px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Department
                      </th>
                      <th
                        style={{
                          width: "150px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        From
                      </th>
                      <th
                        style={{
                          width: "150px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        To
                      </th>
                      <th
                        style={{
                          width: "80px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {experience.teaching_experience.map((exp, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            width: "60px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          style={{
                            width: "180px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="text"
                            value={exp.designation}
                            onChange={(e) =>
                              handleArrayChange(
                                "teaching_experience",
                                idx,
                                "designation",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "210px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                            placeholder="Designation"
                          />
                        </td>
                        <td
                          style={{
                            width: "200px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="text"
                            value={exp.institution}
                            onChange={(e) =>
                              handleArrayChange(
                                "teaching_experience",
                                idx,
                                "institution",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "220px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                            placeholder="Institution"
                          />
                        </td>
                        <td
                          style={{
                            width: "180px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="text"
                            value={exp.department}
                            onChange={(e) =>
                              handleArrayChange(
                                "teaching_experience",
                                idx,
                                "department",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "200px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                            placeholder="Department"
                          />
                        </td>
                        <td
                          style={{
                            width: "150px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="month"
                            value={exp.from}
                            onChange={(e) =>
                              handleArrayChange(
                                "teaching_experience",
                                idx,
                                "from",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "170px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                          />
                        </td>
                        <td
                          style={{
                            width: "150px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="month"
                            value={exp.to}
                            onChange={(e) =>
                              handleArrayChange(
                                "teaching_experience",
                                idx,
                                "to",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "170px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                          />
                        </td>
                        <td
                          style={{
                            width: "80px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => removeArrayItem("teaching_experience", idx)}
                            style={{
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              fontSize: "0.8rem",
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
                  onClick={() => addArrayItem("teaching_experience")}
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
                  + Add Teaching Experience
                </button>
              </div>

              {/* Research Experience Section */}
              <div style={{ marginTop: "40px" }}>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: "25px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "Segoe UI, Arial, sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  Research Experience
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
                      <th
                        style={{
                          width: "60px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        S.No
                      </th>
                      <th
                        style={{
                          width: "180px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Position
                      </th>
                      <th
                        style={{
                          width: "200px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Organization
                      </th>
                      <th
                        style={{
                          width: "250px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Project/Research Area
                      </th>
                      <th
                        style={{
                          width: "150px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        From
                      </th>
                      <th
                        style={{
                          width: "150px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        To
                      </th>
                      <th
                        style={{
                          width: "80px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {experience.research_experience.map((exp, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            width: "60px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          style={{
                            width: "180px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) =>
                              handleArrayChange(
                                "research_experience",
                                idx,
                                "position",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "210px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                            placeholder="Position"
                          />
                        </td>
                        <td
                          style={{
                            width: "200px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="text"
                            value={exp.organization}
                            onChange={(e) =>
                              handleArrayChange(
                                "research_experience",
                                idx,
                                "organization",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "220px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                            placeholder="Organization"
                          />
                        </td>
                        <td
                          style={{
                            width: "250px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="text"
                            value={exp.project}
                            onChange={(e) =>
                              handleArrayChange(
                                "research_experience",
                                idx,
                                "project",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "270px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                            placeholder="Project/Research Area"
                          />
                        </td>
                        <td
                          style={{
                            width: "150px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="month"
                            value={exp.from}
                            onChange={(e) =>
                              handleArrayChange(
                                "research_experience",
                                idx,
                                "from",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "170px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                          />
                        </td>
                        <td
                          style={{
                            width: "150px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="month"
                            value={exp.to}
                            onChange={(e) =>
                              handleArrayChange(
                                "research_experience",
                                idx,
                                "to",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "170px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                          />
                        </td>
                        <td
                          style={{
                            width: "80px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => removeArrayItem("research_experience", idx)}
                            style={{
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              fontSize: "0.8rem",
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
                  onClick={() => addArrayItem("research_experience")}
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
                  + Add Research Experience
                </button>
              </div>

              {/* Industry Experience Section */}
              <div style={{ marginTop: "40px" }}>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: "25px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "Segoe UI, Arial, sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  Industry Experience
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
                      <th
                        style={{
                          width: "60px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        S.No
                      </th>
                      <th
                        style={{
                          width: "180px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Designation
                      </th>
                      <th
                        style={{
                          width: "200px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Company
                      </th>
                      <th
                        style={{
                          width: "180px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Sector/Domain
                      </th>
                      <th
                        style={{
                          width: "150px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        From
                      </th>
                      <th
                        style={{
                          width: "150px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        To
                      </th>
                      <th
                        style={{
                          width: "80px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {experience.industry_experience.map((exp, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            width: "60px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          style={{
                            width: "180px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="text"
                            value={exp.designation}
                            onChange={(e) =>
                              handleArrayChange(
                                "industry_experience",
                                idx,
                                "designation",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "210px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                            placeholder="Designation"
                          />
                        </td>
                        <td
                          style={{
                            width: "200px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) =>
                              handleArrayChange(
                                "industry_experience",
                                idx,
                                "company",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "220px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                            placeholder="Company"
                          />
                        </td>
                        <td
                          style={{
                            width: "180px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="text"
                            value={exp.sector}
                            onChange={(e) =>
                              handleArrayChange(
                                "industry_experience",
                                idx,
                                "sector",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "200px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                            placeholder="Sector/Domain"
                          />
                        </td>
                        <td
                          style={{
                            width: "150px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="month"
                            value={exp.from}
                            onChange={(e) =>
                              handleArrayChange(
                                "industry_experience",
                                idx,
                                "from",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "170px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                          />
                        </td>
                        <td
                          style={{
                            width: "150px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="month"
                            value={exp.to}
                            onChange={(e) =>
                              handleArrayChange(
                                "industry_experience",
                                idx,
                                "to",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "170px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                          />
                        </td>
                        <td
                          style={{
                            width: "80px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => removeArrayItem("industry_experience", idx)}
                            style={{
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              fontSize: "0.8rem",
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
                  onClick={() => addArrayItem("industry_experience")}
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
                  + Add Industry Experience
                </button>
              </div>

              {/* Submit Button */}
              <div
                style={{
                  marginTop: "50px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  type="submit"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                    e.target.style.boxShadow =
                      "0 12px 35px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(102, 126, 234, 0.3)";
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

export default Experience;