import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { DataRefreshProvider } from './hooks/useDataRefresh';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import Profile from './components/Profile';
import Faculty from './components/Faculty';
import Publications from './components/Publications';
import Patents from './components/Patents';
import Books from './components/Books';
import ResearchGuidanceStudents from './components/ResearchGuidanceStudents';
import ProjectConsultancy from './components/ProjectConsultancy';
import EEducation from './components/EEducation';
import ConferenceSeminarWorkshop from './components/ConferenceSeminarWorkshop';
import ParticipationCollaboration from './components/ParticipationCollaboration';
import Programme from './components/Programme';
import Experience from './components/Experience';
import Fellowship from './components/Fellowship';
import Training from './components/Training';
import MOU from './components/MOU';
import AccessRequests from './components/AccessRequests';
import RequestPublications from './components/RequestPublications';
import Report from './components/Report';
import FacultyImporter from './components/FacultyImporter';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DataRefreshProvider>
      <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path='/profile'  element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path='/profile/:professorId'  element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path='/faculty'  element={
          <ProtectedRoute>
            <Faculty />
          </ProtectedRoute>
        } />
        <Route path='/publications'  element={
          <ProtectedRoute>
            <Publications />
          </ProtectedRoute>
        } />
        <Route path='/patents'  element={
          <ProtectedRoute>
            <Patents />
          </ProtectedRoute>
        } />
        <Route path='/fellowship'  element={
          <ProtectedRoute>
            <Fellowship />
          </ProtectedRoute>
        } />
        <Route path='/books'  element={
          <ProtectedRoute>
            <Books />
          </ProtectedRoute>
        } />
        <Route path='/research-guidance'  element={
          <ProtectedRoute>
            <ResearchGuidanceStudents />
          </ProtectedRoute>
        } />
        <Route path='/project-consultancy'  element={
          <ProtectedRoute>
            <ProjectConsultancy />
          </ProtectedRoute>
        } />
        <Route path='/e-education'  element={
          <ProtectedRoute>
            <EEducation />
          </ProtectedRoute>
        } />
        <Route path='/conference-seminar-workshop'  element={
          <ProtectedRoute>
            <ConferenceSeminarWorkshop />
          </ProtectedRoute>
        } />
        <Route path='/participation-collaboration'  element={
          <ProtectedRoute>
            <ParticipationCollaboration />
          </ProtectedRoute>
        } />
        <Route path='/programme'  element={
          <ProtectedRoute>
            <Programme />
          </ProtectedRoute>
        } />
        <Route path='/experience'  element={
          <ProtectedRoute>
            <Experience />
          </ProtectedRoute>
        } />
        <Route path='/training'  element={
          <ProtectedRoute>
            <Training />
          </ProtectedRoute>
        } />
        <Route path='/mou'  element={
          <ProtectedRoute>
            <MOU />
          </ProtectedRoute>
        } />
        <Route path='/access-requests'  element={
          <ProtectedRoute>
            <AccessRequests />
          </ProtectedRoute>
        } />
        <Route path='/request-publications/:facultyId'  element={
          <ProtectedRoute>
            <RequestPublications />
          </ProtectedRoute>
        } />
        <Route path='/report'  element={
          <ProtectedRoute>
            <Report />
          </ProtectedRoute>
        } />
        <Route path='/faculty-importer'  element={
          <ProtectedRoute>
            <FacultyImporter />
          </ProtectedRoute>
        } />

        <Route path='*' element={<Login />} />
        <Route path='/' element={<Login />} />
      </Routes>
      </Router>
    </DataRefreshProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
