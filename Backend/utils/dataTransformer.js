/**
 * Data Transformation Utility for Faculty Data
 * Converts web-scraped data format to manual entry database schema format
 */

class DataTransformer {
  /**
   * Transform scraped faculty data to database-compatible format
   * @param {Object} scrapedData - Raw scraped data from facultyDataScraper
   * @returns {Object} - Transformed data compatible with Professor schema
   */
  static transformScrapedDataForDB(scrapedData) {
    console.log('Transforming scraped data for database storage...');

    const transformed = {
      // Basic Information (Direct Mapping)
      name: scrapedData.name || '',
      email: scrapedData.email || '',
      department: scrapedData.department || '',
      designation: scrapedData.designation || '',
      school: scrapedData.school || '',
      profileImage: scrapedData.profileImage || '',

      // Metadata
      node_id: scrapedData.node_id || '',
      source_url: scrapedData.source_url || '',
      scraped_date: scrapedData.scraped_date || new Date(),
      data_source: 'web_scraping',

      // Home Section
      education: this.transformEducation(scrapedData.home?.education || []),
      awards: this.transformAwards(scrapedData.home?.awards || []),
      research_interests: scrapedData.home?.researchInterests || [],
      area_of_expertise: this.flattenSpecialization(scrapedData.home?.specialization || []),

      // Experience Section
      teaching_experience: this.transformTeachingExperience(scrapedData.experience?.teaching || []),
      research_experience: this.transformResearchExperience(scrapedData.experience?.research || []),
      industry_experience: this.transformIndustryExperience(scrapedData.experience?.industry || []),

      // Innovation & Patents
      innovation_contributions: this.transformInnovationContributions(scrapedData.innovation?.contributions || []),
      patent_details: this.transformPatents(scrapedData.innovation?.patents || []),

      // Publications - Legacy format for backward compatibility
      ugc_approved_journals: this.transformUGCPapers(scrapedData.innovation?.ugc_papers || []),
      non_ugc_journals: this.transformNonUGCPapers(scrapedData.innovation?.non_ugc_papers || []),
      conference_proceedings: this.transformConferencePapers(scrapedData.innovation?.conference_papers || []),

      // Publications - New consolidated format
      papers_published: [
        ...this.transformUGCPapersToNewFormat(scrapedData.innovation?.ugc_papers || []),
        ...this.transformNonUGCPapersToNewFormat(scrapedData.innovation?.non_ugc_papers || [])
      ],

      // Books
      books: this.transformAuthoredBooks(scrapedData.books?.authored_books || []),
      chapters_in_books: this.transformBookChapters(scrapedData.books?.book_chapters || []),
      edited_books: this.transformEditedBooks(scrapedData.books?.edited_books || []),

      // Projects & Consultancy
      ongoing_projects: this.transformOngoingProjects(scrapedData.projects?.ongoing_projects || []),
      ongoing_consultancy_works: this.transformOngoingConsultancy(scrapedData.projects?.ongoing_consultancy || []),
      completed_projects: this.transformCompletedProjects(scrapedData.projects?.completed_projects || []),
      completed_consultancy_works: this.transformCompletedConsultancy(scrapedData.projects?.completed_consultancy || []),

      // Research Guidance
      pg_guidance: this.transformPGGuidance(scrapedData.research_guidance?.pg_guidance || []),
      phd_guidance: this.transformPhDGuidance(scrapedData.research_guidance?.phd_guidance || []),
      postdoc_guidance: this.transformPostDocGuidance(scrapedData.research_guidance?.postdoc_guidance || []),

      // Conferences & Seminars
      e_lecture_details: this.transformELectures(scrapedData.conferences_seminars?.e_lectures || []),
      online_education_conducted: this.transformOnlineEducation(scrapedData.conferences_seminars?.online_education || []),
      invited_talks: this.transformInvitedTalks(scrapedData.conferences_seminars?.invited_talks || []),
      conferences_seminars_workshops_organized: [
        ...this.transformOrganizedConferences(scrapedData.conferences_seminars?.organized_conferences || []),
        ...this.transformOrganizedWorkshops(scrapedData.conferences_seminars?.organized_workshops || [])
      ],
      conferences_seminars_workshops_participated: [], // Empty for now - should contain actual participated data if available

      // Collaboration & Administration
      participation_extension_academic: this.transformAcademicAdmin(scrapedData.collaboration?.academic_administration || []),
      participation_extension_cocurricular: this.transformCoCurricular(scrapedData.collaboration?.co_curricular || []),
      collaboration_institution_industry: this.transformInstitutionalCollaboration(scrapedData.collaboration?.institutional_collaboration || []),

      // Programme Details
      faculty_development_programme: this.transformFacultyDevelopment(scrapedData.programmes?.faculty_development || []),
      executive_development_programme: this.transformExecutiveDevelopment(scrapedData.programmes?.executive_development || []),
      participation_impress_imprint: this.transformSpecialProgrammes(scrapedData.programmes?.special_programmes || []),
      enrolment_arpit_programme: this.transformArpitProgrammes(scrapedData.programmes?.arpit_programmes || [])
    };

    console.log('Data transformation completed successfully');
    return transformed;
  }

