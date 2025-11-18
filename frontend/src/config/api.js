// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export { API_BASE_URL };

// Helper function to build API URLs
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export const API_ENDPOINTS = {
  // Authentication
  login: `${API_BASE_URL}/login`,
  signup: `${API_BASE_URL}/signup`,

  // Profile
  profile: `${API_BASE_URL}/api/professor/profile`,
  profileById: (id) => `${API_BASE_URL}/api/professor/profile/${id}`,

  // Data endpoints
  experience: `${API_BASE_URL}/api/professor/experience`,
  experienceById: (id) => `${API_BASE_URL}/api/professor/experience/${id}`,

  publications: `${API_BASE_URL}/api/professor/publications`,
  publicationsById: (id) => `${API_BASE_URL}/api/professor/publications/${id}`,

  patents: `${API_BASE_URL}/api/professor/patents`,
  patentsById: (id) => `${API_BASE_URL}/api/professor/patents/${id}`,

  fellowship: `${API_BASE_URL}/api/professor/fellowship`,
  fellowshipById: (id) => `${API_BASE_URL}/api/professor/fellowship/${id}`,

  books: `${API_BASE_URL}/api/professor/books`,
  booksById: (id) => `${API_BASE_URL}/api/professor/books/${id}`,

  researchGuidance: `${API_BASE_URL}/api/professor/research-guidance`,
  researchGuidanceById: (id) => `${API_BASE_URL}/api/professor/research-guidance/${id}`,

  projectConsultancy: `${API_BASE_URL}/api/professor/project-consultancy`,
  projectConsultancyById: (id) => `${API_BASE_URL}/api/professor/project-consultancy/${id}`,

  eEducation: `${API_BASE_URL}/api/professor/e-education`,
  eEducationById: (id) => `${API_BASE_URL}/api/professor/e-education/${id}`,

  conferenceWorkshop: `${API_BASE_URL}/api/professor/conference-seminar-workshop`,
  conferenceWorkshopById: (id) => `${API_BASE_URL}/api/professor/conference-seminar-workshop/${id}`,

  participation: `${API_BASE_URL}/api/professor/participation-collaboration`,
  participationById: (id) => `${API_BASE_URL}/api/professor/participation-collaboration/${id}`,

  programme: `${API_BASE_URL}/api/professor/programme`,
  programmeById: (id) => `${API_BASE_URL}/api/professor/programme/${id}`,

  training: `${API_BASE_URL}/api/professor/training`,
  trainingById: (id) => `${API_BASE_URL}/api/professor/training/${id}`,

  faculty: `${API_BASE_URL}/api/professor/faculty`,
  mou: `${API_BASE_URL}/api/professor/mou`,
  mouById: (id) => `${API_BASE_URL}/api/professor/mou/${id}`,
};

export default API_BASE_URL;