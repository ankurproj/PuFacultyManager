import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";

import { getApiUrl } from '../config/api';
function Profile() {
  const [profile, setProfile] = useState({
    // Personal Information
    // Faculty Information
    department: "",
    designation: "",
    employee_id: "",
    date_of_joining: "",
    qualification: "",
    experience_years: "",
    subjects_taught: [""],
    research_interests: [""],
    office_location: "",
    office_hours: "",

    // Complex Arrays
    education: [
      {
        degree: "",
        title: "",
        university: "",
        graduationYear: "",
      },
    ],
    awards: [
      {
        title: "",
        type: "",
        agency: "",
        year: "",
        amount: "",
      },
    ],
    teaching_experience: [
      {
        designation: "",
        department: "",
        institution: "",
        from: "",
        to: "",
      },
    ],
    research_experience: [
      {
        position: "",
        organization: "",
        duration: "",
        research_area: "",
      },
    ],
    industry_experience: [
      {
        position: "",
        company: "",
        duration: "",
        role: "",
      },
    ],
    contribution_to_innovation: [
      {
        title: "",
        description: "",
        year: "",
        impact: "",
      },
    ],
    patents: [
      {
        title: "",
        patent_number: "",
        status: "",
        year: "",
        co_inventors: "",
      },
    ],
    publications: [
      {
        title: "",
        authors: "",
        journal: "",
        volume: "",
        issue: "",
        pages: "",
        year: "",
        doi: "",
        type: "",
      },
    ],
    books: [
      {
        title: "",
        authors: "",
        publisher: "",
        isbn: "",
        year: "",
      },
    ],
    chapters_in_books: [
      {
        chapter_title: "",
        book_title: "",
        editors: "",
        publisher: "",
        pages: "",
        year: "",
      },
    ],
    edited_books: [
      {
        title: "",
        editors: "",
        publisher: "",
        isbn: "",
        year: "",
      },
    ],
    projects: [
      {
        title: "",
        funding_agency: "",
        amount: "",
        duration: "",
        role: "",
        status: "",
      },
    ],
    consultancy_works: [
      {
        title: "",
        organization: "",
        amount: "",
        duration: "",
        status: "",
      },
    ],
    pg_student_guided: [
      {
        student_name: "",
        thesis_title: "",
        year_of_completion: "",
        current_status: "",
      },
    ],
    phd_student_guided: [
      {
        student_name: "",
        thesis_title: "",
        thesis_status: "",
        thesis_submission_date: "",
        viva_date: "",
        year_of_award: "",
      },
    ],
    postdoc_student_guided: [
      {
        student_name: "",
        designation: "",
        funding_agency: "",
        fellowship_title: "",
        joining_date: "",
        completion_date: "",
      },
    ],
    invited_talks: [
      {
        title: "",
        conference_seminar_workshop_trainingProgram: "",
        organization: "",
        level: "",
        from: "",
        to: "",
        year: "",
      },
    ],
    conferences_seminar_: [
      {
        title: "",
        sponsors: "",
        venue: "",
        duration: "",
        level: "",
        from: "",
        to: "",
        year: "",
      },
    ],
    administrative_responsibilities: [
      {
        position: "",
        organization: "",
        duration: "",
        nature_of_duty: "",
      },
    ],
    affliations: [
      {
        position: "",
        organization: "",
        duration: "",
        nature: "",
      },
    ],
  });

  // Image upload state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [viewingMode, setViewingMode] = useState('own'); // 'own' or 'viewing'
  const [viewedProfessorName, setViewedProfessorName] = useState('');

  // Additional data for comprehensive profile view (HOD viewing)
  const [experienceData, setExperienceData] = useState(null);
  const [publicationsData, setPublicationsData] = useState(null);
  const [patentsData, setPatentsData] = useState(null);
  const [fellowshipData, setFellowshipData] = useState(null);
  const [booksData, setBooksData] = useState(null);
  const [researchData, setResearchData] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [educationData, setEducationData] = useState(null);
  const [conferenceData, setConferenceData] = useState(null);
  const [participationData, setParticipationData] = useState(null);
  const [programmeData, setProgrammeData] = useState(null);

  // Section filter states
  const [showSectionFilter, setShowSectionFilter] = useState(false);
  const [selectedSections, setSelectedSections] = useState({
    personalInfo: true,
    education: true,
    expertise: true,
    awards: true,
    experience: true,
    publications: true,
    books: true,
    patents: true,
    projects: true,
    fellowships: true
  });

  // Section visibility states for hide/show functionality
  const [sectionVisibility, setSectionVisibility] = useState({
    experience: true,
    publications: true,
    patents: true,
    books: true,
    fellowship: true,
    research: true,
    projects: true,
    education: true,
    conference: true,
    participation: true,
    programme: true,
    awards: true
  });

  // Timeline filter states
  const [enableTimelineFilter, setEnableTimelineFilter] = useState(false);
  const [timelineRange, setTimelineRange] = useState({
    startYear: '',
    endYear: ''
  });

  // React Router hooks
  const { professorId } = useParams();
  const navigate = useNavigate();

  // Toggle section selection for report
  const toggleSection = (sectionKey) => {
    setSelectedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Toggle section visibility for hide/show functionality
  const toggleSectionVisibility = (sectionKey, event) => {
    // Prevent form submission and event bubbling
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setSectionVisibility(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Select all sections
  const selectAllSections = () => {
    setSelectedSections({
      personalInfo: true,
      education: true,
      expertise: true,
      awards: true,
      experience: true,
      publications: true,
      books: true,
      patents: true,
      projects: true,
      fellowships: true
    });
  };

  // Deselect all sections
  const deselectAllSections = () => {
    setSelectedSections({
      personalInfo: false,
      education: false,
      expertise: false,
      awards: false,
      experience: false,
      publications: false,
      books: false,
      patents: false,
      projects: false,
      fellowships: false
    });
  };

  // Filter data by timeline
  const filterDataByTimeline = (data, yearField) => {
    if (!enableTimelineFilter || !timelineRange.startYear || !timelineRange.endYear) {
      return data;
    }

    const startYear = parseInt(timelineRange.startYear);
    const endYear = parseInt(timelineRange.endYear);

    return data.filter(item => {
      const itemYear = parseInt(item[yearField]);
      return itemYear >= startYear && itemYear <= endYear;
    });
  };

  // Filter experience data by timeline (using 'from' or 'to' fields)
  const filterExperienceByTimeline = (data) => {
    if (!enableTimelineFilter || !timelineRange.startYear || !timelineRange.endYear) {
      return data;
    }

    const startYear = parseInt(timelineRange.startYear);
    const endYear = parseInt(timelineRange.endYear);

    return data.filter(item => {
      const fromYear = parseInt(item.from);
      const toYear = item.to === 'Present' ? new Date().getFullYear() : parseInt(item.to);

      // Check if the experience period overlaps with the timeline range
      return (fromYear <= endYear && toYear >= startYear);
    });
  };

  // Generate formatted faculty report for printing
  const generateFacultyReport = () => {
    const reportWindow = window.open('', '_blank');
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Faculty Profile Report - ${profile.name || 'Faculty Member'}</title>
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

          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 11pt;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
          }

          .print-button:hover {
            background: linear-gradient(135deg, #5a67d8 0%, #6b46a3 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.3);
          }

          .print-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .print-icon {
            width: 16px;
            height: 16px;
          }

          @media print {
            body { -webkit-print-color-adjust: exact; }
            .section { page-break-inside: avoid; }
            .print-button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${profile.profileImage || imagePreview ? `
            <img src="${imagePreview || profile.profileImage}" alt="Profile Photo" class="profile-image" />
          ` : `
            <div class="profile-placeholder">
              ${profile.name?.charAt(0) || '👤'}
            </div>
          `}
          <div class="header-info">
            <h1>FACULTY PROFILE REPORT</h1>
            <h2>${profile.name || 'Faculty Member'}</h2>
            <p style="margin: 3px 0 0 0; font-size: 9pt;">Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </div>

        <!-- Print Button -->
        <button class="print-button" onclick="window.print()" title="Print this report">
          <svg class="print-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd"></path>
          </svg>
          Print Report
        </button>

        ${selectedSections.personalInfo ? `
        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Full Name:</span>
              <span class="info-value">${profile.name || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">${profile.email || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone:</span>
              <span class="info-value">${profile.phone || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Department:</span>
              <span class="info-value">${profile.department || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Designation:</span>
              <span class="info-value">${profile.designation || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Employee ID:</span>
              <span class="info-value">${profile.employee_id || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date of Joining:</span>
              <span class="info-value">${profile.date_of_joining || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Experience:</span>
              <span class="info-value">${profile.experience_years || 'N/A'} years</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date of Birth:</span>
              <span class="info-value">${profile.date_of_birth || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Address:</span>
              <span class="info-value">${profile.address || 'N/A'}</span>
            </div>
          </div>
        </div>
        ` : ''}

        ${selectedSections.education && profile.education && profile.education.length > 0 ? `
        <div class="section">
          <div class="section-title">Educational Qualifications</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 15%">Degree</th>
                <th style="width: 35%">Subject/Title</th>
                <th style="width: 35%">University/Board</th>
                <th style="width: 15%">Year</th>
              </tr>
            </thead>
            <tbody>
              ${filterDataByTimeline(profile.education, 'graduationYear').map(edu => `
                <tr>
                  <td>${edu.degree || 'N/A'}</td>
                  <td>${edu.title || 'N/A'}</td>
                  <td>${edu.university || 'N/A'}</td>
                  <td>${edu.graduationYear || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${selectedSections.expertise && profile.area_of_expertise && (Array.isArray(profile.area_of_expertise) ? profile.area_of_expertise.length > 0 : profile.area_of_expertise) ? `
        <div class="section">
          <div class="section-title">Areas of Expertise</div>
          ${Array.isArray(profile.area_of_expertise) ?
          profile.area_of_expertise.map(expertise => `<div class="list-item">• ${expertise}</div>`).join('') :
          `<div class="list-item">• ${profile.area_of_expertise}</div>`
        }
        </div>
        ` : ''}

        ${selectedSections.awards && profile.awards && profile.awards.length > 0 && profile.awards.some(award => award.title) ? `
        <div class="section">
          <div class="section-title">Awards and Recognition</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 35%">Award Title</th>
                <th style="width: 15%">Type</th>
                <th style="width: 30%">Agency</th>
                <th style="width: 10%">Year</th>
                <th style="width: 10%">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filterDataByTimeline(profile.awards.filter(award => award.title), 'year').map(award => `
                <tr>
                  <td>${award.title || 'N/A'}</td>
                  <td>${award.type || 'N/A'}</td>
                  <td>${award.agency || 'N/A'}</td>
                  <td>${award.year || 'N/A'}</td>
                  <td>${award.amount || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${selectedSections.experience && experienceData && experienceData.teaching_experience && experienceData.teaching_experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Professional Experience</div>
          <div class="subsection-title">Teaching Experience</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 20%">Designation</th>
                <th style="width: 30%">Institution</th>
                <th style="width: 20%">Department</th>
                <th style="width: 15%">From</th>
                <th style="width: 15%">To</th>
              </tr>
            </thead>
            <tbody>
              ${filterExperienceByTimeline(experienceData.teaching_experience).map(exp => `
                <tr>
                  <td>${exp.designation || 'N/A'}</td>
                  <td>${exp.institution || 'N/A'}</td>
                  <td>${exp.department || 'N/A'}</td>
                  <td>${exp.from || 'N/A'}</td>
                  <td>${exp.to || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${selectedSections.experience && experienceData && experienceData.research_experience && experienceData.research_experience.length > 0 ? `
        <div class="section">
          <div class="subsection-title">Research Experience</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 25%">Position</th>
                <th style="width: 35%">Organization</th>
                <th style="width: 20%">From</th>
                <th style="width: 20%">To</th>
              </tr>
            </thead>
            <tbody>
              ${filterExperienceByTimeline(experienceData.research_experience).map(exp => `
                <tr>
                  <td>${exp.position || 'N/A'}</td>
                  <td>${exp.organization || 'N/A'}</td>
                  <td>${exp.from || 'N/A'}</td>
                  <td>${exp.to || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${selectedSections.publications && publicationsData && publicationsData.seie_journals && publicationsData.seie_journals.length > 0 ? `
        <div class="section">
          <div class="section-title">Publications</div>
          <div class="subsection-title">SCI-E Journals</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 30%">Title</th>
                <th style="width: 20%">Authors</th>
                <th style="width: 20%">Journal Name</th>
                <th style="width: 8%">Volume</th>
                <th style="width: 8%">Issue</th>
                <th style="width: 7%">Year</th>
                <th style="width: 7%">Impact Factor</th>
              </tr>
            </thead>
            <tbody>
              ${filterDataByTimeline(publicationsData.seie_journals, 'year').map(pub => `
                <tr>
                  <td>${pub.title || 'N/A'}</td>
                  <td>${pub.authors || 'N/A'}</td>
                  <td>${pub.journal_name || 'N/A'}</td>
                  <td>${pub.volume || 'N/A'}</td>
                  <td>${pub.issue || 'N/A'}</td>
                  <td>${pub.year || 'N/A'}</td>
                  <td>${pub.impact_factor || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${selectedSections.publications && publicationsData && publicationsData.scopus_journals && publicationsData.scopus_journals.length > 0 ? `
        <div class="section">
          <div class="subsection-title">Scopus Journals</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 30%">Title</th>
                <th style="width: 20%">Authors</th>
                <th style="width: 20%">Journal Name</th>
                <th style="width: 8%">Volume</th>
                <th style="width: 8%">Issue</th>
                <th style="width: 7%">Year</th>
                <th style="width: 7%">Impact Factor</th>
              </tr>
            </thead>
            <tbody>
              ${filterDataByTimeline(publicationsData.scopus_journals, 'year').map(pub => `
                <tr>
                  <td>${pub.title || 'N/A'}</td>
                  <td>${pub.authors || 'N/A'}</td>
                  <td>${pub.journal_name || 'N/A'}</td>
                  <td>${pub.volume || 'N/A'}</td>
                  <td>${pub.issue || 'N/A'}</td>
                  <td>${pub.year || 'N/A'}</td>
                  <td>${pub.impact_factor || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${selectedSections.books && booksData && booksData.books_authored && booksData.books_authored.length > 0 ? `
        <div class="section">
          <div class="section-title">Books</div>
          <div class="subsection-title">Books Authored</div>
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
              ${filterDataByTimeline(booksData.books_authored, 'year').map(book => `
                <tr>
                  <td>${book.title || 'N/A'}</td>
                  <td>${book.authors || 'N/A'}</td>
                  <td>${book.publisher || 'N/A'}</td>
                  <td>${book.year || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${selectedSections.patents && patentsData && patentsData.patents && patentsData.patents.length > 0 ? `
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
              ${filterDataByTimeline(patentsData.patents, 'year').map(patent => `
                <tr>
                  <td>${patent.title || 'N/A'}</td>
                  <td>${patent.patent_number || 'N/A'}</td>
                  <td>${patent.status || 'N/A'}</td>
                  <td>${patent.year || 'N/A'}</td>
                  <td>${patent.co_inventors || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${selectedSections.projects && projectData && projectData.ongoing_projects && projectData.ongoing_projects.length > 0 ? `
        <div class="section">
          <div class="section-title">Projects</div>
          <div class="subsection-title">Ongoing Projects</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 30%">Title</th>
                <th style="width: 20%">Funding Agency</th>
                <th style="width: 15%">Amount</th>
                <th style="width: 15%">Duration</th>
                <th style="width: 20%">Role</th>
              </tr>
            </thead>
            <tbody>
              ${filterDataByTimeline(projectData.ongoing_projects, 'year').map(project => `
                <tr>
                  <td>${project.title_of_project || 'N/A'}</td>
                  <td>${project.sponsoredBy || 'N/A'}</td>
                  <td>${project.sanctioned_amount || 'N/A'}</td>
                  <td>${project.period || 'N/A'}</td>
                  <td>${project.role || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${selectedSections.projects && projectData && projectData.completed_projects && projectData.completed_projects.length > 0 ? `
        <div class="section">
          <div class="subsection-title">Completed Projects</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 30%">Title</th>
                <th style="width: 20%">Funding Agency</th>
                <th style="width: 15%">Amount</th>
                <th style="width: 15%">Duration</th>
                <th style="width: 20%">Role</th>
              </tr>
            </thead>
            <tbody>
              ${filterDataByTimeline(projectData.completed_projects, 'year').map(project => `
                <tr>
                  <td>${project.title_of_project || 'N/A'}</td>
                  <td>${project.sponsoredBy || 'N/A'}</td>
                  <td>${project.sanctioned_amount || 'N/A'}</td>
                  <td>${project.period || 'N/A'}</td>
                  <td>${project.role || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${selectedSections.fellowships && fellowshipData && fellowshipData.fellowships && fellowshipData.fellowships.length > 0 ? `
        <div class="section">
          <div class="section-title">Fellowships</div>
          <table class="table">
            <thead>
              <tr>
                <th style="width: 40%">Fellowship Title</th>
                <th style="width: 30%">Awarded By</th>
                <th style="width: 15%">Duration</th>
                <th style="width: 15%">Year</th>
              </tr>
            </thead>
            <tbody>
              ${filterDataByTimeline(fellowshipData.fellowships, 'year').map(fellowship => `
                <tr>
                  <td>${fellowship.fellowship_title || 'N/A'}</td>
                  <td>${fellowship.awarded_by || 'N/A'}</td>
                  <td>${fellowship.duration || 'N/A'}</td>
                  <td>${fellowship.year || 'N/A'}</td>
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

    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.focus();

    // No automatic print - user will click the print icon when ready
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImagePreview(e.target.result);
          // Update profile state with image
          setProfile(prev => ({
            ...prev,
            profileImage: e.target.result
          }));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Check if HOD is viewing another professor's profile using URL parameter
    if (professorId) {
      setViewingMode('viewing');
      fetchViewingProfile(professorId);
      // Also fetch comprehensive data for HOD viewing
      fetchComprehensiveData(professorId);
    } else {
      setViewingMode('own');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setProfile((prev) => ({
            ...prev,
            name: decoded.name,
            email: decoded.email,
            department: prev.department || "Computer Science", // Default value
          }));
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
      fetchProfile();
    }
  }, [professorId]); // Add professorId as dependency

  // Auto-expand all textareas when component mounts or data changes
  useEffect(() => {
    const expandAllTextareas = () => {
      const textareas = document.querySelectorAll('textarea[data-field]');
      textareas.forEach(textarea => {
        autoExpandTextarea(textarea);
      });
    };

    // Expand textareas after a short delay to ensure DOM is rendered
    const timer = setTimeout(expandAllTextareas, 100);
    return () => clearTimeout(timer);
  }, [profile]);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        getApiUrl("/api/professor/profile"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Function to fetch another professor's profile (HOD viewing mode)
  const fetchViewingProfile = async (professorId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      console.log('Attempting to fetch profile for professor ID:', professorId);
      const response = await fetch(
        getApiUrl(`/api/professor/profile/${professorId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        setProfile(data);
        setViewedProfessorName(data.name || 'Professor');
      } else {
        const errorData = await response.text();
        console.error("Failed to fetch professor profile. Status:", response.status, "Error:", errorData);
        alert(`Failed to load professor profile. Status: ${response.status}. Error: ${errorData}`);
      }
    } catch (error) {
      console.error("Error fetching professor profile:", error);
      alert(`Error loading professor profile: ${error.message}`);
    }
  };

  // Function to fetch all comprehensive data for HOD viewing
  const fetchComprehensiveData = async (professorId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Fetch all data endpoints for comprehensive profile view
      const endpoints = [
        { name: 'experience', url: getApiUrl(`/api/professor/experience/${professorId}`), setter: setExperienceData },
        { name: 'publications', url: getApiUrl(`/api/professor/publications/${professorId}`), setter: setPublicationsData },
        { name: 'patents', url: getApiUrl(`/api/professor/patents/${professorId}`), setter: setPatentsData },
        { name: 'fellowship', url: getApiUrl(`/api/professor/fellowship/${professorId}`), setter: setFellowshipData },
        { name: 'books', url: getApiUrl(`/api/professor/books/${professorId}`), setter: setBooksData },
        { name: 'research', url: getApiUrl(`/api/professor/research-guidance/${professorId}`), setter: setResearchData },
        { name: 'projects', url: getApiUrl(`/api/professor/project-consultancy/${professorId}`), setter: setProjectData },
        { name: 'education', url: getApiUrl(`/api/professor/e-education/${professorId}`), setter: setEducationData },
        { name: 'conferences', url: getApiUrl(`/api/professor/conference-seminar-workshop/${professorId}`), setter: setConferenceData },
        { name: 'participation', url: getApiUrl(`/api/professor/participation-collaboration/${professorId}`), setter: setParticipationData },
        { name: 'programmes', url: getApiUrl(`/api/professor/programme/${professorId}`), setter: setProgrammeData }
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            endpoint.setter(data);
          } else {
            console.log(`No ${endpoint.name} data available for this professor`);
            endpoint.setter(null);
          }
        } catch (error) {
          console.error(`Error fetching ${endpoint.name}:`, error);
          endpoint.setter(null);
        }
      }
    } catch (error) {
      console.error("Error fetching comprehensive data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if in viewing mode
    if (viewingMode === 'viewing') {
      alert('Cannot edit profile in viewing mode.');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        return;
      }

      // Send profile data directly to backend for immediate saving
      const response = await fetch(getApiUrl("/api/professor/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        const data = await response.json();
        alert("Profile updated successfully!");
        console.log("Profile saved:", data.profile);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error updating profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Please try again.");
    }
  };

  // Get input style with disabled state for viewing mode
  const getInputStyle = (isDisabled = false) => ({
    width: "100%",
    padding: "12px 16px",
    border: isDisabled ? "2px solid #e2e8f0" : "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
    backgroundColor: isDisabled ? "#f7fafc" : "#fff",
    color: isDisabled ? "#718096" : "#2d3748",
    cursor: isDisabled ? "not-allowed" : "text"
  });

  // Get textarea style with auto-expand functionality
  const getTextareaStyle = (isDisabled = false) => ({
    ...getInputStyle(isDisabled),
    minHeight: "44px",
    resize: "none",
    overflow: "hidden",
    lineHeight: "1.5"
  });

  // Auto-expand textarea function
  const autoExpandTextarea = (element) => {
    element.style.height = "auto";
    element.style.height = Math.max(44, element.scrollHeight) + "px";
  };

  // Enhanced handleInputChange to handle auto-expanding textareas
  const handleInputChange = (field, value, isTextarea = false) => {
    setProfile((prev) => ({ ...prev, [field]: value }));

    // Auto-expand textarea after state update
    if (isTextarea) {
      setTimeout(() => {
        const textarea = document.querySelector(`textarea[data-field="${field}"]`);
        if (textarea) {
          autoExpandTextarea(textarea);
        }
      }, 0);
    }
  };

  const isDisabled = viewingMode === 'viewing';

  const handleArrayChange = (arrayName, index, field, value) => {
    setProfile((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Enhanced handleArrayChange for auto-expanding textareas
  const handleArrayChangeWithExpand = (arrayName, index, field, value, element) => {
    handleArrayChange(arrayName, index, field, value);
    if (element) {
      setTimeout(() => autoExpandTextarea(element), 0);
    }
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      education: { degree: "", title: "", university: "", graduationYear: "" },
      awards: { title: "", type: "", agency: "", year: "", amount: "" },
      teaching_experience: {
        designation: "",
        department: "",
        institution: "",
        from: "",
        to: "",
      },
      // Add other defaults as needed
    };

    setProfile((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName] || {}],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setProfile((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
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
              margin: "0 0 10px 0",
              fontFamily: "Segoe UI, Arial, sans-serif",
            }}
          >
            {viewingMode === 'viewing' ? `${viewedProfessorName}` : 'Faculty Profile'}
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              opacity: 0.8,
            }}
          >
          </p>

        </div>
        <div
          style={{
            maxWidth: "87vw",
            margin: "0 auto",
            background: "#fff",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div
              style={{
                padding: "5px 30px 30px",
              }}
            >

              {viewingMode === 'viewing' ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '20px',
                }}>

                  <button
                    type="button"
                    onClick={() => {
                      // Navigate back to faculty directory
                      navigate('/faculty');
                    }}
                    style={{
                      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "15px",
                      padding: "16px 25px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 8px 25px rgba(79, 172, 254, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 12px 35px rgba(79, 172, 254, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 8px 25px rgba(79, 172, 254, 0.3)";
                    }}
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Show section filter modal when report button is clicked
                      setShowSectionFilter(true);
                    }}
                    style={{
                      background: "linear-gradient(135deg, #fe4f5eff 0%, #fe0050ff 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "15px",
                      padding: "16px 20px",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 8px 25px rgba(79, 172, 254, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 12px 35px rgba(79, 172, 254, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 8px 25px rgba(79, 172, 254, 0.3)";
                    }}
                  >
                    Report 🖨️
                  </button>
                </div>
              ) : (
                <></>
              )}

              {/* Section Filter Modal */}
              {showSectionFilter && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '30px',
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#2d3748',
                      marginBottom: '20px',
                      textAlign: 'center',
                      marginTop: 0
                    }}>
                      Select Report Sections
                    </h3>

                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={selectAllSections}
                        style={{
                          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '8px 16px',
                          marginRight: '10px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 600
                        }}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllSections}
                        style={{
                          background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 600
                        }}
                      >
                        Deselect All
                      </button>
                    </div>

                    {/* Timeline Filter Section */}
                    <div style={{
                      marginBottom: '20px',
                      padding: '15px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0'
                    }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#2d3748'
                      }}>
                        <input
                          type="checkbox"
                          checked={enableTimelineFilter}
                          onChange={(e) => setEnableTimelineFilter(e.target.checked)}
                          style={{
                            marginRight: '8px',
                            width: '16px',
                            height: '16px',
                            accentColor: '#667eea'
                          }}
                        />
                        Enable Timeline Filter
                      </label>

                      {enableTimelineFilter && (
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'center',
                          marginTop: '10px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <label style={{
                              display: 'block',
                              fontSize: '0.9rem',
                              fontWeight: 500,
                              color: '#4a5568',
                              marginBottom: '5px'
                            }}>
                              From Year
                            </label>
                            <input
                              type="number"
                              value={timelineRange.startYear}
                              onChange={(e) => setTimelineRange(prev => ({
                                ...prev,
                                startYear: e.target.value
                              }))}
                              placeholder="e.g., 2000"
                              min="1900"
                              max="2030"
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{
                              display: 'block',
                              fontSize: '0.9rem',
                              fontWeight: 500,
                              color: '#4a5568',
                              marginBottom: '5px'
                            }}>
                              To Year
                            </label>
                            <input
                              type="number"
                              value={timelineRange.endYear}
                              onChange={(e) => setTimelineRange(prev => ({
                                ...prev,
                                endYear: e.target.value
                              }))}
                              placeholder="e.g., 2024"
                              min="1900"
                              max="2030"
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#667eea'}
                              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                      {[
                        { key: 'personalInfo', label: 'Personal Information' },
                        { key: 'education', label: 'Education' },
                        { key: 'expertise', label: 'Areas of Expertise' },
                        { key: 'awards', label: 'Awards & Recognition' },
                        { key: 'experience', label: 'Experience' },
                        { key: 'publications', label: 'Publications' },
                        { key: 'books', label: 'Books' },
                        { key: 'patents', label: 'Patents' },
                        { key: 'projects', label: 'Projects' },
                        { key: 'fellowships', label: 'Fellowships' }
                      ].map(section => (
                        <label key={section.key} style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '10px',
                          borderRadius: '10px',
                          border: '2px solid #e2e8f0',
                          transition: 'all 0.2s ease'
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedSections[section.key]}
                            onChange={() => toggleSection(section.key)}
                            style={{
                              marginRight: '8px',
                              width: '16px',
                              height: '16px',
                              accentColor: '#667eea'
                            }}
                          />
                          <span style={{
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: selectedSections[section.key] ? '#667eea' : '#4a5568'
                          }}>
                            {section.label}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                      <button
                        onClick={() => {
                          setShowSectionFilter(false);
                          generateFacultyReport();
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 24px',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 4px 15px rgba(151, 240, 188, 0.3)'
                        }}
                      >
                        Generate Report
                      </button>
                      <button
                        onClick={() => {
                          setShowSectionFilter(false);
                          // Reset to all sections selected
                          selectAllSections();
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 24px',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: 600,
                          boxShadow: '0 4px 15px rgba(160, 174, 192, 0.3)'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center' }}>
                {viewingMode === 'viewing' ? (
                  <>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '20px',
                      padding: '10px',
                      borderRadius: '15px',
                    }}>
                      {/* Image Preview */}
                      <div style={{
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '3rem',
                        fontWeight: 700,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        border: '4px solid #fff',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}>
                        {imagePreview || profile.profileImage ? (
                          <img
                            src={imagePreview || profile.profileImage}
                            alt="Profile"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center',
                              borderRadius: '50%'
                            }}
                          />
                        ) : (
                          <span>{profile.name?.charAt(0) || '👤'}</span>
                        )}
                      </div>

                      {/* Upload Button */}
                      {!isDisabled && (
                        <label style={{
                          background: 'linear-gradient(135deg, #6093ecff 0%, #1a202c 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 24px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          📷 {imagePreview ? 'Change Photo' : 'Upload Photo'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}

                      {!isDisabled && selectedImage && (
                        <p style={{
                          color: '#4a5568',
                          fontSize: '0.9rem',
                          margin: 0,
                          textAlign: 'center'
                        }}>
                          Selected: {selectedImage.name}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '10px',
                      maxWidth: 'fit-content',
                    }}>
                      {/* Image Preview */}
                      <div style={{
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '3rem',
                        fontWeight: 700,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        border: '4px solid #fff',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}>
                        {imagePreview || profile.profileImage ? (
                          <img
                            src={imagePreview || profile.profileImage}
                            alt="Profile"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center',
                              borderRadius: '50%'
                            }}
                          />
                        ) : (
                          <span>{profile.name?.charAt(0) || '👤'}</span>
                        )}
                      </div>

                      {/* Upload Button */}
                      {!isDisabled && (
                        <label style={{
                          background: 'linear-gradient(135deg, #6093ecff 0%, #1a202c 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 24px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          📷 {imagePreview ? 'Change Photo' : 'Upload Photo'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}

                      {!isDisabled && selectedImage && (
                        <p style={{
                          color: '#4a5568',
                          fontSize: '0.9rem',
                          margin: 0,
                          textAlign: 'center'
                        }}>
                          Selected: {selectedImage.name}
                        </p>
                      )}
                    </div>
                  </>

                )}

                <div>
                  <h2
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color: "#2d3748",
                      marginBottom: "25px",
                      marginLeft: '20px',
                      marginTop: '30px',
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontFamily: "Segoe UI, Arial, sans-serif",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Personal Information
                  </h2>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      marginLeft: '20px',
                      flexWrap: 'wrap',
                      gap: '20px',
                    }}
                  >
                    <div >
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#4a5568",
                        }}
                      >
                        Full Name
                      </label>
                      <textarea
                        value={profile.name}
                        onChange={(e) => {
                          handleInputChange("name", e.target.value, true);
                          autoExpandTextarea(e.target);
                        }}
                        disabled={isDisabled}
                        style={getTextareaStyle(isDisabled)}
                        placeholder="Enter your full name"
                        data-field="name"
                        rows="1"
                        onInput={(e) => autoExpandTextarea(e.target)}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#4a5568",
                        }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled={isDisabled}
                        style={getInputStyle(isDisabled)}
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#4a5568",
                        }}
                      >
                        Phone
                      </label>
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        disabled={isDisabled}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "10px",
                          fontSize: "1rem",
                          transition: "border-color 0.3s ease",
                          boxSizing: "border-box",
                        }}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#4a5568",
                        }}
                      >
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={profile.date_of_birth}
                        onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                        disabled={isDisabled}
                        style={getInputStyle(isDisabled)}
                        placeholder="Select your date of birth"
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#4a5568",
                        }}
                      >
                        Address
                      </label>
                      <textarea
                        value={profile.address}
                        onChange={(e) => {
                          handleInputChange("address", e.target.value, true);
                          autoExpandTextarea(e.target);
                        }}
                        disabled={isDisabled}
                        style={getTextareaStyle(isDisabled)}
                        placeholder="Enter your address"
                        data-field="address"
                        rows="1"
                        onInput={(e) => autoExpandTextarea(e.target)}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#4a5568",
                        }}
                      >
                        Designation
                      </label>
                      <textarea
                        value={profile.designation}
                        onChange={(e) => {
                          handleInputChange("designation", e.target.value, true);
                          autoExpandTextarea(e.target);
                        }}
                        disabled={isDisabled}
                        style={getTextareaStyle(isDisabled)}
                        placeholder="Enter your designation"
                        data-field="designation"
                        rows="1"
                        onInput={(e) => autoExpandTextarea(e.target)}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#4a5568",
                        }}
                      >
                        Department
                      </label>
                      <textarea
                        value={profile.department}
                        onChange={(e) => {
                          handleInputChange("department", e.target.value, true);
                          autoExpandTextarea(e.target);
                        }}
                        disabled={isDisabled}
                        style={getTextareaStyle(isDisabled)}
                        placeholder="Enter your department"
                        data-field="department"
                        rows="1"
                        onInput={(e) => autoExpandTextarea(e.target)}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#4a5568",
                        }}
                      >
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={profile.employee_id}
                        onChange={(e) => handleInputChange("employee_id", e.target.value)}
                        disabled={isDisabled}
                        style={getInputStyle(isDisabled)}
                        placeholder="Enter your employee ID"
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                          color: "#4a5568",
                        }}
                      >
                        Date of Joining
                      </label>
                      <input
                        type="date"
                        value={profile.date_of_joining}
                        onChange={(e) => handleInputChange("date_of_joining", e.target.value)}
                        disabled={isDisabled}
                        style={getInputStyle(isDisabled)}
                        placeholder="Select your date of joining"
                      />
                    </div>
                  </div>



                </div>
              </div>


              {/* Educational Qualifications Section */}
              <div style={{ marginTop: "30px" }}>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: "25px",
                    marginTop: '0px',
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "Segoe UI, Arial, sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  Educational Qualifications
                </h2>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "10px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      <th
                        style={{
                          width: "60px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        S.No
                      </th>
                      <th
                        style={{
                          width: "180px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Degree
                      </th>
                      <th
                        style={{
                          width: "250px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Subject/Title of Thesis
                      </th>
                      <th
                        style={{
                          width: "200px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        University/Board
                      </th>
                      <th
                        style={{
                          width: "120px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Year of Passing
                      </th>
                      <th
                        style={{
                          width: "80px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.education.map((edu, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            width: "60px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          style={{
                            width: "180px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          {isDisabled ? (
                            edu.degree || "N/A"
                          ) : (
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) =>
                                handleArrayChange(
                                  "education",
                                  idx,
                                  "degree",
                                  e.target.value
                                )
                              }
                              style={{
                                width: "100%",
                                minWidth: "0",
                                maxWidth: "210px",
                                padding: "12px 16px",
                                borderRadius: "10px",
                                border: "2px solid #e2e8f0",
                                boxSizing: "border-box",
                                fontSize: "1rem",
                                textAlign: "center"
                              }}
                              placeholder="Degree"
                            />
                          )}
                        </td>
                        <td
                          style={{
                            width: "220px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          {isDisabled ? (
                            edu.title || "N/A"
                          ) : (
                            <textarea
                              value={edu.title}
                              onChange={(e) => {
                                handleArrayChangeWithExpand(
                                  "education",
                                  idx,
                                  "title",
                                  e.target.value,
                                  e.target
                                );
                              }}
                              style={{
                                width: "100%",
                                minWidth: "0",
                                maxWidth: "350px",
                                padding: "12px 16px",
                                borderRadius: "10px",
                                border: "2px solid #e2e8f0",
                                boxSizing: "border-box",
                                fontSize: "1rem",
                                textAlign: "center",
                                minHeight: "44px",
                                resize: "none",
                                overflow: "hidden",
                                lineHeight: "1.5"
                              }}
                              placeholder="Subject/Title of Thesis"
                              rows="1"
                              onInput={(e) => autoExpandTextarea(e.target)}
                            />
                          )}
                        </td>
                        <td
                          style={{
                            width: "200px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          {isDisabled ? (
                            edu.university || "N/A"
                          ) : (
                            <input
                              type="text"
                              value={edu.university}
                              onChange={(e) =>
                                handleArrayChange(
                                  "education",
                                  idx,
                                  "university",
                                  e.target.value
                                )
                              }
                              style={{
                                width: "100%",
                                minWidth: "0",
                                maxWidth: "220px",
                                padding: "12px 16px",
                                borderRadius: "10px",
                                border: "2px solid #e2e8f0",
                                boxSizing: "border-box",
                                fontSize: "1rem",
                                textAlign: "center"
                              }}
                              placeholder="University/Board"
                            />
                          )}
                        </td>
                        <td
                          style={{
                            width: "120px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          {isDisabled ? (
                            edu.graduationYear || "N/A"
                          ) : (
                            <input
                              type="text"
                              value={edu.graduationYear}
                              onChange={(e) =>
                                handleArrayChange(
                                  "education",
                                  idx,
                                  "graduationYear",
                                  e.target.value
                                )
                              }
                              style={{
                                width: "100%",
                                minWidth: "0",
                                maxWidth: "150px",
                                padding: "12px 16px",
                                borderRadius: "10px",
                                border: "2px solid #e2e8f0",
                                boxSizing: "border-box",
                                fontSize: "1rem",
                                textAlign: "center"
                              }}
                              placeholder="Year of Passing"
                            />
                          )}
                        </td>
                        <td
                          style={{
                            width: "80px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          {!isDisabled && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem("education", idx)}
                              style={{
                                background: "#e53e3e",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 10px",
                                cursor: "pointer",
                                fontSize: "0.95rem",
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
                {!isDisabled && (
                  <button
                    type="button"
                    onClick={() => addArrayItem("education")}
                    style={{
                      background: "#3182ce",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 18px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "1rem",
                      marginTop: "5px",
                    }}
                  >
                    Add Qualification
                  </button>
                )}
              </div>

              <div
                style={{
                  margin: "0",
                  background: "#fff",
                  borderRadius: "20px",
                  maxWidth: "87vw",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: "25px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "Segoe UI, Arial, sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  Area of Specialization
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {Array.isArray(profile.area_of_expertise) ? (
                    profile.area_of_expertise.map((spec, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <input
                          type="text"
                          value={spec}
                          onChange={(e) => {
                            const newSpecs = [...profile.area_of_expertise];
                            newSpecs[idx] = e.target.value;
                            setProfile((prev) => ({
                              ...prev,
                              area_of_expertise: newSpecs,
                            }));
                          }}
                          disabled={isDisabled}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "2px solid #e2e8f0",
                            borderRadius: "10px",
                            fontSize: "1rem",
                            transition: "border-color 0.3s ease",
                            boxSizing: "border-box",
                            fontFamily: "Segoe UI, Arial, sans-serif",
                          }}
                          placeholder={`Specialization ${idx + 1}`}
                        />
                        {!isDisabled && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfile((prev) => ({
                                ...prev,
                                area_of_expertise: prev.area_of_expertise.filter(
                                  (_, i) => i !== idx
                                ),
                              }));
                            }}
                            style={{
                              background: "#e53e3e",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              cursor: "pointer",
                              fontSize: "0.95rem",
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <input
                        type="text"
                        value={profile.area_of_expertise}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            area_of_expertise: [e.target.value],
                          }))
                        }
                        disabled={isDisabled}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "10px",
                          fontSize: "1rem",
                          transition: "border-color 0.3s ease",
                          boxSizing: "border-box",
                          fontFamily: "Segoe UI, Arial, sans-serif",
                        }}
                        placeholder="Specialization 1"
                      />

                    </div>
                  )}
                </div>
                {!isDisabled && (
                  <button
                    type="button"
                    onClick={() =>
                      setProfile((prev) => ({
                        ...prev,
                        area_of_expertise: [
                          ...(Array.isArray(prev.area_of_expertise)
                            ? prev.area_of_expertise
                            : [prev.area_of_expertise]),
                          "",
                        ],
                      }))
                    }
                    style={{
                      background: "#3182ce",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 18px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "1rem",
                      marginTop: "15px",
                    }}
                  >
                    Add Specialization
                  </button>
                )}
              </div>

              {/* Awards / Prizes Conferred Section */}
              <div style={{ marginTop: "40px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                  <h2
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color: "#2d3748",
                      marginBottom: "0px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontFamily: "Segoe UI, Arial, sans-serif",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Awards / Prizes Conferred
                  </h2>
                  <button
                    type="button"
                    onClick={(e) => toggleSectionVisibility('awards', e)}
                    style={{
                      background: sectionVisibility.awards ? "#ef4444" : "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {sectionVisibility.awards ? "Hide" : "Show"}
                  </button>
                </div>

                {sectionVisibility.awards && (
                  <>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginBottom: "10px",
                      }}
                    >
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      <th
                        style={{
                          width: "60px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        S.No
                      </th>
                      <th
                        style={{
                          width: "220px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Name / Title of the Award
                      </th>
                      <th
                        style={{
                          width: "120px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Category/Type of Award
                      </th>
                      <th
                        style={{
                          width: "220px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Name of the Agency conferred the Award
                      </th>
                      <th
                        style={{
                          width: "120px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Year of the Award
                      </th>
                      <th
                        style={{
                          width: "120px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        Amount for Cash Award
                      </th>
                      <th
                        style={{
                          width: "80px",
                          padding: "10px",
                          border: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.awards.map((award, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            width: "60px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          style={{
                            width: "220px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          {isDisabled ? (
                            award.title || "N/A"
                          ) : (
                            <textarea
                              value={award.title}
                              onChange={(e) => {
                                handleArrayChangeWithExpand(
                                  "awards",
                                  idx,
                                  "title",
                                  e.target.value,
                                  e.target
                                );
                              }}
                              style={{
                                width: "100%",
                                minWidth: "0",
                                maxWidth: "250px",
                                padding: "12px 16px",
                                borderRadius: "10px",
                                border: "2px solid #e2e8f0",
                                boxSizing: "border-box",
                                fontSize: "1rem",
                                textAlign: "center",
                                minHeight: "44px",
                                resize: "none",
                                overflow: "hidden",
                                lineHeight: "1.5"
                              }}
                              placeholder="Name / Title of the Award"
                              rows="1"
                              onInput={(e) => autoExpandTextarea(e.target)}
                            />
                          )}
                        </td>
                        <td
                          style={{
                            width: "120px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          {isDisabled ? (
                            award.type || "N/A"
                          ) : (
                            <input
                              type="text"
                              value={award.type}
                              onChange={(e) =>
                                handleArrayChange(
                                  "awards",
                                  idx,
                                  "type",
                                  e.target.value
                                )
                              }
                              style={{
                                width: "100%",
                                minWidth: "0",
                                maxWidth: "150px",
                                padding: "12px 16px",
                                borderRadius: "10px",
                                border: "2px solid #e2e8f0",
                                boxSizing: "border-box",
                                fontSize: "1rem",
                                textAlign: "center"
                              }}
                              placeholder="Type"
                            />
                          )}
                        </td>
                        <td
                          style={{
                            width: "220px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          {isDisabled ? (
                            award.agency || "N/A"
                          ) : (
                            <input
                              type="text"
                              value={award.agency}
                              onChange={(e) =>
                                handleArrayChange(
                                  "awards",
                                  idx,
                                  "agency",
                                  e.target.value
                                )
                              }
                              style={{
                                width: "100%",
                                minWidth: "0",
                                maxWidth: "250px",
                                padding: "12px 16px",
                                borderRadius: "10px",
                                border: "2px solid #e2e8f0",
                                boxSizing: "border-box",
                                fontSize: "1rem",
                                textAlign: "center"
                              }}
                              placeholder="Name of the Agency"
                            />
                          )}
                        </td>
                        <td
                          style={{
                            width: "120px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          {isDisabled ? (
                            award.year || "N/A"
                          ) : (
                            <input
                              type="text"
                              value={award.year}
                              onChange={(e) =>
                                handleArrayChange(
                                  "awards",
                                  idx,
                                  "year",
                                  e.target.value
                                )
                              }
                              style={{
                                width: "100%",
                                minWidth: "0",
                                maxWidth: "100px",
                                padding: "12px 16px",
                                borderRadius: "10px",
                                border: "2px solid #e2e8f0",
                                boxSizing: "border-box",
                                fontSize: "1rem",
                                textAlign: "center"
                              }}
                              placeholder="Year"
                            />
                          )}
                        </td>
                        <td
                          style={{
                            width: "120px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center"
                          }}
                        >
                          {isDisabled ? (
                            award.amount || "N/A"
                          ) : (
                            <input
                              type="text"
                              value={award.amount}
                              onChange={(e) =>
                                handleArrayChange(
                                  "awards",
                                  idx,
                                  "amount",
                                  e.target.value
                                )
                              }
                              style={{
                                width: "100%",
                                minWidth: "0",
                                maxWidth: "130px",
                                padding: "12px 16px",
                                borderRadius: "10px",
                                border: "2px solid #e2e8f0",
                                boxSizing: "border-box",
                                fontSize: "1rem",
                                textAlign: "center"
                              }}
                              placeholder="Amount"
                            />
                          )}
                        </td>
                        <td
                          style={{
                            width: "80px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          {!isDisabled && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem("awards", idx)}
                              style={{
                                background: "#e53e3e",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 10px",
                                cursor: "pointer",
                                fontSize: "0.95rem",
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
                {!isDisabled && (
                  <button
                    type="button"
                    onClick={() => addArrayItem("awards")}
                    style={{
                      background: "#3182ce",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 18px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "1rem",
                      marginTop: "5px",
                    }}
                  >
                    Add Award / Prize
                  </button>
                )}
                  </>
                )}
              </div>
            </div>

            {/* Comprehensive Profile Data for HOD Viewing */}
            {viewingMode === 'viewing' && (
              <>
                {/* Experience Section */}
                {experienceData && (
                  <div style={{ marginTop: "0px", padding: "30px", paddingTop: '0px', borderRadius: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#2d3748", marginTop: '0px', marginBottom: "0px", display: "flex", alignItems: "center", gap: "10px" }}>
                        Professional Experience
                      </h2>
                      <button
                        type="button"
                        onClick={(e) => toggleSectionVisibility('experience', e)}
                        style={{
                          background: sectionVisibility.experience ? "#ef4444" : "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {sectionVisibility.experience ? "Hide" : "Show"}
                      </button>
                    </div>

                    {sectionVisibility.experience && (
                      <>
                        {/* Teaching Experience Table */}
                        {experienceData.teaching_experience?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Teaching Experience</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "60px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Designation</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Institution</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Department</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>From</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>To</th>
                            </tr>
                          </thead>
                          <tbody>
                            {experienceData.teaching_experience.map((exp, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{exp.designation}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{exp.institution}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{exp.department}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{exp.from}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{exp.to}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Research Experience Table */}
                    {experienceData.research_experience?.length > 0 && (
                      <div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Research Experience</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "60px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Position</th>
                              <th style={{ width: "250px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Organization</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>From</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>To</th>
                            </tr>
                          </thead>
                          <tbody>
                            {experienceData.research_experience.map((exp, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{exp.position}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{exp.organization}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{exp.from}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{exp.to}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                )}

                {/* Publications Section */}
                {publicationsData && (
                  <div style={{ marginTop: "0px", padding: "30px", paddingTop: '0px', borderRadius: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#2d3748", marginTop: '0px', marginBottom: "0px", display: "flex", alignItems: "center", gap: "10px" }}>
                        Publications
                      </h2>
                      <button
                        type="button"
                        onClick={(e) => toggleSectionVisibility('publications', e)}
                        style={{
                          background: sectionVisibility.publications ? "#ef4444" : "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {sectionVisibility.publications ? "Hide" : "Show"}
                      </button>
                    </div>

                    {sectionVisibility.publications && (
                      <>
                        {/* SEIE Journals Table */}
                        {publicationsData.seie_journals?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>SEIE Journals</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Authors</th>
                              <th style={{ width: "160px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Journal Name</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Volume</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Issue</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Page Nos.</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Impact Factor</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Paper Upload</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Paper Link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {publicationsData.seie_journals.map((pub, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.authors}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.journal_name}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.volume}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.issue}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.page_nos}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.year}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.impact_factor}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                  {pub.paper_upload_filename ? (
                                    <a
                                      href={pub.paper_upload}
                                      download={pub.paper_upload_filename}
                                      style={{ color: "#3182ce", textDecoration: "underline", fontSize: "0.9rem" }}
                                    >
                                      {pub.paper_upload_filename}
                                    </a>
                                  ) : (
                                    "No file"
                                  )}
                                </td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                  {pub.paper_link ? (
                                    <a
                                      href={pub.paper_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: "#3182ce", textDecoration: "underline", fontSize: "0.9rem" }}
                                    >
                                      View Paper
                                    </a>
                                  ) : (
                                    "No link"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* UGC Approved Journals Table */}
                    {publicationsData.ugc_approved_journals?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>UGC Approved Journals</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Authors</th>
                              <th style={{ width: "160px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Journal Name</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Volume</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Issue</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Page Nos.</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Impact Factor</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Paper Upload</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Paper Link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {publicationsData.ugc_approved_journals.map((pub, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.authors}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.journal_name}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.volume}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.issue}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.page_nos}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.year}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.impact_factor}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                  {pub.paper_upload_filename ? (
                                    <a
                                      href={pub.paper_upload}
                                      download={pub.paper_upload_filename}
                                      style={{ color: "#3182ce", textDecoration: "underline", fontSize: "0.9rem" }}
                                    >
                                      {pub.paper_upload_filename}
                                    </a>
                                  ) : (
                                    "No file"
                                  )}
                                </td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                  {pub.paper_link ? (
                                    <a
                                      href={pub.paper_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: "#3182ce", textDecoration: "underline", fontSize: "0.9rem" }}
                                    >
                                      View Paper
                                    </a>
                                  ) : (
                                    "No link"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Non-UGC Journals Table */}
                    {publicationsData.non_ugc_journals?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Other Journals</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Authors</th>
                              <th style={{ width: "160px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Journal Name</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Volume</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Issue</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Page Nos.</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Impact Factor</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Paper Upload</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Paper Link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {publicationsData.non_ugc_journals.map((pub, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.authors}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.journal_name}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.volume}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.issue}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.page_nos}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.year}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.impact_factor}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                  {pub.paper_upload_filename ? (
                                    <a
                                      href={pub.paper_upload}
                                      download={pub.paper_upload_filename}
                                      style={{ color: "#3182ce", textDecoration: "underline", fontSize: "0.9rem" }}
                                    >
                                      {pub.paper_upload_filename}
                                    </a>
                                  ) : (
                                    "No file"
                                  )}
                                </td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                  {pub.paper_link ? (
                                    <a
                                      href={pub.paper_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: "#3182ce", textDecoration: "underline", fontSize: "0.9rem" }}
                                    >
                                      View Paper
                                    </a>
                                  ) : (
                                    "No link"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Conference Proceedings Table */}
                    {publicationsData.conference_proceedings?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Conference Proceedings</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Authors</th>
                              <th style={{ width: "250px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Conference Details</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Page Nos.</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Paper Upload</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Paper Link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {publicationsData.conference_proceedings.map((pub, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.authors}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.conference_details}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.page_nos}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.year}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                  {pub.paper_upload_filename ? (
                                    <a
                                      href={pub.paper_upload}
                                      download={pub.paper_upload_filename}
                                      style={{ color: "#3182ce", textDecoration: "underline", fontSize: "0.9rem" }}
                                    >
                                      {pub.paper_upload_filename}
                                    </a>
                                  ) : (
                                    "No file"
                                  )}
                                </td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                  {pub.paper_link ? (
                                    <a
                                      href={pub.paper_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: "#3182ce", textDecoration: "underline", fontSize: "0.9rem" }}
                                    >
                                      View Paper
                                    </a>
                                  ) : (
                                    "No link"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Journal Publications Table (Legacy) */}
                    {publicationsData.journal_publications?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Journal Publications (Legacy)</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "250px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Journal</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Volume</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Pages</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                            </tr>
                          </thead>
                          <tbody>
                            {publicationsData.journal_publications.map((pub, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.journal}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.volume}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.pages}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.year}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Conference Publications Table */}
                    {publicationsData.conference_publications?.length > 0 && (
                      <div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Conference Publications</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "250px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Conference</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Pages</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                            </tr>
                          </thead>
                          <tbody>
                            {publicationsData.conference_publications.map((pub, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.conference}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.pages}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{pub.year}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                )}

                {/* Patents Section */}
                {patentsData && (
                  <div style={{ marginTop: "0px", padding: "30px", paddingTop: '0px', borderRadius: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#2d3748", marginTop: '0px', marginBottom: "0px", display: "flex", alignItems: "center", gap: "10px" }}>
                        Patents
                      </h2>
                      <button
                        type="button"
                        onClick={(e) => toggleSectionVisibility('patents', e)}
                        style={{
                          background: sectionVisibility.patents ? "#ef4444" : "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {sectionVisibility.patents ? "Hide" : "Show"}
                      </button>
                    </div>

                    {sectionVisibility.patents && (
                      <>
                        {patentsData.patents?.length > 0 && (
                      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                        <thead>
                          <tr style={{ background: "#f1f5f9" }}>
                            <th style={{ width: "60px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                            <th style={{ width: "250px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title</th>
                            <th style={{ width: "150px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Patent Number</th>
                            <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Date of Award</th>
                            <th style={{ width: "150px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Awarding Agency</th>
                            <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Status</th>
                            <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Scope</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patentsData.patents.map((patent, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{patent.title}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{patent.patent_number}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{patent.date_of_award}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{patent.awarding_agency}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{patent.status}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{patent.scope}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                      </>
                    )}
                  </div>
                )}

                {/* Fellowship Section */}
                {fellowshipData && (
                  <div style={{ marginTop: "0px", padding: "30px", paddingTop: '0px', borderRadius: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#2d3748", marginTop: '0px', marginBottom: "0px", display: "flex", alignItems: "center", gap: "10px" }}>
                        Fellowship
                      </h2>
                      <button
                        type="button"
                        onClick={(e) => toggleSectionVisibility('fellowship', e)}
                        style={{
                          background: sectionVisibility.fellowship ? "#ef4444" : "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {sectionVisibility.fellowship ? "Hide" : "Show"}
                      </button>
                    </div>

                    {sectionVisibility.fellowship && (
                      <>
                        {fellowshipData.fellowship_details?.length > 0 && (
                      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                        <thead>
                          <tr style={{ background: "#f1f5f9" }}>
                            <th style={{ width: "50px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                            <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Fellowship Name</th>
                            <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Financial Support (INR)</th>
                            <th style={{ width: "150px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Purpose of Grant</th>
                            <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Stature</th>
                            <th style={{ width: "150px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Awarding Agency</th>
                            <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year of Award</th>
                            <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Grant Letter</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fellowshipData.fellowship_details.map((fellowship, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{fellowship.fellowship_name}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{fellowship.financial_support}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{fellowship.purpose_of_grant}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{fellowship.stature}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{fellowship.awarding_agency}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{fellowship.year_of_award}</td>
                              <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                                {fellowship.grant_letter && fellowship.grant_letter_filename && (
                                  <a
                                    href={fellowship.grant_letter}
                                    download={fellowship.grant_letter_filename}
                                    style={{ color: "#0066cc", textDecoration: "underline" }}
                                  >
                                    {fellowship.grant_letter_filename}
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                      </>
                    )}
                  </div>
                )}

                {/* Books Section */}
                {booksData && (
                  <div style={{ marginTop: "0px", padding: "30px", paddingTop: '0px', borderRadius: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#2d3748", marginTop: '0px', marginBottom: "0px", display: "flex", alignItems: "center", gap: "10px" }}>
                        Books & Publications
                      </h2>
                      <button
                        type="button"
                        onClick={(e) => toggleSectionVisibility('books', e)}
                        style={{
                          background: sectionVisibility.books ? "#ef4444" : "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {sectionVisibility.books ? "Hide" : "Show"}
                      </button>
                    </div>

                    {sectionVisibility.books && (
                      <>
                        {/* Books Authored Table */}
                        {booksData.books?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Books Authored</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "60px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "300px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Authors</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Publisher</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                              <th style={{ width: "150px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>ISBN</th>
                            </tr>
                          </thead>
                          <tbody>
                            {booksData.books.map((book, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{book.title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{book.authors}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{book.publisher}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{book.year}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{book.isbn}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Chapters in Books Table */}
                    {booksData.chapters_in_books?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Chapters in Books</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "60px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Chapter Title</th>
                              <th style={{ width: "150px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Authors</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Book Title</th>
                              <th style={{ width: "150px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Publisher</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                              <th style={{ width: "130px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>ISBN</th>
                            </tr>
                          </thead>
                          <tbody>
                            {booksData.chapters_in_books.map((chapter, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{chapter.chapter_title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{chapter.authors}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{chapter.book_title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{chapter.publisher}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{chapter.year}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{chapter.isbn}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Edited Books Table */}
                    {booksData.edited_books?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Edited Books</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "60px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title of the Book</th>
                              <th style={{ width: "150px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Authors</th>
                              <th style={{ width: "130px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Publisher</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>ISBN No.</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title of the Chapters</th>
                            </tr>
                          </thead>
                          <tbody>
                            {booksData.edited_books.map((book, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{book.title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{book.authors}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{book.publisher}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{book.year}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{book.isbn}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{book.chapter_titles}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                )}

                {/* Research Guidance Section */}
                {researchData && (
                  <div style={{ marginTop: "0px", padding: "30px", paddingTop: '0px', borderRadius: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#2d3748", marginTop: '0px', marginBottom: "0px", display: "flex", alignItems: "center", gap: "10px" }}>
                        Research Guidance
                      </h2>
                      <button
                        type="button"
                        onClick={(e) => toggleSectionVisibility('research', e)}
                        style={{
                          background: sectionVisibility.research ? "#ef4444" : "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {sectionVisibility.research ? "Hide" : "Show"}
                      </button>
                    </div>

                    {sectionVisibility.research && (
                      <>
                        {/* PhD Students Table */}
                        {researchData.phd_students?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>PhD Students</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "60px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Student Name</th>
                              <th style={{ width: "300px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Thesis Title</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year of Completion</th>
                            </tr>
                          </thead>
                          <tbody>
                            {researchData.phd_students.map((student, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{student.student_name}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{student.thesis_title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{student.year_of_completion}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* PG Students Table */}
                    {researchData.pg_students?.length > 0 && (
                      <div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>PG Students</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "60px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Student Name</th>
                              <th style={{ width: "300px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Thesis Title</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year of Completion</th>
                            </tr>
                          </thead>
                          <tbody>
                            {researchData.pg_students.map((student, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{student.student_name}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{student.thesis_title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{student.year_of_completion}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                )}

                {/* Project Consultancy Section */}
                {projectData && (
                  <div style={{ marginTop: "0px", padding: "30px", paddingTop: '0px', borderRadius: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#2d3748", marginTop: '0px', marginBottom: "0px", display: "flex", alignItems: "center", gap: "10px" }}>
                        Project & Consultancy
                      </h2>
                      <button
                        type="button"
                        onClick={(e) => toggleSectionVisibility('projects', e)}
                        style={{
                          background: sectionVisibility.projects ? "#ef4444" : "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {sectionVisibility.projects ? "Hide" : "Show"}
                      </button>
                    </div>

                    {sectionVisibility.projects && (
                      <>
                        {/* Research Projects Funded Table */}
                        {projectData.research_projects_funded?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "15px" }}>
                          Research Projects funded by Government, Non-Government, Industry, Corporate Houses, International Bodies
                        </h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "50px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>PI/Co-PI/Chair Holder</th>
                              <th style={{ width: "250px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Project Title</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Funding Agency</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Duration</th>
                              <th style={{ width: "100px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year of Award</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Amount (INR)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectData.research_projects_funded.map((project, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.pi_name}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.project_title}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.funding_agency}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.duration}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.year_of_award}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Ongoing Projects Table */}
                    {projectData.ongoing_projects?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Ongoing Projects</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "60px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "250px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Project Title</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Sponsored By</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Period</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Amount</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectData.ongoing_projects.map((project, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.title_of_project}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.sponsored_by}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.period}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.sanctioned_amount}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.year}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Completed Projects Table */}
                    {projectData.completed_projects?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Completed Projects</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "60px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "250px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Project Title</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Sponsored By</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Period</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Amount</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectData.completed_projects.map((project, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.title_of_project}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.sponsored_by}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.period}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.sanctioned_amount}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{project.year}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Ongoing Consultancy Works Table */}
                    {projectData.ongoing_consultancy_works?.length > 0 && (
                      <div style={{ marginBottom: "30px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Ongoing Consultancy Works</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "60px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "250px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Consultancy Work Title</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Sponsored By</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Period</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Amount</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectData.ongoing_consultancy_works.map((work, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{work.title_of_consultancy_work}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{work.sponsored_by}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{work.period}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{work.sanctioned_amount}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{work.year}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Completed Consultancy Works Table */}
                    {projectData.completed_consultancy_works?.length > 0 && (
                      <div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#4a5568", marginBottom: "15px" }}>Completed Consultancy Works</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                          <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                              <th style={{ width: "60px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                              <th style={{ width: "250px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Consultancy Work Title</th>
                              <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Sponsored By</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Period</th>
                              <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Amount</th>
                              <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectData.completed_consultancy_works.map((work, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{work.title_of_consultancy_work}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{work.sponsored_by}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{work.period}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{work.sanctioned_amount}</td>
                                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>{work.year}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            <div
              style={{
                padding: "20px 30px",
                textAlign: "end",
                background: 'white',
              }}
            >
            </div>
            {viewingMode === 'viewing' ? (
              <></>
            ) : (
              <div style={{ display: "flex", justifyContent: "flex-end", marginRight: "20px" }}>
                <button
                  type="submit"
                  style={{
                    background:
                      "linear-gradient(135deg, #6093ecff 0%, #1a202c 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "15px",
                    padding: "16px 40px",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 8px 25px rgba(96, 147, 236, 0.3)",
                    minWidth: "100px",
                    marginBottom: "20px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 12px 35px rgba(96, 147, 236, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(96, 147, 236, 0.3)";
                  }}
                >
                  Save
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