  // === TRANSFORMATION HELPER METHODS ===

  /**
   * Transform education data (Direct mapping)
   */
  static transformEducation(educationArray) {
    return educationArray.map(edu => ({
      degree: edu.degree || '',
      title: edu.title || '',
      university: edu.university || '',
      graduationYear: edu.graduationYear || ''
    }));
  }

  /**
   * Transform awards data (Direct mapping)
   */
  static transformAwards(awardsArray) {
    return awardsArray.map(award => ({
      title: award.title || '',
      type: award.type || '',
      agency: award.agency || '',
      year: award.year || '',
      amount: award.amount || ''
    }));
  }

  /**
   * Transform teaching experience with date parsing
   */
  static transformTeachingExperience(experienceArray) {
    return experienceArray.map(exp => {
      const dateRange = this.parseDateRange(exp.duration || '');
      return {
        designation: exp.designation || '',
        institution: exp.institution || '',
        department: exp.department || '',
        from: dateRange.from,
        to: dateRange.to
      };
    });
  }

  /**
   * Transform research experience with field mapping
   */
  static transformResearchExperience(experienceArray) {
    return experienceArray.map(exp => {
      const dateRange = this.parseDateRange(exp.duration || '');
      return {
        position: exp.designation || '',        // designation -> position
        organization: exp.institution || '',    // institution -> organization
        project: exp.areaOfResearch || '',      // areaOfResearch -> project
        from: dateRange.from,
        to: dateRange.to
      };
    });
  }

  /**
   * Transform industry experience with missing field handling
   */
  static transformIndustryExperience(experienceArray) {
    return experienceArray.map(exp => ({
      designation: exp.designation || '',
      company: exp.company || exp.institution || '',
      sector: exp.natureOfWork || '',         // Map natureOfWork to sector
      from: '',                               // Not available in scraped data
      to: ''                                  // Not available in scraped data
    }));
  }

  /**
   * Transform innovation contributions with field name conversion
   */
  static transformInnovationContributions(contributionsArray) {
    return contributionsArray.map(contrib => ({
      work_name: contrib.workName || '',
      specialization: contrib.specialization || '',
      remarks: contrib.remarks || ''
    }));
  }

  /**
   * Transform patents with field mapping and missing fields
   */
  static transformPatents(patentsArray) {
    return patentsArray.map(patent => ({
      title: patent.title || '',
      status: patent.status || '',
      patent_number: patent.patentNumber || '',
      date_of_award: patent.yearOfAward || '',
      awarding_agency: '',                    // Not available in scraped data
      scope: patent.type || '',               // type -> scope
      commercialized_status: patent.commercializedStatus || ''
    }));
  }

