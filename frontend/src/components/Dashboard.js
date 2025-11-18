import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from './LoadingSpinner';

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Role-based menu items
  const baseMenuItems = [
    { label: 'Profile', path: '/profile', icon: '👤' },
    { label: 'Experience', path: '/experience', icon: '💼' },
    { label: 'Faculty', path: '/faculty', icon: '👥' },
    { label: 'Faculty Importer', path: '/faculty-importer', icon: '📥' },
    { label: 'Publications', path: '/publications', icon: '📄' },
    { label: 'Access Requests', path: '/access-requests', icon: '🔐' },
    { label: 'Patents', path: '/patents', icon: '💡' },
    { label: 'Fellowship', path: '/fellowship', icon: '🏆' },
    { label: 'Training & Consultancy', path: '/training', icon: '💰' },
    { label: 'MOU & Collaborations', path: '/mou', icon: '🤝' },
    { label: 'Books', path: '/books', icon: '📚' },
    { label: 'Research Guidance', path: '/research-guidance', icon: '👨‍🎓' },
    { label: 'Project & Consultancy', path: '/project-consultancy', icon: '🚀' },
    { label: 'E-Education', path: '/e-education', icon: '💻' },
    { label: 'Conference/ Seminar/ Workshop', path: '/conference-seminar-workshop', icon: '🎤' },
    { label: 'Participation & Collaboration', path: '/participation-collaboration', icon: '🤝' },
    { label: 'Programme Details', path: '/programme', icon: '📋' }
  ];

  const hodMenuItems = [
    ...baseMenuItems
    // Faculty directory is available in the base menu for all users
  ];

  const menuItems = userRole === 'hod' ? hodMenuItems : baseMenuItems;

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundSize: 'cover',
      display: 'flex', position: 'relative'
    }}>
      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(134, 133, 133, 0.3)',
            zIndex: 998
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '90px',
        background: 'linear-gradient(180deg, #6093ecff 0%, #1a202c 100%)',
        color: '#fff',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 999,
        boxShadow: sidebarOpen ? '4px 0 20px rgba(0,0,0,0.15)' : '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center'
        }}>
          {sidebarOpen && (
            <h3 style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 700,
              background: 'white',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Dashboard
            </h3>
          )}

          {/* Enhanced Burger Menu */}
          <div
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              background: sidebarOpen ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <div style={{
              width: '24px',
              height: '4px',
              background: '#fff',
              margin: '4px 0',
              borderRadius: '2px',
            }} />
            <div style={{
              width: '24px',
              height: '4px',
              background: '#fff',
              margin: '4px 0',
              borderRadius: '2px',
            }} />
            <div style={{
              width: '24px',
              height: '4px',
              background: '#fff',
              margin: '4px 0',
              borderRadius: '2px',
            }} />
          </div>
        </div>

        {/* Navigation Menu */}
        <div
          className="dashboard-menu-scroll"
          style={{
            flex: 1,
            padding: '5px 0',
            overflowY: 'auto',
            overflowX: 'hidden',
            maxHeight: 'calc(100vh - 160px)', // Account for header and logout button
          }}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
              .dashboard-menu-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .dashboard-menu-scroll::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.1);
                border-radius: 3px;
              }
              .dashboard-menu-scroll::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.3);
                border-radius: 3px;
              }
              .dashboard-menu-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.5);
              }
              .dashboard-menu-scroll {
                scrollbar-width: thin;
                scrollbar-color: rgba(255,255,255,0.3) transparent;
              }
            `
          }} />
          {menuItems.map((item, index) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: sidebarOpen ? '5px 24px' : '5px 15px',
                margin: '8px 16px',
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                background: 'transparent',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => navigate(item.path)}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <span style={{
                fontSize: '1.5rem',
                marginRight: sidebarOpen ? '16px' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px'
              }}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <span style={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  opacity: 0.9
                }}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div style={{ padding: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: sidebarOpen ? '12px 20px' : '12px',
              cursor: 'pointer',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s ease',
              justifyContent: sidebarOpen ? 'flex-start' : 'center'
            }}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.2rem', marginRight: sidebarOpen ? '12px' : '0' }}>➜]</span>
            {sidebarOpen && (
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#ef4444' }}>
                Logout
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '70px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        {/* Header with Profile Picture */}
        <div style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#2d3748',
              marginBottom: '8px',
              marginTop: 0,
              marginLeft: 20,
              fontFamily: 'Segoe UI, Arial, sans-serif',
              textShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}>
              Welcome back, {userName}!
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#718096',
              marginLeft: 20,
              margin: '0 0 0 20px'
            }}>
              {userRole === 'hod' ? 'Head of Department Dashboard' :
                userRole === 'dean' ? 'Dean Dashboard' :
                  userRole === 'guest_faculty' ? 'Guest Faculty Dashboard' :
                    'Faculty Dashboard'}
            </p>
            <p style={{
              fontSize: '0.9rem',
              color: '#a0aec0',
              marginLeft: 20,
              margin: '5px 0 0 20px',
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
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
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
              fontSize: '1.1rem',
              marginLeft: 20,
              margin: '0px 0 0 20px',
              fontWeight: 600,
              fontSize: '1.2rem'
            }}>{userDesignation}</p>
          </div>
        </div>

        {/* Statistics Cards for HOD */}
        {userRole === 'hod' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '25px',
            marginBottom: '40px'
          }}>
            {/* Faculty Statistics Card */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              padding: '25px',
              color: '#fff',
              boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease',
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
                marginBottom: '20px'
              }}>

                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.8rem',
                    fontWeight: 700
                  }}>Faculty Overview</h3>

                </div>
              </div>

              <div style={{
                fontSize: '3rem',
                fontWeight: 800,
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                {facultyStats.totalProfessors}
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '15px',
                marginTop: '20px'
              }}>

                {Object.entries(facultyStats.designationCounts).map(([designation, count]) => (
                  <div key={designation} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '5px',
                    fontSize: '0.95rem'
                  }}>
                    <span>{designation}</span>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 600
                    }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Publications Statistics Card */}
            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '20px',
              padding: '25px',
              color: '#fff',
              boxShadow: '0 10px 40px rgba(79, 172, 254, 0.3)',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease',
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
                marginBottom: '20px'
              }}>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.8rem',
                    fontWeight: 700
                  }}>Department Publications</h3>
                </div>
              </div>

              <div style={{
                fontSize: '3rem',
                fontWeight: 800,
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                {publicationsStats.totalPublications}
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '15px',
                marginTop: '20px'
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  marginBottom: '10px',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>Last 3 Years</div>

                {publicationsStats.yearWiseBreakdown.length > 0 ? (
                  publicationsStats.yearWiseBreakdown.map(([year, count]) => (
                    <div key={year} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '5px',
                      fontSize: '0.85rem'
                    }}>
                      <span>{year}</span>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '10px',
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
            <div style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '20px',
              padding: '25px',
              color: '#fff',
              boxShadow: '0 10px 40px rgba(250, 112, 154, 0.3)',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease',
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
                marginBottom: '20px'
              }}>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.8rem',
                    fontWeight: 700
                  }}>Department Awards</h3>
                </div>
              </div>

              <div style={{
                fontSize: '3rem',
                fontWeight: 800,
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                {awardsStats.totalAwards}
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '15px',
                marginTop: '20px'
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  marginBottom: '10px',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>Top Faculty by Awards</div>

                {awardsStats.topFacultyByAwards.length > 0 ? (
                  awardsStats.topFacultyByAwards.map((faculty, index) => (
                    <div key={faculty.name} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.3)',
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
                        background: 'rgba(255, 255, 255, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '10px',
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
        {(accessRequestsCount.incoming > 0) && (
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#2d3748',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '0px',
            }}>
              Access Request Notifications
            </h2>
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

        {/* Quick Actions */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#2d3748',
            marginBottom: '20px',
            marginTop: '0px',
          }}>
            Quick Actions
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
          }}>
            <button
              onClick={() => navigate('/faculty')}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                padding: '15px 20px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
              }}
            >
              👥 Faculty Directory
            </button>

            <button
              onClick={() => navigate('/access-requests')}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#fff',
                border: 'none',
                padding: '15px 20px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🔐 Access Requests
            </button>

            <button
              onClick={() => navigate('/report')}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                padding: '15px 20px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
              }}
            >
              📊 Generate Report
            </button>

            <button
              onClick={() => navigate('/faculty-importer')}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                padding: '15px 20px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
              }}
            >
              📥 Import Faculty Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;