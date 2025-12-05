import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from './LoadingSpinner';
import Layout from './Layout';

import { getApiUrl } from '../config/api';
function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDesignation, setuserDesignation] = useState('Assistant Professor');
  const [userName, setUserName] = useState('Professor');
  const [userRole, setUserRole] = useState('faculty'); // 'faculty' or 'hod'
  const [profileImage, setProfileImage] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [facultyStats, setFacultyStats] = useState({
    totalProfessors: 0,
    designationCounts: {}
  });
  const [accessRequestsCount, setAccessRequestsCount] = useState({
    incoming: 0,
    outgoing: 0
  });
  const [publicationsStats, setPublicationsStats] = useState({
    totalPublications: 0,
    yearWiseBreakdown: []
  });
  const [awardsStats, setAwardsStats] = useState({
    totalAwards: 0,
    topFacultyByAwards: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);

      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          const userInfo = JSON.parse(user);
          const decoded = jwtDecode(token);
          setUserName(userInfo.name || decoded.name || 'Professor');
          setUserRole(userInfo.role || decoded.role || 'faculty');

          // Fetch all data in parallel
          const promises = [
            fetchProfileData(),
            fetchAccessRequestsCount()
          ];

          // If user is HOD, also fetch faculty statistics
          if ((userInfo.role || decoded.role || 'faculty') === 'hod') {
            promises.push(fetchFacultyStats());
            promises.push(fetchPublicationsStats());
            promises.push(fetchAwardsStats());
          }

          await Promise.all(promises);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }

      setLoading(false);
    };

    initializeDashboard();
  }, []);

  const fetchProfileData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(getApiUrl("/api/professor/profile"), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const profileData = await response.json();
        // Update profile image from the fetched profile data
        if (profileData.profileImage) {
          setProfileImage(profileData.profileImage);
        }
        if (profileData.designation) {
          setuserDesignation(profileData.designation);
        }
        // Update last updated timestamp
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const fetchFacultyStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(getApiUrl("/api/faculty"), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const facultyData = await response.json();

        // Calculate statistics
        const totalProfessors = facultyData.length;
        const designationCounts = {};

        facultyData.forEach(faculty => {
          const designation = faculty.designation || 'Not Specified';
          designationCounts[designation] = (designationCounts[designation] || 0) + 1;
        });

        setFacultyStats({
          totalProfessors,
          designationCounts
        });
      }
    } catch (error) {
      console.error('Error fetching faculty statistics:', error);
    }
  };

  const fetchPublicationsStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(getApiUrl("/api/hod/publications-statistics"), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPublicationsStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching publications statistics:', error);
    }
  };

  const fetchAwardsStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(getApiUrl("/api/hod/awards-statistics"), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAwardsStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching awards statistics:', error);
    }
  };

  const fetchAccessRequestsCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch incoming requests count
      const incomingResponse = await fetch(
        getApiUrl("/api/access-requests/incoming"),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      let incomingCount = 0;
      if (incomingResponse.ok) {
        const incomingData = await incomingResponse.json();
        incomingCount = (incomingData.access_requests || []).filter(req => req.status === 'pending').length;
      }

      // Fetch outgoing requests count
      const outgoingResponse = await fetch(
        getApiUrl("/api/access-requests/outgoing"),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      let outgoingCount = 0;
      if (outgoingResponse.ok) {
        const outgoingData = await outgoingResponse.json();
        outgoingCount = (outgoingData.outgoing_access_requests || []).filter(req => req.status === 'pending').length;
      }

      setAccessRequestsCount({
        incoming: incomingCount,
        outgoing: outgoingCount
      });

    } catch (error) {
      console.error('Error fetching access requests count:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="app-page">
          <LoadingSpinner message="Loading dashboard..." />
        </div>
      </Layout>
    );
  }

  // Shared styles for HOD statistic cards to keep them perfectly aligned
  const statCardHeader = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px'
  };

  const statCardTitle = {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700
  };

  const statCardSubtitle = {
    margin: '6px 0 0',
    fontSize: '0.9rem',
    opacity: 0.9
  };

  const statCardIcon = {
    fontSize: '1.9rem'
  };

  const statCardValue = {
    fontSize: '3.2rem',
    fontWeight: 800,
    marginBottom: '16px',
    textAlign: 'center',
    width: '100%'
  };

  const statCardInner = {
    background: 'rgba(15, 23, 42, 0.22)',
    borderRadius: '18px',
    padding: '14px 18px',
    marginTop: '8px',
    minHeight: '120px',
    backdropFilter: 'blur(14px)'
  };

  return (
    <Layout>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .app-page {
              padding: 20px 16px !important;
            }
            .app-page-header {
              flex-direction: column !important;
              text-align: center !important;
              gap: 20px !important;
            }
            .app-page-title {
              font-size: 1.6rem !important;
            }
            .app-page-subtitle {
              font-size: 0.95rem !important;
            }
            .app-profile-stats {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
            .app-card {
              padding: 20px !important;
            }
            .dashboard-stat-card-header {
              flex-direction: row !important;
              align-items: flex-start !important;
              gap: 10px !important;
            }
            .dashboard-stat-card-icon {
              position: absolute !important;
              top: 20px !important;
              right: 20px !important;
            }
            .dashboard-stat-card-value {
              font-size: 2.5rem !important;
              margin-bottom: 12px !important;
            }
            .dashboard-stat-card-inner {
              min-height: auto !important;
              padding: 12px 14px !important;
            }
            .dashboard-quick-actions {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
            .dashboard-access-requests {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
          }
        `
      }} />
      <div className="app-page" style={{ padding: '32px 40px', minHeight: '100vh' }}>
        {/* Header with Profile Picture */}
        <div className="app-page-header" style={{ marginBottom: '28px', alignItems: 'center' }}>
          <div>
            <h1 className="app-page-title">Welcome back, {userName}!</h1>
            <p className="app-page-subtitle">
              {userRole === 'hod' ? 'Head of Department Dashboard' :
                userRole === 'dean' ? 'Dean Dashboard' :
                  userRole === 'guest_faculty' ? 'Guest Faculty Dashboard' :
                    'Faculty Dashboard'}
            </p>
            <p style={{
              fontSize: '0.9rem',
              color: '#a0aec0',
              marginTop: '6px',
              fontStyle: 'italic'
            }}>
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          </div>

          {/* Profile Picture */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexDirection: 'column'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: !profileImage ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '2rem',
              fontWeight: 700,
              boxShadow: '0 18px 45px rgba(15, 23, 42, 0.35)',
              border: '3px solid #fff',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%'
                  }}
                />
              ) : (
                userName.charAt(0) || '👨‍🏫'
              )}
            </div>
            <p style={{
              margin: 0,
              fontWeight: 600,
              fontSize: '1.2rem'
            }}>{userDesignation}</p>
          </div>
        </div>

        {/* Statistics Cards for HOD */}
        {userRole === 'hod' && (
          <div className="app-profile-stats" style={{ marginBottom: '32px' }}>
            {/* Faculty Statistics Card */}
            <div
              className="app-card"
              style={{
                background: 'linear-gradient(145deg, #6366f1 0%, #8b5cf6 40%, #ec4899 100%)',
                color: '#fff',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => navigate('/faculty')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 50px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(102, 126, 234, 0.3)';
              }}>
              <div style={statCardHeader} className="dashboard-stat-card-header">
                <div>
                  <h3 style={statCardTitle}>Faculty Overview</h3>
                  <p style={statCardSubtitle}>Distribution by designation in your department</p>
                </div>
                <span style={statCardIcon} className="dashboard-stat-card-icon">👥</span>
              </div>

              <div style={statCardValue} className="dashboard-stat-card-value">
                {facultyStats.totalProfessors}
              </div>

              <div style={statCardInner} className="dashboard-stat-card-inner">

                {Object.entries(facultyStats.designationCounts).map(([designation, count]) => (
                  <div key={designation} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                      marginBottom: '6px',
                      fontSize: '0.9rem'
                  }}>
                    <span>{designation}</span>
                    <span style={{
                      background: 'rgba(248, 250, 252, 0.24)',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontWeight: 600
                    }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Publications Statistics Card */}
            <div
              className="app-card"
              style={{
                background: 'linear-gradient(145deg, #0ea5e9 0%, #38bdf8 40%, #22c55e 100%)',
                color: '#fff',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => navigate('/publications')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 50px rgba(79, 172, 254, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(79, 172, 254, 0.3)';
              }}>
              <div style={statCardHeader} className="dashboard-stat-card-header">
                <div>
                  <h3 style={statCardTitle}>Faculty Publications</h3>
                  <p style={statCardSubtitle}>Consolidated publications across all faculty</p>
                </div>
                <span style={statCardIcon} className="dashboard-stat-card-icon">📚</span>
              </div>

              <div style={statCardValue} className="dashboard-stat-card-value">
                {publicationsStats.totalPublications}
              </div>

              <div style={statCardInner} className="dashboard-stat-card-inner">
                <div style={{
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>Last 3 Years</div>

                {publicationsStats.yearWiseBreakdown.length > 0 ? (
                  publicationsStats.yearWiseBreakdown.map(([year, count]) => (
                    <div key={year} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                      fontSize: '0.85rem'
                    }}>
                      <span>{year}</span>
                      <span style={{
                        background: 'rgba(248, 250, 252, 0.24)',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontWeight: 600
                      }}>{count}</span>
                    </div>
                  ))
                ) : (
                  <div style={{
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    opacity: 0.8
                  }}>
                    No publications in last 3 years
                  </div>
                )}
              </div>
            </div>

            {/* Awards Statistics Card */}
            <div
              className="app-card"
              style={{
                background: 'linear-gradient(145deg, #f97316 0%, #facc15 45%, #22c55e 100%)',
                color: '#fff',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => navigate('/fellowship')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 50px rgba(250, 112, 154, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(250, 112, 154, 0.3)';
              }}>
              <div style={statCardHeader} className="dashboard-stat-card-header">
                <div>
                  <h3 style={statCardTitle}>Department Awards</h3>
                  <p style={statCardSubtitle}>Recognition and achievements across the department</p>
                </div>
                <span style={statCardIcon} className="dashboard-stat-card-icon">🏆</span>
              </div>

              <div style={statCardValue} className="dashboard-stat-card-value">
                {awardsStats.totalAwards}
              </div>

              <div style={statCardInner} className="dashboard-stat-card-inner">
                <div style={{
                  fontSize: '0.9rem',
                  marginBottom: '8px',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>Top Faculty by Awards</div>

                {awardsStats.topFacultyByAwards.length > 0 ? (
                  awardsStats.topFacultyByAwards.map((faculty, index) => (
                    <div key={faculty.name} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{
                          background: 'rgba(248, 250, 252, 0.24)',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          marginRight: '8px'
                        }}>
                          {index + 1}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '120px'
                        }}>
                          {faculty.name}
                        </span>
                      </div>
                      <span style={{
                        background: 'rgba(248, 250, 252, 0.24)',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}>{faculty.awardCount}</span>
                    </div>
                  ))
                ) : (
                  <div style={{
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    opacity: 0.8
                  }}>
                    No awards data available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Access Request Notifications */}
        {(accessRequestsCount.incoming > 0 || accessRequestsCount.outgoing > 0) && (
          <div className="app-card" style={{ marginBottom: '24px' }}>
            <div className="app-card-header">
              <div>
                <h2 className="app-card-title">Access Request Notifications</h2>
                <p className="app-card-description">Quickly jump into requests that need your attention.</p>
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}
            className="dashboard-access-requests"
            >
              {accessRequestsCount.incoming > 0 && (
                <div
                  onClick={() => navigate('/access-requests')}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#fff',
                    padding: '20px',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                    width: 'fit-content'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                    Incoming Requests
                  </h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '2rem', fontWeight: 700 }}>
                    {accessRequestsCount.incoming}
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                    Click to review
                  </p>
                </div>
              )}

              {accessRequestsCount.outgoing > 0 && (
                <div
                  onClick={() => navigate('/access-requests')}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#fff',
                    padding: '20px',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📤</div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                    Pending Requests
                  </h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '2rem', fontWeight: 700 }}>
                    {accessRequestsCount.outgoing}
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                    Waiting for response
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state when no notifications */}
        {(accessRequestsCount.incoming === 0 && accessRequestsCount.outgoing === 0) && (
          <div className="app-card" style={{ marginBottom: '24px' }}>
            <div className="app-card-header">
              <div>
                <h2 className="app-card-title">No Pending Requests</h2>
                <p className="app-card-description">You’re all caught up. New access requests will appear here.</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="app-card">
          <div className="app-card-header">
            <div>
              <h2 className="app-card-title">Quick Actions</h2>
              <p className="app-card-description">Jump straight to the most common workflows.</p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
          }}
          className="dashboard-quick-actions"
          >
            <button
              onClick={() => navigate('/faculty')}
              className="app-btn app-btn-primary"
            >
              👥 Faculty Directory
            </button>

            <button
              onClick={() => navigate('/access-requests')}
              className="app-btn app-btn-secondary"
            >
              🔐 Access Requests
            </button>

            <button
              onClick={() => navigate('/report')}
              className="app-btn app-btn-secondary"
            >
              📊 Generate Report
            </button>

            <button
              onClick={() => navigate('/faculty-importer')}
              className="app-btn app-btn-primary"
            >
              📥 Import Faculty Data
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;