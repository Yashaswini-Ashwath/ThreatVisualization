import React, { useState, useEffect } from 'react';
import { graphqlRequest, formatTimestamp } from '../utils/api';
import './Tables.css';

function WAFTriggers() {
    const [triggers, setTriggers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTriggers = async () => {
            try {
                setLoading(true);
                const data = await graphqlRequest(`
                    {
                        wafTriggers {
                            id
                            rule
                            severity
                            timestamp
                        }
                    }
                `);
                setTriggers(data.wafTriggers);
                setError(null);
            } catch (err) {
                console.error('Error fetching triggers:', err);
                setError('Failed to load WAF triggers');
            } finally {
                setLoading(false);
            }
        };
        fetchTriggers();
    }, []);

    if (loading) return <div className="page-container">Loading...</div>;
    if (error) return <div className="page-container error">{error}</div>;

    return (
        <div className="page-container">
            <h2>WAF Triggers</h2>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Rule</th>
                        <th>Severity</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {triggers.length === 0 ? (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center' }}>No WAF triggers found</td>
                        </tr>
                    ) : (
                        triggers.map((trigger) => (
                            <tr key={trigger.id} className={`severity-${trigger.severity}`}>
                                <td>{trigger.rule}</td>
                                <td className="severity-badge">{trigger.severity.toUpperCase()}</td>
                                <td>{formatTimestamp(trigger.timestamp)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default WAFTriggers;