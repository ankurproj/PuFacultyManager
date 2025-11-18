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
        console.log('Faculty data received:', data);
        console.log('Publications data:', data.publications);
        console.log('All publication fields:', {
          publications: data.publications,
          seie_journals: data.seie_journals,
          ugc_approved_journals: data.ugc_approved_journals,
          non_ugc_journals: data.non_ugc_journals,
          conference_proceedings: data.conference_proceedings
        });

        // Debug: Show ALL available fields
        console.log('=== ALL AVAILABLE FIELDS IN FACULTY DATA ===');
        Object.keys(data).forEach(key => {
          if (Array.isArray(data[key]) && data[key].length > 0) {
            console.log(`${key}: ${data[key].length} items`, data[key]);
          } else if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
            console.log(`${key}:`, data[key]);
          } else if (data[key]) {
            console.log(`${key}:`, data[key]);
          }
        });
        console.log('=== END OF AVAILABLE FIELDS ===');

        setFacultyData(data);
        applyFilters(data);
      } else {
        console.error('Failed to fetch faculty data. Status:', response.status);
        // Set empty object so the component knows the fetch completed
        setFacultyData({});
      }
    } catch (error) {
      console.error('Error fetching faculty data:', error);
      // Set empty object so the component knows the fetch completed
      setFacultyData({});
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

    // Always preserve profile information regardless of filters
    // This ensures basic info like name, email, etc. are always available

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

    // Also return true if we have current user info (can show basic profile)
    if (currentUser && currentUser.name) {
      return true;
    }

    // If no faculty data, return false
    return false;
  };

  const generateFilteredData = () => {
    // If no faculty data, create basic data from current user
    if (!facultyData || Object.keys(facultyData).length === 0) {
      return {
        name: currentUser.name || 'N/A',
        email: currentUser.email || 'N/A',
        publications: [],
        patents: [],
        books: [],
        researchGuidanceStudents: [],
        projectConsultancy: [],
        conferenceSeminarWorkshop: [],
        experience: [],
        fellowship: [],
        training: [],
        mou: [],
        eEducation: [],
        participationCollaboration: [],
        programme: []
      };
    }

    const filtered = { ...facultyData };
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
    if (filters.includePublications) {
      // Combine all publication types from the database
      let allPublications = [];

      if (facultyData.publications) allPublications = allPublications.concat(facultyData.publications);
      if (facultyData.seie_journals) allPublications = allPublications.concat(facultyData.seie_journals);
      if (facultyData.ugc_approved_journals) allPublications = allPublications.concat(facultyData.ugc_approved_journals);
      if (facultyData.non_ugc_journals) allPublications = allPublications.concat(facultyData.non_ugc_journals);
      if (facultyData.conference_proceedings) allPublications = allPublications.concat(facultyData.conference_proceedings);

      console.log('All publications combined:', allPublications);
      filtered.publications = filterByYear(allPublications);
    } else {
      filtered.publications = [];
    }

    if (filters.includePatents) {
      // Combine patent data from different sources
      let allPatents = [];

      if (facultyData.patents) allPatents = allPatents.concat(facultyData.patents);
      if (facultyData.patent_details) allPatents = allPatents.concat(facultyData.patent_details);

      console.log('All patents combined:', allPatents);
      filtered.patents = filterByYear(allPatents);
    } else {
      filtered.patents = [];
    }

    if (filters.includeBooks) {
      // Combine book data from different sources
      let allBooks = [];

      if (facultyData.books) allBooks = allBooks.concat(facultyData.books);
      if (facultyData.chapters_in_books) allBooks = allBooks.concat(facultyData.chapters_in_books);
      if (facultyData.edited_books) allBooks = allBooks.concat(facultyData.edited_books);

      console.log('All books combined:', allBooks);
      filtered.books = filterByYear(allBooks);
    } else {
      filtered.books = [];
    }

    if (filters.includeResearchGuidance) {
      // Research guidance students - check multiple possible field names
      let allResearchGuidance = [];

      if (facultyData.researchGuidanceStudents) allResearchGuidance = allResearchGuidance.concat(facultyData.researchGuidanceStudents);
      if (facultyData.research_guidance) allResearchGuidance = allResearchGuidance.concat(facultyData.research_guidance);
      if (facultyData.pg_guidance) allResearchGuidance = allResearchGuidance.concat(facultyData.pg_guidance);
      if (facultyData.phd_guidance) allResearchGuidance = allResearchGuidance.concat(facultyData.phd_guidance);
      if (facultyData.postdoc_guidance) allResearchGuidance = allResearchGuidance.concat(facultyData.postdoc_guidance);

      console.log('All research guidance combined:', allResearchGuidance);
      filtered.researchGuidanceStudents = filterByYear(allResearchGuidance);
    } else {
      filtered.researchGuidanceStudents = [];
    }

    if (filters.includeProjects) {
      // Project and consultancy data - using correct backend field names
      let allProjects = [];

      if (facultyData.projectConsultancy) allProjects = allProjects.concat(facultyData.projectConsultancy);
      if (facultyData.ongoing_projects) allProjects = allProjects.concat(facultyData.ongoing_projects);
      if (facultyData.completed_projects) allProjects = allProjects.concat(facultyData.completed_projects);
      if (facultyData.ongoing_consultancy_works) allProjects = allProjects.concat(facultyData.ongoing_consultancy_works);
      if (facultyData.completed_consultancy_works) allProjects = allProjects.concat(facultyData.completed_consultancy_works);
      if (facultyData.research_projects_funded) allProjects = allProjects.concat(facultyData.research_projects_funded);

      console.log('All projects combined:', allProjects);
      filtered.projectConsultancy = filterByYear(allProjects);
    } else {
      filtered.projectConsultancy = [];
    }

    if (filters.includeConferences) {
      // Conference, seminar, workshop data - using correct backend field names
      let allConferences = [];

      if (facultyData.conferenceSeminarWorkshop) allConferences = allConferences.concat(facultyData.conferenceSeminarWorkshop);
      if (facultyData.invited_talks) allConferences = allConferences.concat(facultyData.invited_talks);
      if (facultyData.conferences_seminars_organized) allConferences = allConferences.concat(facultyData.conferences_seminars_organized);
      if (facultyData.workshops_organized) allConferences = allConferences.concat(facultyData.workshops_organized);
      if (facultyData.financial_support) allConferences = allConferences.concat(facultyData.financial_support);

      console.log('All conferences combined:', allConferences);
      filtered.conferenceSeminarWorkshop = filterByYear(allConferences);
    } else {
      filtered.conferenceSeminarWorkshop = [];
    }

    if (filters.includeExperience) {
      // Experience data from multiple sources
      let allExperience = [];

      if (facultyData.experience) allExperience = allExperience.concat(facultyData.experience);
      if (facultyData.teaching_experience) allExperience = allExperience.concat(facultyData.teaching_experience);
      if (facultyData.research_experience) allExperience = allExperience.concat(facultyData.research_experience);
      if (facultyData.industry_experience) allExperience = allExperience.concat(facultyData.industry_experience);

      console.log('All experience combined:', allExperience);
      filtered.experience = filterByYear(allExperience);
    } else {
      filtered.experience = [];
    }

    if (filters.includeFellowship) {
      // Fellowship and awards data - using correct backend field names
      let allFellowships = [];

      if (facultyData.fellowship) allFellowships = allFellowships.concat(facultyData.fellowship);
      if (facultyData.fellowship_details) allFellowships = allFellowships.concat(facultyData.fellowship_details);
      if (facultyData.fellowships) allFellowships = allFellowships.concat(facultyData.fellowships);
      if (facultyData.awards) allFellowships = allFellowships.concat(facultyData.awards);

      console.log('All fellowships combined:', allFellowships);
      filtered.fellowship = filterByYear(allFellowships);
    } else {
      filtered.fellowship = [];
    }

    if (filters.includeTraining) {
      // Training data - using correct backend field names
      let allTraining = [];

      if (facultyData.training) allTraining = allTraining.concat(facultyData.training);
      if (facultyData.revenue_consultancy_training) allTraining = allTraining.concat(facultyData.revenue_consultancy_training);
      if (facultyData.trainings) allTraining = allTraining.concat(facultyData.trainings);

      console.log('All training combined:', allTraining);
      filtered.training = filterByYear(allTraining);
    } else {
      filtered.training = [];
    }

    if (filters.includeMOU) {
      // MOU data - using correct backend field names
      let allMOUs = [];

      if (facultyData.mou) allMOUs = allMOUs.concat(facultyData.mou);
      if (facultyData.functional_mous) allMOUs = allMOUs.concat(facultyData.functional_mous);
      if (facultyData.mous) allMOUs = allMOUs.concat(facultyData.mous);

      console.log('All MOUs combined:', allMOUs);
      filtered.mou = filterByYear(allMOUs);
    } else {
      filtered.mou = [];
    }

    if (filters.includeEEducation) {
      // E-Education data - using correct backend field names
      let allEEducation = [];

      if (facultyData.eEducation) allEEducation = allEEducation.concat(facultyData.eEducation);
      if (facultyData.e_lecture_details) allEEducation = allEEducation.concat(facultyData.e_lecture_details);
      if (facultyData.online_education_conducted) allEEducation = allEEducation.concat(facultyData.online_education_conducted);

      console.log('All E-Education combined:', allEEducation);
      filtered.eEducation = filterByYear(allEEducation);
    } else {
      filtered.eEducation = [];
    }

    if (filters.includeParticipation) {
      // Participation and collaboration data - using correct backend field names
      let allParticipation = [];

      if (facultyData.participation_extension_academic) allParticipation = allParticipation.concat(facultyData.participation_extension_academic);
      if (facultyData.participation_extension_cocurricular) allParticipation = allParticipation.concat(facultyData.participation_extension_cocurricular);
      if (facultyData.collaboration_institution_industry) allParticipation = allParticipation.concat(facultyData.collaboration_institution_industry);
      if (facultyData.participationCollaboration) allParticipation = allParticipation.concat(facultyData.participationCollaboration);

      console.log('All participation combined:', allParticipation);
      filtered.participationCollaboration = filterByYear(allParticipation);
    } else {
      filtered.participationCollaboration = [];
    }

    if (filters.includeProgramme) {
      // Programme data - using correct backend field names
      let allProgrammes = [];

      if (facultyData.faculty_development_programme) allProgrammes = allProgrammes.concat(facultyData.faculty_development_programme);
      if (facultyData.executive_development_programme) allProgrammes = allProgrammes.concat(facultyData.executive_development_programme);
      if (facultyData.participation_impress_imprint) allProgrammes = allProgrammes.concat(facultyData.participation_impress_imprint);
      if (facultyData.enrolment_arpit_programme) allProgrammes = allProgrammes.concat(facultyData.enrolment_arpit_programme);
      if (facultyData.programme) allProgrammes = allProgrammes.concat(facultyData.programme);

      console.log('All programmes combined:', allProgrammes);
      filtered.programme = filterByYear(allProgrammes);
    } else {
      filtered.programme = [];
    }

    return filtered;
  };

  const exportToPDF = () => {
    console.log('=== PDF GENERATION DEBUG ===');
    console.log('Faculty Data:', facultyData);
    console.log('Current Filters:', filters);

    // Check if we have any data at all
    if (!facultyData || Object.keys(facultyData).length === 0) {
      // If no faculty data, create a basic report with user info
      if (!currentUser || !currentUser.name) {
        alert('No data available to generate report. Please make sure you are logged in and have data in your profile.');
        return;
      }

      // Generate a basic report with just user information
      const basicData = {
        name: currentUser.name,
        email: currentUser.email,
        ...facultyData // Include any faculty data that might exist
      };

      const printWindow = window.open('', '_blank');
      const htmlContent = generatePDFContent(basicData);

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();

      // No automatic print - user will click the print icon when ready
      return;
    }

    // Generate fresh filtered data for the PDF
    const currentFilteredData = generateFilteredData();
    console.log('Generated Filtered Data:', currentFilteredData);
    console.log('Publications in filtered data:', currentFilteredData.publications);

    const printWindow = window.open('', '_blank');
    const htmlContent = generatePDFContent(currentFilteredData);

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    // No automatic print - user will click the print icon when ready
  };

  const generatePDFContent = (dataToUse = filteredData) => {
    const data = dataToUse;

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

        <!-- Print Button -->
        <button class="print-button" onclick="window.print()" title="Print this report">
          <svg class="print-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd"></path>
          </svg>
          Print Report
        </button>

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

        <div class="footer">
          Faculty Profile Report | ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

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
            Report Generator
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              marginBottom: "40px",
              opacity: 0.8,
              marginTop: "0px",
            }}
          >
            Generate comprehensive reports for your academic profile
          </p>

          {/* Main Content Card */}
          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              marginBottom: "30px",
            }}
          >
            {/* Filter Options Section */}
            <div style={{ marginBottom: '30px' }}>
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "#2d3748",
                  marginBottom: "25px",
                  marginTop: "0px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "Segoe UI, Arial, sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                Filter Options
              </h2>

              {/* Year Range Filters */}
              {/* Year Range Filters */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '60px',
                marginBottom: '25px',
                marginLeft:'30px',
                marginRight:'30px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Start Year
                  </label>
                  <input
                    type="number"
                    value={filters.startYear}
                    onChange={(e) => handleFilterChange('startYear', e.target.value)}
                    placeholder="e.g., 2020"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.2s ease'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    End Year
                  </label>
                  <input
                    type="number"
                    value={filters.endYear}
                    onChange={(e) => handleFilterChange('endYear', e.target.value)}
                    placeholder="e.g., 2024"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.2s ease'
                    }}
                  />
                </div>
              </div>

              {/* Section Filters */}
              <div>
                <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '1.1rem' }}>
                  Include Sections
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '15px'
                }}>
                  {[
                    { key: 'includeProfile', label: 'Profile Information' },
                    { key: 'includePublications', label: 'Publications' },
                    { key: 'includePatents', label: 'Patents' },
                    { key: 'includeBooks', label: 'Books' },
                    { key: 'includeResearchGuidance', label: 'Research Guidance' },
                    { key: 'includeProjects', label: 'Projects & Consultancy' },
                    { key: 'includeConferences', label: 'Conferences' },
                    { key: 'includeExperience', label: 'Experience' },
                    { key: 'includeFellowship', label: 'Fellowship & Awards' },
                    { key: 'includeTraining', label: 'Training' },
                    { key: 'includeMOU', label: 'MOUs' },
                    { key: 'includeEEducation', label: 'E-Education' },
                    { key: 'includeParticipation', label: 'Participation' },
                    { key: 'includeProgramme', label: 'Programmes' }
                  ].map(item => (
                    <label key={item.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      padding: '10px',
                      borderRadius: '8px',
                      background: filters[item.key] ? '#eff6ff' : '#f9fafb',
                      border: `2px solid ${filters[item.key] ? '#3b82f6' : '#e5e7eb'}`,
                      transition: 'all 0.2s ease'
                    }}>
                      <input
                        type="checkbox"
                        checked={filters[item.key]}
                        onChange={(e) => handleFilterChange(item.key, e.target.checked)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{
                        fontWeight: filters[item.key] ? 600 : 400,
                        color: filters[item.key] ? '#1e40af' : '#374151'
                      }}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '15px',
                marginTop: '25px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                flexDirection: 'column',
                alignItems: 'center'
              }}>


                <button
                  onClick={exportToPDF}
                  disabled={loading || (!currentUser || !currentUser.name)}
                  style={{
                    background: loading || (!currentUser || !currentUser.name)
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '15px 25px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: loading || (!currentUser || !currentUser.name) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: loading || (!currentUser || !currentUser.name)
                      ? '0 4px 15px rgba(156, 163, 175, 0.3)'
                      : '0 4px 15px rgba(16, 185, 129, 0.3)',
                    opacity: loading || (!currentUser || !currentUser.name) ? 0.7 : 1
                  }}
                >
                  {loading ? 'Loading...' :
                   (!currentUser || !currentUser.name) ? 'Please Login' :
                   'Generate Report'}
                </button>

                {/* Info message when no faculty data */}
                {facultyData && Object.keys(facultyData).length === 0 && currentUser.name && (
                  <div style={{
                    background: '#fef3c7',
                    padding: '15px',
                    borderRadius: '8px',
                    marginTop: '15px',
                    textAlign: 'center',
                    border: '1px solid #f59e0b'
                  }}>
                    <p style={{
                      margin: '0',
                      color: '#92400e',
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }}>
                      📝 No detailed profile data found. You can still generate a basic report with your login information,
                      or add data to your profile first for a more comprehensive report.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Report;