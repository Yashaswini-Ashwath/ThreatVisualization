import React, { useState, useMemo, useCallback } from 'react';
import BlockedIPs from './BlockedIPs';
import WAFTriggers from './WAFTriggers';
import DDoSEvents from './DDoSEvents';
import RuleManagement from './RuleManagement';
import './Dashboard.css';

const getUserRole = () => {
    try {
        const token = localStorage.getItem('jwt');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
};

export default function Dashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('blockedIPs');
    const userRole = useMemo(() => getUserRole(), []);

    const renderContent = useCallback(() => {
        switch(activeTab) {
            case 'blockedIPs':
                return <BlockedIPs />;
            case 'wafTriggers':
                return <WAFTriggers />;
            case 'ddosEvents':
                return <DDoSEvents />;
            case 'ruleManagement':
                return userRole === 'admin' ? <RuleManagement /> : <div className="unauthorized">Unauthorized Access</div>;
            default:
                return <BlockedIPs />;
        }
    }, [activeTab, userRole]);

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <nav>
                    <ul>
                        <li>
                            <button 
                                className={activeTab === 'blockedIPs' ? 'active' : ''} 
                                onClick={() => setActiveTab('blockedIPs')}
                            >
                                Blocked IPs
                            </button>
                        </li>
                        <li>
                            <button 
                                className={activeTab === 'wafTriggers' ? 'active' : ''} 
                                onClick={() => setActiveTab('wafTriggers')}
                            >
                                WAF Triggers
                            </button>
                        </li>
                        <li>
                            <button 
                                className={activeTab === 'ddosEvents' ? 'active' : ''} 
                                onClick={() => setActiveTab('ddosEvents')}
                            >
                                DDoS Events
                            </button>
                        </li>
                        {userRole === 'admin' && (
                            <li>
                                <button 
                                    className={activeTab === 'ruleManagement' ? 'active' : ''} 
                                    onClick={() => setActiveTab('ruleManagement')}
                                >
                                    Rule Management
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </aside>
            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
}