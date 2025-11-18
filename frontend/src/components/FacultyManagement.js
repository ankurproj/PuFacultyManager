import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import { getApiUrl } from '../config/api';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/faculty'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFaculty(data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const openModal = (facultyMember) => {
    setSelectedFaculty(facultyMember);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedFaculty(null);
    setShowModal(false);
  };

  return (
    <div className="faculty-management">
      <h2>Faculty Management</h2>

      <div className="faculty-list">
        <table className="faculty-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((facultyMember) => (
              <tr key={facultyMember._id}>
                <td>{facultyMember.name}</td>
                <td>{facultyMember.email}</td>
                <td>{facultyMember.department}</td>
                <td>
                  <button
                    onClick={() => openModal(facultyMember)}
                    className="view-btn"
                  >
                    <FaEye /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedFaculty && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Faculty Details</h3>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <p><strong>Name:</strong> {selectedFaculty.name}</p>
              <p><strong>Email:</strong> {selectedFaculty.email}</p>
              <p><strong>Department:</strong> {selectedFaculty.department}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement;
