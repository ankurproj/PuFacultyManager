import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Layout from './Layout';
import LoadingSpinner from './LoadingSpinner';

import { getApiUrl } from '../config/api';
function RequestPublications() {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [publications, setPublications] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({});
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser({
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    fetchFacultyPublications();
  }, [facultyId]);

  const fetchFacultyPublications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);

      // First, get all faculty to find the specific faculty member
      const facultyListResponse = await fetch(
        getApiUrl("/api/faculty"),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (facultyListResponse.ok) {
        const facultyList = await facultyListResponse.json();
        const targetFaculty = facultyList.find(f => f._id === facultyId);

        if (targetFaculty) {
          setFaculty(targetFaculty);

          // Extract publications from faculty data
          const publicationsData = {
            seie_journals: targetFaculty.seie_journals || [],
            ugc_approved_journals: targetFaculty.ugc_approved_journals || [],
            non_ugc_journals: targetFaculty.non_ugc_journals || [],
            conference_papers: targetFaculty.conference_papers || [],
            book_chapters: targetFaculty.book_chapters || [],
            books_published: targetFaculty.books_published || []
          };

          setPublications(publicationsData);
          console.log('Faculty found and publications loaded:', targetFaculty.name);
        } else {
          console.error('Faculty not found in the list. Faculty ID:', facultyId);
          console.log('Available faculty IDs:', facultyList.map(f => f._id));
        }
      } else {
        console.error('Failed to fetch faculty list:', facultyListResponse.status, facultyListResponse.statusText);
        const errorData = await facultyListResponse.json().catch(() => ({}));
        console.error('Error details:', errorData);
        alert('Error fetching faculty information');
      }
    } catch (error) {
      console.error('Error fetching faculty publications:', error);
      alert('Error fetching publications');
    } finally {
      setLoading(false);
    }
  };  const handlePublicationSelect = (publicationType, publicationIndex, publication) => {
    const publicationKey = `${publicationType}_${publicationIndex}`;
    const isSelected = selectedPublications.some(p => p.key === publicationKey);

    if (isSelected) {
      setSelectedPublications(prev => prev.filter(p => p.key !== publicationKey));
    } else {
      setSelectedPublications(prev => [...prev, {
        key: publicationKey,
        type: publicationType,
        index: publicationIndex,
        title: publication.title,
        publication: publication
      }]);
    }
  };

  const handleSendRequests = async () => {
    if (selectedPublications.length === 0) {
      alert('Please select at least one publication to request access to.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const promises = selectedPublications.map(async (selectedPub) => {
        const response = await fetch(
          getApiUrl("/api/access-request"),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              target_faculty_id: facultyId,
              publication_type: selectedPub.type,
              publication_index: selectedPub.index,
              publication_title: selectedPub.title,
              message: requestMessage || `Request access to view publication: ${selectedPub.title}`
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error sending request');
        }

        return response.json();
      });

      await Promise.all(promises);

      alert(`Successfully sent ${selectedPublications.length} access request(s) to ${faculty.name}!`);
      navigate('/faculty');

    } catch (error) {
      console.error('Error sending access requests:', error);
      alert(error.message || 'Error sending access requests');
    }
  };

  const renderPublicationTable = (publicationType, publicationArray, title) => {
    if (!publicationArray || publicationArray.length === 0) return null;

    // Filter out empty publications
    const validPublications = publicationArray.filter(pub => pub.title && pub.title.trim() !== '');
    if (validPublications.length === 0) return null;

    return (
      <div key={publicationType} style={{ marginBottom: '30px' }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: 600,
          color: '#2d3748',
          marginBottom: '15px',
          padding: '10px 0'
        }}>
          {title}
        </h3>

        <div style={{
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                background: '#f8fafc',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <th style={{ padding: '15px', textAlign: 'left', width: '50px', fontWeight: 600 }}>Select</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600 }}>Title</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600 }}>Authors</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600 }}>Journal/Conference</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600 }}>Year</th>
              </tr>
            </thead>
            <tbody>
              {validPublications.map((publication, index) => {
                const publicationKey = `${publicationType}_${index}`;
                const isSelected = selectedPublications.some(p => p.key === publicationKey);

                return (
                  <tr key={index} style={{
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#f0f9ff' : (index % 2 === 0 ? '#f8fafc' : '#fff'),
                    transition: 'all 0.2s ease'
                  }}>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handlePublicationSelect(publicationType, index, publication)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer'
                        }}
                      />
                    </td>
                    <td style={{ padding: '15px', fontWeight: 500, color: '#2d3748' }}>
                      {publication.title}
                    </td>
                    <td style={{ padding: '15px', color: '#4a5568' }}>
                      {publication.authors || 'N/A'}
                    </td>
                    <td style={{ padding: '15px', color: '#4a5568' }}>
                      {publication.journal_name || publication.conference_name || 'N/A'}
                    </td>
                    <td style={{ padding: '15px', color: '#4a5568' }}>
                      {publication.year || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner message={`Loading publications for Faculty ID: ${facultyId}`} />;
  }

  if (!faculty) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '1.2rem',
          color: '#e53e3e'
        }}>
          <div>Faculty not found</div>
          <div style={{ fontSize: '0.9rem', marginTop: '10px', opacity: 0.7 }}>
            Faculty ID: {facultyId}
          </div>
          <button
            onClick={() => navigate('/faculty')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Back to Faculty Directory
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{
        minHeight: '100vh',
        padding: '40px 20px'
      }}>
        <div style={{
          padding: '10px 30px 30px'
        }}>
          <div style={{ background: 'blue', borderRadius: '15px', width: 'fit-content', marginBottom: '20px', padding: '5px 10px' }}>
          <button
            onClick={() => navigate('/faculty')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            ← Back to Faculty Directory
          </button>
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '10px',
            marginTop: '0px'
          }}>
            Request Access to Publications
          </h1>

          <p style={{
            fontSize: '1.1rem',
            marginBottom: '40px',
            opacity: 0.8,
            marginTop: '0px'
          }}>
            Select the publications you would like to request access to from {faculty.name}.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '30px',
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: faculty.profileImage ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: 600,
              overflow: 'hidden'
            }}>
              {faculty.profileImage ? (
                <img
                  src={faculty.profileImage}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%'
                  }}
                />
              ) : (
                (faculty.name || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#2d3748', margin: 0 }}>
                {faculty.name}
              </h2>
              <p style={{ color: '#718096', fontSize: '1rem', margin: '5px 0' }}>
                {faculty.designation}
              </p>
              <div style={{ background: 'orange', display: 'inline-block', padding: '2px 8px', borderRadius: '15px', marginTop: '4px' }}>
              <p style={{ color: 'white', fontSize: '1rem', margin: '5px 0' }}>
                {faculty.role === 'faculty' ? 'Faculty Member' : faculty.role.charAt(0).toUpperCase() + faculty.role.slice(1)}
              </p>
              </div>
            </div>
          </div>
            {renderPublicationTable('seie_journals', publications.seie_journals, '📄 Papers Published in SEIE Journals')}
            {renderPublicationTable('ugc_approved_journals', publications.ugc_approved_journals, '📋 Papers Published in UGC Approved Journals')}
            {renderPublicationTable('non_ugc_journals', publications.non_ugc_journals, '📝 Papers Published in Non UGC Approved Peer Reviewed Journals')}
            {renderPublicationTable('conference_papers', publications.conference_papers, '🎤 Conference Papers')}
            {renderPublicationTable('book_chapters', publications.book_chapters, '📖 Book Chapters')}
            {renderPublicationTable('books_published', publications.books_published, '📚 Books Published')}

            {Object.values(publications).every(arr => !arr || arr.length === 0 || arr.every(pub => !pub.title || pub.title.trim() === '')) && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#718096',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📝</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No Publications Available</h3>
                <p>This faculty member hasn't published any papers yet.</p>
              </div>
            )}

          {/* Request Form */}
          {selectedPublications.length > 0 && (
            <div style={{
              padding: '30px',
              marginBottom: '30px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 600,
                color: '#2d3748',
                marginBottom: '20px'
              }}>
                Send Access Request ({selectedPublications.length} publication{selectedPublications.length !== 1 ? 's' : ''} selected)
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Request Message (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Please provide a reason for accessing these publications..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    minHeight: '100px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={handleSendRequests}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
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
                  Send Request{selectedPublications.length > 1 ? 's' : ''}
                </button>

                <button
                  onClick={() => setSelectedPublications([])}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f3f4f6';
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default RequestPublications;