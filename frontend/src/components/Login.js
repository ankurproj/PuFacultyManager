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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `url(${bgImage}) center/cover no-repeat` }}>
            <div className='header-logo' style={{ position: 'absolute', top: '20px', left: '20px' }}>
                <img src={PU} alt="PU Logo" style={{ width: '120px', height: '110px', marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
            </div>
            <div style={{ display: 'flex', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', borderRadius: '16px', overflow: 'hidden', background: '#fff', width: '900px', height: '620px', maxWidth: '95%' }}>
                {/* Left Side - Branding */}
                <div style={{ flex: 1, background: 'linear-gradient(120deg, #787af7ff 60%, #818cf8 100%)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 30px' }}>
                    <img src={FacultyIcon} style={{ width: '200px', height: '200px', marginBottom: '20px', borderRadius: '12px' }} alt="Faculty Icon" />
                    <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: '8px' }}>Faculty Login</h2>
                </div>
                {/* Right Side - Form */}
                <div style={{ flex: 1.2, padding: '20px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p style={{ fontSize: '2.1rem', opacity: 0.9, fontFamily: 'unset', fontWeight: 600, marginTop: '20px', marginBottom: '10px' }}>Pondicherry University</p>
                    <p style={{ fontSize: '1rem', opacity: 0.7 }}>
                        Login to access your dashboard and manage your publications
                    </p>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ fontWeight: 500, fontSize: '1rem' }}>Email</label>
                        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                        <label style={{ fontWeight: 500 }}>Password</label>
                        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                        <button type="submit" style={{ background: 'linear-gradient(90deg, #6366f1 60%, #818cf8 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 600, fontSize: '1.1rem', marginTop: '10px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.10)' }}>Login</button>
                    </form>
                    <p style={{ color: '#ef4444', marginTop: '8px', fontWeight: 500 }}>{message}</p>
                    <div style={{ marginTop: '18px', textAlign: 'center' }}>
                        Don't have an account? <Link to="/signup" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
        // <div>
        //     <p>Pondicherry University</p>
        //     <form onSubmit={handleSubmit}>
        //         <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required /><br />
        //         <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required /><br />
        //         <button type="submit">Login</button>
        //     </form>
        //     <div>
        //         Don't have an account? <Link to="/signup">Signup</Link>
        //     </div>
        //     <p>{message}</p>
        // </div>
    );
}

export default Login;