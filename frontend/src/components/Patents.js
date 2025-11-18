import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";

import { getApiUrl } from '../config/api';
function Patents() {
  const [patents, setPatents] = useState({
    // Contribution towards Innovation
    innovation_contributions: [
      {
        work_name: "",
        specialization: "",
        remarks: "",
      },
    ],
    // Patent Details
    patent_details: [
      {
        title: "",
        status: "",
        patent_number: "",
        date_of_award: "",
        awarding_agency: "",
        scope: "",
        commercialized_status: "",
      },
    ],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setPatents((prev) => ({
          ...prev,
          name: decoded.name || "",
          email: decoded.email || "",
        }));
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    fetchPatents();
  }, []);

  const fetchPatents = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        getApiUrl("/api/professor/patents"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPatents(data);
      }
    } catch (error) {
      console.error("Error fetching patents:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        return;
      }

      // Send patents data directly to backend for immediate saving
      const response = await fetch(getApiUrl("/api/professor/patents"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(patents)
      });

      if (response.ok) {
        const data = await response.json();
        alert("Patents updated successfully!");
        console.log("Patents saved:", data.patents);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error updating patents");
      }
    } catch (error) {
      console.error("Error saving patents:", error);
      alert("Error saving patents. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setPatents((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setPatents((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      innovation_contributions: {
        work_name: "",
        specialization: "",
        remarks: "",
      },
      patent_details: {
        title: "",
        status: "",
        patent_number: "",
        date_of_award: "",
        awarding_agency: "",
        scope: "",
        commercialized_status: "",
      },
    };

    setPatents((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName] || {}],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setPatents((prev) => ({
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
              marginBottom: "10px",
              marginTop: "0px",
            }}
          >
            Patents & Innovation
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              marginBottom: "30px",
              marginTop: "0px",
              opacity: 0.8,
            }}
          >
            Update your innovation contributions and patent details
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
              {/* Contribution towards Innovation Section */}
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
                  Contribution towards Innovation
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
                          width: "300px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Name of the Work/Contribution
                      </th>
                      <th
                        style={{
                          width: "200px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Specialization
                      </th>
                      <th
                        style={{
                          width: "250px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Remarks
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
                    {patents.innovation_contributions.map((innovation, idx) => (
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
                            width: "300px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <textarea
                            value={innovation.work_name}
                            onChange={(e) =>
                              handleArrayChange(
                                "innovation_contributions",
                                idx,
                                "work_name",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              height: "60px",
                              minWidth: "0",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Work/Contribution Name"
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
                          <textarea
                            value={innovation.specialization}
                            onChange={(e) =>
                              handleArrayChange(
                                "innovation_contributions",
                                idx,
                                "specialization",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              height: "60px",
                              minWidth: "0",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Specialization"
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
                          <textarea
                            value={innovation.remarks}
                            onChange={(e) =>
                              handleArrayChange(
                                "innovation_contributions",
                                idx,
                                "remarks",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              height: "60px",
                              minWidth: "0",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Remarks"
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
                            onClick={() => removeArrayItem("innovation_contributions", idx)}
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
                  onClick={() => addArrayItem("innovation_contributions")}
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
                  + Add Innovation Contribution
                </button>
              </div>

              {/* Patent Details Section */}
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
                  Patent Details
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
                          width: "40px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        S.No
                      </th>
                      <th
                        style={{
                          width: "200px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Title
                      </th>
                      <th
                        style={{
                          width: "120px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          width: "140px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Patent Number
                      </th>
                      <th
                        style={{
                          width: "100px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Date of Award
                      </th>
                      <th
                        style={{
                          width: "150px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Awarding Agency
                      </th>
                      <th
                        style={{
                          width: "120px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Scope
                      </th>
                      <th
                        style={{
                          width: "140px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Commercialized Status
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
                    {patents.patent_details.map((patent, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            width: "40px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          {idx + 1}
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
                            value={patent.title}
                            onChange={(e) =>
                              handleArrayChange(
                                "patent_details",
                                idx,
                                "title",
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
                            placeholder="Patent Title"
                          />
                        </td>
                        <td
                          style={{
                            width: "120px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <select
                            value={patent.status}
                            onChange={(e) =>
                              handleArrayChange(
                                "patent_details",
                                idx,
                                "status",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "140px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                          >
                            <option value="">Select Status</option>
                            <option value="Filed">Filed</option>
                            <option value="Published">Published</option>
                            <option value="Granted">Granted</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </td>
                        <td
                          style={{
                            width: "140px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="text"
                            value={patent.patent_number}
                            onChange={(e) =>
                              handleArrayChange(
                                "patent_details",
                                idx,
                                "patent_number",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "160px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                            placeholder="Patent Number"
                          />
                        </td>
                        <td
                          style={{
                            width: "100px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <input
                            type="date"
                            value={patent.date_of_award}
                            onChange={(e) =>
                              handleArrayChange(
                                "patent_details",
                                idx,
                                "date_of_award",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "120px",
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
                            type="text"
                            value={patent.awarding_agency}
                            onChange={(e) =>
                              handleArrayChange(
                                "patent_details",
                                idx,
                                "awarding_agency",
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
                            placeholder="Awarding Agency"
                          />
                        </td>
                        <td
                          style={{
                            width: "120px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <select
                            value={patent.scope}
                            onChange={(e) =>
                              handleArrayChange(
                                "patent_details",
                                idx,
                                "scope",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "140px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                          >
                            <option value="">Select Scope</option>
                            <option value="National">National</option>
                            <option value="International">International</option>
                          </select>
                        </td>
                        <td
                          style={{
                            width: "140px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          <select
                            value={patent.commercialized_status}
                            onChange={(e) =>
                              handleArrayChange(
                                "patent_details",
                                idx,
                                "commercialized_status",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              minWidth: "0",
                              maxWidth: "160px",
                              padding: "12px 16px",
                              borderRadius: "10px",
                              border: "2px solid #e2e8f0",
                              boxSizing: "border-box",
                              fontSize: "1rem",
                              textAlign: "center"
                            }}
                          >
                            <option value="">Select Status</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Under Review">Under Review</option>
                          </select>
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
                            onClick={() => removeArrayItem("patent_details", idx)}
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
                  onClick={() => addArrayItem("patent_details")}
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
                  + Add Patent Details
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

export default Patents;