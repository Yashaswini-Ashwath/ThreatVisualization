import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import WAFTriggers from '../components/WAFTriggers.jsx';
import * as api from '../utils/api.js';

// Mock API functions
jest.mock('../utils/api', () => ({
  graphqlRequest: jest.fn(),
  formatTimestamp: jest.fn((ts) => `Formatted(${ts})`)
}));

const mockTriggers = {
  wafTriggers: [
    {
      id: '1',
      rule: 'SQL Injection',
      severity: 'high',
      timestamp: '2025-10-31T10:00:00Z'
    },
    {
      id: '2',
      rule: 'XSS Attempt',
      severity: 'medium',
      timestamp: '2025-10-31T11:00:00Z'
    }
  ]
};

describe('WAFTriggers Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading initially', async () => {
    api.graphqlRequest.mockResolvedValueOnce(mockTriggers);
    render(<WAFTriggers />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument());
  });

  test('renders WAF triggers after fetch', async () => {
    api.graphqlRequest.mockResolvedValueOnce(mockTriggers);
    render(<WAFTriggers />);
    await waitFor(() => {
      expect(screen.getByText('WAF Triggers')).toBeInTheDocument();
      expect(screen.getByText('SQL Injection')).toBeInTheDocument();
      expect(screen.getByText('XSS Attempt')).toBeInTheDocument();
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
      expect(screen.getAllByText(/Formatted/)).toHaveLength(2);
    });
  });

  test('shows error message on fetch failure', async () => {
    api.graphqlRequest.mockRejectedValueOnce(new Error('Network error'));
    render(<WAFTriggers />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to load WAF triggers/i)).toBeInTheDocument();
    });
  });

  test('shows "No WAF triggers found" when list is empty', async () => {
    api.graphqlRequest.mockResolvedValueOnce({ wafTriggers: [] });
    render(<WAFTriggers />);
    await waitFor(() => {
      expect(screen.getByText(/No WAF triggers found/i)).toBeInTheDocument();
    });
  });
});
