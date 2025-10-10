import React, { useState, useCallback } from 'react';
import { graphqlRequest } from '../utils/api';
import './Tables.css';

function RuleManagement() {
    const [rule, setRule] = useState('');
    const [severity, setSeverity] = useState('medium');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            await graphqlRequest(`
                mutation {
                    addRule(rule: "${rule.replace(/"/g, '\\"')}", severity: "${severity}") {
                        id
                        rule
                        severity
                    }
                }
            `);
            setMessage('Rule added successfully!');
            setRule('');
            setSeverity('medium');
        } catch (error) {
            setMessage('Error: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }, [rule, severity]);

    return (
        <div className="page-container">
            <h2>Rule Management</h2>
            <div className="rule-management-form">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="rule">Rule Description:</label>
                        <input
                            id="rule"
                            type="text"
                            value={rule}
                            onChange={(e) => setRule(e.target.value)}
                            placeholder="Enter rule description..."
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="severity">Severity Level:</label>
                        <select
                            id="severity"
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Adding Rule...' : 'Add Rule'}
                    </button>
                </form>
                {message && (
                    <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RuleManagement;