const mongoose = require('mongoose');

const ProfessorSchema = new mongoose.Schema({
    // Basic Authentication Fields
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['faculty', 'hod', 'dean', 'guest_faculty'],
        default: 'faculty'
    },

    // Personal Information
    phone: { type: String, default: '' },
    profileImage: { type: String, default: '' }, // Base64 or file path

    // Faculty Information
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    employee_id: { type: String, default: '' },
    date_of_joining: { type: Date },
    experience_years: { type: Number, default: 0 },
    subjects_taught: [{ type: String }],
    research_interests: [{ type: String }],
    office_location: { type: String, default: '' },
    office_hours: { type: String, default: '' },
    area_of_expertise: [{ type: String, default: '' }],

    // Educational Qualifications
    education: [{
        degree: { type: String, default: '' },
        title: { type: String, default: '' },
        university: { type: String, default: '' },
        graduationYear: { type: String, default: '' }
    }],

    // Awards and Recognition
    awards: [{
        title: { type: String, default: '' },
        type: { type: String, default: '' },
        agency: { type: String, default: '' },
        year: { type: String, default: '' },
        amount: { type: String, default: '' }
    }],

    // Experience
    teaching_experience: [{
        designation: { type: String, default: '' },
        institution: { type: String, default: '' },
        department: { type: String, default: '' },
        from: { type: String, default: '' },
        to: { type: String, default: '' }
    }],

    research_experience: [{
        position: { type: String, default: '' },
        organization: { type: String, default: '' },
        project: { type: String, default: '' },
        from: { type: String, default: '' },
        to: { type: String, default: '' }
    }],

    industry_experience: [{
        designation: { type: String, default: '' },
        company: { type: String, default: '' },
        sector: { type: String, default: '' },
        from: { type: String, default: '' },
        to: { type: String, default: '' }
    }],

    // Research and Innovation
    contribution_to_innovation: [{
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        year: { type: String, default: '' },
        impact: { type: String, default: '' }
    }],

    patents: [{
        title: { type: String, default: '' },
        patent_number: { type: String, default: '' },
        status: { type: String, default: '' },
        year: { type: String, default: '' },
        co_inventors: { type: String, default: '' }
    }],

    publications: [{
        title: { type: String, default: '' },
        authors: { type: String, default: '' },
        journal: { type: String, default: '' },
        volume: { type: String, default: '' },
        issue: { type: String, default: '' },
        pages: { type: String, default: '' },
        year: { type: String, default: '' },
        doi: { type: String, default: '' },
        type: { type: String, default: '' }
    }],

    // New Publications Structure
    seie_journals: [{
        title: { type: String, default: '' },
        authors: { type: String, default: '' },
        journal_name: { type: String, default: '' },
        volume: { type: String, default: '' },
        issue: { type: String, default: '' },
        page_nos: { type: String, default: '' },
        year: { type: String, default: '' },
        impact_factor: { type: String, default: '' },
        paper_upload: { type: String, default: '' },
        paper_upload_filename: { type: String, default: '' },
        paper_link: { type: String, default: '' }
    }],

    ugc_approved_journals: [{
        title: { type: String, default: '' },
        authors: { type: String, default: '' },
        journal_name: { type: String, default: '' },
        volume: { type: String, default: '' },
        issue: { type: String, default: '' },
        page_nos: { type: String, default: '' },
        year: { type: String, default: '' },
        impact_factor: { type: String, default: '' },
        paper_upload: { type: String, default: '' },
        paper_upload_filename: { type: String, default: '' },
        paper_link: { type: String, default: '' }
    }],

    non_ugc_journals: [{
        title: { type: String, default: '' },
        authors: { type: String, default: '' },
        journal_name: { type: String, default: '' },
        volume: { type: String, default: '' },
        issue: { type: String, default: '' },
        page_nos: { type: String, default: '' },
        year: { type: String, default: '' },
        impact_factor: { type: String, default: '' },
        paper_upload: { type: String, default: '' },
        paper_upload_filename: { type: String, default: '' },
        paper_link: { type: String, default: '' }
    }],

    conference_proceedings: [{
        title: { type: String, default: '' },
        authors: { type: String, default: '' },
        conference_details: { type: String, default: '' },
        page_nos: { type: String, default: '' },
        year: { type: String, default: '' },
        paper_upload: { type: String, default: '' },
        paper_upload_filename: { type: String, default: '' },
        paper_link: { type: String, default: '' }
    }],

    // Consolidated Publications (New Format)
    papers_published: [{
        title: { type: String, default: '' },
        coauthors_within_org: { type: String, default: '' },
        coauthors_outside_org: { type: String, default: '' },
        journal_name: { type: String, default: '' },
        volume: { type: String, default: '' },
        issue: { type: String, default: '' },
        page_nos: { type: String, default: '' },
        year: { type: String, default: '' },
        impact_factor: { type: String, default: '' },
        paper_upload: { type: String, default: '' },
        paper_upload_filename: { type: String, default: '' },
        paper_link: { type: String, default: '' },
        paper_type: { type: String, default: 'UGC' }, // UGC, Scopus, SCIE
        conference_details: { type: String, default: '' } // For future conference papers
    }],

    // New Patents Structure
    innovation_contributions: [{
        work_name: { type: String, default: '' },
        specialization: { type: String, default: '' },
        remarks: { type: String, default: '' }
    }],

    patent_details: [{
        title: { type: String, default: '' },
        status: { type: String, default: '' },
        patent_number: { type: String, default: '' },
        date_of_award: { type: String, default: '' },
        awarding_agency: { type: String, default: '' },
        scope: { type: String, default: '' },
        commercialized_status: { type: String, default: '' }
    }],

    books: [{
        title: { type: String, default: '' },
        authors: { type: String, default: '' },
        publisher: { type: String, default: '' },
        isbn: { type: String, default: '' },
        year: { type: String, default: '' }
    }],

    chapters_in_books: [{
        chapter_title: { type: String, default: '' },
        authors: { type: String, default: '' },
        book_title: { type: String, default: '' },
        publisher: { type: String, default: '' },
        year: { type: String, default: '' },
        isbn: { type: String, default: '' }
    }],

    edited_books: [{
        title: { type: String, default: '' },
        authors: { type: String, default: '' },
        publisher: { type: String, default: '' },
        year: { type: String, default: '' },
        isbn: { type: String, default: '' },
        chapter_titles: { type: String, default: '' }
    }],

    // Fellowship Details
    fellowship_details: [{
        fellowship_name: { type: String, default: '' },
        financial_support: { type: String, default: '' },
        purpose_of_grant: { type: String, default: '' },
        stature: { type: String, default: '' },
        awarding_agency: { type: String, default: '' },
        year_of_award: { type: String, default: '' },
        grant_letter: { type: String, default: '' },
        grant_letter_filename: { type: String, default: '' }
    }],

    // Projects and Students
    projects: [{
        title: { type: String, default: '' },
        funding_agency: { type: String, default: '' },
        amount: { type: String, default: '' },
        duration: { type: String, default: '' },
        role: { type: String, default: '' },
        status: { type: String, default: '' }
    }],

    consultancy_works: [{
        title: { type: String, default: '' },
        organization: { type: String, default: '' },
        amount: { type: String, default: '' },
        duration: { type: String, default: '' },
        status: { type: String, default: '' }
    }],

    // Research Guidance - New Structure
    pg_guidance: [{
        year: { type: String, default: '' },
        degree: { type: String, default: '' },
        students_awarded: { type: String, default: '' },
        student_names: { type: String, default: '' },
        student_roll_no: { type: String, default: '' },
        department_centre: { type: String, default: '' }
    }],

    phd_guidance: [{
        student_name: { type: String, default: '' },
        registration_date: { type: String, default: '' },
        registration_no: { type: String, default: '' },
        thesis_title: { type: String, default: '' },
        thesis_submitted_status: { type: String, default: '' },
        thesis_submitted_date: { type: String, default: '' },
        vivavoce_completed_status: { type: String, default: '' },
        date_awarded: { type: String, default: '' }
    }],

    postdoc_guidance: [{
        scholar_name: { type: String, default: '' },
        designation: { type: String, default: '' },
        funding_agency: { type: String, default: '' },
        fellowship_title: { type: String, default: '' },
        year_of_joining: { type: String, default: '' },
        year_of_completion: { type: String, default: '' }
    }],

    // Legacy fields (keeping for backward compatibility)
    pg_student_guided: [{
        student_name: { type: String, default: '' },
        thesis_title: { type: String, default: '' },
        year_of_completion: { type: String, default: '' },
        current_status: { type: String, default: '' }
    }],

    phd_student_guided: [{
        student_name: { type: String, default: '' },
        thesis_title: { type: String, default: '' },
        thesis_status: { type: String, default: '' },
        thesis_submission_date: { type: String, default: '' },
        viva_date: { type: String, default: '' },
        year_of_award: { type: String, default: '' }
    }],

    postdoc_student_guided: [{
        student_name: { type: String, default: '' },
        designation: { type: String, default: '' },
        funding_agency: { type: String, default: '' },
        fellowship_title: { type: String, default: '' },
        joining_date: { type: String, default: '' },
        completion_date: { type: String, default: '' }
    }],

    // Project & Consultancy
    ongoing_projects: [{
        title_of_project: { type: String, default: '' },
        sponsored_by: { type: String, default: '' },
        period: { type: String, default: '' },
        sanctioned_amount: { type: String, default: '' },
        year: { type: String, default: '' }
    }],

    ongoing_consultancy_works: [{
        title_of_consultancy_work: { type: String, default: '' },
        sponsored_by: { type: String, default: '' },
        period: { type: String, default: '' },
        sanctioned_amount: { type: String, default: '' },
        year: { type: String, default: '' }
    }],

    completed_projects: [{
        title_of_project: { type: String, default: '' },
        sponsored_by: { type: String, default: '' },
        period: { type: String, default: '' },
        sanctioned_amount: { type: String, default: '' },
        year: { type: String, default: '' }
    }],

    completed_consultancy_works: [{
        title_of_consultancy_work: { type: String, default: '' },
        sponsored_by: { type: String, default: '' },
        period: { type: String, default: '' },
        sanctioned_amount: { type: String, default: '' },
        year: { type: String, default: '' }
    }],

    research_projects_funded: [{
        pi_name: { type: String, default: '' },
        project_title: { type: String, default: '' },
        funding_agency: { type: String, default: '' },
        duration: { type: String, default: '' },
        year_of_award: { type: String, default: '' },
        amount: { type: String, default: '' }
    }],

    // E-Education
    e_lecture_details: [{
        e_lecture_title: { type: String, default: '' },
        content_module_title: { type: String, default: '' },
        institution_platform: { type: String, default: '' },
        year: { type: String, default: '' },
        weblink: { type: String, default: '' },
        member_of_editorial_bodies: { type: String, default: '' },
        reviewer_referee_of: { type: String, default: '' }
    }],

    online_education_conducted: [{
        nature_of_online_course: { type: String, default: '' },
        no_of_sessions: { type: String, default: '' },
        target_group: { type: String, default: '' },
        date: { type: String, default: '' }
    }],

    // Conference/Seminar/Workshop
    invited_talks: [{
        title_of_paper: { type: String, default: '' },
        conferences_seminar_workshop_training: { type: String, default: '' },
        organized_by: { type: String, default: '' },
        level: { type: String, default: '' },
        from_date: { type: String, default: '' },
        to_date: { type: String, default: '' },
        year: { type: String, default: '' }
    }],

    conferences_seminars_workshops_organized: [{
        title_of_programme: { type: String, default: '' },
        type: { type: String, default: '' }, // Conference, Seminar, or Workshop
        sponsors: { type: String, default: '' },
        venue_duration: { type: String, default: '' },
        level: { type: String, default: '' },
        from_date: { type: String, default: '' },
        to_date: { type: String, default: '' },
        year: { type: String, default: '' }
    }],

    conferences_seminars_workshops_participated: [{
        title_of_programme: { type: String, default: '' },
        type: { type: String, default: '' }, // Conference, Seminar, or Workshop
        organized_by: { type: String, default: '' },
        venue_duration: { type: String, default: '' },
        level: { type: String, default: '' },
        from_date: { type: String, default: '' },
        to_date: { type: String, default: '' },
        year: { type: String, default: '' }
    }],

    // Financial Support for Conferences/Workshops
    financial_support: [{
        title_conference_workshop: { type: String, default: '' },
        amount_provided: { type: String, default: '' },
        purpose: { type: String, default: '' },
        from_date: { type: String, default: '' },
        to_date: { type: String, default: '' }
    }],

    // Participation & Collaboration
    participation_extension_academic: [{
        position_name: { type: String, default: '' },
        duration: { type: String, default: '' },
        nature_of_duties: { type: String, default: '' }
    }],

    participation_extension_cocurricular: [{
        position_name: { type: String, default: '' },
        duration: { type: String, default: '' },
        nature_of_duties: { type: String, default: '' }
    }],

    collaboration_institution_industry: [{
        collaborator_name: { type: String, default: '' },
        designation: { type: String, default: '' },
        institution_industry: { type: String, default: '' },
        type: { type: String, default: '' },
        nature_of_collaboration: { type: String, default: '' },
        period_from: { type: String, default: '' },
        period_to: { type: String, default: '' },
        visits_from: { type: String, default: '' },
        visits_to: { type: String, default: '' },
        details_collaborative_research: { type: String, default: '' }
    }],

    // Programme Details
    faculty_development_programme: [{
        title_fdp: { type: String, default: '' },
        organiser: { type: String, default: '' },
        venue: { type: String, default: '' },
        duration: { type: String, default: '' },
        from_date: { type: String, default: '' },
        to_date: { type: String, default: '' },
        year: { type: String, default: '' }
    }],

    executive_development_programme: [{
        name_programme: { type: String, default: '' },
        no_participants: { type: String, default: '' },
        venue: { type: String, default: '' },
        duration: { type: String, default: '' },
        from_date: { type: String, default: '' },
        to_date: { type: String, default: '' },
        year: { type: String, default: '' },
        revenue_generated: { type: String, default: '' }
    }],

    participation_impress_imprint: [{
        programme_type: { type: String, default: '' },
        place: { type: String, default: '' },
        from_date: { type: String, default: '' },
        to_date: { type: String, default: '' },
        year: { type: String, default: '' }
    }],

    enrolment_arpit_programme: [{
        name_programme: { type: String, default: '' },
        period_from: { type: String, default: '' },
        period_to: { type: String, default: '' }
    }],

    // Administrative Responsibilities

    administrative_responsibilities: [{
        position: { type: String, default: '' },
        organization: { type: String, default: '' },
        duration: { type: String, default: '' },
        nature_of_duty: { type: String, default: '' }
    }],

    affliations: [{
        position: { type: String, default: '' },
        organization: { type: String, default: '' },
        duration: { type: String, default: '' },
        nature: { type: String, default: '' }
    }],

    // Training and Consultancy Revenue
    revenue_consultancy_training: [{
        organization: { type: String, default: '' },
        from_date: { type: String, default: '' },
        to_date: { type: String, default: '' },
        amount_generated: { type: String, default: '' }
    }],

    // Functional MOUs with Institutions/Industries
    functional_mous: [{
        organization_name: { type: String, default: '' },
        duration: { type: String, default: '' },
        purpose: { type: String, default: '' },
        activities: { type: String, default: '' },
        date: { type: String, default: '' }
    }],

    // Access Requests for Publications
    access_requests: [{
        requester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
        requester_name: { type: String, default: '' },
        requester_email: { type: String, default: '' },
        requester_role: { type: String, default: '' },
        publication_type: { type: String, default: '' }, // 'seie_journals', 'ugc_approved_journals', etc.
        publication_index: { type: Number, default: 0 },
        publication_title: { type: String, default: '' },
        request_date: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        message: { type: String, default: '' },
        response_date: { type: Date },
        response_message: { type: String, default: '' }
    }],

    // Outgoing access requests (requests this user has made)
    outgoing_access_requests: [{
        target_faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
        target_faculty_name: { type: String, default: '' },
        target_faculty_email: { type: String, default: '' },
        publication_type: { type: String, default: '' },
        publication_index: { type: Number, default: 0 },
        publication_title: { type: String, default: '' },
        request_date: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        message: { type: String, default: '' },
        response_date: { type: Date },
        response_message: { type: String, default: '' }
    }],

    // Web Scraping Metadata
    school: { type: String, default: '' }, // School/Faculty name
    node_id: { type: String, default: '' }, // University website node ID
    source_url: { type: String, default: '' }, // Original profile URL
    scraped_date: { type: Date }, // When data was scraped
    data_source: { type: String, enum: ['manual', 'web_scraping'], default: 'manual' }
}, { timestamps: true });

module.exports = mongoose.model('Professor', ProfessorSchema, 'Professors');