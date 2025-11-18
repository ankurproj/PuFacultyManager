import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { getApiUrl } from '../config/api';
import { useRefreshTrigger } from '../hooks/useDataRefresh';

const FacultyImporter = () => {
  const [nodeId, setNodeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const { triggerRefresh, triggerRefreshAfterSuccess } = useRefreshTrigger();

  // State for managing table visibility
  const [tableVisibility, setTableVisibility] = useState({
    education: true,
    teachingExperience: true,
    researchExperience: true,
    industryExperience: true,
    phdGuidance: true,
    awards: true,
    innovationContributions: true,
    patentDetails: true,
    ugcPapers: true,
    nonUgcPapers: true,
    conferencePapers: true,
    authoredBooks: true,
    bookChapters: true,
    editedBooks: true,
    ongoingProjects: true,
    ongoingConsultancy: true,
    completedProjects: true,
    completedConsultancy: true,
    pgGuidance: true,
    phdGuidanceDetailed: true,
    postdocGuidance: true,
    eLectures: true,
    onlineEducation: true,
    invitedTalks: true,
    organizedConferences: true,
    organizedWorkshops: true,
    academicAdministration: true,
    coCurricular: true,
    institutionalCollaboration: true,
    facultyDevelopment: true,
    executiveDevelopment: true,
    specialProgrammes: true,
    arpitProgrammes: true
  });

  // Check backend status on component mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(getApiUrl('/'));
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        setBackendStatus('disconnected');
        console.error('Backend connection failed:', error);
      }
    };

    checkBackendStatus();
  }, []);

  // Function to toggle table visibility
  const toggleTableVisibility = (tableName) => {
    setTableVisibility(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  // Helper function to create table header with hide button
  const createTableHeader = (title, tableName, color) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
      <h5 style={{ color: color, fontSize: '1.3rem', fontWeight: '600', margin: 0 }}>
        {title}
      </h5>
      <button
        onClick={() => toggleTableVisibility(tableName)}
        style={{
          backgroundColor: 'transparent',
          border: `1px solid ${color}`,
          borderRadius: '4px',
          color: color,
          padding: '4px 8px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = color;
          e.target.style.color = 'white';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = color;
        }}
      >
        {tableVisibility[tableName] ? '👁️ Hide' : '👁️‍🗨️ Show'}
      </button>
    </div>
  );

  const handleSingleImport = async () => {
    if (!nodeId) return;

    setLoading(true);
    setResult(null);

    try {
      const apiUrl = getApiUrl('/api/scraper/faculty');
      console.log('Sending request to:', apiUrl);
      console.log('Request body:', { nodeId });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodeId }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setResult({
          success: true,
          nodeId,
          data: data.data
        });
      } else {
        setResult({
          success: false,
          nodeId,
          error: data.message || 'Failed to import faculty data'
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
      setResult({
        success: false,
        nodeId,
        error: 'Network error: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDatabase = async () => {
    if (!nodeId) {
      setResult({
        success: false,
        error: 'Please enter a Node ID first'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login first to update the database. Go to Login page to authenticate.');
      }

      const apiUrl = getApiUrl('/api/integration/faculty/' + nodeId);
      console.log('Sending update request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          updateStrategy: 'merge', // Use merge strategy to preserve existing data
          mergeOptions: {
            arrayMergeStrategy: 'smart_merge',
            conflictResolution: 'manual'
          }
        })
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }

        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Please check your login credentials.';
        } else if (response.status === 404) {
          errorMessage = 'Faculty data not found for this Node ID.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Update response data:', data);

      if (data.success) {
        setResult({
          success: true,
          updated: true,
          nodeId,
          message: data.message || 'Faculty data successfully updated in database',
          recordId: data.recordId,
          mergeStats: data.mergeStats
        });

        // 🔄 Trigger automatic refresh of all relevant components
        console.log('✅ Profile update successful, triggering refresh...');

        // Check if backend provided refresh instructions
        if (data.refreshRequired && data.refreshPages) {
          console.log('📋 Backend requested refresh for:', data.refreshPages);
          triggerRefresh(data);
        } else {
          // Default refresh for key pages
          triggerRefreshAfterSuccess(['experience', 'publications', 'books', 'patents', 'profile']);
        }
      } else {
        setResult({
          success: false,
          nodeId,
          error: data.message || 'Failed to update faculty data in database'
        });
      }
    } catch (error) {
      console.error('Database update failed:', error);
      setResult({
        success: false,
        nodeId,
        error: 'Update error: ' + error.message
      });
    } finally {
      setLoading(false);
    }
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
            Faculty Data Importer
          </h1>



          <p style={{ margin: '0 0 30px 0', color: 'black', fontSize: '1.2rem', opacity: 0.8 }}>
            Import faculty profile data from Pondicherry University
          </p>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
          {/* Faculty Import */}
          <div style={{
            padding: '15px',
            marginBottom: '20px',
            paddingTop: '0px'
          }}>
            <h3 style={{
              color: '#2c3e50',
              marginBottom: '15px',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              Faculty Data Management
            </h3>

            <div style={{
              backgroundColor: '#e8f4fd',
              border: '1px solid #bee5eb',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '25px',
              textAlign: 'center'
            }}>
              <p style={{
                margin: '0 0 10px 0',
                fontSize: '16px',
                color: '#0c5460',
                fontWeight: '600'
              }}>
                📝 <strong>Update My Profile:</strong> Enter a faculty Node ID and click "Update My Profile"
                to add their academic data to your current profile.
              </p>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#0c5460',
                opacity: 0.8
              }}>
                Your email and login credentials will remain unchanged. Only academic data (publications, experience, etc.) will be added.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <input
                type="text"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                placeholder="Enter Faculty Node ID (e.g., 941)"
                style={{
                  padding: '18px 24px',
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  fontSize: '16px',
                  width: '320px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
              />
              <button
                onClick={handleSingleImport}
                disabled={loading || !nodeId}
                style={{
                  padding: '18px 36px',
                  backgroundColor: loading || !nodeId ? '#95a5a6' : '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: loading || !nodeId ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Importing...' : 'Import Faculty'}
              </button>

              <button
                onClick={handleUpdateDatabase}
                disabled={loading || !nodeId}
                style={{
                  padding: '18px 36px',
                  backgroundColor: loading || !nodeId ? '#95a5a6' : '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: loading || !nodeId ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (!loading && nodeId) {
                    e.target.style.backgroundColor = '#2980b9';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading && nodeId) {
                    e.target.style.backgroundColor = '#3498db';
                  }
                }}
              >
                {loading ? 'Updating My Profile...' : 'Update My Profile'}
              </button>
            </div>
          </div>

          {loading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '50px',
              backgroundColor: '#f8f9fa',
              borderRadius: '16px',
              marginBottom: '30px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '6px solid #f3f3f3',
                borderTop: '6px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div style={{ marginBottom: '40px' }}>
              {/* Single Import Result */}
              <div style={{
                padding: '20px',
                backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                border: result.success ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                borderRadius: '12px',
                color: result.success ? '#155724' : '#721c24',
                marginBottom: '20px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
                  {result.success ?
                    (result.updated ? 'Your Profile Updated Successfully! 🎉' : 'Import Successful') :
                    (result.updated ? 'Profile Update Failed' : 'Import Failed')
                  }
                </h4>
                <p style={{ margin: '5px 0' }}><strong>Node ID:</strong> {result.nodeId}</p>
                {result.updated && result.success && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ margin: '5px 0', fontWeight: '600' }}>✅ {result.message}</p>
                    <div style={{
                      backgroundColor: '#d1ecf1',
                      border: '1px solid #bee5eb',
                      borderRadius: '8px',
                      padding: '15px',
                      marginTop: '10px'
                    }}>
                      <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#0c5460' }}>
                        📄 Your profile has been updated! You can now view the data at:
                      </p>
                      <div style={{ fontSize: '14px', color: '#0c5460' }}>
                        • <a href="/experience" style={{color: '#0c5460'}}>Experience Page</a> - Teaching, research & industry experience<br/>
                        • <a href="/publications" style={{color: '#0c5460'}}>Publications Page</a> - Papers, journals & conference proceedings<br/>
                        • <a href="/books" style={{color: '#0c5460'}}>Books Page</a> - Authored & edited books<br/>
                        • <a href="/profile" style={{color: '#0c5460'}}>Profile Page</a> - Complete academic profile
                      </div>
                    </div>
                    {result.recordId && (
                      <p style={{ margin: '5px 0' }}><strong>Record ID:</strong> {result.recordId}</p>
                    )}
                    {result.mergeStats && (
                      <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                        <p style={{ margin: '2px 0' }}><strong>Merge Statistics:</strong></p>
                        {Object.entries(result.mergeStats).map(([field, stats]) => (
                          <p key={field} style={{ margin: '2px 0', paddingLeft: '10px' }}>
                            • {field}: {stats.added || 0} added, {stats.updated || 0} updated, {stats.skipped || 0} skipped
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {result.error && (
                  <p style={{ margin: '10px 0 0 0', fontWeight: '600' }}>❌ {result.error}</p>
                )}
                {result.success ? (
                  <div>
                    {result.data && (
                      <div style={{ marginTop: '20px' }}>
                        {/* Faculty Name, Designation, Department, and Email */}
                        {(result.data.name || result.data.designation || result.data.department || result.data.email) && (
                          <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#e8f4f8', borderRadius: '12px', borderLeft: '4px solid #007bff' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#2c3e50' }}>
                              {result.data.name}
                            </div>
                            {result.data.designation && (
                              <div style={{ fontSize: '1.2rem', color: '#555', marginTop: '8px', fontStyle: 'italic' }}>
                                {result.data.designation}
                              </div>
                            )}
                            {result.data.department && (
                              <div style={{ fontSize: '1.1rem', color: '#6c757d', marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '8px' }}>🏢</span>
                                <span>{result.data.department}</span>
                              </div>
                            )}
                            {result.data.email && (
                              <div style={{ fontSize: '1.1rem', color: '#007bff', marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '8px' }}>📧</span>
                                <a
                                  href={`mailto:${result.data.email}`}
                                  style={{
                                    color: '#007bff',
                                    textDecoration: 'none',
                                    borderBottom: '1px solid transparent',
                                    transition: 'border-bottom 0.2s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.borderBottom = '1px solid #007bff'}
                                  onMouseOut={(e) => e.target.style.borderBottom = '1px solid transparent'}
                                >
                                  {result.data.email}
                                </a>
                              </div>
                            )}
                            {result.data.home?.specialization && result.data.home.specialization.length > 0 && (
                              <div style={{ fontSize: '1.1rem', color: '#28a745', marginTop: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                  <span style={{ marginRight: '8px' }}>🎯</span>
                                  <span style={{ fontWeight: 'bold' }}>Areas of Specialization:</span>
                                </div>
                                <div style={{ marginLeft: '24px' }}>
                                  {result.data.home.specialization.map((area, index) => (
                                    <span
                                      key={index}
                                      style={{
                                        display: 'inline-block',
                                        backgroundColor: '#d4edda',
                                        color: '#155724',
                                        padding: '6px 12px',
                                        margin: '4px 8px 4px 0',
                                        borderRadius: '20px',
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        border: '1px solid #c3e6cb'
                                      }}
                                    >
                                      {area}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Detailed Tables Section */}
                        <div style={{ marginTop: '30px' }}>

                          {/* Home Section */}
                          {result.data.home && (
                            <div style={{ marginTop: '40px' }}>
                              <h3 style={{ color: '#28a745', fontSize: '24px', marginBottom: '20px', fontWeight: '600', borderBottom: '2px solid #28a745', paddingBottom: '10px' }}>
                                🏠 Home Profile
                              </h3>

                              {/* Educational Qualification */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🎓 Educational Qualification', 'education', '#007bff')}
                                {tableVisibility.education && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Degree</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Title</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>University</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Year</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.home.education && result.data.home.education.map((edu, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500' }}>{edu.degree || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{edu.title || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{edu.university || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{edu.graduationYear || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Awards / Prizes Conferred */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🏆 Awards / Prizes Conferred', 'awards', '#fd7e14')}
                                {tableVisibility.awards && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                      <tr style={{ backgroundColor: '#fd7e14', color: 'white' }}>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dc6900', width: '60px' }}>S.No</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc6900' }}>Title</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc6900' }}>Type</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc6900' }}>Agency</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc6900' }}>Year</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc6900' }}>Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {result.data.home.awards && result.data.home.awards.map((award, index) => (
                                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#fd7e14' }}>{index + 1}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500' }}>{award.title || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{award.type || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{award.agency || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{award.year || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', color: '#28a745' }}>{award.amount || 'N/A'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Experience Tables */}
                          {result.data.experience && (
                            <div style={{ marginTop: '40px' }}>
                              <h3 style={{ color: '#17a2b8', fontSize: '24px', marginBottom: '20px', fontWeight: '600', borderBottom: '2px solid #17a2b8', paddingBottom: '10px' }}>
                                💼 Professional Experience
                              </h3>

                              {/* Teaching Experience */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('👨‍🏫 Teaching Experience', 'teachingExperience', '#28a745')}
                                {tableVisibility.teachingExperience && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #1e7e34', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Designation</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Department</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Institution</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Duration/Notes</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.experience.teaching && result.data.experience.teaching.map((exp, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#28a745' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500' }}>{exp.designation || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{exp.department || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{exp.institution || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{exp.duration || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Research Experience */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🧪 Research Experience', 'researchExperience', '#6f42c1')}
                                {tableVisibility.researchExperience && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #5a2d91', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Designation</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Department</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Institution</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Duration/Notes</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.experience.research && result.data.experience.research.map((exp, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#6f42c1' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500' }}>{exp.designation || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{exp.department || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{exp.institution || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{exp.duration || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Industry Experience */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🏭 Industry Experience', 'industryExperience', '#e83e8c')}
                                {tableVisibility.industryExperience && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#e83e8c', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dc1a6b', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc1a6b' }}>Designation</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc1a6b' }}>Company/Corporate</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc1a6b' }}>Nature of Work</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.experience.industry && result.data.experience.industry.map((exp, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#e83e8c' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500' }}>{exp.designation || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{exp.company || exp.institution || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{exp.natureOfWork || exp.duration || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Research Guidance Table */}
                          {result.data.research_guidance?.phd_guidance && result.data.research_guidance.phd_guidance.length > 0 && (
                            <div style={{ marginBottom: '30px' }}>
                              {createTableHeader('🔬 PhD Research Guidance', 'phdGuidance', '#dc3545')}
                              {tableVisibility.phdGuidance && (
                                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                      <tr style={{ backgroundColor: '#dc3545', color: 'white' }}>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #c82333', width: '60px' }}>S.No</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Student Name</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Registration No</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Registration Date</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Thesis Title</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Status</th>
                                      </tr>
                                    </thead>
                                  <tbody>
                                    {result.data.research_guidance.phd_guidance.map((guidance, index) => (
                                      <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#dc3545' }}>{index + 1}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500' }}>{guidance.studentName || 'N/A'}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.registrationNo || 'N/A'}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.registrationDate || 'N/A'}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '300px', wordWrap: 'break-word' }}>{guidance.thesisTitle || 'N/A'}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                          <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: guidance.status === 'YES' ? '#d4edda' : '#f8d7da',
                                            color: guidance.status === 'YES' ? '#155724' : '#721c24',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                          }}>
                                            {guidance.status === 'YES' ? 'Completed' : 'In Progress'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                </div>
                              )}
                            </div>
                          )}





                          {/* Patents/Papers Section */}
                          {result.data.innovation && (
                            <div style={{ marginTop: '40px' }}>
                              <h3 style={{ color: '#dc3545', fontSize: '24px', marginBottom: '20px', fontWeight: '600', borderBottom: '2px solid #dc3545', paddingBottom: '10px' }}>
                                📋 Patents & Research Publications
                              </h3>

                              {/* Innovation Contributions */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🔬 Contribution towards Innovation', 'innovationContributions', '#6610f2')}
                                {tableVisibility.innovationContributions && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                      <tr style={{ backgroundColor: '#6610f2', color: 'white' }}>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #520dc2', width: '60px' }}>S.No</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #520dc2' }}>Name of the Work/Contribution</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #520dc2' }}>Specialization</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #520dc2' }}>Remarks</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {result.data.innovation.contributions && result.data.innovation.contributions.map((contrib, index) => (
                                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#6610f2' }}>{index + 1}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500' }}>{contrib.workName || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{contrib.specialization || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{contrib.remarks || 'N/A'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  </div>
                                )}
                              </div>

                              {/* Patent Details */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('📜 Patent Details', 'patentDetails', '#20c997')}
                                {tableVisibility.patentDetails && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                      <tr style={{ backgroundColor: '#20c997', color: 'white' }}>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #1aa179', width: '60px' }}>S.No</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1aa179' }}>Title</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1aa179' }}>Status</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1aa179' }}>Patent Number</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1aa179' }}>Year of Award</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1aa179' }}>Type</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1aa179' }}>Commercialized Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {result.data.innovation.patents && result.data.innovation.patents.map((patent, index) => (
                                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#20c997' }}>{index + 1}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '250px', wordWrap: 'break-word' }}>{patent.title || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                            <span style={{
                                              padding: '4px 8px',
                                              borderRadius: '4px',
                                              backgroundColor: patent.status?.toLowerCase() === 'granted' ? '#d4edda' : '#fff3cd',
                                              color: patent.status?.toLowerCase() === 'granted' ? '#155724' : '#856404',
                                              fontSize: '12px',
                                              fontWeight: '500'
                                            }}>
                                              {patent.status || 'N/A'}
                                            </span>
                                          </td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{patent.patentNumber || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{patent.yearOfAward || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{patent.type || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                            <span style={{
                                              padding: '4px 8px',
                                              borderRadius: '4px',
                                              backgroundColor: patent.commercializedStatus?.toLowerCase() === 'yes' ? '#d1ecf1' : '#f8d7da',
                                              color: patent.commercializedStatus?.toLowerCase() === 'yes' ? '#0c5460' : '#721c24',
                                              fontSize: '12px',
                                              fontWeight: '500'
                                            }}>
                                              {patent.commercializedStatus || 'N/A'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  </div>
                                )}
                              </div>

                              {/* UGC Approved Papers */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('📚 Papers Published in UGC Approved Journals', 'ugcPapers', '#0d6efd')}
                                {tableVisibility.ugcPapers && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                      <tr style={{ backgroundColor: '#0d6efd', color: 'white' }}>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #0a58ca', width: '60px' }}>S.No</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0a58ca' }}>Title</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0a58ca' }}>Authors</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0a58ca' }}>Journal Name</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0a58ca' }}>Volume, Issue & Page Nos.</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0a58ca' }}>Year</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0a58ca' }}>Impact Factor</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {result.data.innovation.ugc_papers && result.data.innovation.ugc_papers.map((paper, index) => (
                                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#0d6efd' }}>{index + 1}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '300px', wordWrap: 'break-word' }}>{paper.title || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{paper.authors || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{paper.journalName || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{paper.volumeIssuePages || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{paper.year || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', color: '#198754' }}>{paper.impactFactor || 'N/A'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  </div>
                                )}
                              </div>

                              {/* Non-UGC Papers */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('📄 Papers Published in Non UGC Approved Peer Reviewed Journals', 'nonUgcPapers', '#6f42c1')}
                                {tableVisibility.nonUgcPapers && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                      <tr style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #5a2d91', width: '60px' }}>S.No</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Title</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Authors</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Journal Name</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Volume, Issue & Page Nos.</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Year</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Impact Factor</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {result.data.innovation.non_ugc_papers && result.data.innovation.non_ugc_papers.map((paper, index) => (
                                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#6f42c1' }}>{index + 1}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '300px', wordWrap: 'break-word' }}>{paper.title || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{paper.authors || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{paper.journalName || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{paper.volumeIssuePages || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{paper.year || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', color: '#198754' }}>{paper.impactFactor || 'N/A'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  </div>
                                )}
                              </div>

                              {/* Conference Papers */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🎤 Papers Published in Conference Proceedings', 'conferencePapers', '#fd7e14')}
                                {tableVisibility.conferencePapers && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                      <tr style={{ backgroundColor: '#fd7e14', color: 'white' }}>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dc6900', width: '60px' }}>S.No</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc6900' }}>Title</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc6900' }}>Authors</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc6900' }}>Details of Conference Publication</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc6900' }}>Page Nos.</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc6900' }}>Year</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {result.data.innovation.conference_papers && result.data.innovation.conference_papers.map((paper, index) => (
                                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#fd7e14' }}>{index + 1}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '300px', wordWrap: 'break-word' }}>{paper.title || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{paper.authors || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '250px', wordWrap: 'break-word' }}>{paper.conferenceDetails || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{paper.pageNos || 'N/A'}</td>
                                          <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{paper.year || 'N/A'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Books Section */}
                          {result.data.books && (
                            <div style={{ marginTop: '40px' }}>
                              <h3 style={{ color: '#6f42c1', fontSize: '24px', marginBottom: '20px', fontWeight: '600', borderBottom: '2px solid #6f42c1', paddingBottom: '10px' }}>
                                📚 Books & Publications
                              </h3>

                              {/* Authored Books */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('📚 Authored Books', 'authoredBooks', '#17a2b8')}
                                {tableVisibility.authoredBooks && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#17a2b8', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #138496', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #138496' }}>Title of the Book</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #138496' }}>Name of the Authors as per the order in Book</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #138496' }}>Publisher</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #138496' }}>Year</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #138496' }}>ISBN No.</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.books.authored_books && result.data.books.authored_books.map((book, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#17a2b8' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '300px', wordWrap: 'break-word' }}>{book.title || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '250px', wordWrap: 'break-word' }}>{book.authors || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{book.publisher || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{book.year || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{book.isbn || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Edited Books */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('� Edited Books', 'editedBooks', '#6f42c1')}
                                {tableVisibility.editedBooks && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #5a2d91', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Title of the Book</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Name of the Authors as per the order in Book</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Publisher</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Year</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>ISBN No.</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.books.edited_books && result.data.books.edited_books.map((book, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#6f42c1' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '300px', wordWrap: 'break-word' }}>{book.title || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '250px', wordWrap: 'break-word' }}>{book.authors || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{book.publisher || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{book.year || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{book.isbn || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Chapters in Books */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('� Chapters in Books', 'bookChapters', '#e83e8c')}
                                {tableVisibility.bookChapters && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#e83e8c', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dc1a6b', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc1a6b' }}>Title of the Chapters</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc1a6b' }}>Name of the Authors</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc1a6b' }}>Title of the Book</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc1a6b' }}>Publisher</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc1a6b' }}>Year</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc1a6b' }}>ISBN No.</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.books.book_chapters && result.data.books.book_chapters.map((chapter, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#e83e8c' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '280px', wordWrap: 'break-word' }}>{chapter.chapterTitle || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{chapter.authors || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '250px', wordWrap: 'break-word' }}>{chapter.bookTitle || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{chapter.publisher || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{chapter.year || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{chapter.isbn || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Projects/Consultancy Tables */}
                          {result.data.projects && (
                            <div style={{ marginTop: '40px' }}>
                              <h3 style={{ color: '#007bff', fontSize: '24px', marginBottom: '20px', fontWeight: '600', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
                                📊 Projects & Consultancy
                              </h3>

                              {/* Table 1 - Ongoing Projects */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🚀 Ongoing Projects', 'ongoingProjects', '#28a745')}
                                {tableVisibility.ongoingProjects && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #1e7e34', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Title of the Project</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Sponsored By</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Period</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Sanctioned Amount(Rs. Lakh)</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Year</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.projects.ongoing_projects.map((project, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#28a745' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '300px', wordWrap: 'break-word' }}>{project.title || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{project.sponsoredBy || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{project.period || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{project.sanctionedAmount || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{project.year || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 2 - Ongoing Consultancy Works */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('💼 Ongoing Consultancy Works', 'ongoingConsultancy', '#fd7e14')}
                                {tableVisibility.ongoingConsultancy && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#fd7e14', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e55a00', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Title of the Consultancy Work</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Sponsored By</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Period</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Sanctioned Amount(Rs. Lakh)</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Year</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.projects.ongoing_consultancy.map((consultancy, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#fd7e14' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '300px', wordWrap: 'break-word' }}>{consultancy.title || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{consultancy.sponsoredBy || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{consultancy.period || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{consultancy.sanctionedAmount || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{consultancy.year || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 3 - Completed Projects */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('✅ Completed Projects', 'completedProjects', '#17a2b8')}
                                {tableVisibility.completedProjects && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#17a2b8', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #117a8b', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #117a8b' }}>Title of the Project</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #117a8b' }}>Sponsored By</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #117a8b' }}>Period</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #117a8b' }}>Sanctioned Amount(Rs. Lakh)</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #117a8b' }}>Year</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.projects.completed_projects.map((project, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#17a2b8' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '300px', wordWrap: 'break-word' }}>{project.title || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{project.sponsoredBy || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{project.period || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{project.sanctionedAmount || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{project.year || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 4 - Completed Consultancy Works */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🏆 Completed Consultancy Works', 'completedConsultancy', '#dc3545')}
                                {tableVisibility.completedConsultancy && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#dc3545', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #c82333', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Title of the Consultancy Work</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Sponsored By</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Period</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Sanctioned Amount(Rs. Lakh)</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Year</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.projects.completed_consultancy.map((consultancy, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#dc3545' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '300px', wordWrap: 'break-word' }}>{consultancy.title || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{consultancy.sponsoredBy || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{consultancy.period || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{consultancy.sanctionedAmount || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{consultancy.year || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Research Guidance Tables */}
                          {result.data.research_guidance && (
                            <div style={{ marginTop: '40px' }}>
                              <h3 style={{ color: '#6f42c1', fontSize: '24px', marginBottom: '20px', fontWeight: '600', borderBottom: '2px solid #6f42c1', paddingBottom: '10px' }}>
                                🎓 Research Guidance
                              </h3>

                              {/* Table 3 - Research Guidance - PG */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('📋 Research Guidance - PG', 'pgGuidance', '#007bff')}
                                {tableVisibility.pgGuidance && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #0056b3', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Year</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Degree</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>No. of Students Awarded</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Department/Centre</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.research_guidance.pg_guidance.map((guidance, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#007bff' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.year || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500' }}>{guidance.degree || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.studentsAwarded || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.department || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 4 - Research Guidance - Ph.D */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🎯 Research Guidance - Ph.D', 'phdGuidanceDetailed', '#28a745')}
                                {tableVisibility.phdGuidanceDetailed && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #1e7e34', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Student Name</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Registration Date</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Registration No.</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Thesis Title</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Thesis Submitted Status</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Thesis Submitted Date</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Vivavoce Completed Status</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Date Awarded</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.research_guidance.phd_guidance.map((guidance, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#28a745' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '200px', wordWrap: 'break-word' }}>{guidance.studentName || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.registrationDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.registrationNo || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '250px', wordWrap: 'break-word' }}>{guidance.thesisTitle || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.thesisSubmittedStatus || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.thesisSubmittedDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.vivavoceCompletedStatus || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.dateAwarded || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 5 - Research Guidance - Post Doctoral */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🌟 Research Guidance - Post Doctoral', 'postdocGuidance', '#fd7e14')}
                                {tableVisibility.postdocGuidance && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#fd7e14', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e55a00', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Scholar Name</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Designation</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Funding Agency</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Fellowship Title</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Year of Joining</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Year of Completion</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.research_guidance.postdoc_guidance.map((guidance, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#fd7e14' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '200px', wordWrap: 'break-word' }}>{guidance.scholarName || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.designation || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{guidance.fundingAgency || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '250px', wordWrap: 'break-word' }}>{guidance.fellowshipTitle || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.yearOfJoining || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{guidance.yearOfCompletion || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Conferences/Seminars/Workshops Tables */}
                          {result.data.conferences_seminars && (
                            <div style={{ marginTop: '40px' }}>
                              <h3 style={{ color: '#17a2b8', fontSize: '24px', marginBottom: '20px', fontWeight: '600', borderBottom: '2px solid #17a2b8', paddingBottom: '10px' }}>
                                🎤 Conferences, Seminars & Workshops
                              </h3>

                              {/* Table 2 - E-Lecture Details */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('💻 E-Lecture Details', 'eLectures', '#007bff')}
                                {tableVisibility.eLectures && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #0056b3', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>E-Lecture Title</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Content/Module Title</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Institution/Platform</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Year</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Weblink</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Member of Editorial Bodies</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Reviewer/Referee of</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.conferences_seminars.e_lectures.map((lecture, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#007bff' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '200px', wordWrap: 'break-word' }}>{lecture.lectureTitle || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{lecture.contentTitle || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{lecture.institution || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{lecture.year || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '150px', wordWrap: 'break-word' }}>{lecture.weblink || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{lecture.editorialBodies || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{lecture.reviewer || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 3 - Details of Online Education Conducted */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🌐 Details of Online Education Conducted', 'onlineEducation', '#28a745')}
                                {tableVisibility.onlineEducation && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #1e7e34', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Nature of Online Course</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>No. of Sessions</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Target Group</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Date</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.conferences_seminars.online_education.map((education, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#28a745' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '250px', wordWrap: 'break-word' }}>{education.nature || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{education.sessions || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{education.targetGroup || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{education.date || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 4 - Invited Talks in Conference/Seminar/Workshop/Training Programme */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🎯 Invited Talks in Conference/Seminar/Workshop/Training Programme', 'invitedTalks', '#fd7e14')}
                                {tableVisibility.invitedTalks && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#fd7e14', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e55a00', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Title of the Paper</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Conference/Seminar/Workshop/Training Programme</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Organized by</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Level</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>From</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>To</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Year</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.conferences_seminars.invited_talks.map((talk, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#fd7e14' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '200px', wordWrap: 'break-word' }}>{talk.paperTitle || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{talk.programme || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '150px', wordWrap: 'break-word' }}>{talk.organizedBy || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{talk.level || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{talk.fromDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{talk.toDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{talk.year || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 5 - Conferences/Seminars Organized */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🏛️ Conferences/Seminars Organized', 'organizedConferences', '#6f42c1')}
                                {tableVisibility.organizedConferences && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #5a2d91', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Title of the Programme</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Sponsors</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Venue & Duration</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Level</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>From</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>To</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Year</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.conferences_seminars.organized_conferences.map((conference, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#6f42c1' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '250px', wordWrap: 'break-word' }}>{conference.programmeTitle || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '150px', wordWrap: 'break-word' }}>{conference.sponsors || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{conference.venue || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{conference.level || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{conference.fromDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{conference.toDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{conference.year || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 6 - Workshop Organized */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🔧 Workshop Organized', 'organizedWorkshops', '#dc3545')}
                                {tableVisibility.organizedWorkshops && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#dc3545', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #c82333', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Title of the Programme</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Sponsors</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Venue & Duration</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Level</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>From</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>To</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Year</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.conferences_seminars.organized_workshops.map((workshop, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#dc3545' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '250px', wordWrap: 'break-word' }}>{workshop.programmeTitle || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '150px', wordWrap: 'break-word' }}>{workshop.sponsors || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{workshop.venue || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{workshop.level || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{workshop.fromDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{workshop.toDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{workshop.year || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Collaboration/Affiliation Tables */}
                          {result.data.collaboration && (
                            <div style={{ marginTop: '40px' }}>
                              <h3 style={{ color: '#6c757d', fontSize: '24px', marginBottom: '20px', fontWeight: '600', borderBottom: '2px solid #6c757d', paddingBottom: '10px' }}>
                                🤝 Affiliation & Collaboration
                              </h3>

                              {/* Table 3 - Academic/Administration Activities */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🎓 Participation & Extension Activities (Academic/Administration)', 'academicAdministration', '#007bff')}
                                {tableVisibility.academicAdministration && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #0056b3', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Name of the Position (Head, Dean, Co-ordinator, Director, etc.)</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Duration</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Nature of Duties</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.collaboration.academic_administration.map((admin, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#007bff' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '300px', wordWrap: 'break-word' }}>{admin.position || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{admin.duration || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '250px', wordWrap: 'break-word' }}>{admin.duties || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 5 - Co-Curricular Activities */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🏃 Participation & Extension Activities (Co-Curricular)', 'coCurricular', '#28a745')}
                                {tableVisibility.coCurricular && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #1e7e34', width: '60px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Name of the Position (NSS, NCC, Warden etc.)</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Duration</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Nature of Duties</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.collaboration.co_curricular.map((cocurricular, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#28a745' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '300px', wordWrap: 'break-word' }}>{cocurricular.position || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{cocurricular.duration || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '250px', wordWrap: 'break-word' }}>{cocurricular.duties || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 6 - Institutional Collaboration */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🏢 Collaboration with Institution/Industry', 'institutionalCollaboration', '#fd7e14')}
                                {tableVisibility.institutionalCollaboration && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#fd7e14', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e55a00', width: '50px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Collaborator Name</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Designation</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Institution/Industry</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Type</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Nature of Collaboration</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00', backgroundColor: '#f8f9fa', color: '#fd7e14' }} colSpan="2">Period of Collaboration</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00', backgroundColor: '#f8f9fa', color: '#fd7e14' }} colSpan="2">Visits to Collaborating Institution/Industry</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Details of Collaborative Research/Teaching</th>
                                        </tr>
                                        <tr style={{ backgroundColor: '#f8f9fa', color: '#fd7e14' }}>
                                          <th style={{ padding: '8px', borderBottom: '1px solid #e55a00' }}></th>
                                          <th style={{ padding: '8px', borderBottom: '1px solid #e55a00' }}></th>
                                          <th style={{ padding: '8px', borderBottom: '1px solid #e55a00' }}></th>
                                          <th style={{ padding: '8px', borderBottom: '1px solid #e55a00' }}></th>
                                          <th style={{ padding: '8px', borderBottom: '1px solid #e55a00' }}></th>
                                          <th style={{ padding: '8px', borderBottom: '1px solid #e55a00' }}></th>
                                          <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e55a00', fontSize: '12px' }}>From Date</th>
                                          <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e55a00', fontSize: '12px' }}>To Date</th>
                                          <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e55a00', fontSize: '12px' }}>From Date</th>
                                          <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #e55a00', fontSize: '12px' }}>To Date</th>
                                          <th style={{ padding: '8px', borderBottom: '1px solid #e55a00' }}></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.collaboration.institutional_collaboration.map((collab, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#fd7e14' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '150px', wordWrap: 'break-word' }}>{collab.collaboratorName || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '120px', wordWrap: 'break-word' }}>{collab.designation || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '150px', wordWrap: 'break-word' }}>{collab.institution || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{collab.type || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '150px', wordWrap: 'break-word' }}>{collab.natureOfCollaboration || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontSize: '14px' }}>{collab.periodFromDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontSize: '14px' }}>{collab.periodToDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontSize: '14px' }}>{collab.visitFromDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontSize: '14px' }}>{collab.visitToDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{collab.collaborativeDetails || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Programme Tables */}
                          {result.data.programmes && (
                            <div style={{ marginTop: '40px' }}>
                              <h3 style={{ color: '#495057', fontSize: '24px', marginBottom: '20px', fontWeight: '600', borderBottom: '2px solid #495057', paddingBottom: '10px' }}>
                                📚 Programme Development & Participation
                              </h3>

                              {/* Table 1 - Faculty Development Programme */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🎓 Faculty Development Programme Attended', 'facultyDevelopment', '#007bff')}
                                {tableVisibility.facultyDevelopment && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #0056b3', width: '50px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Title of the FDP</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Organiser</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Venue</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Duration</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>From Date</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>To Date</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Year</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.programmes.faculty_development.map((fdp, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#007bff' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '250px', wordWrap: 'break-word' }}>{fdp.title || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '200px', wordWrap: 'break-word' }}>{fdp.organiser || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '150px', wordWrap: 'break-word' }}>{fdp.venue || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{fdp.duration || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{fdp.fromDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{fdp.toDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{fdp.year || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 2 - Executive Development Programme */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('💼 Executive Development Programme Conducted', 'executiveDevelopment', '#28a745')}
                                {tableVisibility.executiveDevelopment && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #1e7e34', width: '50px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Name of the Programme</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>No. of Participants</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Venue</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Duration</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>From Date</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>To Date</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Year</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Revenue Generated</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.programmes.executive_development.map((edp, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#28a745' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '200px', wordWrap: 'break-word' }}>{edp.programName || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>{edp.participants || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '150px', wordWrap: 'break-word' }}>{edp.venue || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{edp.duration || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{edp.fromDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{edp.toDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{edp.year || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', color: '#28a745' }}>{edp.revenue || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 3 - Special Programmes */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🏛️ IMPRESS/IMPRINT/SPARC/STARS/LEAP Programme Participation', 'specialProgrammes', '#fd7e14')}
                                {tableVisibility.specialProgrammes && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#fd7e14', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e55a00', width: '50px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>IMPRESS/IMPRINT/SPARC/STARS/LEAP/Others</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Place</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>From Date</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>To Date</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e55a00' }}>Year</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.programmes.special_programmes.map((special, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#fd7e14' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '250px', wordWrap: 'break-word' }}>{special.programType || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', maxWidth: '150px', wordWrap: 'break-word' }}>{special.place || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{special.fromDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{special.toDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{special.year || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Table 4 - ARPIT Programme */}
                              <div style={{ marginBottom: '30px' }}>
                                {createTableHeader('🎯 Enrolment under ARPIT Programme', 'arpitProgrammes', '#6f42c1')}
                                {tableVisibility.arpitProgrammes && (
                                  <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #5a2d91', width: '50px' }}>S.No</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91' }}>Name of the Programme</th>
                                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #5a2d91', backgroundColor: '#f8f9fa', color: '#6f42c1' }} colSpan="2">Period of the Programme</th>
                                        </tr>
                                        <tr style={{ backgroundColor: '#f8f9fa', color: '#6f42c1' }}>
                                          <th style={{ padding: '8px', borderBottom: '1px solid #5a2d91' }}></th>
                                          <th style={{ padding: '8px', borderBottom: '1px solid #5a2d91' }}></th>
                                          <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #5a2d91', fontSize: '12px' }}>From Date</th>
                                          <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #5a2d91', fontSize: '12px' }}>To Date</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {result.data.programmes.arpit_programmes.map((arpit, index) => (
                                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center', fontWeight: '600', color: '#6f42c1' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500', maxWidth: '300px', wordWrap: 'break-word' }}>{arpit.programName || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>{arpit.fromDate || 'N/A'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>{arpit.toDate || 'N/A'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: '5px 0' }}><strong>Error:</strong> {result.error}</p>
                )}
              </div>
            </div>
          )}
          </div>

          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    </Layout>
  );
};

export default FacultyImporter;