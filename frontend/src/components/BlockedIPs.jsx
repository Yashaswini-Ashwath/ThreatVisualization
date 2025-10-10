import React, { useState, useEffect, useMemo } from 'react';
import { graphqlRequest, formatTimestamp } from '../utils/api';
import './Tables.css';

function BlockedIPs() {
    const [ips, setIps] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIPs = async () => {
            try {
                setLoading(true);
                const data = await graphqlRequest(`
                    {
                        blockedIPs {
                            ip
                            reason
                            timestamp
                        }
                    }
                `);
                setIps(data.blockedIPs);
                setError(null);
            } catch (err) {
                console.error('Error fetching IPs:', err);
                setError('Failed to load blocked IPs');
            } finally {
                setLoading(false);
            }
        };
        fetchIPs();
    }, []);

    const filteredIPs = useMemo(() => 
        ips.filter(ip => 
            ip.ip.includes(filter) || 
            ip.reason.toLowerCase().includes(filter.toLowerCase())
        ), [ips, filter]
    );

    if (loading) return <div className="page-container">Loading...</div>;
    if (error) return <div className="page-container error">{error}</div>;

    return (
        <div className="page-container">
            <h2>Blocked IP Addresses</h2>
            <input
                type="text"
                placeholder="Filter by IP or reason..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-input"
            />
            <table className="data-table">
                <thead>
                    <tr>
                        <th>IP Address</th>
                        <th>Reason</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredIPs.length === 0 ? (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center' }}>No blocked IPs found</td>
                        </tr>
                    ) : (
                        filteredIPs.map((ip, index) => (
                            <tr key={`${ip.ip}-${index}`}>
                                <td>{ip.ip}</td>
                                <td>{ip.reason}</td>
                                <td>{formatTimestamp(ip.timestamp)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default BlockedIPs;