  /**
   * Transform UGC papers with volume/issue parsing
   */
  static transformUGCPapers(papersArray) {
    return papersArray.map(paper => {
      const volumeData = this.parseVolumeIssuePages(paper.volumeIssuePages || '');
      return {
        title: paper.title || '',
        authors: paper.authors || '',
        journal_name: paper.journalName || '',
        volume: volumeData.volume,
        issue: volumeData.issue,
        page_nos: volumeData.pages,
        year: paper.year || '',
        impact_factor: paper.impactFactor || '',
        paper_upload: '',                     // Not available in scraped data
        paper_upload_filename: '',
        paper_link: ''
      };
    });
  }

  /**
   * Transform Non-UGC papers (same structure as UGC)
   */
  static transformNonUGCPapers(papersArray) {
    return this.transformUGCPapers(papersArray); // Same transformation logic
  }

  /**
   * Transform UGC papers to new consolidated format with proper fields for frontend
   */
  static transformUGCPapersToNewFormat(papersArray) {
    return papersArray.map(paper => {
      const volumeData = this.parseVolumeIssuePages(paper.volumeIssuePages || '');
      return {
        title: paper.title || '',
        coauthors_within_org: '',              // Blank for scraped data as requested
        coauthors_outside_org: '',             // Blank for scraped data as requested
        journal_name: paper.journalName || '',
        volume: volumeData.volume,
        issue: volumeData.issue,
        page_nos: volumeData.pages,
        year: paper.year || '',
        impact_factor: paper.impactFactor || '',
        paper_upload: '',                      // Not available in scraped data
        paper_upload_filename: '',
        paper_link: '',                        // Blank as requested
        paper_type: 'UGC',                     // Mark as UGC type as requested
        conference_details: ''                 // For future use
      };
    });
  }

  /**
   * Transform Non-UGC papers to new consolidated format with proper fields for frontend
   */
  static transformNonUGCPapersToNewFormat(papersArray) {
    return papersArray.map(paper => {
      const volumeData = this.parseVolumeIssuePages(paper.volumeIssuePages || '');
      return {
        title: paper.title || '',
        coauthors_within_org: '',              // Blank for scraped data as requested
        coauthors_outside_org: '',             // Blank for scraped data as requested
        journal_name: paper.journalName || '',
        volume: volumeData.volume,
        issue: volumeData.issue,
        page_nos: volumeData.pages,
        year: paper.year || '',
        impact_factor: paper.impactFactor || '',
        paper_upload: '',                      // Not available in scraped data
        paper_upload_filename: '',
        paper_link: '',                        // Blank as requested
        paper_type: 'Scopus',                  // Mark as Scopus type as requested
        conference_details: ''                 // For future use
      };
    });
  }

  /**
   * Transform conference papers
   */
  static transformConferencePapers(papersArray) {
    return papersArray.map(paper => ({
      title: paper.title || '',
      authors: paper.authors || '',
      conference_details: paper.conferenceDetails || '',
      page_nos: paper.pageNos || '',
      year: paper.year || '',
      paper_upload: '',                       // Not available in scraped data
      paper_upload_filename: '',
      paper_link: ''
    }));
  }

  /**
   * Transform authored books (direct mapping)
   */
  static transformAuthoredBooks(booksArray) {
    return booksArray.map(book => ({
      title: book.title || '',
      authors: book.authors || '',
      publisher: book.publisher || '',
      isbn: book.isbn || '',
      year: book.year || ''
    }));
  }

  /**
   * Transform book chapters with field name conversion
   */
  static transformBookChapters(chaptersArray) {
    return chaptersArray.map(chapter => ({
      chapter_title: chapter.chapterTitle || '',
      authors: chapter.authors || '',
      book_title: chapter.bookTitle || '',
      publisher: chapter.publisher || '',
      year: chapter.year || '',
      isbn: chapter.isbn || ''
    }));
  }

  /**
   * Transform edited books
   */
  static transformEditedBooks(booksArray) {
    return booksArray.map(book => ({
      title: book.title || '',
      authors: book.authors || '',
      publisher: book.publisher || '',
      year: book.year || '',
      isbn: book.isbn || '',
      chapter_titles: ''                      // Not available in scraped data
    }));
  }

  /**
   * Transform ongoing projects with field name conversion
   */
  static transformOngoingProjects(projectsArray) {
    return projectsArray.map(project => ({
      title_of_project: project.title || '',
      sponsored_by: project.sponsoredBy || '',
      period: project.period || '',
      sanctioned_amount: project.sanctionedAmount || '',
      year: project.year || ''
    }));
  }

  /**
   * Transform ongoing consultancy (same structure as projects)
   */
  static transformOngoingConsultancy(consultancyArray) {
    return consultancyArray.map(consultancy => ({
      title_of_consultancy_work: consultancy.title || '',
      sponsored_by: consultancy.sponsoredBy || '',
      period: consultancy.period || '',
      sanctioned_amount: consultancy.sanctionedAmount || '',
      year: consultancy.year || ''
    }));
  }

  /**
   * Transform completed projects (same as ongoing)
   */
  static transformCompletedProjects(projectsArray) {
    return this.transformOngoingProjects(projectsArray);
  }

  /**
   * Transform completed consultancy (same as ongoing)
   */
  static transformCompletedConsultancy(consultancyArray) {
    return this.transformOngoingConsultancy(consultancyArray);
  }

  /**
   * Transform PG guidance
   */
  static transformPGGuidance(guidanceArray) {
    return guidanceArray.map(guidance => ({
      year: guidance.year || '',
      degree: guidance.degree || '',
      students_awarded: guidance.studentsAwarded || '',
      student_names: guidance.studentNames || '',
      student_roll_no: guidance.studentRollNo || '',
      department_centre: guidance.departmentCentre || ''
    }));
  }

  /**
   * Transform PhD guidance with status expansion
   */
  static transformPhDGuidance(guidanceArray) {
    return guidanceArray.map(guidance => {
      const isCompleted = guidance.status === 'YES';
      return {
        student_name: guidance.studentName || '',
        registration_date: guidance.registrationDate || '',
        registration_no: guidance.registrationNo || '',
        thesis_title: guidance.thesisTitle || '',
        thesis_submitted_status: isCompleted ? 'YES' : 'NO',
        thesis_submitted_date: isCompleted ? guidance.registrationDate : '',
        vivavoce_completed_status: isCompleted ? 'YES' : 'NO',
        date_awarded: isCompleted ? guidance.registrationDate : ''
      };
    });
  }

  /**
   * Transform PostDoc guidance
   */
  static transformPostDocGuidance(guidanceArray) {
    return guidanceArray.map(guidance => ({
      scholar_name: guidance.scholarName || '',
      designation: guidance.designation || '',
      funding_agency: guidance.fundingAgency || '',
      fellowship_title: guidance.fellowshipTitle || '',
      year_of_joining: guidance.yearOfJoining || '',
      year_of_completion: guidance.yearOfCompletion || ''
    }));
  }

  // === PLACEHOLDER METHODS FOR OTHER SECTIONS ===
  // These would need to be implemented based on actual scraped data structure

  static transformELectures(lecturesArray) {
    return lecturesArray.map(lecture => ({
      e_lecture_title: lecture.title || '',
      content_module_title: lecture.moduleTitle || '',
      institution_platform: lecture.platform || '',
      year: lecture.year || '',
      weblink: lecture.weblink || '',
      member_of_editorial_bodies: '',
      reviewer_referee_of: ''
    }));
  }

  static transformOnlineEducation(educationArray) {
    return educationArray.map(education => ({
      nature_of_online_course: education.courseNature || '',
      no_of_sessions: education.sessions || '',
      target_group: education.targetGroup || '',
      date: education.date || ''
    }));
  }

  static transformInvitedTalks(talksArray) {
    return talksArray.map(talk => ({
      title_of_paper: talk.title_of_paper || talk.paperTitle || '',
      conferences_seminar_workshop_training: talk.conference_seminar_workshop || talk.eventType || '',
      organized_by: talk.organized_by || talk.organizer || '',
      level: talk.level || '',
      from_date: talk.from_date || talk.fromDate || '',
      to_date: talk.to_date || talk.toDate || '',
      year: talk.year || ''
    }));
  }

