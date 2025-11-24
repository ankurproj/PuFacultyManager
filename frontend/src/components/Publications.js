import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";
import LoadingSpinner from "./LoadingSpinner";
import { getApiUrl } from "../config/api";
import { useComponentRefresh } from "../hooks/useDataRefresh";

function Publications() {
  const [currentUser, setCurrentUser] = useState({});
  const [targetFacultyId, setTargetFacultyId] = useState(null); // When viewing someone else's publications
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [publications, setPublications] = useState({
    // Consolidated Papers Published with paper type
    papers_published: [
      {
        title: "",
        coauthors_within_org: "",
        coauthors_outside_org: "",
        journal_name: "",
        volume: "",
        issue: "",
        page_nos: "",
        year: "",
        impact_factor: "",
        paper_upload: "",
        paper_upload_filename: "",
        paper_link: "",
        paper_type: "SCIE", // SCIE, UGC, Scopus
        conference_details: "", // For future conference papers
      },
    ],
    // Legacy arrays for backward compatibility during migration
    seie_journals: [],
    ugc_approved_journals: [],
    non_ugc_journals: [],
    conference_proceedings: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser({
          id: decoded.id,
          name: decoded.name || "",
          email: decoded.email || "",
          role: decoded.role || "faculty"
        });

        // Check if viewing someone else's profile via URL params or route
        const urlParams = new URLSearchParams(window.location.search);
        const facultyId = urlParams.get('facultyId');

        if (facultyId && facultyId !== decoded.id) {
          setTargetFacultyId(facultyId);
          setIsOwnProfile(false);
        } else {
          setIsOwnProfile(true);
          setTargetFacultyId(null);
        }

        setPublications((prev) => ({
          ...prev,
          name: decoded.name || "",
          email: decoded.email || "",
        }));
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    fetchPublications();
  }, []);

  const requestAccess = async (publicationType, publicationIndex, publicationTitle) => {
    const token = localStorage.getItem("token");
    if (!token || isOwnProfile) return;

    const message = prompt("Please enter a message explaining why you need access to this publication (optional):");
    if (message === null) return; // User cancelled

    try {
      const response = await fetch(
        getApiUrl("/api/access-request"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            target_faculty_id: targetFacultyId,
            publication_type: publicationType,
            publication_index: publicationIndex,
            publication_title: publicationTitle,
            message: message || ""
          }),
        }
      );

      if (response.ok) {
        alert("Access request sent successfully! The faculty will be notified.");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error sending access request");
      }
    } catch (error) {
      console.error("Error sending access request:", error);
      alert("Error sending access request. Please try again.");
    }
  };

  // Helper function to render paper upload cell
  const renderPaperUploadCell = (pub, arrayName, idx) => {
    if (isOwnProfile) {
      return (
        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              if (e.target.files[0]) {
                handleFileUpload(arrayName, idx, e.target.files[0]);
              }
            }}
            style={{ width: "100%", padding: "4px", fontSize: "0.8rem" }}
          />
          {pub.paper_upload_filename && (
            <div style={{ fontSize: "0.7rem", color: "#666", marginTop: "2px" }}>
              {pub.paper_upload_filename}
            </div>
          )}
        </td>
      );
    } else {
      return (
        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <button
            onClick={() => requestAccess(arrayName, idx, pub.title)}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontWeight: "500"
            }}
            title="Request access to view paper upload"
          >
            Request Access
          </button>
        </td>
      );
    }
  };

  // Helper function to render paper link cell
  const renderPaperLinkCell = (pub, arrayName, idx) => {
    if (isOwnProfile) {
      return (
        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
          <input
            type="url"
            value={pub.paper_link}
            onChange={(e) => handleArrayChange(arrayName, idx, "paper_link", e.target.value)}
            style={{ width: "90%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
            placeholder="Paper Link"
          />
        </td>
      );
    } else {
      return (
        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <button
            onClick={() => requestAccess(arrayName, idx, pub.title)}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontWeight: "500"
            }}
            title="Request access to view paper link"
          >
            Request Access
          </button>
        </td>
      );
    }
  };

  const fetchPublications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching publications data...');
      setLoading(true);
      let url = getApiUrl("/api/professor/publications");

      // If viewing someone else's profile, fetch their publications
      if (targetFacultyId && !isOwnProfile) {
        url += `?facultyId=${targetFacultyId}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Publications API Response:', data);
        console.log('UGC Papers Count:', data.ugcPapers?.length || 0);
        console.log('Non-UGC Papers Count:', data.nonUgcPapers?.length || 0);
        console.log('Papers Published Count:', data.papers_published?.length || 0);

        // Convert legacy data to new format if needed
        let papersPublished = data.papers_published || [];
        console.log('📄 Raw papers_published array:', papersPublished.length, 'papers');
        if (papersPublished.length > 0) {
          console.log('🔍 First paper structure:', papersPublished[0]);
          console.log('🔍 First paper title:', papersPublished[0]?.title);
          console.log('🔍 First paper type:', papersPublished[0]?.paper_type);
        }

        // If legacy arrays exist, convert them to new format
        if (!papersPublished.length && (data.seie_journals?.length || data.ugc_approved_journals?.length || data.non_ugc_journals?.length)) {
          const seie = (data.seie_journals || []).map(p => ({
            ...p,
            paper_type: 'SCIE',
            coauthors_within_org: p.authors || "",
            coauthors_outside_org: ""
          }));
          const ugc = (data.ugc_approved_journals || []).map(p => ({
            ...p,
            paper_type: 'UGC',
            coauthors_within_org: p.authors || "",
            coauthors_outside_org: ""
          }));
          const scopus = (data.non_ugc_journals || []).map(p => ({
            ...p,
            paper_type: 'Scopus',
            coauthors_within_org: p.authors || "",
            coauthors_outside_org: ""
          }));
          papersPublished = [...seie, ...ugc, ...scopus];
        } else if (papersPublished.length > 0) {
          // Migrate existing papers_published to new format if they still use old 'authors' field
          papersPublished = papersPublished.map(p => {
            if (!p.coauthors_within_org && !p.coauthors_outside_org && p.authors) {
              return {
                ...p,
                coauthors_within_org: p.authors || "",
                coauthors_outside_org: "",
                authors: undefined // Remove old field
              };
            }
            return p;
          });
        }

        setPublications(prevState => {
          // Migrate conference_proceedings if needed
          let conferenceProceedings = data.conference_proceedings || [];
          conferenceProceedings = conferenceProceedings.map(p => {
            if (!p.coauthors_within_org && !p.coauthors_outside_org && p.authors) {
              return {
                ...p,
                coauthors_within_org: p.authors || "",
                coauthors_outside_org: "",
                authors: undefined // Remove old field
              };
            }
            return p;
          });

          console.log('📊 Final papersPublished array before setState:', papersPublished.length, 'papers');
          console.log('🎯 Setting papers_published in state:', papersPublished.length > 0 ? papersPublished.length : 'keeping previous (empty)');

          const newState = {
            ...prevState,
            papers_published: papersPublished.length > 0 ? papersPublished : prevState.papers_published,
            // Keep legacy arrays for now
            seie_journals: data.seie_journals || [],
            ugc_approved_journals: data.ugc_approved_journals || [],
            non_ugc_journals: data.non_ugc_journals || [],
            conference_proceedings: conferenceProceedings
          };

          console.log('🔄 New state papers_published length:', newState.papers_published?.length);
          return newState;
        });
      }
    } catch (error) {
      console.error("Error fetching publications:", error);
    } finally {
      setLoading(false);
    }
  }, [targetFacultyId, isOwnProfile]);

  // Register this component for automatic refresh
  useComponentRefresh('publications', fetchPublications);

  const handleFileUpload = (arrayName, index, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      handleArrayChange(arrayName, index, 'paper_upload', base64);
      handleArrayChange(arrayName, index, 'paper_upload_filename', file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        return;
      }

      // Send publications data directly to backend for immediate saving
      const response = await fetch(getApiUrl('/api/professor/publications'), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(publications)
      });

      if (response.ok) {
        const data = await response.json();
        alert("Publications updated successfully!");
        console.log("Publications saved:", data.publications);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error updating publications");
      }
    } catch (error) {
      console.error("Error saving publications:", error);
      alert("Error saving publications. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setPublications((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setPublications((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      papers_published: {
        title: "",
        coauthors_within_org: "",
        coauthors_outside_org: "",
        journal_name: "",
        volume: "",
        issue: "",
        page_nos: "",
        year: "",
        impact_factor: "",
        paper_upload: "",
        paper_upload_filename: "",
        paper_link: "",
        paper_type: "SCIE",
        conference_details: "",
      },
      seie_journals: {
        title: "",
        authors: "",
        journal_name: "",
        volume: "",
        issue: "",
        page_nos: "",
        year: "",
        impact_factor: "",
        paper_upload: "",
        paper_upload_filename: "",
        paper_link: "",
      },
      ugc_approved_journals: {
        title: "",
        authors: "",
        journal_name: "",
        volume: "",
        issue: "",
        page_nos: "",
        year: "",
        impact_factor: "",
        paper_upload: "",
        paper_upload_filename: "",
        paper_link: "",
      },
      non_ugc_journals: {
        title: "",
        authors: "",
        journal_name: "",
        volume: "",
        issue: "",
        page_nos: "",
        year: "",
        impact_factor: "",
        paper_upload: "",
        paper_upload_filename: "",
        paper_link: "",
      },
      conference_proceedings: {
        title: "",
        coauthors_within_org: "",
        coauthors_outside_org: "",
        conference_name: "",
        conference_details: "",
        year: "",
        paper_upload: "",
        paper_upload_filename: "",
        paper_link: "",
      },
    };

    setPublications((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName] || {}],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setPublications((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="app-page">
          <LoadingSpinner message="Loading publications..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="app-page">
        <div className="app-card">
          <div className="app-card-header">
            <div>
              <h1 className="app-page-title">Publications</h1>
              <p className="app-page-subtitle">
                Update your academic publications and research papers.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div>
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
                  Papers Published
                </h2>
                <div className="app-table-wrapper">
                  <table className="app-table">
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                      <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Type</th>
                      <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title</th>
                      <th style={{ width: "130px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Co-authors (Within Org)</th>
                      <th style={{ width: "130px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Co-authors (Outside Org)</th>
                      <th style={{ width: "160px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Journal Name</th>
                      <th style={{ width: "70px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Volume</th>
                      <th style={{ width: "70px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Issue</th>
                      <th style={{ width: "90px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Page Nos.</th>
                      <th style={{ width: "70px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                      <th style={{ width: "90px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Impact Factor</th>
                      <th style={{ width: "110px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>First Page Updation</th>
                      <th style={{ width: "110px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Paper Link</th>
                      <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {console.log('🎨 Rendering table with papers_published:', publications.papers_published?.length, 'papers')}
                    {console.log('📋 First paper sample:', publications.papers_published?.[0])}
                    {console.log('📝 First paper title:', publications.papers_published?.[0]?.title)}
                    {console.log('📄 First paper type:', publications.papers_published?.[0]?.paper_type)}
                    {(publications.papers_published || []).map((pub, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          {isOwnProfile ? (
                            <select
                              value={pub.paper_type || "SCIE"}
                              onChange={(e) => handleArrayChange("papers_published", idx, "paper_type", e.target.value)}
                              style={{
                                width: "95%",
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                fontSize: "0.9rem",
                                fontFamily: "inherit"
                              }}
                            >
                              <option value="SCIE">SCIE</option>
                              <option value="UGC">UGC</option>
                              <option value="Scopus">Scopus</option>
                            </select>
                          ) : (
                            <span style={{ padding: "8px", fontSize: "0.9rem" }}>{pub.paper_type || "SCIE"}</span>
                          )}
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={pub.title}
                            onChange={(e) => handleArrayChange("papers_published", idx, "title", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Paper Title"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={pub.coauthors_within_org}
                            onChange={(e) => handleArrayChange("papers_published", idx, "coauthors_within_org", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Co-authors (Within Org)"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={pub.coauthors_outside_org}
                            onChange={(e) => handleArrayChange("papers_published", idx, "coauthors_outside_org", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Co-authors (Outside Org)"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={pub.journal_name}
                            onChange={(e) => handleArrayChange("papers_published", idx, "journal_name", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Journal Name"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <input
                            type="text"
                            value={pub.volume}
                            onChange={(e) => handleArrayChange("papers_published", idx, "volume", e.target.value)}
                            style={{ width: "80%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            placeholder="Vol"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <input
                            type="text"
                            value={pub.issue}
                            onChange={(e) => handleArrayChange("papers_published", idx, "issue", e.target.value)}
                            style={{ width: "80%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            placeholder="Issue"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <input
                            type="text"
                            value={pub.page_nos}
                            onChange={(e) => handleArrayChange("papers_published", idx, "page_nos", e.target.value)}
                            style={{ width: "80%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            placeholder="Pages"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <input
                            type="text"
                            value={pub.year}
                            onChange={(e) => handleArrayChange("papers_published", idx, "year", e.target.value)}
                            style={{ width: "80%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            placeholder="Year"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <input
                            type="text"
                            value={pub.impact_factor}
                            onChange={(e) => handleArrayChange("papers_published", idx, "impact_factor", e.target.value)}
                            style={{ width: "80%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            placeholder="IF"
                          />
                        </td>
                        {renderPaperUploadCell(pub, "papers_published", idx)}
                        {renderPaperLinkCell(pub, "papers_published", idx)}
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                          {isOwnProfile && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem("papers_published", idx)}
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
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => addArrayItem("papers_published")}
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
                  + Add Paper
                </button>
                )}
              </div>

              {/* Conference Proceedings Section */}
              <div style={{ marginTop: "40px" }}>
                <h2
                  style={{
                    color: "#1e293b",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "20px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Conference Proceedings
                </h2>
                <div className="app-table-wrapper">
                  <table className="app-table">
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                      <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title</th>
                      <th style={{ width: "130px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Co-authors (Within Org)</th>
                      <th style={{ width: "130px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Co-authors (Outside Org)</th>
                      <th style={{ width: "160px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Conference Name</th>
                      <th style={{ width: "90px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                      <th style={{ width: "140px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Conference Details</th>
                      <th style={{ width: "110px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>First Page Updation</th>
                      <th style={{ width: "110px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Paper Link</th>
                      <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(publications.conference_proceedings || []).map((proc, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={proc.title}
                            onChange={(e) => handleArrayChange("conference_proceedings", idx, "title", e.target.value)}
                            disabled={!isOwnProfile}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit",
                              backgroundColor: isOwnProfile ? "#fff" : "#f5f5f5",
                              cursor: isOwnProfile ? "text" : "default"
                            }}
                            placeholder="Conference Paper Title"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={proc.coauthors_within_org}
                            onChange={(e) => handleArrayChange("conference_proceedings", idx, "coauthors_within_org", e.target.value)}
                            disabled={!isOwnProfile}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit",
                              backgroundColor: isOwnProfile ? "#fff" : "#f5f5f5",
                              cursor: isOwnProfile ? "text" : "default"
                            }}
                            placeholder="Co-authors (Within Org)"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={proc.coauthors_outside_org}
                            onChange={(e) => handleArrayChange("conference_proceedings", idx, "coauthors_outside_org", e.target.value)}
                            disabled={!isOwnProfile}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit",
                              backgroundColor: isOwnProfile ? "#fff" : "#f5f5f5",
                              cursor: isOwnProfile ? "text" : "default"
                            }}
                            placeholder="Co-authors (Outside Org)"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={proc.conference_name}
                            onChange={(e) => handleArrayChange("conference_proceedings", idx, "conference_name", e.target.value)}
                            disabled={!isOwnProfile}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit",
                              backgroundColor: isOwnProfile ? "#fff" : "#f5f5f5",
                              cursor: isOwnProfile ? "text" : "default"
                            }}
                            placeholder="Conference Name"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <input
                            type="number"
                            value={proc.year}
                            onChange={(e) => handleArrayChange("conference_proceedings", idx, "year", e.target.value)}
                            disabled={!isOwnProfile}
                            style={{
                              width: "90%",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              fontFamily: "inherit",
                              backgroundColor: isOwnProfile ? "#fff" : "#f5f5f5",
                              cursor: isOwnProfile ? "text" : "default"
                            }}
                            placeholder="Year"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={proc.conference_details}
                            onChange={(e) => handleArrayChange("conference_proceedings", idx, "conference_details", e.target.value)}
                            disabled={!isOwnProfile}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit",
                              backgroundColor: isOwnProfile ? "#fff" : "#f5f5f5",
                              cursor: isOwnProfile ? "text" : "default"
                            }}
                            placeholder="Details (venue, date, etc.)"
                          />
                        </td>
                        {renderPaperUploadCell(proc, "conference_proceedings", idx)}
                        {renderPaperLinkCell(proc, "conference_proceedings", idx)}
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                          {isOwnProfile && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem("conference_proceedings", idx)}
                              style={{
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 12px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => addArrayItem("conference_proceedings")}
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
                    + Add Conference Paper
                  </button>
                )}
              </div>

              {/* Submit Button */}
              {isOwnProfile && (
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
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}


export default Publications;