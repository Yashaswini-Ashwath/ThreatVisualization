import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BlockedIPs from '../components/BlockedIPs.jsx';
import * as api from '../utils/api.js';

// Mock formatTimestamp
jest.mock('../utils/api', () => ({
  graphqlRequest: jest.fn(),
  formatTimestamp: jest.fn((ts) => `Formatted(${ts})`)
}));

const mockData = {
  blockedIPs: [
    { ip: '192.168.1.1', reason: 'Suspicious activity', timestamp: '2025-10-31T10:00:00Z' },
    { ip: '10.0.0.2', reason: 'Malware detected', timestamp: '2025-10-31T11:00:00Z' }
  ]
};

describe('BlockedIPs Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading initially', async () => {
    api.graphqlRequest.mockResolvedValueOnce(mockData);
    render(<BlockedIPs />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument());
  });

  test('renders blocked IPs after fetch', async () => {
    api.graphqlRequest.mockResolvedValueOnce(mockData);
    render(<BlockedIPs />);
    await waitFor(() => {
      expect(screen.getByText('Blocked IP Addresses')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
      expect(screen.getByText('Suspicious activity')).toBeInTheDocument();
      expect(screen.getByText('10.0.0.2')).toBeInTheDocument();
      expect(screen.getByText('Malware detected')).toBeInTheDocument();
    });
  });

  test('shows error message on fetch failure', async () => {
    api.graphqlRequest.mockRejectedValueOnce(new Error('Network error'));
    render(<BlockedIPs />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to load blocked IPs/i)).toBeInTheDocument();
    });
  });

  test('filters IPs based on input', async () => {
    api.graphqlRequest.mockResolvedValueOnce(mockData);
    render(<BlockedIPs />);
    await waitFor(() => screen.getByText('Blocked IP Addresses'));

    const input = screen.getByPlaceholderText(/Filter by IP or reason/i);
    fireEvent.change(input, { target: { value: 'malware' } });

    expect(screen.queryByText('192.168.1.1')).not.toBeInTheDocument();
    expect(screen.getByText('10.0.0.2')).toBeInTheDocument();
  });

  test('shows "No blocked IPs found" when filter matches nothing', async () => {
    api.graphqlRequest.mockResolvedValueOnce(mockData);
    render(<BlockedIPs />);
    await waitFor(() => screen.getByText('Blocked IP Addresses'));

    const input = screen.getByPlaceholderText(/Filter by IP or reason/i);
    fireEvent.change(input, { target: { value: 'notfound' } });

    expect(screen.getByText(/No blocked IPs found/i)).toBeInTheDocument();
  });
});
