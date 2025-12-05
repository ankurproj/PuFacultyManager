import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PU from '../assets/PU.png';
import bgImage from '../assets/pondicherry-university-banner.jpg';
import FacultyIcon from '../assets/faculty.png';
import { API_ENDPOINTS } from '../config/api';

function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'faculty' });
    const [message, setMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [countdown, setCountdown] = useState(3);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validateEmail = (email) => {
        const universityDomains = ['@pondiuni.ac.in'];
        return universityDomains.some(domain => email.toLowerCase().endsWith(domain));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        if (!validateEmail(form.email)) {
            setMessage('Please use a valid university email (e.g., @pondiuni.ac.in)');
            return;
        }
        try {
            const res = await fetch(API_ENDPOINTS.signup, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            console.log(res);
            const data = await res.json();
            console.log(data);

            if (res.ok) {
                setMessage('');
                setShowSuccessPopup(true);

                // Countdown timer for redirect
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            navigate('/login');
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setMessage(data.message || 'Signup failed');
            }
        } catch (err) {
            setMessage('Signup failed - Server error');
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    .signup-container {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 20px;
                        position: relative;
                        overflow: hidden;
                    }
                    .signup-container::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url(${bgImage}) center/cover no-repeat;
                        opacity: 0.15;
                        z-index: 0;
                    }
                    .signup-box {
                        display: flex;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        border-radius: 24px;
                        overflow: hidden;
                        background: rgba(255, 255, 255, 0.98);
                        backdrop-filter: blur(20px);
                        width: 950px;
                        max-width: 95%;
                        animation: fadeInUp 0.6s ease-out;
                        position: relative;
                        z-index: 1;
                        border: 1px solid rgba(255, 255, 255, 0.5);
                    }
                    .signup-form-container {
                        flex: 1.3;
                        padding: 40px 50px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        background: #ffffff;
                    }
                    .signup-branding {
                        flex: 1;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #fff;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 50px 40px;
                        position: relative;
                        overflow: hidden;
                    }
                    .signup-branding::before {
                        content: '';
                        position: absolute;
                        top: -50%;
                        left: -50%;
                        width: 200%;
                        height: 200%;
                        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                        animation: float 6s ease-in-out infinite;
                    }
                    .signup-branding img {
                        position: relative;
                        z-index: 1;
                    }
                    .header-logo-signup {
                        position: absolute;
                        top: 30px;
                        left: 30px;
                        z-index: 10;
                        animation: fadeInUp 0.8s ease-out 0.2s both;
                    }
                    .header-logo-signup img {
                        width: 90px;
                        height: 85px;
                        border-radius: 16px;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                        background: white;
                        padding: 8px;
                        transition: transform 0.3s ease;
                    }
                    .header-logo-signup img:hover {
                        transform: scale(1.05);
                    }
                    .signup-input {
                        padding: 12px 14px;
                        border-radius: 12px;
                        border: 2px solid #e5e7eb;
                        fontSize: 0.9rem;
                        transition: all 0.3s ease;
                        background: #f9fafb;
                    }
                    .signup-input:focus {
                        outline: none;
                        border-color: #667eea;
                        background: #ffffff;
                        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
                    }
                    .signup-btn {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #fff;
                        border: none;
                        border-radius: 12px;
                        padding: 14px;
                        font-weight: 600;
                        font-size: 1.05rem;
                        margin-top: 10px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    }
                    .signup-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
                    }
                    .signup-btn:active {
                        transform: translateY(0);
                    }
                    @media (max-width: 768px) {
                        .signup-container {
                            padding: 10px;
                            padding-top: 75px;
                        }
                        .signup-box {
                            flex-direction: column;
                            width: 100%;
                            max-width: 500px;
                            border-radius: 20px;
                            margin-top: 0;
                        }
                        .signup-branding {
                            padding: 25px 20px 20px 20px;
                            order: -1;
                        }
                        .signup-branding img {
                            width: 100px !important;
                            height: 100px !important;
                            margin-bottom: 16px !important;
                        }
                        .signup-branding h2 {
                            font-size: 1.4rem !important;
                            margin-bottom: 0 !important;
                        }
                        .signup-branding p {
                            display: none;
                        }
                        .signup-form-container {
                            padding: 25px 20px 30px 20px;
                        }
                        .signup-form-container > div:first-child {
                            margin-bottom: 12px !important;
                        }
                        .signup-form-container > div:first-child h1 {
                            font-size: 1.6rem !important;
                            margin-bottom: 4px !important;
                        }
                        .signup-form-container > div:first-child p {
                            font-size: 0.9rem !important;
                        }
                        .signup-form-container form {
                            margin-top: 12px !important;
                            gap: 10px !important;
                        }
                        .signup-input {
                            width: 100% !important;
                            box-sizing: border-box;
                        }
                        .header-logo-signup {
                            top: 12px;
                            left: 12px;
                        }
                        .header-logo-signup img {
                            width: 55px !important;
                            height: 52px !important;
                        }
                    }
                    @media (max-width: 480px) {
                        .signup-container {
                            padding-top: 70px;
                        }
                        .signup-form-container {
                            padding: 20px 18px 25px 18px;
                        }
                        .signup-form-container > div:first-child h1 {
                            font-size: 1.4rem !important;
                        }
                        .signup-branding {
                            padding: 20px 18px 18px 18px;
                        }
                        .signup-branding img {
                            width: 90px !important;
                            height: 90px !important;
                            margin-bottom: 12px !important;
                        }
                        .signup-branding h2 {
                            font-size: 1.3rem !important;
                        }
                    }
                `
            }} />
            <div className="signup-container">
                <div className='header-logo-signup'>
                    <img src={PU} alt="PU Logo" />
                </div>
                <div className="signup-box">
                    <div className="signup-branding">
                        <img src={FacultyIcon} alt="Faculty Icon" style={{ width: '180px', height: '180px', marginBottom: '32px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', animation: 'float 3s ease-in-out infinite' }}></img>
                        <h2 style={{ fontWeight: 700, fontSize: '2.2rem', marginBottom: '12px', textShadow: '0 2px 10px rgba(0,0,0,0.2)', zIndex: 1 }}>
                            {form.role === 'hod' ? 'HOD Registration' : 'Faculty Registration'}
                        </h2>
                        <p style={{ textAlign: 'center', fontSize: '1rem', opacity: 0.95, lineHeight: '1.6', maxWidth: '300px', zIndex: 1 }}>
                            {form.role === 'hod'
                                ? 'Register as Head of Department to manage faculty profiles and approve department publications'
                                : 'Join our platform to manage your publications, research, and academic profile'
                            }
                        </p>
                    </div>
                    <div className="signup-form-container">
                        <div style={{ marginBottom: '12px' }}>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>Create Account</h1>
                            <p style={{ fontSize: '1.05rem', color: '#6b7280', marginTop: '0' }}>
                                Join Pondicherry University's Faculty Platform
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '6px' }}>Full Name</label>
                                <input className="signup-input" name="name" type="text" placeholder="Enter your full name" value={form.name} onChange={handleChange} required style={{ width: '100%', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '6px' }}>Role</label>
                                <select className="signup-input" name="role" value={form.role} onChange={handleChange} required style={{ cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
                                    <option value="faculty">Faculty Member</option>
                                    <option value="guest_faculty">Guest Faculty</option>
                                    <option value="dean">Dean of Department</option>
                                    <option value="hod">Head of Department (HOD)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '6px' }}>University Email</label>
                                <input
                                    className="signup-input"
                                    name="email"
                                    type="email"
                                    placeholder="your.email@pondiuni.ac.in"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        borderColor: form.email && !validateEmail(form.email) ? '#ef4444' : '#e5e7eb',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {form.email && !validateEmail(form.email) && (
                                    <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                                        ⚠️ Please use a university email (@pondiuni.ac.in)
                                    </span>
                                )}
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '6px' }}>Password</label>
                                <input className="signup-input" name="password" type="password" placeholder="Create a strong password" value={form.password} onChange={handleChange} required style={{ width: '100%', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
                                <input className="signup-input" name="confirmPassword" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} required style={{ width: '100%', boxSizing: 'border-box' }} />
                            </div>
                            <button type="submit" className="signup-btn">Create Account</button>
                        </form>
                        {message && (
                            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginTop: '16px', fontSize: '0.9rem', fontWeight: 500 }}>
                                {message}
                            </div>
                        )}
                        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.95rem', color: '#6b7280' }}>
                            Already have an account? <Link to="/login" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#764ba2'} onMouseLeave={(e) => e.target.style.color = '#667eea'}>Sign In</Link>
                        </div>
                    </div>
                    {/* Right Side - Branding */}
                    
                </div>
            </div>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '20px',
                        padding: '40px 50px',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        transform: 'scale(1)',
                        animation: 'popupFadeIn 0.3s ease-out',
                        maxWidth: '450px',
                        width: '90%'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            animation: 'checkmarkBounce 0.6s ease-out 0.2s both'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                        </div>

                        <h2 style={{
                            fontSize: '1.8rem',
                            fontWeight: 700,
                            color: '#1f2937',
                            margin: '0 0 15px 0'
                        }}>
                            Signup Successful! 🎉
                        </h2>

                        <p style={{
                            fontSize: '1.1rem',
                            color: '#6b7280',
                            margin: '0 0 25px 0',
                            lineHeight: '1.5'
                        }}>
                            Welcome to the Pondicherry University Faculty Publication Platform!
                        </p>

                        <div style={{
                            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                            borderRadius: '12px',
                            padding: '20px',
                            margin: '20px 0'
                        }}>
                            <p style={{
                                fontSize: '1rem',
                                color: '#374151',
                                margin: '0 0 10px 0',
                                fontWeight: 600
                            }}>
                                Redirecting to Login Page...
                            </p>

                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 700,
                                color: '#6366f1',
                                margin: '10px 0'
                            }}>
                                {countdown}
                            </div>

                            <div style={{
                                width: '100%',
                                height: '4px',
                                background: '#e5e7eb',
                                borderRadius: '2px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                                    borderRadius: '2px',
                                    animation: `progressBar ${countdown}s linear`,
                                    transformOrigin: 'left'
                                }}></div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                            }}
                        >
                            Go to Login Now
                        </button>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes popupFadeIn {
                        from {
                            opacity: 0;
                            transform: scale(0.8) translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }

                    @keyframes checkmarkBounce {
                        from {
                            opacity: 0;
                            transform: scale(0);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1.2);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    @keyframes progressBar {
                        from {
                            transform: scaleX(1);
                        }
                        to {
                            transform: scaleX(0);
                        }
                    }
                `
            }} />
        </>
    );
}

export default Signup;