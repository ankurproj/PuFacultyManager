const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Professor = require('./Professor');
const scraperRoutes = require('./routes/scraperRoutes');
const scraperIntegrationRoutes = require('./routes/scraperIntegrationRoutes');
require('dotenv').config();
const { TOKEN } = process.env;
const { MONGO_URI } = process.env;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://professorpublication-production.up.railway.app',
        /\.netlify\.app$/,
        /\.vercel\.app$/
    ],
    credentials: true
}));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// MongoDB connection
// mongoose.connect(MONGO_URI).then(() => console.log('MongoDB connected'))
// .catch(err => console.log(err));
// in Backend/index.js, replace the direct connect with this:
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
      console.error('MongoDB connection error (non-fatal for scraper):', err.message);
    });
} else {
  console.warn('MONGO_URI not set; skipping MongoDB connection');
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token is required'
        });
    }

    jwt.verify(token, TOKEN, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

// Sample route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Public Faculty Data Scraper route (no authentication required)
app.post('/api/scraper/faculty', async (req, res) => {
    try {
        const { nodeId } = req.body;

        if (!nodeId) {
            return res.status(400).json({
                success: false,
                message: 'Node ID is required'
            });
        }

        // Try to load the faculty data scraper
        let scraper = null;
        try {
            const FacultyDataScraper = require('./scrapers/facultyDataScraper');
            scraper = new FacultyDataScraper();
        } catch (error) {
            console.error('Error loading FacultyDataScraper:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Faculty data scraper not available',
                error: error.message
            });
        }

        // Scrape faculty data
        const scrapedData = await scraper.scrapeFacultyData(nodeId);

        if (!scrapedData.name) {
            return res.status(404).json({
                success: false,
                message: 'No faculty data found for the provided Node ID'
            });
        }

        // Return the scraped data (without saving to database for this public route)
        res.status(200).json({
            success: true,
            message: 'Faculty data scraped successfully',
            data: scrapedData
        });

    } catch (error) {
        console.error('Faculty scraper error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to scrape faculty data',
            error: error.message
        });
    }
});

// Scraper routes (authentication required)
app.use('/api/scraper', authenticateToken, scraperRoutes);

// Scraper Integration routes (authentication required)
app.use('/api/integration', authenticateToken, scraperIntegrationRoutes);

