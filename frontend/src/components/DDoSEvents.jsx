import React, { useState, useEffect, useMemo } from 'react';
import { graphqlRequest, formatTimestamp } from '../utils/api';
import './DDoSEvents.css';

function DDoSEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const data = await graphqlRequest(`
                    {
                        ddosEvents {
                            id
                            source
                            trafficVolume
                            timestamp
                        }
                    }
                `);
                setEvents(data.ddosEvents);
                setError(null);
            } catch (err) {
                console.error('Error fetching DDoS events:', err);
                setError('Failed to load DDoS events');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const maxVolume = useMemo(() => 
        events.length > 0 ? Math.max(...events.map(event => event.trafficVolume)) : 1,
        [events]
    );

    if (loading) return <div className="ddos-container">Loading...</div>;
    if (error) return <div className="ddos-container error">{error}</div>;

    return (
        <div className="ddos-container">
            <h2>DDoS Events Timeline</h2>
            {events.length === 0 ? (
                <div className="no-data">No DDoS events found</div>
            ) : (
                <div className="timeline">
                    {events.map((event) => (
                        <div key={event.id} className="event-card">
                            <div className="event-header">
                                <span className="event-source">{event.source}</span>
                                <span className="event-time">
                                    {formatTimestamp(event.timestamp)}
                                </span>
                            </div>
                            <div className="traffic-bar-container">
                                <div 
                                    className="traffic-bar"
                                    style={{ width: `${(event.trafficVolume / maxVolume) * 100}%` }}
                                />
                                <span className="traffic-volume">
                                    {event.trafficVolume.toLocaleString()} requests/sec
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DDoSEvents;