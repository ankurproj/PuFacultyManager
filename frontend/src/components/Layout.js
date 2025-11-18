import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import RefreshNotification from './RefreshNotification';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userRole, setUserRole] = useState('faculty'); // Default to faculty
  const navigate = useNavigate();

  useEffect(() => {
    // Get user role from token or localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role || 'faculty');
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else if (user) {
      try {
        const userInfo = JSON.parse(user);
        setUserRole(userInfo.role || 'faculty');
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Base menu items available to all users
  const baseMenuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Profile', path: '/profile', icon: '👤' },
    { label: 'Experience', path: '/experience', icon: '💼' },
    { label: 'Faculty', path: '/faculty', icon: '👥' },
    { label: 'Faculty Importer', path: '/faculty-importer', icon: '📥' },
    { label: 'Publications', path: '/publications', icon: '📄' },
    { label: 'Access Requests', path: '/access-requests', icon: '🔐' },
    { label: 'Patents', path: '/patents', icon: '💡' },
    { label: 'Fellowship', path: '/fellowship', icon: '🏆' },
    { label: 'Training & Consultancy', path: '/training', icon: '💰' },
    { label: 'MOU & Collaborations', path: '/mou', icon: '🤝' },
    { label: 'Books', path: '/books', icon: '📚' },
    { label: 'Research Guidance', path: '/research-guidance', icon: '👨‍🎓' },
    { label: 'Project & Consultancy', path: '/project-consultancy', icon: '🚀' },
    { label: 'E-Education', path: '/e-education', icon: '💻' },
    { label: 'Conference/ Seminar/ Workshop', path: '/conference-seminar-workshop', icon: '🎤' },
    { label: 'Participation & Collaboration', path: '/participation-collaboration', icon: '🤝' },
    { label: 'Programme Details', path: '/programme', icon: '📋' }
  ];

  // HOD-specific menu items
  const hodMenuItems = [
    // Faculty directory is available in the base menu for all users
  ];

  // Filter menu items based on user role
  const menuItems = userRole === 'hod'
    ? [...baseMenuItems, ...hodMenuItems]
    : baseMenuItems;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(134, 133, 133, 0.3)',
            zIndex: 998
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '90px',
        background: 'linear-gradient(180deg, #6093ecff 0%, #1a202c 100%)',
        color: '#fff',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 999,
        boxShadow: sidebarOpen ? '4px 0 20px rgba(0,0,0,0.15)' : '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center'
        }}>
          {sidebarOpen && (
            <h3 style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'white'
            }}>
              Dashboard
            </h3>
          )}

          {/* Enhanced Burger Menu */}
          <div
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              background: sidebarOpen ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <div style={{
              width: '24px',
              height: '4px',
              background: '#fff',
              margin: '4px 0',
              borderRadius: '2px',
            }} />
            <div style={{
              width: '24px',
              height: '4px',
              background: '#fff',
              margin: '4px 0',
              borderRadius: '2px',
            }} />
            <div style={{
              width: '24px',
              height: '4px',
              background: '#fff',
              margin: '4px 0',
              borderRadius: '2px',
            }} />
          </div>
        </div>

        {/* Navigation Menu */}
        <div
          className="sidebar-menu-scroll"
          style={{
            flex: 1,
            padding: '5px 0',
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: '0', // Allow flex shrinking
            height: 'calc(100vh - 180px)', // Fixed height to ensure scrolling works
          }}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
              .sidebar-menu-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .sidebar-menu-scroll::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.1);
                border-radius: 3px;
              }
              .sidebar-menu-scroll::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.3);
                border-radius: 3px;
              }
              .sidebar-menu-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.5);
              }
              .sidebar-menu-scroll {
                scrollbar-width: thin;
                scrollbar-color: rgba(255,255,255,0.3) transparent;
              }
            `
          }} />
          {menuItems.map((item, index) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: sidebarOpen ? '5px 24px' : '5px 15px',
                margin: '8px 16px',
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                background: window.location.pathname === item.path
                  ? 'rgba(255,255,255,0.2)'
                  : hoveredItem === index
                    ? 'rgba(255,255,255,0.1)'
                    : 'transparent',
                transform: hoveredItem === index ? 'translateX(4px)' : 'translateX(0)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => navigate(item.path)}
              onMouseEnter={() => {
                if (window.location.pathname !== item.path) {
                  setHoveredItem(index);
                }
              }}
              onMouseLeave={() => {
                setHoveredItem(null);
              }}
            >
              <span
                style={{
                  fontSize: '1.5rem',
                  marginRight: sidebarOpen ? '16px' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: hoveredItem === index ? 'scale(1.2)' : 'scale(1)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(item.path);
                }}
                title={item.label}
              >
                {item.icon}
              </span>
              {sidebarOpen && (
                <span style={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  opacity: 0.9
                }}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div style={{ padding: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: sidebarOpen ? '12px 20px' : '12px',
              cursor: 'pointer',
              borderRadius: '12px',
              background: hoveredItem === 'logout' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
              border: hoveredItem === 'logout' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s ease',
              justifyContent: sidebarOpen ? 'flex-start' : 'center'
            }}
            onClick={handleLogout}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span style={{ fontSize: '1.2rem', marginRight: sidebarOpen ? '12px' : '0' }}>➜</span>
            {sidebarOpen && (
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#ef4444' }}>
                Logout
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '90px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Dashboard Icon - Top Right Corner */}
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            cursor: 'pointer',
            color: '#fff',
            borderRadius: '50%',
            border: '2px solid #929294ff',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(19, 19, 19, 0.3)',
            transition: 'all 0.3s ease',
            fontSize: '1.5rem'
          }}
          onClick={() => navigate('/dashboard')}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 25px rgba(96, 147, 236, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(96, 147, 236, 0.3)';
          }}
          title="Go to Dashboard"
        >
          🏠
        </div>

        {children}
      </div>

      {/* Refresh Notification */}
      <RefreshNotification />
    </div>
  );
}

export default Layout;