// Register Professor/HOD
app.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword, role } = req.body;
    try {
        console.log('Signup request received:');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Role:', role);
        console.log('Role type:', typeof role);

        const existingProfessor = await Professor.findOne({ email });
        if (existingProfessor) {
            return res.status(400).json({ message: 'User already exists' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Validate role
        const validRoles = ['faculty', 'hod', 'dean', 'guest_faculty'];
        const userRole = role || 'faculty'; // Default to faculty if role is undefined
        if (!validRoles.includes(userRole)) {
            return res.status(400).json({ message: 'Invalid role selected' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newProfessor = new Professor({
            name,
            email,
            password: hashedPassword,
            role: userRole
        });

        console.log('About to save professor with role:', userRole);
        const savedProfessor = await newProfessor.save();
        console.log('Saved professor:', savedProfessor.role);

        res.status(201).json({
            message: `${userRole === 'hod' ? 'HOD' : userRole === 'dean' ? 'Dean' : userRole === 'guest_faculty' ? 'Guest Faculty' : 'Faculty member'} registered successfully`,
            role: savedProfessor.role
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Professor
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log(email, password);
        const professor = await Professor.findOne({ email });
        if (!professor) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, professor.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({
            id: professor._id,
            name: professor.name,
            email: professor.email,
            role: professor.role
        }, TOKEN, { expiresIn: '24h' });
        res.status(200).json({ result: professor, token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// PROFILE MANAGEMENT API ENDPOINTS
// =============================================================================

// Get professor profile
app.get('/api/professor/profile', authenticateToken, async (req, res) => {
    try {
        const professor = await Professor.findById(req.user.id).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }
        res.status(200).json(professor);
        console.log('Profile fetched successfully for user:', req.user.id);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update profile directly (no approval needed)
app.put('/api/professor/profile', authenticateToken, async (req, res) => {
    try {
        const profileData = req.body;

        // Remove sensitive fields that shouldn't be updated via this endpoint
        delete profileData.password;
        delete profileData.role;
        delete profileData._id;
        delete profileData.__v;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            req.user.id,
            profileData,
            { new: true, select: '-password' }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Profile updated successfully for user:', req.user.id);
        res.status(200).json({
            message: 'Profile updated successfully',
            profile: updatedProfessor
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific professor profile by ID (HOD access only)
app.get('/api/professor/profile/:professorId', authenticateToken, async (req, res) => {
    try {
        console.log('HOD profile view request received');
        console.log('Requesting user ID:', req.user.id);
        console.log('Target professor ID:', req.params.professorId);

        // Check if the requesting user is HOD
        const requestingUser = await Professor.findById(req.user.id);
        console.log('Requesting user found:', requestingUser ? 'Yes' : 'No');
        console.log('Requesting user role:', requestingUser?.role);

        if (!requestingUser || requestingUser.role !== 'hod') {
            console.log('Access denied - not HOD');
            return res.status(403).json({ message: 'Access denied. HOD privileges required.' });
        }

        const professorId = req.params.professorId;
        const professor = await Professor.findById(professorId).select('-password');

        console.log('Target professor found:', professor ? 'Yes' : 'No');

        if (!professor) {
            console.log('Professor not found');
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Successfully returning professor profile');
        res.status(200).json(professor);
    } catch (error) {
        console.error('Error fetching professor profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get faculty publications for access requests (available to all authenticated users)
app.get('/api/faculty/:facultyId/publications', authenticateToken, async (req, res) => {
    try {
        console.log('Faculty publications request received');
        console.log('Requesting user ID:', req.user.id);
        console.log('Target faculty ID:', req.params.facultyId);

        const facultyId = req.params.facultyId;
        const faculty = await Professor.findById(facultyId).select('-password -access_requests -outgoing_access_requests');

        console.log('Target faculty found:', faculty ? 'Yes' : 'No');

        if (!faculty) {
            console.log('Faculty not found');
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Return faculty basic info and publications only (no sensitive data)
        const publicData = {
            _id: faculty._id,
            name: faculty.name,
            designation: faculty.designation,
            department: faculty.department,
            profileImage: faculty.profileImage,
            // Publications
            seie_journals: faculty.seie_journals || [],
            ugc_approved_journals: faculty.ugc_approved_journals || [],
            non_ugc_journals: faculty.non_ugc_journals || [],
            conference_papers: faculty.conference_papers || [],
            book_chapters: faculty.book_chapters || [],
            books_published: faculty.books_published || []
        };

        console.log('Successfully returning faculty publications');
        res.status(200).json(publicData);
    } catch (error) {
        console.error('Error fetching faculty publications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Temporary endpoint to promote user to HOD (for testing only - remove in production)
app.post('/api/promote-to-hod', authenticateToken, async (req, res) => {
    try {
        console.log('Promoting user to HOD:', req.user.id);

        const updatedUser = await Professor.findByIdAndUpdate(
            req.user.id,
            { role: 'hod' },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User promoted to HOD successfully');
        res.status(200).json({
            message: 'Successfully promoted to HOD',
            role: updatedUser.role
        });
    } catch (error) {
        console.error('Error promoting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get professor experience
app.get('/api/professor/experience', authenticateToken, async (req, res) => {
    try {
        const professor = await Professor.findById(req.user.id).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return experience data or default structure
        const experienceData = {
            teaching_experience: professor.teaching_experience || [{
                designation: "",
                institution: "",
                department: "",
                from: "",
                to: "",
            }],
            research_experience: professor.research_experience || [{
                position: "",
                organization: "",
                project: "",
                from: "",
                to: "",
            }],
            industry_experience: professor.industry_experience || [{
                designation: "",
                company: "",
                sector: "",
                from: "",
                to: "",
            }]
        };

        res.status(200).json(experienceData);
    } catch (error) {
        console.error('Error fetching experience:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update experience directly (no approval needed)
app.put('/api/professor/experience', authenticateToken, async (req, res) => {
    try {
        const experienceData = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            req.user.id,
            {
                teaching_experience: experienceData.teaching_experience || [],
                research_experience: experienceData.research_experience || [],
                industry_experience: experienceData.industry_experience || [],
                lastExperienceUpdate: new Date()
            },
            { new: true, select: '-password' }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Experience updated successfully for user:', req.user.id);
        res.status(200).json({
            message: 'Experience updated successfully',
            experience: {
                teaching_experience: updatedProfessor.teaching_experience,
                research_experience: updatedProfessor.research_experience,
                industry_experience: updatedProfessor.industry_experience
            }
        });
    } catch (error) {
        console.error('Error updating experience:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get professor publications
app.get('/api/professor/publications', authenticateToken, async (req, res) => {
    try {
        const { facultyId } = req.query;
        const requesterId = req.user.id;
        let targetFacultyId = facultyId || requesterId;

        const professor = await Professor.findById(targetFacultyId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Check if requesting own data or others'
        const isOwnProfile = targetFacultyId === requesterId;

        // Function to sanitize sensitive publication data
        const sanitizePublications = (publications) => {
            return publications.map(pub => {
                // Convert Mongoose document to plain object
                const plainPub = pub.toObject ? pub.toObject() : pub;
                return {
                    ...plainPub,
                    paper_upload: !isOwnProfile ? "" : plainPub.paper_upload,
                    paper_upload_filename: !isOwnProfile ? "" : plainPub.paper_upload_filename,
                    paper_link: !isOwnProfile ? "" : plainPub.paper_link
                };
            });
        };

        // Return publications data with field names that match frontend expectations
        const publicationsData = {
            name: professor.name,
            email: professor.email,
            // New consolidated format
            papers_published: sanitizePublications(professor.papers_published || []),
            // Frontend expects these specific field names
            ugcPapers: sanitizePublications([
                ...(professor.ugc_papers || []),
                ...(professor.ugc_approved_journals || [])
            ]),
            nonUgcPapers: sanitizePublications([
                ...(professor.non_ugc_papers || []),
                ...(professor.non_ugc_journals || [])
            ]),
            // Legacy fields for backward compatibility
            seie_journals: sanitizePublications(professor.seie_journals || []),
            ugc_approved_journals: sanitizePublications(professor.ugc_approved_journals || []),
            non_ugc_journals: sanitizePublications(professor.non_ugc_journals || []),
            conference_proceedings: sanitizePublications(professor.conference_proceedings || [])
        };

        // Add a flag to indicate if this is viewing someone else's profile
        publicationsData.isOwnProfile = isOwnProfile;
        publicationsData.targetFacultyId = targetFacultyId;

        res.status(200).json(publicationsData);
    } catch (error) {
        console.error('Error fetching publications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update publications directly (no approval needed)
app.put('/api/professor/publications', authenticateToken, async (req, res) => {
    try {
        const publicationsData = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            req.user.id,
            {
                ugc_approved_journals: publicationsData.ugc_approved_journals || [],
                non_ugc_journals: publicationsData.non_ugc_journals || [],
                conference_proceedings: publicationsData.conference_proceedings || [],
                lastPublicationsUpdate: new Date()
            },
            { new: true, select: '-password' }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Publications updated successfully for user:', req.user.id);
        res.status(200).json({
            message: 'Publications updated successfully',
            publications: {
                ugc_approved_journals: updatedProfessor.ugc_approved_journals,
                non_ugc_journals: updatedProfessor.non_ugc_journals,
                conference_proceedings: updatedProfessor.conference_proceedings
            }
        });
    } catch (error) {
        console.error('Error updating publications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get professor patents
app.get('/api/professor/patents', authenticateToken, async (req, res) => {
    try {
        const professor = await Professor.findById(req.user.id).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return patents data or default structure
        const patentsData = {
            innovation_contributions: professor.innovation_contributions || [{
                work_name: "",
                specialization: "",
                remarks: "",
            }],
            patent_details: professor.patent_details || [{
                title: "",
                status: "",
                patent_number: "",
                year_of_award: "",
                type: "",
                commercialized_status: "",
            }]
        };

        res.status(200).json(patentsData);
    } catch (error) {
        console.error('Error fetching patents:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update patents directly (no approval needed)
app.put('/api/professor/patents', authenticateToken, async (req, res) => {
    try {
        const patentsData = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            req.user.id,
            {
                innovation_contributions: patentsData.innovation_contributions || [],
                patent_details: patentsData.patent_details || [],
                lastPatentsUpdate: new Date()
            },
            { new: true, select: '-password' }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Patents updated successfully for user:', req.user.id);
        res.status(200).json({
            message: 'Patents updated successfully',
            patents: {
                innovation_contributions: updatedProfessor.innovation_contributions,
                patent_details: updatedProfessor.patent_details
            }
        });
    } catch (error) {
        console.error('Error updating patents:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get professor fellowship
app.get('/api/professor/fellowship', authenticateToken, async (req, res) => {
    try {
        const professor = await Professor.findById(req.user.id).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return fellowship data or default structure
        const fellowshipData = {
            fellowship_details: professor.fellowship_details || []
        };

        res.status(200).json(fellowshipData);
    } catch (error) {
        console.error('Error getting fellowship:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update professor fellowship
app.put('/api/professor/fellowship', authenticateToken, async (req, res) => {
    try {
        const fellowshipData = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            req.user.id,
            {
                fellowship_details: fellowshipData.fellowship_details || [],
                lastFellowshipUpdate: new Date()
            },
            { new: true, select: '-password' }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Fellowship updated successfully for user:', req.user.id);
        res.status(200).json({
            message: 'Fellowship updated successfully',
            fellowship: {
                fellowship_details: updatedProfessor.fellowship_details
            }
        });
    } catch (error) {
        console.error('Error updating fellowship:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get professor books
app.get('/api/professor/books', authenticateToken, async (req, res) => {
    try {
        const professor = await Professor.findById(req.user.id).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return books data or default structure
        const booksData = {
            books: professor.books || [{
                title: "",
                authors: "",
                publisher: "",
                year: "",
                isbn: "",
            }],
            chapters_in_books: professor.chapters_in_books || [{
                chapter_title: "",
                authors: "",
                book_title: "",
                publisher: "",
                year: "",
                isbn: "",
            }],
            edited_books: professor.edited_books || [{
                title: "",
                authors: "",
                publisher: "",
                year: "",
                isbn: "",
                chapter_titles: "",
            }]
        };

        res.status(200).json(booksData);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update books directly (no approval needed)
app.put('/api/professor/books', authenticateToken, async (req, res) => {
    try {
        const booksData = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            req.user.id,
            {
                books: booksData.books || [],
                chapters_in_books: booksData.chapters_in_books || [],
                edited_books: booksData.edited_books || [],
                lastBooksUpdate: new Date()
            },
            { new: true, select: '-password' }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Books updated successfully for user:', req.user.id);
        res.status(200).json({
            message: 'Books updated successfully',
            books: {
                books: updatedProfessor.books,
                chapters_in_books: updatedProfessor.chapters_in_books,
                edited_books: updatedProfessor.edited_books
            }
        });
    } catch (error) {
        console.error('Error updating books:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// MISSING ENDPOINTS FOR VIEWING OTHER PROFESSORS' DATA
// =============================================================================

// Get professor experience by ID (for HOD viewing)
app.get('/api/professor/experience/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const professor = await Professor.findById(professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return experience data or default structure
        const experienceData = {
            teaching_experience: professor.teaching_experience || [{
                designation: "",
                institution: "",
                department: "",
                from: "",
                to: "",
            }],
            research_experience: professor.research_experience || [{
                position: "",
                organization: "",
                project: "",
                from: "",
                to: "",
            }],
            industry_experience: professor.industry_experience || [{
                designation: "",
                company: "",
                sector: "",
                from: "",
                to: "",
            }]
        };

        res.status(200).json(experienceData);
    } catch (error) {
        console.error('Error fetching experience:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get professor publications by ID (for HOD viewing)
app.get('/api/professor/publications/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const professor = await Professor.findById(professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return publications data or default structure
        const publicationsData = {
            ugc_approved_journals: professor.ugc_approved_journals || [{
                title: "",
                authors: "",
                journal_name: "",
                volume: "",
                issue: "",
                page_nos: "",
                year: "",
                impact_factor: "",
            }],
            non_ugc_journals: professor.non_ugc_journals || [{
                title: "",
                authors: "",
                journal_name: "",
                volume: "",
                issue: "",
                page_nos: "",
                year: "",
                impact_factor: "",
            }],
            scopus_indexed_journals: professor.scopus_indexed_journals || [{
                title: "",
                authors: "",
                journal_name: "",
                volume: "",
                issue: "",
                page_nos: "",
                year: "",
                impact_factor: "",
            }],
            conference_proceedings: professor.conference_proceedings || [{
                title: "",
                authors: "",
                conference_name: "",
                pages: "",
                year: "",
                issn: "",
            }]
        };

        res.status(200).json(publicationsData);
    } catch (error) {
        console.error('Error fetching publications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get professor patents by ID (for HOD viewing)
app.get('/api/professor/patents/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const professor = await Professor.findById(professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return patents data or default structure
        const patentsData = {
            patents: professor.patents || [{
                title: "",
                application_number: "",
                status: "",
                filed_date: "",
                published_date: "",
                granted_date: "",
                inventors: "",
            }]
        };

        res.status(200).json(patentsData);
    } catch (error) {
        console.error('Error fetching patents:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get professor fellowship by ID (for HOD viewing)
app.get('/api/professor/fellowship/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const professor = await Professor.findById(professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return fellowship data or default structure
        const fellowshipData = {
            fellowships: professor.fellowships || [{
                title: "",
                awarded_by: "",
                year: "",
                duration: "",
                amount: "",
            }]
        };

        res.status(200).json(fellowshipData);
    } catch (error) {
        console.error('Error fetching fellowship:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get professor books by ID (for HOD viewing)
app.get('/api/professor/books/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const professor = await Professor.findById(professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return books data or default structure
        const booksData = {
            books_authored: professor.books_authored || [{
                title: "",
                publisher: "",
                year: "",
                isbn: "",
                co_authors: "",
            }],
            books_edited: professor.books_edited || [{
                title: "",
                publisher: "",
                year: "",
                isbn: "",
                co_editors: "",
            }],
            chapters_in_books: professor.chapters_in_books || [{
                chapter_title: "",
                book_title: "",
                editors: "",
                publisher: "",
                pages: "",
                year: "",
                isbn: "",
            }]
        };

        res.status(200).json(booksData);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// RESEARCH GUIDANCE API ENDPOINTS
// =============================================================================

// Get professor research guidance
app.get('/api/professor/research-guidance/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const professor = await Professor.findById(professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return research guidance data or default structure
        const researchGuidanceData = {
            pg_guidance: professor.pg_guidance || [{
                year: "",
                degree: "",
                students_awarded: "",
                department_centre: "",
            }],
            phd_guidance: professor.phd_guidance || [{
                student_name: "",
                registration_date: "",
                registration_no: "",
                thesis_title: "",
                thesis_submitted_status: "",
                thesis_submitted_date: "",
                vivavoce_completed_status: "",
                date_awarded: "",
            }],
            postdoc_guidance: professor.postdoc_guidance || [{
                scholar_name: "",
                designation: "",
                funding_agency: "",
                fellowship_title: "",
                year_of_joining: "",
                year_of_completion: "",
            }]
        };

        res.status(200).json(researchGuidanceData);
    } catch (error) {
        console.error('Error fetching research guidance:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update research guidance directly (no approval needed)
app.put('/api/professor/research-guidance/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const researchGuidanceData = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            professorId,
            {
                pg_guidance: researchGuidanceData.pg_guidance || [],
                phd_guidance: researchGuidanceData.phd_guidance || [],
                postdoc_guidance: researchGuidanceData.postdoc_guidance || [],
                lastResearchGuidanceUpdate: new Date()
            },
            { new: true, select: '-password' }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Research guidance updated successfully for user:', professorId);
        res.status(200).json({
            message: 'Research guidance updated successfully',
            research_guidance: {
                pg_guidance: updatedProfessor.pg_guidance,
                phd_guidance: updatedProfessor.phd_guidance,
                postdoc_guidance: updatedProfessor.postdoc_guidance
            }
        });
    } catch (error) {
        console.error('Error updating research guidance:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// PROJECT & CONSULTANCY API ENDPOINTS
// =============================================================================

// Get professor project & consultancy
app.get('/api/professor/project-consultancy/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        console.log('🔍 Project Consultancy API - Professor ID:', professorId);
        const professor = await Professor.findById(professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }
        console.log('👨‍🏫 Found professor:', professor.name, professor.email);
        console.log('📊 Data counts - Ongoing:', professor.ongoing_projects?.length, 'Completed:', professor.completed_projects?.length);

        // Function to convert Mongoose documents to plain objects
        const convertToPlainObjects = (items) => {
            if (!items || items.length === 0) return [];
            return items.map(item => item.toObject ? item.toObject() : item);
        };

        // Function to check if array has actual data (not just empty objects)
        const hasActualData = (items, titleField) => {
            if (!items || items.length === 0) return false;
            return items.some(item => {
                const plainItem = item.toObject ? item.toObject() : item;
                return plainItem[titleField] && plainItem[titleField].trim() !== '';
            });
        };

        // Return project consultancy data or default structure
        const projectConsultancyData = {
            ongoing_projects: hasActualData(professor.ongoing_projects, 'title_of_project')
                ? convertToPlainObjects(professor.ongoing_projects)
                : [{
                    title_of_project: "",
                    sponsored_by: "",
                    period: "",
                    sanctioned_amount: "",
                    year: "",
                }],
            ongoing_consultancy_works: hasActualData(professor.ongoing_consultancy_works, 'title_of_consultancy_work')
                ? convertToPlainObjects(professor.ongoing_consultancy_works)
                : [{
                    title_of_consultancy_work: "",
                    sponsored_by: "",
                    period: "",
                    sanctioned_amount: "",
                    year: "",
                }],
            completed_projects: hasActualData(professor.completed_projects, 'title_of_project')
                ? convertToPlainObjects(professor.completed_projects)
                : [{
                    title_of_project: "",
                    sponsored_by: "",
                    period: "",
                    sanctioned_amount: "",
                    year: "",
                }],
            completed_consultancy_works: hasActualData(professor.completed_consultancy_works, 'title_of_consultancy_work')
                ? convertToPlainObjects(professor.completed_consultancy_works)
                : [{
                    title_of_consultancy_work: "",
                    sponsored_by: "",
                    period: "",
                    sanctioned_amount: "",
                    year: "",
                }],
            research_projects_funded: hasActualData(professor.research_projects_funded, 'project_title')
                ? convertToPlainObjects(professor.research_projects_funded)
                : [{
                    pi_name: "",
                    project_title: "",
                    funding_agency: "",
                    duration: "",
                    year_of_award: "",
                    amount: "",
                }]
        };

        res.status(200).json(projectConsultancyData);
    } catch (error) {
        console.error('Error fetching project consultancy:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update project & consultancy directly (no approval needed)
app.put('/api/professor/project-consultancy/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const projectConsultancyData = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            professorId,
            {
                ongoing_projects: projectConsultancyData.ongoing_projects || [],
                ongoing_consultancy_works: projectConsultancyData.ongoing_consultancy_works || [],
                completed_projects: projectConsultancyData.completed_projects || [],
                completed_consultancy_works: projectConsultancyData.completed_consultancy_works || [],
                research_projects_funded: projectConsultancyData.research_projects_funded || [],
                lastProjectConsultancyUpdate: new Date()
            },
            { new: true, select: '-password' }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Project consultancy updated successfully for user:', professorId);
        res.status(200).json({
            message: 'Project consultancy updated successfully',
            project_consultancy: {
                ongoing_projects: updatedProfessor.ongoing_projects,
                ongoing_consultancy_works: updatedProfessor.ongoing_consultancy_works,
                completed_projects: updatedProfessor.completed_projects,
                completed_consultancy_works: updatedProfessor.completed_consultancy_works,
                research_projects_funded: updatedProfessor.research_projects_funded
            }
        });
    } catch (error) {
        console.error('Error updating project consultancy:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// E-EDUCATION API ENDPOINTS
// =============================================================================

// Get professor e-education
app.get('/api/professor/e-education/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const professor = await Professor.findById(professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return e-education data or default structure
        const eEducationData = {
            e_lecture_details: professor.e_lecture_details || [{
                e_lecture_title: "",
                content_module_title: "",
                institution_platform: "",
                year: "",
                weblink: "",
                member_of_editorial_bodies: "",
                reviewer_referee_of: "",
            }],
            online_education_conducted: professor.online_education_conducted || [{
                nature_of_online_course: "",
                no_of_sessions: "",
                target_group: "",
                date: "",
            }]
        };

        res.status(200).json(eEducationData);
    } catch (error) {
        console.error('Error fetching e-education:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update e-education directly (no approval needed)
app.put('/api/professor/e-education/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const eEducationData = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            professorId,
            {
                e_lecture_details: eEducationData.e_lecture_details || [],
                online_education_conducted: eEducationData.online_education_conducted || [],
                lastEEducationUpdate: new Date()
            },
            { new: true, select: '-password' }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('E-education updated successfully for user:', professorId);
        res.status(200).json({
            message: 'E-education updated successfully',
            e_education: {
                e_lecture_details: updatedProfessor.e_lecture_details,
                online_education_conducted: updatedProfessor.online_education_conducted
            }
        });
    } catch (error) {
        console.error('Error updating e-education:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// CONFERENCE/SEMINAR/WORKSHOP API ENDPOINTS
// =============================================================================

// Get professor conference/seminar/workshop data
app.get('/api/professor/conference-seminar-workshop/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const professor = await Professor.findById(professorId).select('invited_talks conferences_seminars_workshops_organized conferences_seminars_workshops_participated financial_support');

        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return conference/seminar/workshop data or default structure
        res.status(200).json({
            invited_talks: professor.invited_talks || [],
            conferences_seminars_workshops_organized: professor.conferences_seminars_workshops_organized || [],
            conferences_seminars_workshops_participated: professor.conferences_seminars_workshops_participated || [],
            financial_support: professor.financial_support || []
        });
    } catch (error) {
        console.error('Error fetching conference/seminar/workshop:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update conference/seminar/workshop directly (no approval needed)
app.put('/api/professor/conference-seminar-workshop/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const { invited_talks, conferences_seminars_workshops_organized, conferences_seminars_workshops_participated, financial_support } = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            professorId,
            {
                invited_talks: invited_talks,
                conferences_seminars_workshops_organized: conferences_seminars_workshops_organized,
                conferences_seminars_workshops_participated: conferences_seminars_workshops_participated,
                financial_support: financial_support
            },
            { new: true, runValidators: true }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Conference/seminar/workshop updated successfully for user:', professorId);
        res.status(200).json({
            message: 'Conference/seminar/workshop updated successfully',
            conference_data: {
                invited_talks: updatedProfessor.invited_talks,
                conferences_seminars_organized: updatedProfessor.conferences_seminars_organized,
                workshops_organized: updatedProfessor.workshops_organized,
                financial_support: updatedProfessor.financial_support
            }
        });
    } catch (error) {
        console.error('Error updating conference/seminar/workshop:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// END CONFERENCE/SEMINAR/WORKSHOP API ENDPOINTS
// =============================================================================

// =============================================================================
// TRAINING API ENDPOINTS
// =============================================================================

// Get training data
app.get('/api/professor/training', authenticateToken, async (req, res) => {
    try {
        const professor = await Professor.findById(req.user.id).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return training data or default structure
        const trainingData = {
            revenue_consultancy_training: professor.revenue_consultancy_training || [{
                organization: "",
                from_date: "",
                to_date: "",
                amount_generated: "",
            }]
        };

        res.status(200).json(trainingData);
    } catch (error) {
        console.error('Error fetching training data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update training data
app.put('/api/professor/training', authenticateToken, async (req, res) => {
    try {
        const trainingData = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            req.user.id,
            {
                revenue_consultancy_training: trainingData.revenue_consultancy_training || [],
                lastTrainingUpdate: new Date()
            },
            { new: true, select: '-password' }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Training data updated successfully for user:', req.user.id);
        res.status(200).json({
            message: 'Training data updated successfully',
            training: {
                revenue_consultancy_training: updatedProfessor.revenue_consultancy_training
            }
        });
    } catch (error) {
        console.error('Error updating training data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// END TRAINING API ENDPOINTS
// =============================================================================

// =============================================================================
// MOU API ENDPOINTS
// =============================================================================

// Get MOU data
app.get('/api/professor/mou', authenticateToken, async (req, res) => {
    try {
        const professor = await Professor.findById(req.user.id).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return MOU data or default structure
        const mouData = {
            functional_mous: professor.functional_mous || [{
                organization_name: "",
                duration: "",
                purpose: "",
                activities: "",
                date: "",
            }]
        };

        res.status(200).json(mouData);
    } catch (error) {
        console.error('Error fetching MOU data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update MOU data
app.put('/api/professor/mou', authenticateToken, async (req, res) => {
    try {
        const mouData = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            req.user.id,
            {
                functional_mous: mouData.functional_mous || [],
                lastMouUpdate: new Date()
            },
            { new: true, select: '-password' }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('MOU data updated successfully for user:', req.user.id);
        res.status(200).json({
            message: 'MOU data updated successfully',
            mou: {
                functional_mous: updatedProfessor.functional_mous
            }
        });
    } catch (error) {
        console.error('Error updating MOU data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// END MOU API ENDPOINTS
// =============================================================================

// =============================================================================
// PARTICIPATION & COLLABORATION API ENDPOINTS
// =============================================================================

// Get professor participation & collaboration data
app.get('/api/professor/participation-collaboration/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const professor = await Professor.findById(professorId).select('participation_extension_academic participation_extension_cocurricular collaboration_institution_industry');

        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return participation & collaboration data or default structure
        res.status(200).json({
            participation_extension_academic: professor.participation_extension_academic || [],
            participation_extension_cocurricular: professor.participation_extension_cocurricular || [],
            collaboration_institution_industry: professor.collaboration_institution_industry || []
        });
    } catch (error) {
        console.error('Error fetching participation & collaboration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update participation & collaboration directly (no approval needed)
app.put('/api/professor/participation-collaboration/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const { participation_extension_academic, participation_extension_cocurricular, collaboration_institution_industry } = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            professorId,
            {
                participation_extension_academic: participation_extension_academic,
                participation_extension_cocurricular: participation_extension_cocurricular,
                collaboration_institution_industry: collaboration_institution_industry
            },
            { new: true, runValidators: true }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Participation & collaboration updated successfully for user:', professorId);
        res.status(200).json({
            message: 'Participation & collaboration updated successfully',
            participation_data: {
                participation_extension_academic: updatedProfessor.participation_extension_academic,
                participation_extension_cocurricular: updatedProfessor.participation_extension_cocurricular,
                collaboration_institution_industry: updatedProfessor.collaboration_institution_industry
            }
        });
    } catch (error) {
        console.error('Error updating participation & collaboration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// END PARTICIPATION & COLLABORATION API ENDPOINTS
// =============================================================================

// =============================================================================
// PROGRAMME API ENDPOINTS
// =============================================================================

// Get professor programme data
app.get('/api/professor/programme/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const professor = await Professor.findById(professorId).select('faculty_development_programme executive_development_programme participation_impress_imprint enrolment_arpit_programme');

        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Return programme data or default structure
        res.status(200).json({
            faculty_development_programme: professor.faculty_development_programme || [],
            executive_development_programme: professor.executive_development_programme || [],
            participation_impress_imprint: professor.participation_impress_imprint || [],
            enrolment_arpit_programme: professor.enrolment_arpit_programme || []
        });
    } catch (error) {
        console.error('Error fetching programme data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update programme data directly (no approval needed)
app.put('/api/professor/programme/:id', authenticateToken, async (req, res) => {
    try {
        const professorId = req.params.id;
        const { faculty_development_programme, executive_development_programme, participation_impress_imprint, enrolment_arpit_programme } = req.body;

        const updatedProfessor = await Professor.findByIdAndUpdate(
            professorId,
            {
                faculty_development_programme: faculty_development_programme,
                executive_development_programme: executive_development_programme,
                participation_impress_imprint: participation_impress_imprint,
                enrolment_arpit_programme: enrolment_arpit_programme
            },
            { new: true, runValidators: true }
        );

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        console.log('Programme data updated successfully for user:', professorId);
        res.status(200).json({
            message: 'Programme data updated successfully',
            programme_data: {
                faculty_development_programme: updatedProfessor.faculty_development_programme,
                executive_development_programme: updatedProfessor.executive_development_programme,
                participation_impress_imprint: updatedProfessor.participation_impress_imprint,
                enrolment_arpit_programme: updatedProfessor.enrolment_arpit_programme
            }
        });
    } catch (error) {
        console.error('Error updating programme data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// END PROGRAMME API ENDPOINTS
// =============================================================================

// Get all professors (for faculty directory)
app.get('/api/faculty', authenticateToken, async (req, res) => {
    try {
        const professors = await Professor.find({
            role: { $in: ['faculty', 'guest_faculty', 'hod', 'dean'] }  // Show all academic staff
        }).select('-password -__v').sort({ name: 1 });

        res.status(200).json(professors);
    } catch (error) {
        console.error('Error fetching professors:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// END PROFILE MANAGEMENT API ENDPOINTS
// =============================================================================

// =============================================================================
// HOD MANAGEMENT API ENDPOINTS
// =============================================================================

// Get all faculty members (HOD only)
app.get('/api/hod/faculty-list', authenticateToken, async (req, res) => {
    try {
        // Check if user is HOD
        const token = req.headers['authorization']?.split(' ')[1];
        const decoded = jwt.verify(token, TOKEN);

        if (decoded.role !== 'hod') {
            return res.status(403).json({ message: 'Access denied. HOD role required.' });
        }

        const faculty = await Professor.find({
            role: { $in: ['faculty', 'guest_faculty'] }
        }).select('-password -__v').sort({ createdAt: -1 });

        res.status(200).json({
            faculty: faculty,
            count: faculty.length
        });
    } catch (error) {
        console.error('Error fetching faculty list:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// HOD COMPREHENSIVE PROFILE VIEWING ENDPOINTS
// =============================================================================

// Get specific professor's experience data (HOD access only)
app.get('/api/professor/experience/:professorId', authenticateToken, async (req, res) => {
    try {
        const requestingUser = await Professor.findById(req.user.id);
        if (!requestingUser || requestingUser.role !== 'hod') {
            return res.status(403).json({ message: 'Access denied. HOD privileges required.' });
        }

        const professor = await Professor.findById(req.params.professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const experienceData = {
            teaching_experience: professor.teaching_experience || [],
            research_experience: professor.research_experience || []
        };

        res.status(200).json(experienceData);
    } catch (error) {
        console.error('Error fetching professor experience:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific professor's publications data (HOD access only)
app.get('/api/professor/publications/:professorId', authenticateToken, async (req, res) => {
    try {
        const requestingUser = await Professor.findById(req.user.id);
        if (!requestingUser || requestingUser.role !== 'hod') {
            return res.status(403).json({ message: 'Access denied. HOD privileges required.' });
        }

        const professor = await Professor.findById(req.params.professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const publicationsData = {
            journal_publications: professor.journal_publications || [],
            conference_publications: professor.conference_publications || [],
            other_publications: professor.other_publications || []
        };

        res.status(200).json(publicationsData);
    } catch (error) {
        console.error('Error fetching professor publications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific professor's patents data (HOD access only)
app.get('/api/professor/patents/:professorId', authenticateToken, async (req, res) => {
    try {
        const requestingUser = await Professor.findById(req.user.id);
        if (!requestingUser || requestingUser.role !== 'hod') {
            return res.status(403).json({ message: 'Access denied. HOD privileges required.' });
        }

        const professor = await Professor.findById(req.params.professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const patentsData = {
            patents: professor.patents || []
        };

        res.status(200).json(patentsData);
    } catch (error) {
        console.error('Error fetching professor patents:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific professor's fellowship data (HOD access only)
app.get('/api/professor/fellowship/:professorId', authenticateToken, async (req, res) => {
    try {
        const requestingUser = await Professor.findById(req.user.id);
        if (!requestingUser || requestingUser.role !== 'hod') {
            return res.status(403).json({ message: 'Access denied. HOD privileges required.' });
        }

        const professor = await Professor.findById(req.params.professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const fellowshipData = {
            fellowship_details: professor.fellowship_details || []
        };

        res.status(200).json(fellowshipData);
    } catch (error) {
        console.error('Error fetching professor fellowship:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific professor's books data (HOD access only)
app.get('/api/professor/books/:professorId', authenticateToken, async (req, res) => {
    try {
        const requestingUser = await Professor.findById(req.user.id);
        if (!requestingUser || requestingUser.role !== 'hod') {
            return res.status(403).json({ message: 'Access denied. HOD privileges required.' });
        }

        const professor = await Professor.findById(req.params.professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const booksData = {
            books_authored: professor.books_authored || [],
            books_edited: professor.books_edited || [],
            chapters_in_books: professor.chapters_in_books || []
        };

        res.status(200).json(booksData);
    } catch (error) {
        console.error('Error fetching professor books:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific professor's research guidance data (HOD access only)
app.get('/api/professor/research-guidance/:professorId', authenticateToken, async (req, res) => {
    try {
        const requestingUser = await Professor.findById(req.user.id);
        if (!requestingUser || requestingUser.role !== 'hod') {
            return res.status(403).json({ message: 'Access denied. HOD privileges required.' });
        }

        const professor = await Professor.findById(req.params.professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const researchData = {
            phd_students: professor.phd_student_guided || [],
            pg_students: professor.pg_student_guided || []
        };

        res.status(200).json(researchData);
    } catch (error) {
        console.error('Error fetching professor research guidance:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// END HOD MANAGEMENT API ENDPOINTS
// =============================================================================

// Get specific professor's project consultancy data (HOD access only)
app.get('/api/professor/project-consultancy/:professorId', authenticateToken, async (req, res) => {
    try {
        const requestingUser = await Professor.findById(req.user.id);
        if (!requestingUser || requestingUser.role !== 'hod') {
            return res.status(403).json({ message: 'Access denied. HOD privileges required.' });
        }

        const professor = await Professor.findById(req.params.professorId).select('-password');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const projectConsultancyData = {
            ongoing_projects: professor.ongoing_projects || [],
            ongoing_consultancy_works: professor.ongoing_consultancy_works || [],
            completed_projects: professor.completed_projects || [],
            completed_consultancy_works: professor.completed_consultancy_works || [],
            research_projects_funded: professor.research_projects_funded || []
        };

        res.status(200).json(projectConsultancyData);
    } catch (error) {
        console.error('Error fetching professor project consultancy:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== HOD STATISTICS ENDPOINTS =====

// Get department-wide publications statistics for HOD dashboard
app.get('/api/hod/publications-statistics', authenticateToken, async (req, res) => {
    try {
        // Check if user has HOD role
        const requester = await Professor.findById(req.user.id);
        if (!requester || requester.role !== 'hod') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. HOD role required.'
            });
        }

        // Get all faculty in the department
        const allFaculty = await Professor.find({}).select('ugc_approved_journals conference_proceedings non_ugc_journals');

        let totalPublications = 0;
        const yearWisePublications = {};

        // Process UGC approved journals
        allFaculty.forEach(faculty => {
            if (faculty.ugc_approved_journals && faculty.ugc_approved_journals.length > 0) {
                faculty.ugc_approved_journals.forEach(paper => {
                    totalPublications++;
                    const year = paper.year || 'Unknown';
                    yearWisePublications[year] = (yearWisePublications[year] || 0) + 1;
                });
            }

            // Process conference proceedings
            if (faculty.conference_proceedings && faculty.conference_proceedings.length > 0) {
                faculty.conference_proceedings.forEach(paper => {
                    totalPublications++;
                    const year = paper.year || 'Unknown';
                    yearWisePublications[year] = (yearWisePublications[year] || 0) + 1;
                });
            }

            // Process non-UGC journals
            if (faculty.non_ugc_journals && faculty.non_ugc_journals.length > 0) {
                faculty.non_ugc_journals.forEach(paper => {
                    totalPublications++;
                    const year = paper.year || 'Unknown';
                    yearWisePublications[year] = (yearWisePublications[year] || 0) + 1;
                });
            }
        });

        // Get current year and filter for last 3 years only
        const currentYear = new Date().getFullYear();
        const last3Years = [currentYear, currentYear - 1, currentYear - 2];

        const sortedYears = Object.entries(yearWisePublications)
            .filter(([year, count]) => {
                // Only include last 3 years (exclude 'Unknown')
                return year !== 'Unknown' && last3Years.includes(parseInt(year));
            })
            .sort((a, b) => {
                return parseInt(b[0]) - parseInt(a[0]);
            });

        res.status(200).json({
            success: true,
            data: {
                totalPublications,
                yearWiseBreakdown: sortedYears
            }
        });
    } catch (error) {
        console.error('Error fetching publications statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get department-wide awards statistics for HOD dashboard
app.get('/api/hod/awards-statistics', authenticateToken, async (req, res) => {
    try {
        // Check if user has HOD role
        const requester = await Professor.findById(req.user.id);
        if (!requester || requester.role !== 'hod') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. HOD role required.'
            });
        }

        // Get all faculty with their awards
        const allFaculty = await Professor.find({}).select('name awards');

        let totalAwards = 0;
        const facultyAwards = [];

        allFaculty.forEach(faculty => {
            const awardCount = (faculty.awards && faculty.awards.length) ? faculty.awards.length : 0;
            totalAwards += awardCount;

            if (awardCount > 0) {
                facultyAwards.push({
                    name: faculty.name || 'Unknown Faculty',
                    awardCount: awardCount
                });
            }
        });

        // Sort faculty by award count and get top 3
        const topFaculty = facultyAwards
            .sort((a, b) => b.awardCount - a.awardCount)
            .slice(0, 3);

        res.status(200).json({
            success: true,
            data: {
                totalAwards,
                topFacultyByAwards: topFaculty
            }
        });
    } catch (error) {
        console.error('Error fetching awards statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ===== ACCESS REQUEST ENDPOINTS =====

// Request access to a faculty's publication
app.post('/api/access-request', authenticateToken, async (req, res) => {
    try {
        const { target_faculty_id, publication_type, publication_index, publication_title, message } = req.body;

        // Get requester info
        const requester = await Professor.findById(req.user.id);
        if (!requester) {
            return res.status(404).json({ message: 'Requester not found' });
        }

        // Get target faculty
        const targetFaculty = await Professor.findById(target_faculty_id);
        if (!targetFaculty) {
            return res.status(404).json({ message: 'Target faculty not found' });
        }

        // Create access request for target faculty (incoming request)
        const accessRequest = {
            requester_id: req.user.id,
            requester_name: requester.name,
            requester_email: requester.email,
            requester_role: requester.role,
            publication_type,
            publication_index,
            publication_title,
            request_date: new Date(),
            status: 'pending',
            message: message || ''
        };

        // Add to target faculty's access_requests
        targetFaculty.access_requests.push(accessRequest);

        // Create outgoing request for requester
        const outgoingRequest = {
            target_faculty_id,
            target_faculty_name: targetFaculty.name,
            target_faculty_email: targetFaculty.email,
            publication_type,
            publication_index,
            publication_title,
            request_date: new Date(),
            status: 'pending',
            message: message || ''
        };

        // Add to requester's outgoing_access_requests
        requester.outgoing_access_requests.push(outgoingRequest);

        await targetFaculty.save();
        await requester.save();

        res.status(201).json({ message: 'Access request sent successfully' });
    } catch (error) {
        console.error('Error creating access request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get incoming access requests for a faculty
app.get('/api/access-requests/incoming', authenticateToken, async (req, res) => {
    try {
        const professor = await Professor.findById(req.user.id);
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        res.status(200).json({
            access_requests: professor.access_requests || []
        });
    } catch (error) {
        console.error('Error fetching incoming access requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get outgoing access requests for a faculty
app.get('/api/access-requests/outgoing', authenticateToken, async (req, res) => {
    try {
        const professor = await Professor.findById(req.user.id);
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        res.status(200).json({
            outgoing_access_requests: professor.outgoing_access_requests || []
        });
    } catch (error) {
        console.error('Error fetching outgoing access requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Respond to an access request (approve/reject)
app.put('/api/access-request/:requestId/respond', authenticateToken, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, response_message } = req.body; // status: 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
        }

        const professor = await Professor.findById(req.user.id);
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Find the access request
        const accessRequest = professor.access_requests.id(requestId);
        if (!accessRequest) {
            return res.status(404).json({ message: 'Access request not found' });
        }

        // Update the request
        accessRequest.status = status;
        accessRequest.response_date = new Date();
        accessRequest.response_message = response_message || '';

        // Also update the corresponding outgoing request in the requester's record
        const requester = await Professor.findById(accessRequest.requester_id);
        if (requester) {
            const outgoingRequest = requester.outgoing_access_requests.find(req =>
                req.target_faculty_id.toString() === professor._id.toString() &&
                req.publication_type === accessRequest.publication_type &&
                req.publication_index === accessRequest.publication_index &&
                req.status === 'pending'
            );

            if (outgoingRequest) {
                outgoingRequest.status = status;
                outgoingRequest.response_date = new Date();
                outgoingRequest.response_message = response_message || '';
                await requester.save();
            }
        }

        await professor.save();

        res.status(200).json({ message: `Access request ${status} successfully` });
    } catch (error) {
        console.error('Error responding to access request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get publication data with access control
app.get('/api/publication-access/:facultyId/:publicationType/:publicationIndex', authenticateToken, async (req, res) => {
    try {
        const { facultyId, publicationType, publicationIndex } = req.params;
        const requesterId = req.user.id;

        // Check if requester is the owner or has approved access
        const targetFaculty = await Professor.findById(facultyId);
        if (!targetFaculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // If requester is the owner, allow access
        if (facultyId === requesterId) {
            const publicationArray = targetFaculty[publicationType];
            if (publicationArray && publicationArray[publicationIndex]) {
                return res.status(200).json({
                    publication: publicationArray[publicationIndex],
                    hasAccess: true
                });
            }
            return res.status(404).json({ message: 'Publication not found' });
        }

        // Check if there's an approved access request
        const approvedRequest = targetFaculty.access_requests.find(req =>
            req.requester_id.toString() === requesterId &&
            req.publication_type === publicationType &&
            req.publication_index == publicationIndex &&
            req.status === 'approved'
        );

        if (approvedRequest) {
            const publicationArray = targetFaculty[publicationType];
            if (publicationArray && publicationArray[publicationIndex]) {
                return res.status(200).json({
                    publication: publicationArray[publicationIndex],
                    hasAccess: true
                });
            }
        }

        res.status(403).json({ message: 'Access denied', hasAccess: false });
    } catch (error) {
        console.error('Error checking publication access:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =============================================================================
// DATA REFRESH NOTIFICATION ENDPOINT
// =============================================================================

// Get data refresh timestamp - used by frontend to check for updates
app.get('/api/professor/data-status', authenticateToken, async (req, res) => {
    try {
        const professor = await Professor.findById(req.user.id).select('last_scraped data_source node_id');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        res.status(200).json({
            last_scraped: professor.last_scraped || null,
            data_source: professor.data_source || 'manual',
            node_id: professor.node_id || null,
            has_scraped_data: professor.data_source === 'web_scraping' || professor.data_source === 'hybrid',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching data status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Notify frontend about successful data update (called after profile updates)
app.post('/api/professor/refresh-notification', authenticateToken, async (req, res) => {
    try {
        const { updateType } = req.body; // 'scraped', 'manual', 'integration'

        // Update the professor's last refresh timestamp
        await Professor.findByIdAndUpdate(
            req.user.id,
            {
                last_refresh_notification: new Date(),
                last_update_type: updateType || 'manual'
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Refresh notification sent',
            timestamp: new Date().toISOString(),
            updateType
        });
    } catch (error) {
        console.error('Error sending refresh notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});