  static transformOrganizedConferences(conferencesArray) {
    return conferencesArray.map(conference => ({
      title_of_programme: conference.title_of_programme || conference.title || '',
      type: conference.type || 'Conference',
      sponsors: conference.sponsors || '',
      venue_duration: conference.venue_duration || conference.venue || '',
      level: conference.level || '',
      from_date: conference.fromDate || '',
      to_date: conference.toDate || '',
      year: conference.year || ''
    }));
  }

  static transformOrganizedWorkshops(workshopsArray) {
    return workshopsArray.map(workshop => ({
      title_of_programme: workshop.title_of_programme || workshop.title || '',
      type: workshop.type || 'Workshop',
      sponsors: workshop.sponsors || '',
      venue_duration: workshop.venue_duration || workshop.venue || '',
      level: workshop.level || '',
      from_date: workshop.from_date || workshop.fromDate || '',
      to_date: workshop.to_date || workshop.toDate || '',
      year: workshop.year || ''
    }));
  }

  static transformAcademicAdmin(adminArray) {
    return adminArray.map(admin => ({
      position_name: admin.position || '',
      duration: admin.duration || '',
      nature_of_duties: admin.duties || ''
    }));
  }

  static transformCoCurricular(coArray) {
    return coArray.map(co => ({
      position_name: co.position || '',
      duration: co.duration || '',
      nature_of_duties: co.duties || ''
    }));
  }

  static transformInstitutionalCollaboration(collabArray) {
    return collabArray.map(collab => ({
      collaborator_name: collab.collaboratorName || '',
      designation: collab.designation || '',
      institution_industry: collab.institution || '',
      type: collab.type || '',
      nature_of_collaboration: collab.nature || '',
      period_from: collab.periodFrom || '',
      period_to: collab.periodTo || '',
      visits_from: collab.visitsFrom || '',
      visits_to: collab.visitsTo || '',
      details_collaborative_research: collab.researchDetails || ''
    }));
  }

  static transformFacultyDevelopment(fdpArray) {
    return fdpArray.map(fdp => ({
      title_fdp: fdp.title || '',
      organiser: fdp.organizer || '',
      venue: fdp.venue || '',
      duration: fdp.duration || '',
      from_date: fdp.fromDate || '',
      to_date: fdp.toDate || '',
      year: fdp.year || ''
    }));
  }

  static transformExecutiveDevelopment(edpArray) {
    return edpArray.map(edp => ({
      name_programme: edp.programmeName || '',
      no_participants: edp.participants || '',
      venue: edp.venue || '',
      duration: edp.duration || '',
      from_date: edp.fromDate || '',
      to_date: edp.toDate || '',
      year: edp.year || '',
      revenue_generated: edp.revenue || ''
    }));
  }

  static transformSpecialProgrammes(specialArray) {
    return specialArray.map(special => ({
      programme_type: special.programmeType || '',
      place: special.place || '',
      from_date: special.fromDate || '',
      to_date: special.toDate || '',
      year: special.year || ''
    }));
  }

  static transformArpitProgrammes(arpitArray) {
    return arpitArray.map(arpit => ({
      name_programme: arpit.programmeName || '',
      period_from: arpit.periodFrom || '',
      period_to: arpit.periodTo || ''
    }));
  }

  // === UTILITY HELPER METHODS ===

  /**
   * Parse date range string like "2020-2023" into from and to dates
   */
  static parseDateRange(duration) {
    if (!duration) return { from: '', to: '' };

    // Handle various date formats
    const patterns = [
      /(\d{4})\s*-\s*(\d{4})/,           // "2020-2023"
      /(\d{4})\s*to\s*(\d{4})/i,         // "2020 to 2023"
      /(\d{4})\s*–\s*(\d{4})/,           // "2020–2023" (em dash)
      /from\s*(\d{4})\s*to\s*(\d{4})/i   // "from 2020 to 2023"
    ];

    for (const pattern of patterns) {
      const match = duration.match(pattern);
      if (match) {
        return {
          from: match[1],
          to: match[2]
        };
      }
    }

    // If no pattern matches, check for single year
    const singleYear = duration.match(/(\d{4})/);
    if (singleYear) {
      return {
        from: singleYear[1],
        to: singleYear[1]
      };
    }

    return { from: '', to: '' };
  }

