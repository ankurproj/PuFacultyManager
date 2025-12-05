import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Layout from './Layout';
import LoadingSpinner from './LoadingSpinner';
import { API_BASE_URL } from '../config/api';

function Faculty() {
  const [professors, setProfessors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('faculty'); // Track user role
  const [currentUserId, setCurrentUserId] = useState(null); // Track current user ID
  const navigate = useNavigate();

  useEffect(() => {
    // Check user role from token/localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const userInfo = JSON.parse(user);
        const decoded = jwtDecode(token);
        const role = userInfo.role || decoded.role || 'faculty';
        const userId = userInfo.id || decoded.id;
        console.log('User role detected:', role);
        console.log('Current user ID:', userId);
        setUserRole(role);
        setCurrentUserId(userId);
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserRole('faculty'); // Default to faculty if error
        setCurrentUserId(null);
      }
    }

    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/faculty`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched professors:', data);
        setProfessors(data);
      } else {
        console.error('Failed to fetch professors:', response.status);
        setProfessors([]); // Set empty array instead of mock data
      }
    } catch (error) {
      console.error('Error fetching professors:', error);
      setProfessors([]); // Set empty array instead of mock data
    } finally {
      setLoading(false);
    }
  };

  // Function to view a specific professor's profile (HOD only)
  const viewProfessorProfile = (professorId) => {
    console.log('Attempting to view profile for professor ID:', professorId);
    console.log('Current user role:', userRole);

    // Navigate to profile page with professor ID as URL parameter
    navigate(`/profile/${professorId}`);
  };

  // Temporary function to promote current user to HOD for testing
  const promoteToHOD = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/promote-to-hod`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully promoted to HOD! Role: ${data.role}`);

        // Update localStorage user info
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.role = 'hod';
        localStorage.setItem('user', JSON.stringify(user));

        setUserRole('hod');
        window.location.reload(); // Refresh to update UI
      } else {
        const error = await response.text();
        alert(`Failed to promote to HOD: ${error}`);
      }
    } catch (error) {
      console.error('Error promoting to HOD:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredProfessors = professors.filter(prof => {
    // First, exclude the current user from the list
    if (currentUserId && prof._id === currentUserId) {
      return false;
    }

    const expertiseText = Array.isArray(prof.area_of_expertise)
      ? prof.area_of_expertise.join(', ')
      : (prof.area_of_expertise || '');

    const matchesSearch = (prof.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      expertiseText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || prof.department === filterDepartment;
    const matchesDesignation = !filterDesignation || prof.designation === filterDesignation;
    const matchesRole = !filterRole || prof.role === filterRole;

    return matchesSearch && matchesDepartment && matchesDesignation && matchesRole;
  });

  const departments = [...new Set(professors.map(prof => prof.department).filter(Boolean))];
  const designations = [...new Set(professors.map(prof => prof.designation).filter(Boolean))];

  if (loading) {
    return <LoadingSpinner message="Loading faculty directory..." />;
  }

  return (
    <div>
      <Layout>
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
              .faculty-container {
                padding: 20px 16px !important;
              }
              .faculty-header h1 {
                font-size: 1.8rem !important;
              }
              .faculty-header p {
                font-size: 1rem !important;
              }
              .faculty-filters {
                flex-direction: column !important;
                gap: 12px !important;
              }
              .faculty-filters > div {
                width: 100% !important;
              }
              .faculty-filters input,
              .faculty-filters select {
                width: 100% !important;
              }
              .faculty-table-container {
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch;
              }
              .faculty-table {
                min-width: 800px !important;
              }
              .faculty-table th,
              .faculty-table td {
                padding: 12px 10px !important;
                font-size: 0.85rem !important;
              }
            }
          `
        }} />
        <div className="faculty-container" style={{
          padding: '40px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Page Header */}
          <div className="faculty-header" style={{
            marginBottom: '40px',
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              margin: '0 0 10px 0',
              fontFamily: 'Segoe UI, Arial, sans-serif'
            }}>
              Faculty Directory
            </h1>
            <p style={{
              fontSize: '1.2rem',
              margin: 0,
              opacity: 0.8
            }}>
              Discover our distinguished faculty members and guest faculty expertise
            </p>
          </div>

          {/* Search and Filter Section */}
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            padding: '30px',
            marginBottom: '30px'
          }}>
            <div className="faculty-filters" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              alignItems: 'end'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.95rem'
                }}>
                  🔍 Search Faculty
                </label>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or expertise..."
                  style={{
                    width: '90%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    background: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.95rem'
                }}>
                  👔 Designation
                </label>
                <select
                  value={filterDesignation}
                  onChange={(e) => setFilterDesignation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    background: '#fff'
                  }}
                >
                  <option value="">All Designations</option>
                  {designations.map(designation => (
                    <option key={designation} value={designation}>{designation}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.95rem'
                }}>
                  🎭 Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    background: '#fff'
                  }}
                >
                  <option value="">All Roles</option>
                  <option value="faculty">Faculty</option>
                  <option value="guest_faculty">Guest Faculty</option>
                  <option value="hod">HOD</option>
                  <option value="dean">Dean</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDepartment('');
                  setFilterDesignation('');
                  setFilterRole('');
                }}
                style={{
                  padding: '14px 20px',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#374151',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#cbd5e0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#e2e8f0';
                }}
              >
                🔄 Clear Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div style={{
            marginBottom: '20px',
            fontSize: '1.1rem',
            color: '#4a5568',
            fontWeight: 500
          }}>
            {filteredProfessors.length} member{filteredProfessors.length !== 1 ? 's' : ''} found
          </div>

          {/* Faculty Table */}
          <div className="faculty-table-container" style={{
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <table className="faculty-table" style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff'
                }}>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderBottom: 'none'
                  }}>
                    Name
                  </th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderBottom: 'none'
                  }}>
                    Department
                  </th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderBottom: 'none'
                  }}>
                    Designation
                  </th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderBottom: 'none'
                  }}>
                    Contact
                  </th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderBottom: 'none'
                  }}>
                    🔬 Expertise
                  </th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderBottom: 'none'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProfessors.map((professor, index) => (
                  <tr key={professor._id} style={{
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    backgroundColor: index % 2 === 0 ? '#f8fafc' : '#fff'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f9ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8fafc' : '#fff';
                    }}
                  >
                    <td style={{
                      padding: '20px',
                      verticalAlign: 'top'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: !professor.profileImage
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          {professor.profileImage ? (
                            <img
                              src={professor.profileImage}
                              alt="Profile"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '50%'
                              }}
                            />
                          ) : (
                            (professor.name || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: 600,
                            color: '#2d3748',
                            fontSize: '1rem',
                            marginBottom: '4px'
                          }}>
                            {professor.name || 'N/A'}
                          </div>
                          {/* Role Badge */}
                          <span style={{
                            background: professor.role === 'hod' ?
                              'linear-gradient(135deg, #e11d48 0%, #be185d 100%)' :
                              professor.role === 'dean' ?
                              'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' :
                              professor.role === 'guest_faculty' ?
                              'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' :
                              'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            display: 'inline-block',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {professor.role === 'hod' ? 'HOD' :
                             professor.role === 'dean' ? 'DEAN' :
                             professor.role === 'guest_faculty' ? 'GUEST' :
                             'FACULTY'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '20px',
                      verticalAlign: 'top',
                      color: '#4a5568',
                      fontSize: '0.95rem'
                    }}>
                      {professor.department || 'Not specified'}
                    </td>
                    <td style={{
                      padding: '20px',
                      verticalAlign: 'top'
                    }}>
                      <span style={{
                        background: professor.designation === 'Professor' ?
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                          professor.designation === 'Associate Professor' ?
                            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'inline-block'
                      }}>
                        {professor.designation || 'Not specified'}
                      </span>
                    </td>
                    <td style={{
                      padding: '20px',
                      verticalAlign: 'top'
                    }}>
                      <div style={{ marginBottom: '6px' }}>
                        <a href={`mailto:${professor.email}`} style={{
                          color: '#6093ecff',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          display: 'block'
                        }}>
                          {professor.email || 'N/A'}
                        </a>
                      </div>
                      <div style={{
                        color: '#718096',
                        fontSize: '0.85rem'
                      }}>
                        {professor.phone || 'Not provided'}
                      </div>
                    </td>
                    <td style={{
                      padding: '20px',
                      verticalAlign: 'top',
                      color: '#4a5568',
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
                      maxWidth: '250px'
                    }}>
                      {Array.isArray(professor.area_of_expertise)
                        ? professor.area_of_expertise.filter(Boolean).join(', ') || 'Not specified'
                        : professor.area_of_expertise || 'Not specified'
                      }
                    </td>
                    <td style={{
                      padding: '20px',
                      verticalAlign: 'top',
                      textAlign: 'center'
                    }}>
                      {userRole === 'hod' ? (
                        <button
                          onClick={() => viewProfessorProfile(professor._id)}
                          style={{
                            background: 'linear-gradient(135deg, #6093ecff 0%, #4facfe 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            minWidth: '120px',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(96, 147, 236, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(96, 147, 236, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(96, 147, 236, 0.3)';
                          }}
                          title="View detailed profile"
                        >
                          View
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/request-publications/${professor._id}`)}
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            minWidth: '120px',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                          }}
                          title="Request access to publications"
                        >
                          🔐 Request Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No Results Message */}
          {filteredProfessors.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#fff',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
              <h3 style={{
                fontSize: '1.5rem',
                color: '#2d3748',
                marginBottom: '10px'
              }}>
                No members found
              </h3>
              <p style={{
                color: '#718096',
                fontSize: '1.1rem'
              }}>
                Try adjusting your search criteria or clearing the filters
              </p>
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}

export default Faculty;