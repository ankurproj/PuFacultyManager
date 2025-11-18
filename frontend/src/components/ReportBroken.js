import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Layout from './Layout';
import LoadingSpinner from './LoadingSpinner';

import { getApiUrl } from '../config/api';
function Report() {
  const [currentUser, setCurrentUser] = useState({});
  const [facultyData, setFacultyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startYear: '',
    endYear: '',
    includeProfile: true,
    includePublications: true,
    includePatents: true,
    includeBooks: true,
    includeResearchGuidance: true,
    includeProjects: true,
    includeConferences: true,
    includeExperience: true,
    includeFellowship: true,
    includeTraining: true,
    includeMOU: true,
    includeEEducation: true,
    includeParticipation: true,
    includeProgramme: true,
    sortBy: 'year',
    sortOrder: 'desc'
  });
  const [filteredData, setFilteredData] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser({
          id: decoded.id,
          name: decoded.name || '',
          email: decoded.email || '',
          role: decoded.role || 'faculty'
        });
        fetchFacultyData();
      } catch (error) {
        console.error('Error decoding token:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchFacultyData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/professor/profile"), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFacultyData(data);
        applyFilters(data);
      } else {
        console.error('Failed to fetch faculty data');
      }
    } catch (error) {
      console.error('Error fetching faculty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data = facultyData) => {
    if (!data || Object.keys(data).length === 0) {
      setFilteredData({});
      return;
    }

    const filtered = { ...data };
    const { startYear, endYear } = filters;

    // Helper function to filter by year
    const filterByYear = (items) => {
      if (!items || !Array.isArray(items)) return [];
      return items.filter(item => {
        const year = item.year || item.publicationYear || item.dateOfPatent ||
                    item.admissionYear || item.joiningDate || item.startDate ||
                    item.dateOfConference || item.trainingYear || item.signingDate ||
                    item.launchDate || item.participationYear || item.yearOfProgramme;

        if (!year) return true;
        const itemYear = parseInt(year);
        const start = startYear ? parseInt(startYear) : 0;
        const end = endYear ? parseInt(endYear) : 9999;
        return itemYear >= start && itemYear <= end;
      });
    };

    // Apply filters to each section
    if (filters.includePublications && data.publications) {
      filtered.publications = filterByYear(data.publications);
    } else {
      filtered.publications = [];
    }

    if (filters.includePatents && data.patents) {
      filtered.patents = filterByYear(data.patents);
    } else {
      filtered.patents = [];
    }

    if (filters.includeBooks && data.books) {
      filtered.books = filterByYear(data.books);
    } else {
      filtered.books = [];
    }

    if (filters.includeResearchGuidance && data.researchGuidanceStudents) {
      filtered.researchGuidanceStudents = filterByYear(data.researchGuidanceStudents);
    } else {
      filtered.researchGuidanceStudents = [];
    }

    if (filters.includeProjects && data.projectConsultancy) {
      filtered.projectConsultancy = filterByYear(data.projectConsultancy);
    } else {
      filtered.projectConsultancy = [];
    }

    if (filters.includeConferences && data.conferenceSeminarWorkshop) {
      filtered.conferenceSeminarWorkshop = filterByYear(data.conferenceSeminarWorkshop);
    } else {
      filtered.conferenceSeminarWorkshop = [];
    }

    if (filters.includeExperience && data.experience) {
      filtered.experience = filterByYear(data.experience);
    } else {
      filtered.experience = [];
    }

    if (filters.includeFellowship && data.fellowship) {
      filtered.fellowship = filterByYear(data.fellowship);
    } else {
      filtered.fellowship = [];
    }

    if (filters.includeTraining && data.training) {
      filtered.training = filterByYear(data.training);
    } else {
      filtered.training = [];
    }

    if (filters.includeMOU && data.mou) {
      filtered.mou = filterByYear(data.mou);
    } else {
      filtered.mou = [];
    }

    if (filters.includeEEducation && data.eEducation) {
      filtered.eEducation = filterByYear(data.eEducation);
    } else {
      filtered.eEducation = [];
    }

    if (filters.includeParticipation && data.participationCollaboration) {
      filtered.participationCollaboration = filterByYear(data.participationCollaboration);
    } else {
      filtered.participationCollaboration = [];
    }

    if (filters.includeProgramme && data.programme) {
      filtered.programme = filterByYear(data.programme);
    } else {
      filtered.programme = [];
    }

    setFilteredData(filtered);
  };

  useEffect(() => {
    if (facultyData && Object.keys(facultyData).length > 0) {
      applyFilters();
    }
  }, [filters, facultyData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Function to check if there's any data to display based on filters
  const hasDisplayableData = () => {
    // Always return true if we have any faculty data at all
    // since we can always show basic profile information
    if (facultyData && Object.keys(facultyData).length > 0) {
      return true;
    }

    // If no faculty data, return false
    return false;
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = generatePDFContent();

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const generatePDFContent = () => {
    const data = filteredData;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Faculty Profile Report - ${data.name || 'Faculty Member'}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            font-family: 'Times New Roman', serif;
            font-size: 10pt;
            line-height: 1.3;
            color: #000;
            margin: 0;
            padding: 0;
            background: white;
          }

          .header {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }

          .header .profile-image {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #333;
            flex-shrink: 0;
          }

          .header .profile-placeholder {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24pt;
            font-weight: bold;
            border: 2px solid #333;
            flex-shrink: 0;
          }

          .header .header-info {
            text-align: left;
            flex-grow: 1;
          }

          .header h1 {
            font-size: 16pt;
            font-weight: bold;
            margin: 0 0 3px 0;
            color: #000;
          }

          .header h2 {
            font-size: 12pt;
            font-weight: normal;
            margin: 0;
            color: #333;
          }

          .section {
            margin-bottom: 15px;
            page-break-inside: avoid;
          }

          .section-title {
            font-size: 12pt;
            font-weight: bold;
            color: #000;
            border-bottom: 1px solid #ccc;
            padding-bottom: 2px;
            margin-bottom: 8px;
          }

          .subsection-title {
            font-size: 11pt;
            font-weight: bold;
            color: #333;
            margin: 10px 0 5px 0;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }

          .info-item {
            margin-bottom: 5px;
          }

          .info-label {
            font-weight: bold;
            color: #333;
          }

          .info-value {
            color: #000;
            margin-left: 3px;
          }

          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 9pt;
          }

          .table th,
          .table td {
            border: 1px solid #ccc;
            padding: 4px 6px;
            text-align: left;
            word-wrap: break-word;
          }

          .table th {
            background-color: #f5f5f5;
            font-weight: bold;
            font-size: 9pt;
          }

          .list-item {
            margin-bottom: 3px;
            padding-left: 8px;
          }

          .footer {
            position: fixed;
            bottom: 8mm;
            right: 0;
            font-size: 8pt;
            color: #666;
          }

          @media print {
            body { -webkit-print-color-adjust: exact; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${data.profileImage ? `
            <img src="${data.profileImage}" alt="Profile Photo" class="profile-image" />
          ` : `
            <div class="profile-placeholder">
              ${data.name?.charAt(0) || '👤'}
            </div>
          `}
          <div class="header-info">
            <h1>FACULTY PROFILE REPORT</h1>
            <h2>${data.name || 'Faculty Member'}</h2>
            <p style="margin: 3px 0 0 0; font-size: 9pt;">Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </div>

        ${filters.includeProfile ? `
        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Full Name:</span>
              <span class="info-value">${data.name || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">${data.email || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone:</span>
              <span class="info-value">${data.phone || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Department:</span>
              <span class="info-value">${data.department || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Designation:</span>
              <span class="info-value">${data.designation || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Employee ID:</span>
              <span class="info-value">${data.employee_id || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date of Joining:</span>
              <span class="info-value">${data.date_of_joining || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Experience:</span>
              <span class="info-value">${data.experience_years || 'N/A'} years</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date of Birth:</span>
              <span class="info-value">${data.date_of_birth || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ORCID ID:</span>
              <span class="info-value">${data.orcidId || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Google Scholar ID:</span>
              <span class="info-value">${data.googleScholarId || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Address:</span>
              <span class="info-value">${data.address || 'N/A'}</span>
            </div>
          </div>
        </div>
        ` : ''}

        ${filters.includePublications && data.publications && data.publications.length > 0 ? `
        <div class="section">
          <div class="section-title">Publications</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 30%">Title</th>
                <th style="width: 20%">Authors</th>
                <th style="width: 20%">Journal</th>
                <th style="width: 8%">Volume</th>
                <th style="width: 8%">Issue</th>
                <th style="width: 7%">Year</th>
                <th style="width: 7%">Type</th>
              </tr>
            </thead>
            <tbody>
              ${data.publications.map(pub => `
                <tr>
                  <td>${pub.title || 'N/A'}</td>
                  <td>${pub.authors || 'N/A'}</td>
                  <td>${pub.journal || 'N/A'}</td>
                  <td>${pub.volume || 'N/A'}</td>
                  <td>${pub.issue || 'N/A'}</td>
                  <td>${pub.year || 'N/A'}</td>
                  <td>${pub.type || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${filters.includePatents && data.patents && data.patents.length > 0 ? `
        <div class="section">
          <div class="section-title">Patents</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 35%">Title</th>
                <th style="width: 20%">Patent Number</th>
                <th style="width: 15%">Status</th>
                <th style="width: 15%">Year</th>
                <th style="width: 15%">Co-Inventors</th>
              </tr>
            </thead>
            <tbody>
              ${data.patents.map(patent => `
                <tr>
                  <td>${patent.title || 'N/A'}</td>
                  <td>${patent.patentNumber || patent.patent_number || 'N/A'}</td>
                  <td>${patent.status || 'N/A'}</td>
                  <td>${patent.year || patent.dateOfPatent || 'N/A'}</td>
                  <td>${patent.inventors || patent.co_inventors || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${filters.includeBooks && data.books && data.books.length > 0 ? `
        <div class="section">
          <div class="section-title">Books</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 40%">Title</th>
                <th style="width: 25%">Authors</th>
                <th style="width: 20%">Publisher</th>
                <th style="width: 15%">Year</th>
              </tr>
            </thead>
            <tbody>
              ${data.books.map(book => `
                <tr>
                  <td>${book.title || 'N/A'}</td>
                  <td>${book.authors || 'N/A'}</td>
                  <td>${book.publisher || 'N/A'}</td>
                  <td>${book.publicationYear || book.year || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${filters.includeResearchGuidance && data.researchGuidanceStudents && data.researchGuidanceStudents.length > 0 ? `
        <div class="section">
          <div class="section-title">Research Guidance</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 25%">Student Name</th>
                <th style="width: 15%">Degree</th>
                <th style="width: 30%">Thesis Title</th>
                <th style="width: 15%">Status</th>
                <th style="width: 15%">Year</th>
              </tr>
            </thead>
            <tbody>
              ${data.researchGuidanceStudents.map(student => `
                <tr>
                  <td>${student.studentName || 'N/A'}</td>
                  <td>${student.degree || 'N/A'}</td>
                  <td>${student.thesisTitle || 'N/A'}</td>
                  <td>${student.status || 'N/A'}</td>
                  <td>${student.admissionYear || student.year || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${filters.includeProjects && data.projectConsultancy && data.projectConsultancy.length > 0 ? `
        <div class="section">
          <div class="section-title">Projects & Consultancy</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 30%">Title</th>
                <th style="width: 20%">Funding Agency</th>
                <th style="width: 15%">Amount</th>
                <th style="width: 15%">Duration</th>
                <th style="width: 20%">Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.projectConsultancy.map(project => `
                <tr>
                  <td>${project.title || 'N/A'}</td>
                  <td>${project.fundingAgency || 'N/A'}</td>
                  <td>${project.amount || 'N/A'}</td>
                  <td>${project.startDate && project.endDate ? `${project.startDate} - ${project.endDate}` : 'N/A'}</td>
                  <td>${project.status || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${filters.includeConferences && data.conferenceSeminarWorkshop && data.conferenceSeminarWorkshop.length > 0 ? `
        <div class="section">
          <div class="section-title">Conferences & Workshops</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 35%">Title</th>
                <th style="width: 15%">Type</th>
                <th style="width: 20%">Venue</th>
                <th style="width: 15%">Date</th>
                <th style="width: 15%">Role</th>
              </tr>
            </thead>
            <tbody>
              ${data.conferenceSeminarWorkshop.map(conf => `
                <tr>
                  <td>${conf.title || 'N/A'}</td>
                  <td>${conf.type || 'N/A'}</td>
                  <td>${conf.venue || 'N/A'}</td>
                  <td>${conf.dateOfConference || 'N/A'}</td>
                  <td>${conf.role || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${filters.includeExperience && data.experience && data.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Professional Experience</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 20%">Position</th>
                <th style="width: 30%">Organization</th>
                <th style="width: 25%">Responsibilities</th>
                <th style="width: 12.5%">From</th>
                <th style="width: 12.5%">To</th>
              </tr>
            </thead>
            <tbody>
              ${data.experience.map(exp => `
                <tr>
                  <td>${exp.position || 'N/A'}</td>
                  <td>${exp.organization || 'N/A'}</td>
                  <td>${exp.responsibilities || 'N/A'}</td>
                  <td>${exp.joiningDate || 'N/A'}</td>
                  <td>${exp.relievingDate || 'Present'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${filters.includeFellowship && data.fellowship && data.fellowship.length > 0 ? `
        <div class="section">
          <div class="section-title">Fellowships & Awards</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 40%">Title</th>
                <th style="width: 30%">Awarding Body</th>
                <th style="width: 15%">Duration</th>
                <th style="width: 15%">Year</th>
              </tr>
            </thead>
            <tbody>
              ${data.fellowship.map(fellowship => `
                <tr>
                  <td>${fellowship.title || 'N/A'}</td>
                  <td>${fellowship.awardingBody || 'N/A'}</td>
                  <td>${fellowship.duration || 'N/A'}</td>
                  <td>${fellowship.year || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${filters.includeTraining && data.training && data.training.length > 0 ? `
        <div class="section">
          <div class="section-title">Training & Development</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 40%">Title</th>
                <th style="width: 30%">Organization</th>
                <th style="width: 15%">Duration</th>
                <th style="width: 15%">Year</th>
              </tr>
            </thead>
            <tbody>
              ${data.training.map(training => `
                <tr>
                  <td>${training.title || 'N/A'}</td>
                  <td>${training.organization || 'N/A'}</td>
                  <td>${training.duration || 'N/A'}</td>
                  <td>${training.trainingYear || training.year || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${filters.includeMOU && data.mou && data.mou.length > 0 ? `
        <div class="section">
          <div class="section-title">MOUs & Collaborations</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 40%">Title</th>
                <th style="width: 30%">Partner Institution</th>
                <th style="width: 15%">Signing Date</th>
                <th style="width: 15%">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${data.mou.map(mou => `
                <tr>
                  <td>${mou.title || 'N/A'}</td>
                  <td>${mou.partnerInstitution || 'N/A'}</td>
                  <td>${mou.signingDate || 'N/A'}</td>
                  <td>${mou.duration || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${filters.includeEEducation && data.eEducation && data.eEducation.length > 0 ? `
        <div class="section">
          <div class="section-title">E-Education</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 40%">Title</th>
                <th style="width: 25%">Platform</th>
                <th style="width: 15%">Launch Date</th>
                <th style="width: 20%">Participants</th>
              </tr>
            </thead>
            <tbody>
              ${data.eEducation.map(eedu => `
                <tr>
                  <td>${eedu.title || 'N/A'}</td>
                  <td>${eedu.platform || 'N/A'}</td>
                  <td>${eedu.launchDate || 'N/A'}</td>
                  <td>${eedu.participants || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${filters.includeParticipation && data.participationCollaboration && data.participationCollaboration.length > 0 ? `
        <div class="section">
          <div class="section-title">Participation & Collaboration</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 40%">Title</th>
                <th style="width: 20%">Type</th>
                <th style="width: 25%">Organization</th>
                <th style="width: 15%">Year</th>
              </tr>
            </thead>
            <tbody>
              ${data.participationCollaboration.map(part => `
                <tr>
                  <td>${part.title || 'N/A'}</td>
                  <td>${part.type || 'N/A'}</td>
                  <td>${part.organization || 'N/A'}</td>
                  <td>${part.participationYear || part.year || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${filters.includeProgramme && data.programme && data.programme.length > 0 ? `
        <div class="section">
          <div class="section-title">Academic Programmes</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 40%">Title</th>
                <th style="width: 20%">Type</th>
                <th style="width: 20%">Duration</th>
                <th style="width: 20%">Year</th>
              </tr>
            </thead>
            <tbody>
              ${data.programme.map(prog => `
                <tr>
                  <td>${prog.title || 'N/A'}</td>
                  <td>${prog.type || 'N/A'}</td>
                  <td>${prog.duration || 'N/A'}</td>
                  <td>${prog.yearOfProgramme || prog.year || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="footer">
          Faculty Profile Report | ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return <LoadingSpinner message="Loading faculty data..." />;
  }

  return (
    <Layout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', fontWeight: 700 }}>
            📊 Faculty Report Generator
          </h1>
          <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
            Generate comprehensive reports including all your academic data
          </p>
        </div>

        {/* Filters Section */}
        <div style={{
          background: '#ffffff',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '1.5rem' }}>
            🎛️ Report Filters
          </h2>

          {/* Year Filters */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '10px' }}>
              📅 Year Range
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>
                  Start Year
                </label>
                <input
                  type="number"
                  value={filters.startYear}
                  onChange={(e) => handleFilterChange('startYear', e.target.value)}
                  placeholder="e.g., 2020"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>
                  End Year
                </label>
                <input
                  type="number"
                  value={filters.endYear}
                  onChange={(e) => handleFilterChange('endYear', e.target.value)}
                  placeholder="e.g., 2024"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>

          {/* Section Filters */}
          <div>
            <h3 style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '15px' }}>
              📋 Include Sections
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px'
            }}>
              {[
                { key: 'includeProfile', label: '👤 Profile Information' },
                { key: 'includePublications', label: '📚 Publications' },
                { key: 'includePatents', label: '🔬 Patents' },
                { key: 'includeBooks', label: '📖 Books' },
                { key: 'includeResearchGuidance', label: '👨‍🎓 Research Guidance' },
                { key: 'includeProjects', label: '💼 Projects & Consultancy' },
                { key: 'includeConferences', label: '🎤 Conferences' },
                { key: 'includeExperience', label: '💼 Experience' },
                { key: 'includeFellowship', label: '🏆 Fellowships' },
                { key: 'includeTraining', label: '📚 Training' },
                { key: 'includeMOU', label: '🤝 MOUs' },
                { key: 'includeEEducation', label: '💻 E-Education' },
                { key: 'includeParticipation', label: '🌐 Participation' },
                { key: 'includeProgramme', label: '🎓 Programmes' }
              ].map(({ key, label }) => (
                <label key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: filters[key] ? '#eff6ff' : '#f8fafc',
                  border: `2px solid ${filters[key] ? '#3b82f6' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.9rem'
                }}>
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={(e) => handleFilterChange(key, e.target.checked)}
                    style={{ marginRight: '5px' }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '25px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
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
            👁️ {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>

          <button
            onClick={exportToPDF}
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)';
            }}
          >
            📄 Export as PDF
          </button>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div style={{
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '1.5rem' }}>
              📋 Report Preview
            </h2>

            {hasDisplayableData() ? (
              <div>
                {/* Profile Section */}
                {filters.includeProfile && (
                  <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2d3748', marginBottom: '20px', marginTop: '0px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      👤 Personal Information
                    </h2>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '15px',
                      background: '#f8fafc',
                      padding: '20px',
                      borderRadius: '10px'
                    }}>
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                        <strong style={{ color: '#475569' }}>Name:</strong> {filteredData.name || 'N/A'}
                      </div>
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                        <strong style={{ color: '#475569' }}>Email:</strong> {filteredData.email || 'N/A'}
                      </div>
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                        <strong style={{ color: '#475569' }}>Department:</strong> {filteredData.department || 'N/A'}
                      </div>
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                        <strong style={{ color: '#475569' }}>Designation:</strong> {filteredData.designation || 'N/A'}
                      </div>
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                        <strong style={{ color: '#475569' }}>Employee ID:</strong> {filteredData.employee_id || 'N/A'}
                      </div>
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                        <strong style={{ color: '#475569' }}>Phone:</strong> {filteredData.phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Statistics */}
                <div style={{
                  background: '#eff6ff',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '25px'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#1e40af' }}>📊 Summary Statistics</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px'
                  }}>
                    {filters.includePublications && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                          {(filteredData.publications || []).length}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Publications</div>
                      </div>
                    )}
                    {filters.includePatents && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                          {(filteredData.patents || []).length}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Patents</div>
                      </div>
                    )}
                    {filters.includeBooks && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                          {(filteredData.books || []).length}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Books</div>
                      </div>
                    )}
                    {filters.includeResearchGuidance && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                          {(filteredData.researchGuidanceStudents || []).length}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Research Guidance</div>
                      </div>
                    )}
                    {filters.includeProjects && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                          {(filteredData.projectConsultancy || []).length}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Projects</div>
                      </div>
                    )}
                    {filters.includeConferences && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                          {(filteredData.conferenceSeminarWorkshop || []).length}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Conferences</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Tables - Same as HOD View */}
                {filters.includePublications && filteredData.publications && filteredData.publications.length > 0 && (
                  <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2d3748', marginBottom: '20px', marginTop: '0px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      📚 Publications ({filteredData.publications.length})
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ width: '40px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>S.No</th>
                            <th style={{ width: '200px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Title</th>
                            <th style={{ width: '150px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Authors</th>
                            <th style={{ width: '140px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Journal</th>
                            <th style={{ width: '80px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Volume</th>
                            <th style={{ width: '80px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Issue</th>
                            <th style={{ width: '80px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Year</th>
                            <th style={{ width: '100px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.publications.slice(0, 5).map((pub, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{idx + 1}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{pub.title || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{pub.authors || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{pub.journal || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{pub.volume || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{pub.issue || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{pub.year || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{pub.type || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredData.publications.length > 5 && (
                        <p style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', marginTop: '10px' }}>
                          ... and {filteredData.publications.length - 5} more publications (full list in PDF)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Patents Table */}
                {filters.includePatents && filteredData.patents && filteredData.patents.length > 0 && (
                  <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2d3748', marginBottom: '20px', marginTop: '0px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      🔬 Patents ({filteredData.patents.length})
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ width: '40px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>S.No</th>
                            <th style={{ width: '250px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Title</th>
                            <th style={{ width: '150px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Patent Number</th>
                            <th style={{ width: '120px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Status</th>
                            <th style={{ width: '100px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Year</th>
                            <th style={{ width: '180px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Co-Inventors</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.patents.slice(0, 3).map((patent, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{idx + 1}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{patent.title || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{patent.patentNumber || patent.patent_number || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{patent.status || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{patent.year || patent.dateOfPatent || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{patent.inventors || patent.co_inventors || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredData.patents.length > 3 && (
                        <p style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', marginTop: '10px' }}>
                          ... and {filteredData.patents.length - 3} more patents (full list in PDF)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Books Table */}
                {filters.includeBooks && filteredData.books && filteredData.books.length > 0 && (
                  <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2d3748', marginBottom: '20px', marginTop: '0px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      📖 Books ({filteredData.books.length})
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ width: '40px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>S.No</th>
                            <th style={{ width: '250px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Title</th>
                            <th style={{ width: '180px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Authors</th>
                            <th style={{ width: '150px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Publisher</th>
                            <th style={{ width: '80px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Year</th>
                            <th style={{ width: '120px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>ISBN</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.books.slice(0, 3).map((book, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{idx + 1}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{book.title || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{book.authors || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{book.publisher || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{book.publicationYear || book.year || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{book.isbn || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredData.books.length > 3 && (
                        <p style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', marginTop: '10px' }}>
                          ... and {filteredData.books.length - 3} more books (full list in PDF)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Research Guidance Table */}
                {filters.includeResearchGuidance && filteredData.researchGuidanceStudents && filteredData.researchGuidanceStudents.length > 0 && (
                  <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2d3748', marginBottom: '20px', marginTop: '0px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      👨‍🎓 Research Guidance ({filteredData.researchGuidanceStudents.length})
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ width: '40px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>S.No</th>
                            <th style={{ width: '180px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Student Name</th>
                            <th style={{ width: '100px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Degree</th>
                            <th style={{ width: '250px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Thesis Title</th>
                            <th style={{ width: '120px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Status</th>
                            <th style={{ width: '80px', padding: '10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Year</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.researchGuidanceStudents.slice(0, 3).map((student, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{idx + 1}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{student.studentName || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{student.degree || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{student.thesisTitle || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{student.status || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{student.admissionYear || student.year || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredData.researchGuidanceStudents.length > 3 && (
                        <p style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', marginTop: '10px' }}>
                          ... and {filteredData.researchGuidanceStudents.length - 3} more students (full list in PDF)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '30px', padding: '20px', background: '#f0f9ff', borderRadius: '10px' }}>
                  <p style={{ margin: '0', color: '#0369a1', fontWeight: 600 }}>
                    📄 Click "Export as PDF" to generate the complete report with all selected sections and detailed data
                  </p>
                </div>
              </div>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                        <strong>Department:</strong> {filteredData.department || 'N/A'}
                      </div>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                        <strong>Designation:</strong> {filteredData.designation || 'N/A'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Statistics */}
                <div style={{
                  background: '#eff6ff',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '25px'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#1e40af' }}>📊 Summary Statistics</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px'
                  }}>
                    {filters.includePublications && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                          {(filteredData.publications || []).length}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Publications</div>
                      </div>
                    )}
                    {filters.includePatents && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                          {(filteredData.patents || []).length}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Patents</div>
                      </div>
                    )}
                    {filters.includeBooks && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                          {(filteredData.books || []).length}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Books</div>
                      </div>
                    )}
                    {filters.includeResearchGuidance && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                          {(filteredData.researchGuidanceStudents || []).length}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Research Guidance</div>
                      </div>
                    )}
                    {filters.includeProjects && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                          {(filteredData.projectConsultancy || []).length}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Projects</div>
                      </div>
                    )}
                    {filters.includeConferences && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                          {(filteredData.conferenceSeminarWorkshop || []).length}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Conferences</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick preview of sections */}
                {filters.includePublications && filteredData.publications && filteredData.publications.length > 0 && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ color: '#3b82f6', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      📚 Publications ({filteredData.publications.length})
                    </h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {filteredData.publications.slice(0, 3).map((pub, index) => (
                        <div key={index} style={{
                          background: '#f8fafc',
                          padding: '15px',
                          marginBottom: '10px',
                          borderRadius: '8px',
                          borderLeft: '4px solid #3b82f6'
                        }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{pub.title || 'Untitled'}</h4>
                          <p style={{ margin: '0', color: '#64748b', fontSize: '0.9rem' }}>
                            {pub.authors} | {pub.journal} | {pub.year}
                          </p>
                        </div>
                      ))}
                      {filteredData.publications.length > 3 && (
                        <p style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                          ... and {filteredData.publications.length - 3} more publications
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Show other sections similarly */}
                {filters.includePatents && filteredData.patents && filteredData.patents.length > 0 && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ color: '#3b82f6', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      🔬 Patents ({filteredData.patents.length})
                    </h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {filteredData.patents.slice(0, 2).map((patent, index) => (
                        <div key={index} style={{
                          background: '#f8fafc',
                          padding: '15px',
                          marginBottom: '10px',
                          borderRadius: '8px',
                          borderLeft: '4px solid #10b981'
                        }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{patent.title || 'Untitled'}</h4>
                          <p style={{ margin: '0', color: '#64748b', fontSize: '0.9rem' }}>
                            Patent No: {patent.patentNumber} | {patent.dateOfPatent}
                          </p>
                        </div>
                      ))}
                      {filteredData.patents.length > 2 && (
                        <p style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                          ... and {filteredData.patents.length - 2} more patents
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '30px', padding: '20px', background: '#f0f9ff', borderRadius: '10px' }}>
                  <p style={{ margin: '0', color: '#0369a1', fontWeight: 600 }}>
                    📄 Click "Export as PDF" to generate the complete report with all selected sections
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <p>No data available for the selected filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Report;