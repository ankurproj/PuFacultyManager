// Test rendering component for debugging
import React from 'react';

const TestDataRenderer = () => {
  // Sample data that might come from the scraper
  const testData = {
    name: 'Dr. Test Faculty',
    email: 'test@university.edu',
    department: 'Computer Science',
    school: 'School of Engineering',
    education: [
      {
        degree: 'Ph.D.',
        title: 'Computer Science',
        university: 'Test University',
        graduationYear: '2010'
      },
      {
        degree: 'M.S.',
        title: 'Software Engineering',
        university: 'Another University',
        graduationYear: '2006'
      }
    ],
    area_of_expertise: [
      'Machine Learning',
      'Data Science',
      'Web Development'
    ],
    awards: [
      {
        title: 'Best Research Paper',
        year: '2020',
        institution: 'IEEE Conference'
      },
      'Excellence in Teaching Award (2019)'
    ]
  };

  // Helper function to safely render data items
  const renderDataItem = (item) => {
    if (typeof item === 'string') {
      return item;
    } else if (typeof item === 'object' && item !== null) {
      // Handle education objects
      if (item.degree || item.university) {
        return `${item.degree || ''} ${item.title || ''} - ${item.university || ''} ${item.graduationYear ? `(${item.graduationYear})` : ''}`.trim();
      }
      // Handle award objects
      if (item.title || item.year) {
        return `${item.title || ''} ${item.year ? `(${item.year})` : ''} ${item.institution ? `- ${item.institution}` : ''}`.trim();
      }
      // Fallback for other objects
      return Object.values(item).filter(val => val).join(' - ');
    }
    return String(item);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Test Data Renderer</h2>

      <div>
        <strong>Name:</strong> {testData.name}
      </div>
      <div>
        <strong>Email:</strong> {testData.email}
      </div>
      <div>
        <strong>Department:</strong> {testData.department}
      </div>

      {testData.education && Array.isArray(testData.education) && testData.education.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <strong>Education:</strong>
          <ul>
            {testData.education.map((edu, index) => (
              <li key={index}>{renderDataItem(edu)}</li>
            ))}
          </ul>
        </div>
      )}

      {testData.area_of_expertise && Array.isArray(testData.area_of_expertise) && testData.area_of_expertise.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <strong>Area of Expertise:</strong>
          <ul>
            {testData.area_of_expertise.map((area, index) => (
              <li key={index}>{renderDataItem(area)}</li>
            ))}
          </ul>
        </div>
      )}

      {testData.awards && Array.isArray(testData.awards) && testData.awards.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <strong>Awards:</strong>
          <ul>
            {testData.awards.map((award, index) => (
              <li key={index}>{renderDataItem(award)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestDataRenderer;