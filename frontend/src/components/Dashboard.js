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

  return (
    <Layout>
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
                cursor: 'pointer'
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}>Faculty Overview</h3>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '0.9rem',
                    opacity: 0.9
                  }}>Distribution by designation in your department</p>
                </div>
                <span style={{ fontSize: '1.8rem' }}>👥</span>
              </div>

              <div style={{
                fontSize: '3rem',
                fontWeight: 800,
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                {facultyStats.totalProfessors}
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.22)',
                borderRadius: '16px',
                padding: '14px 16px',
                marginTop: '16px',
                backdropFilter: 'blur(14px)'
              }}>

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
                cursor: 'pointer'
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}>Department Publications</h3>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '0.9rem',
                    opacity: 0.9
                  }}>Consolidated publications across all faculty</p>
                </div>
                <span style={{ fontSize: '1.8rem' }}>📚</span>
              </div>

              <div style={{
                fontSize: '3rem',
                fontWeight: 800,
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                {publicationsStats.totalPublications}
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.22)',
                borderRadius: '16px',
                padding: '14px 16px',
                marginTop: '16px',
                backdropFilter: 'blur(14px)'
              }}>
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
                cursor: 'pointer'
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}>Department Awards</h3>
                </div>
                <span style={{ fontSize: '1.8rem' }}>🏆</span>
              </div>

              <div style={{
                fontSize: '3rem',
                fontWeight: 800,
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                {awardsStats.totalAwards}
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.22)',
                borderRadius: '16px',
                padding: '14px 16px',
                marginTop: '16px',
                backdropFilter: 'blur(14px)'
              }}>
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
            }}>
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
          }}>
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