import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/pondicherry-university-banner.jpg';
import PU from '../assets/PU.png';
import FacultyIcon from '../assets/faculty.png';
import { API_ENDPOINTS } from '../config/api';


function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(API_ENDPOINTS.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            console.log(data);
            if (data.token) {
                localStorage.setItem('token', data.token);
                // Store user info including role
                localStorage.setItem('user', JSON.stringify({
                    id: data.result._id,
                    name: data.result.name,
                    email: data.result.email,
                    role: data.result.role
                }));
                navigate('/dashboard'); // Redirect to dashboard or another page
            } else {
                setMessage(data.message || 'Login failed');
            }
        } catch (err) {
            setMessage('Login failed');
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
                    @keyframes shimmer {
                        0% { background-position: -1000px 0; }
                        100% { background-position: 1000px 0; }
                    }
                    .login-container {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 20px;
                        position: relative;
                        overflow: hidden;
                    }
                    .login-container::before {
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
                    .login-box {
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
                    .login-branding {
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
                    .login-branding::before {
                        content: '';
                        position: absolute;
                        top: -50%;
                        left: -50%;
                        width: 200%;
                        height: 200%;
                        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                        animation: float 6s ease-in-out infinite;
                    }
                    .login-branding img {
                        position: relative;
                        z-index: 1;
                    }
                    .login-form-container {
                        flex: 1.3;
                        padding: 40px 50px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        background: #ffffff;
                    }
                    .header-logo {
                        position: absolute;
                        top: 30px;
                        left: 30px;
                        z-index: 10;
                        animation: fadeInUp 0.8s ease-out 0.2s both;
                    }
                    .header-logo img {
                        width: 90px;
                        height: 85px;
                        border-radius: 16px;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                        background: white;
                        padding: 8px;
                        transition: transform 0.3s ease;
                    }
                    .header-logo img:hover {
                        transform: scale(1.05);
                    }
                    .login-input {
                        padding: 12px 14px;
                        border-radius: 12px;
                        border: 2px solid #e5e7eb;
                        fontSize: 0.9rem;
                        transition: all 0.3s ease;
                        background: #f9fafb;
                    }
                    .login-input:focus {
                        outline: none;
                        border-color: #667eea;
                        background: #ffffff;
                        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
                    }
                    .login-btn {
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
                        position: relative;
                        overflow: hidden;
                    }
                    .login-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
                    }
                    .login-btn:active {
                        transform: translateY(0);
                    }
                    @media (max-width: 768px) {
                        .login-container {
                            padding: 10px;
                        }
                        .login-box {
                            flex-direction: column;
                            width: 100%;
                            max-width: 500px;
                            border-radius: 20px;
                        }
                        .login-branding {
                            padding: 25px 20px 20px 20px;
                        }
                        .login-branding img {
                            width: 100px !important;
                            height: 100px !important;
                            margin-bottom: 16px !important;
                        }
                        .login-branding h2 {
                            font-size: 1.4rem !important;
                            margin-bottom: 0 !important;
                        }
                        .login-branding p {
                            display: none;
                        }
                        .login-form-container {
                            padding: 25px 20px 30px 20px;
                        }
                        .login-form-container > div:first-child {
                            margin-bottom: 12px !important;
                        }
                        .login-form-container > div:first-child h1 {
                            font-size: 1.6rem !important;
                            margin-bottom: 4px !important;
                        }
                        .login-form-container > div:first-child p {
                            font-size: 0.9rem !important;
                        }
                        .login-form-container form {
                            margin-top: 12px !important;
                            gap: 10px !important;
                        }
                        .login-input {
                            width: 100% !important;
                            box-sizing: border-box;
                        }
                        .header-logo {
                            top: 12px;
                            left: 12px;
                        }
                        .header-logo img {
                            width: 55px !important;
                            height: 52px !important;
                        }
                    }
                    @media (max-width: 480px) {
                        .login-form-container {
                            padding: 20px 18px 25px 18px;
                        }
                        .login-form-container > div:first-child h1 {
                            font-size: 1.4rem !important;
                        }
                        .login-branding {
                            padding: 20px 18px 18px 18px;
                        }
                        .login-branding img {
                            width: 90px !important;
                            height: 90px !important;
                            margin-bottom: 12px !important;
                        }
                        .login-branding h2 {
                            font-size: 1.3rem !important;
                        }
                    }
                `
            }} />
            <div className="login-container">
                <div className='header-logo'>
                    <img src={PU} alt="PU Logo" />
                </div>
                <div className="login-box">
                    {/* Left Side - Branding */}
                    <div className="login-branding">
                        <img src={FacultyIcon} style={{ width: '180px', height: '180px', marginBottom: '32px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', animation: 'float 3s ease-in-out infinite' }} alt="Faculty Icon" />
                        <h2 style={{ fontWeight: 700, fontSize: '2.2rem', marginBottom: '12px', textShadow: '0 2px 10px rgba(0,0,0,0.2)', zIndex: 1 }}>Faculty Portal</h2>
                        <p style={{ fontSize: '1rem', opacity: 0.95, textAlign: 'center', lineHeight: '1.6', maxWidth: '300px', zIndex: 1 }}>Pondicherry University's comprehensive platform for managing faculty publications and profiles</p>
                    </div>
                    {/* Right Side - Form */}
                    <div className="login-form-container">
                        <div style={{ marginBottom: '12px' }}>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>Welcome Back</h1>
                            <p style={{ fontSize: '1.05rem', color: '#6b7280', marginTop: '0' }}>
                                Sign in to access your dashboard
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '6px' }}>Email Address</label>
                                <input 
                                    className="login-input"
                                    name="email" 
                                    type="email" 
                                    placeholder="your.email@pondiuni.ac.in" 
                                    value={form.email} 
                                    onChange={handleChange} 
                                    required
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '6px' }}>Password</label>
                                <input 
                                    className="login-input"
                                    name="password" 
                                    type="password" 
                                    placeholder="Enter your password" 
                                    value={form.password} 
                                    onChange={handleChange} 
                                    required
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                            <button type="submit" className="login-btn">Sign In</button>
                        </form>
                        {message && (
                            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginTop: '16px', fontSize: '0.9rem', fontWeight: 500 }}>
                                {message}
                            </div>
                        )}
                        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.95rem', color: '#6b7280' }}>
                            Don't have an account? <Link to="/signup" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#764ba2'} onMouseLeave={(e) => e.target.style.color = '#667eea'}>Create Account</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;