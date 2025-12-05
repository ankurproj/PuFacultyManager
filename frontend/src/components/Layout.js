import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import RefreshNotification from './RefreshNotification';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('sidebarOpen');
      return stored === null ? false : stored === 'true';
    } catch (e) {
      return false;
    }
  });
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userRole, setUserRole] = useState('faculty'); // Default to faculty
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Persist sidebar open/close state so it survives route changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebarOpen', sidebarOpen ? 'true' : 'false');
    } catch (e) {
      // ignore persistence errors
    }
  }, [sidebarOpen]);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Close sidebar on mobile when resizing
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

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
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', background: '#f3f4f6' }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 39,
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)'
          }}
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: isMobile ? '270px' : (sidebarOpen ? '270px' : '88px'),
        background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 35%, #e5e7eb 100%)',
        color: '#111827',
        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 40,
        borderRight: '1px solid rgba(148,163,184,0.35)',
        boxShadow: '0 0 0 1px rgba(148,163,184,0.4), 10px 0 25px rgba(148,163,184,0.45)',
        left: isMobile ? (sidebarOpen ? '0' : '-270px') : '0',
        transform: isMobile ? 'none' : 'translateX(0)'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 18px 14px 18px',
          borderBottom: '1px solid rgba(148,163,184,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          gap: '10px'
        }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '12px',
                background: 'radial-gradient(circle at 30% 20%, #3b82f6 0, transparent 40%), radial-gradient(circle at 80% 0, #22c55e 0, transparent 40%), radial-gradient(circle at 0 100%, #f97316 0, transparent 55%)',
                boxShadow: '0 6px 18px rgba(148,163,184,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                color: '#ffffff'
              }}>
                PU
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280' }}>Faculty Manager</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Control Center</div>
              </div>
            </div>
          )}

          {/* Glow Burger */}
          <div
            style={{
              cursor: 'pointer',
              padding: '7px 8px',
              borderRadius: '999px',
              transition: 'all 0.18s ease',
              background: sidebarOpen ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(148,163,184,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: sidebarOpen
                ? '0 0 0 1px rgba(148,163,184,0.4), 0 0 20px rgba(59,130,246,0.6)'
                : '0 0 0 1px rgba(15,23,42,0.8)'
            }}
            onClick={() => setSidebarOpen(prev => !prev)}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(1px)',
              transition: 'transform 0.18s ease'
            }}>
              <span style={{
                width: '18px',
                height: '2px',
                borderRadius: '999px',
                background: '#111827',
                boxShadow: '0 0 4px rgba(148,163,184,0.7)'
              }} />
              <span style={{
                width: '14px',
                height: '2px',
                borderRadius: '999px',
                background: '#4b5563',
                opacity: 0.85
              }} />
              <span style={{
                width: '10px',
                height: '2px',
                borderRadius: '999px',
                background: '#9ca3af',
                opacity: 0.7
              }} />
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div
          className="sidebar-menu-scroll"
          style={{
            flex: 1,
            padding: '8px 0 6px 0',
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: '0', // Allow flex shrinking
            height: 'calc(100vh - 168px)', // Fixed height to ensure scrolling works
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
                scrollbar-color: rgba(148,163,184,0.8) transparent;
              }
            `
          }} />
          {menuItems.map((item, index) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: sidebarOpen ? '7px 18px' : '7px 14px',
                margin: '4px 10px',
                cursor: 'pointer',
                borderRadius: '10px',
                transition: 'all 0.18s ease',
                background: location.pathname === item.path
                  ? 'linear-gradient(90deg, rgba(59,130,246,0.96), rgba(96,165,250,0.95))'
                  : hoveredItem === index
                    ? 'rgba(209,213,219,0.85)'
                    : 'transparent',
                transform: hoveredItem === index || location.pathname === item.path ? 'translateX(5px)' : 'translateX(0)',
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
                  fontSize: '1.35rem',
                  marginRight: sidebarOpen ? '14px' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  transform: hoveredItem === index ? 'scale(1.14)' : 'scale(1)'
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
                  fontSize: '0.95rem',
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  letterSpacing: '0.02em',
                  color: location.pathname === item.path ? '#111827' : '#374151'
                }}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div style={{ padding: '14px 18px 18px 18px', borderTop: '1px solid rgba(148,163,184,0.35)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: sidebarOpen ? '10px 16px' : '10px',
              cursor: 'pointer',
              borderRadius: '999px',
              background: hoveredItem === 'logout' ? 'rgba(248, 113, 113, 0.18)' : 'rgba(248, 250, 252, 0.9)',
              border: hoveredItem === 'logout' ? '1px solid rgba(185, 28, 28, 0.8)' : '1px solid rgba(209,213,219,0.9)',
              transition: 'all 0.18s ease',
              justifyContent: sidebarOpen ? 'flex-start' : 'center'
            }}
            onClick={handleLogout}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span style={{ fontSize: '1.1rem', marginRight: sidebarOpen ? '10px' : '0', color: hoveredItem === 'logout' ? '#b91c1c' : '#6b7280' }}>⏻</span>
            {sidebarOpen && (
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: hoveredItem === 'logout' ? '#b91c1c' : '#374151', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Logout
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? '0' : (sidebarOpen ? '270px' : '88px'),
        transition: 'margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        position: 'relative',
        background: 'radial-gradient(circle at top, rgba(191,219,254,0.7) 0, transparent 50%), radial-gradient(circle at bottom, rgba(229,231,235,0.8) 0, transparent 55%)',
        color: '#111827',
        paddingTop: isMobile ? '60px' : '0'
      }}>
        {/* Mobile Hamburger Button - Top Left Corner */}
        {isMobile && (
          <div
            style={{
              position: 'fixed',
              top: '15px',
              left: '15px',
              zIndex: 30,
              cursor: 'pointer',
              color: '#111827',
              borderRadius: '12px',
              border: '1px solid rgba(148,163,184,0.8)',
              width: '45px',
              height: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease',
              background: 'rgba(255,255,255,0.95)'
            }}
            onClick={() => setSidebarOpen(prev => !prev)}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{
                width: '20px',
                height: '2.5px',
                borderRadius: '999px',
                background: '#111827'
              }} />
              <span style={{
                width: '20px',
                height: '2.5px',
                borderRadius: '999px',
                background: '#111827'
              }} />
              <span style={{
                width: '20px',
                height: '2.5px',
                borderRadius: '999px',
                background: '#111827'
              }} />
            </div>
          </div>
        )}

        {/* Dashboard Icon - Top Right Corner */}
        {!isMobile && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 1000,
              cursor: 'pointer',
              color: '#fff',
              borderRadius: '999px',
              border: '1px solid rgba(148,163,184,0.8)',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 1px rgba(148,163,184,0.6), 0 14px 30px rgba(148,163,184,0.6)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              transition: 'all 0.22s ease',
              fontSize: '1.4rem',
              background: 'radial-gradient(circle at 30% 0, rgba(239,246,255,0.95), transparent 55%), rgba(255,255,255,0.95)'
            }}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.9), 0 18px 40px rgba(148,163,184,0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.6), 0 14px 30px rgba(148,163,184,0.6)';
            }}
            title="Go to Dashboard"
          >
            🏠
          </div>
        )}

        {children}
      </div>

      {/* Refresh Notification */}
      <RefreshNotification />
    </div>
  );
}

export default Layout;