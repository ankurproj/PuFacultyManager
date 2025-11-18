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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `url(${bgImage}) center/cover no-repeat` }}>
            <div class='header-logo' style={{ position: 'absolute', top: '20px', left: '20px' }}>
                <img src={PU} alt="PU Logo" style={{ width: '120px', height: '110px', marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
            </div>
            <div style={{ display: 'flex', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', borderRadius: '16px', overflow: 'hidden', background: '#fff', width: '900px', maxWidth: '95%' }}>
                <div style={{ flex: 1.2, padding: '10px 50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p style={{ marginBottom: '0px', marginTop: '30px', fontSize: '2.1rem', opacity: 0.9, fontFamily: 'unset', fontWeight: 600}}>Pondicherry University</p>
                    <p style={{ marginTop: '0px', fontSize: '0.9rem', opacity: 0.7 }}>Join the platform to manage your publications and profile</p>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 500 }}>Name</label>
                        <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                        <label style={{ fontWeight: 500 }}>Role</label>
                        <select name="role" value={form.role} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#fff' }}>
                            <option value="faculty">Faculty Member</option>
                            <option value="guest_faculty">Guest Faculty</option>
                            <option value="dean">Dean of Department</option>
                            <option value="hod">Head of Department (HOD)</option>
                        </select>
                        <label style={{ fontWeight: 500 }}>Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="Email (e.g., @pondiuni.ac.in)"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={{
                                padding: '10px',
                                borderRadius: '8px',
                                border: `1px solid ${form.email && !validateEmail(form.email) ? '#ef4444' : '#cbd5e1'}`,
                                fontSize: '0.9rem'
                            }}
                        />
                        {form.email && !validateEmail(form.email) && (
                            <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '2px' }}>
                                Please use a university email (@pondiuni.ac.in)
                            </span>
                        )}
                        <label style={{ fontWeight: 500 }}>Password</label>
                        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                        <label style={{ fontWeight: 500 }}>Confirm Password</label>
                        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                        <button type="submit" style={{ background: 'linear-gradient(90deg, #6366f1 60%, #818cf8 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 600, fontSize: '1.1rem', marginTop: '10px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.10)' }}>Signup</button>
                    </form>
                    <div style={{ margin: '15px', marginBottom: '15px', textAlign: 'center' }}>
                        Already have an account? <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
                    </div>
                </div>
                {/* Left Side - Branding */}
                <div style={{ flex: 1, background: 'linear-gradient(120deg, #787af7ff 60%, #818cf8 100%)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 30px' }}>
                    <img src={FacultyIcon} alt="Faculty Icon" style={{ width: '200px', height: '200px', marginBottom: '20px', borderRadius: '12px' }}></img>
                    <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: '8px' }}>
                        {form.role === 'hod' ? 'HOD Signup' : 'Faculty Signup'}
                    </h2>
                    <p style={{ textAlign: 'center', opacity: 0.9, fontSize: '0.95rem' }}>
                        {form.role === 'hod'
                            ? 'Create your HOD account to manage faculty and approve submissions'
                            : 'Create your faculty account to manage publications and profile'
                        }
                    </p>
                </div>
                {/* Right Side - Form */}
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
        </div>
    );
}

export default Signup;