  /**
   * Parse volume/issue/pages string like "Vol 1, Issue 2, pp 1-10"
   */
  static parseVolumeIssuePages(volumeIssuePages) {
    if (!volumeIssuePages) return { volume: '', issue: '', pages: '' };

    const result = { volume: '', issue: '', pages: '' };

    // Extract volume
    const volumeMatch = volumeIssuePages.match(/vol(?:ume)?\s*\.?\s*(\d+)/i);
    if (volumeMatch) result.volume = volumeMatch[1];

    // Extract issue
    const issueMatch = volumeIssuePages.match(/issue\s*\.?\s*(\d+)/i);
    if (issueMatch) result.issue = issueMatch[1];

    // Extract pages (handle both "pp 123-145", "p 123", and "Pages 123-145" formats)
    const pagesMatch = volumeIssuePages.match(/(?:pp?|pages?)\s*\.?\s*(\d+[-–]\d+|\d+)/i);
    if (pagesMatch) result.pages = pagesMatch[1];

    // If no specific patterns found, try to extract numbers in sequence
    if (!result.volume && !result.issue && !result.pages) {
      const numbers = volumeIssuePages.match(/\d+/g);
      if (numbers && numbers.length >= 1) result.volume = numbers[0];
      if (numbers && numbers.length >= 2) result.issue = numbers[1];
      if (numbers && numbers.length >= 3) result.pages = numbers.slice(2).join('-');
    }

    return result;
  }

  /**
   * Validate transformed data completeness
   */
  static validateTransformation(originalData, transformedData) {
    const validation = {
      success: true,
      warnings: [],
      errors: [],
      summary: {}
    };

    // Count original vs transformed items
    const sections = [
      'education', 'awards', 'teaching_experience', 'research_experience',
      'innovation_contributions', 'patent_details', 'ugc_approved_journals',
      'books', 'chapters_in_books', 'ongoing_projects'
    ];

    sections.forEach(section => {
      const originalPath = this.getOriginalPath(section);
      const originalCount = this.getNestedValue(originalData, originalPath)?.length || 0;
      const transformedCount = transformedData[section]?.length || 0;

      validation.summary[section] = {
        original: originalCount,
        transformed: transformedCount,
        match: originalCount === transformedCount
      };

      if (originalCount !== transformedCount) {
        validation.warnings.push(`${section}: Original had ${originalCount} items, transformed has ${transformedCount}`);
      }
    });

    return validation;
  }

  /**
   * Get original nested path for validation
   */
  static getOriginalPath(section) {
    const pathMap = {
      'education': 'home.education',
      'awards': 'home.awards',
      'teaching_experience': 'experience.teaching',
      'research_experience': 'experience.research',
      'innovation_contributions': 'innovation.contributions',
      'patent_details': 'innovation.patents',
      'ugc_approved_journals': 'innovation.ugc_papers',
      'books': 'books.authored_books',
      'chapters_in_books': 'books.book_chapters',
      'ongoing_projects': 'projects.ongoing_projects'
    };
    return pathMap[section] || section;
  }

  /**
   * Get nested object value by path
   */
  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Flatten specialization array to ensure it's a flat array of strings
   */
  static flattenSpecialization(specialization) {
    if (!specialization) return [];

    // If it's already an array, flatten any nested arrays
    if (Array.isArray(specialization)) {
      return specialization.flat(2).filter(item =>
        typeof item === 'string' && item.trim().length > 0
      );
    }

    // If it's a string, return as array
    if (typeof specialization === 'string') {
      return [specialization.trim()].filter(item => item.length > 0);
    }

    return [];
  }
}

module.exports = DataTransformer;