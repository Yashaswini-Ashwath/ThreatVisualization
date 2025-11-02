import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DDoSEvents from '../components/DDoSEvents.jsx';
import * as api from '../utils/api.js';

// Mock API functions
jest.mock('../utils/api', () => ({
  graphqlRequest: jest.fn(),
  formatTimestamp: jest.fn((ts) => `Formatted(${ts})`)
}));

const mockEvents = {
  ddosEvents: [
    {
      id: '1',
      source: '192.168.0.1',
      trafficVolume: 5000,
      timestamp: '2025-10-31T10:00:00Z'
    },
    {
      id: '2',
      source: '10.0.0.2',
      trafficVolume: 10000,
      timestamp: '2025-10-31T11:00:00Z'
    }
  ]
};

describe('DDoSEvents Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading initially', async () => {
    api.graphqlRequest.mockResolvedValueOnce(mockEvents);
    render(<DDoSEvents />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument());
  });

  test('renders DDoS events after fetch', async () => {
    api.graphqlRequest.mockResolvedValueOnce(mockEvents);
    render(<DDoSEvents />);
    await waitFor(() => {
      expect(screen.getByText('DDoS Events Timeline')).toBeInTheDocument();
      expect(screen.getByText('192.168.0.1')).toBeInTheDocument();
      expect(screen.getByText('10.0.0.2')).toBeInTheDocument();
      expect(screen.getAllByText(/requests\/sec/i)).toHaveLength(2);
      expect(screen.getAllByText(/Formatted/)).toHaveLength(2);
    });
  });

  test('shows error message on fetch failure', async () => {
    api.graphqlRequest.mockRejectedValueOnce(new Error('Network error'));
    render(<DDoSEvents />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to load DDoS events/i)).toBeInTheDocument();
    });
  });

  test('shows "No DDoS events found" when list is empty', async () => {
    api.graphqlRequest.mockResolvedValueOnce({ ddosEvents: [] });
    render(<DDoSEvents />);
    await waitFor(() => {
      expect(screen.getByText(/No DDoS events found/i)).toBeInTheDocument();
    });
  });

  test('calculates traffic bar width proportionally', async () => {
    api.graphqlRequest.mockResolvedValueOnce(mockEvents);
    render(<DDoSEvents />);
    await waitFor(() => {
      const bars = screen.getAllByTestId('traffic-bar');
expect(bars[0]).toHaveStyle('width: 50%');
expect(bars[1]).toHaveStyle('width: 100%');

    });
  });
});
