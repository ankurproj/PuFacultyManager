import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Layout from './Layout';
import LoadingSpinner from './LoadingSpinner';
import { useApiLoading } from '../hooks/useApiLoading';
import { getApiUrl } from '../config/api';

function AccessRequests() {
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('incoming');
    const [loading, setLoading] = useState(true);
    const { isLoading: apiLoading, executeWithLoading } = useApiLoading();

    useEffect(() => {
        fetchAccessRequests();
    }, []);

    const fetchAccessRequests = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setLoading(true);

            // Fetch incoming requests
            const incomingResponse = await fetch(
                getApiUrl('/api/access-requests/incoming'),
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (incomingResponse.ok) {
                const incomingData = await incomingResponse.json();
                setIncomingRequests(incomingData.access_requests || []);
            }

            // Fetch outgoing requests
            const outgoingResponse = await fetch(
                getApiUrl('/api/access-requests/outgoing'),
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (outgoingResponse.ok) {
                const outgoingData = await outgoingResponse.json();
                setOutgoingRequests(outgoingData.outgoing_access_requests || []);
            }

        } catch (error) {
            console.error('Error fetching access requests:', error);
            alert('Error fetching access requests');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestResponse = async (requestId, status, responseMessage = '') => {
        await executeWithLoading(async () => {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch(
                getApiUrl(`/api/access-request/${requestId}/respond`),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status,
                        response_message: responseMessage
                    })
                }
            );

            if (response.ok) {
                alert(`Request ${status} successfully!`);
                fetchAccessRequests(); // Refresh the list
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error processing request');
            }
        }, {
            successMessage: `Request ${status} successfully!`,
            errorMessage: 'Error processing request'
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px' },
            approved: { backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px' },
            rejected: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px' }
        };
        return <span style={styles[status]}>{status.toUpperCase()}</span>;
    };

    if (loading) {
        return <LoadingSpinner message="Loading access requests..." />;
    }

    return (
        <>
            {apiLoading && <LoadingSpinner message="Processing request..." />}
            <Layout>
                <div style={{
                    minHeight: '100vh',
                    padding: '40px 20px'
                }}>
                    <div style={{
                        padding: '10px 30px 30px'
                    }}>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            marginBottom: '10px',
                            marginTop: '0px'
                        }}>
                            Publication Access Requests
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        marginBottom: '40px',
                        opacity: 0.8,
                        marginTop: '0px'
                    }}>
                        Manage incoming requests for your publications and track your outgoing requests to other faculty members.
                    </p>

                    {/* Tab Navigation */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '20px',
                        padding: '40px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            display: 'flex',
                            marginBottom: '30px',
                            borderBottom: '3px solid #f1f5f9'
                        }}>
                            <button
                                onClick={() => setActiveTab('incoming')}
                                style={{
                                    padding: '15px 30px',
                                    border: 'none',
                                    background: activeTab === 'incoming' ?
                                        'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                        'transparent',
                                    color: activeTab === 'incoming' ? '#fff' : '#6b7280',
                                    borderRadius: '12px 12px 0 0',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    marginRight: '5px',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    marginBottom: '-3px'
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== 'incoming') {
                                        e.target.style.background = '#f8f9fa';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== 'incoming') {
                                        e.target.style.background = 'transparent';
                                    }
                                }}
                            >
                                📥 Incoming Requests ({incomingRequests.filter(req => req.status === 'pending').length} pending)
                            </button>
                            <button
                                onClick={() => setActiveTab('outgoing')}
                                style={{
                                    padding: '15px 30px',
                                    border: 'none',
                                    background: activeTab === 'outgoing' ?
                                        'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
                                        'transparent',
                                    color: activeTab === 'outgoing' ? '#fff' : '#6b7280',
                                    borderRadius: '12px 12px 0 0',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    marginBottom: '-3px'
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== 'outgoing') {
                                        e.target.style.background = '#f8f9fa';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== 'outgoing') {
                                        e.target.style.background = 'transparent';
                                    }
                                }}
                            >
                                📤 My Requests ({outgoingRequests.length} total)
                            </button>
                        </div>

                        {/* Incoming Requests Tab */}
                        {activeTab === 'incoming' && (
                            <div>
                                <h3 style={{ marginBottom: '15px', color: '#374151' }}>
                                    Requests for Your Publications
                                </h3>
                                {incomingRequests.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                                        No access requests received yet.
                                    </p>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Requester</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Role</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Publication</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Type</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Message</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Date</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Status</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {incomingRequests.map((request, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500' }}>{request.requester_name}</div>
                                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{request.requester_email}</div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                                                            <span style={{
                                                                backgroundColor: request.requester_role === 'hod' ? '#dc8317ff' : '#1bec87ff',
                                                                color: request.requester_role === 'hod' ? '#1e40af' : '#374151',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',

                                                            }}>
                                                                {request.requester_role[0].toUpperCase() + request.requester_role.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb', maxWidth: '200px' }}>
                                                            <div style={{  }} title={request.publication_title}>
                                                                {request.publication_title || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                                                            {request.publication_type.replace(/_/g, ' ').toUpperCase()}
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb', maxWidth: '150px' }}>
                                                            <div style={{ whiteSpace: 'nowrap' }} title={request.message}>
                                                                {request.message || 'No message'}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb'}}>
                                                            {formatDate(request.request_date)}
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                                                            {getStatusBadge(request.status)}
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                                                            {request.status === 'pending' ? (
                                                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                                    <button
                                                                        onClick={() => handleRequestResponse(request._id, 'approved')}
                                                                        style={{
                                                                            padding: '4px 8px',
                                                                            backgroundColor: '#10b981',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer',
                                                                        }}
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRequestResponse(request._id, 'rejected')}
                                                                        style={{
                                                                            padding: '4px 14px',
                                                                            backgroundColor: '#ef4444',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer',
                                                                        }}
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span style={{ color: '#6b7280' }}>
                                                                    {request.status === 'approved' ? 'Approved' : 'Rejected'}
                                                                    {request.response_date && (
                                                                        <div>{formatDate(request.response_date)}</div>
                                                                    )}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Outgoing Requests Tab */}
                        {activeTab === 'outgoing' && (
                            <div>
                                <h3 style={{ marginBottom: '15px', color: '#374151' }}>
                                    Your Publication Access Requests
                                </h3>
                                {outgoingRequests.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                                        You haven't made any access requests yet.
                                    </p>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Faculty</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Publication</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Type</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Message</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Request Date</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Status</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Response</th>
                                                    <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: '600' }}>Access</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {outgoingRequests.map((request, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500' }}>{request.target_faculty_name}</div>
                                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{request.target_faculty_email}</div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb', maxWidth: '200px' }}>
                                                            <div style={{  }} title={request.publication_title}>
                                                                {request.publication_title || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                                                            {request.publication_type.replace(/_/g, ' ').toUpperCase()}
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb', maxWidth: '150px' }}>
                                                            <div style={{  }} title={request.message}>
                                                                {request.message || 'No message'}
                                                            </div>
                                                        </td>
                                                        <td style={{ color: 'red', padding: '12px', border: '1px solid #e5e7eb' }}>
                                                            {formatDate(request.request_date)}
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                                                            {getStatusBadge(request.status)}
                                                        </td>
                                                        <td style={{ color: '#34f343ff', padding: '12px', border: '1px solid #e5e7eb', maxWidth: '150px' }}>
                                                            {request.response_date ? (
                                                                <div>
                                                                    <div style={{  }}>
                                                                        {formatDate(request.response_date)}
                                                                    </div>
                                                                    {request.response_message && (
                                                                        <div style={{ marginTop: '2px'}} title={request.response_message}>
                                                                            {request.response_message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span style={{ color: 'red' }}>Pending</span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px', border: '1px solid #e5e7eb' }}>
                                                            {request.status === 'approved' ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                    {/* Paper File Link */}
                                                                    {request.publication_file && (
                                                                        <a
                                                                            href={request.publication_file}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            style={{
                                                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                                                color: '#fff',
                                                                                padding: '4px 8px',
                                                                                borderRadius: '4px',
                                                                                textDecoration: 'none',
                                                                                fontWeight: '500',
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: '3px',
                                                                                transition: 'all 0.2s ease'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.target.style.transform = 'translateY(-1px)';
                                                                                e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.target.style.transform = 'translateY(0)';
                                                                                e.target.style.boxShadow = 'none';
                                                                            }}
                                                                        >
                                                                            📄 View Paper
                                                                        </a>
                                                                    )}

                                                                    {/* Publication Link */}
                                                                    {request.publication_link && (
                                                                        <a
                                                                            href={request.publication_link}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            style={{
                                                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                                                color: '#fff',
                                                                                padding: '4px 8px',
                                                                                borderRadius: '4px',
                                                                                textDecoration: 'none',
                                                                                fontWeight: '500',
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: '3px',
                                                                                transition: 'all 0.2s ease'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.target.style.transform = 'translateY(-1px)';
                                                                                e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.target.style.transform = 'translateY(0)';
                                                                                e.target.style.boxShadow = 'none';
                                                                            }}
                                                                        >
                                                                            🔗 External Link
                                                                        </a>
                                                                    )}

                                                                    {/* If no file or link available */}
                                                                    {!request.publication_file && !request.publication_link && (
                                                                        <span style={{
                                                                            color: '#6b7280',
                                                                            fontStyle: 'italic'
                                                                        }}>
                                                                            No file or link available
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : request.status === 'pending' ? (
                                                                <span style={{
                                                                    color: '#f59e0b',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    ⏳ Awaiting Approval
                                                                </span>
                                                            ) : (
                                                                <span style={{
                                                                    color: '#ef4444',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    ❌ Access Denied
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
        </>
    );
}

export default AccessRequests;