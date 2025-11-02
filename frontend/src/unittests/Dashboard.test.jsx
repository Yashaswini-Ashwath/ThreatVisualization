import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../components/Dashboard.jsx';

// Mock child components
jest.mock('../components/BlockedIPs', () => () => <div>Mock BlockedIPs</div>);
jest.mock('../components/WAFTriggers', () => () => <div>Mock WAFTriggers</div>);
jest.mock('../components/DDoSEvents', () => () => <div>Mock DDoSEvents</div>);
jest.mock('../components/RuleManagement', () => () => <div>Mock RuleManagement</div>);

// Helper to mock JWT
const mockJwt = (role = 'user') => {
  const payload = { role };
  const base64 = btoa(JSON.stringify(payload));
  localStorage.setItem('jwt', `header.${base64}.signature`);
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders BlockedIPs by default', () => {
    mockJwt();
    render(<Dashboard onLogout={jest.fn()} />);
    expect(screen.getByText('Mock BlockedIPs')).toBeInTheDocument();
  });

  test('switches to WAFTriggers tab', () => {
    mockJwt();
    render(<Dashboard onLogout={jest.fn()} />);
    fireEvent.click(screen.getByText('WAF Triggers'));
    expect(screen.getByText('Mock WAFTriggers')).toBeInTheDocument();
  });

  test('switches to DDoSEvents tab', () => {
    mockJwt();
    render(<Dashboard onLogout={jest.fn()} />);
    fireEvent.click(screen.getByText('DDoS Events'));
    expect(screen.getByText('Mock DDoSEvents')).toBeInTheDocument();
  });

  test('shows RuleManagement tab for admin', () => {
    mockJwt('admin');
    render(<Dashboard onLogout={jest.fn()} />);
    fireEvent.click(screen.getByText('Rule Management'));
    expect(screen.getByText('Mock RuleManagement')).toBeInTheDocument();
  });

  test('shows Unauthorized message for non-admin on RuleManagement tab', () => {
    mockJwt('user');
    render(<Dashboard onLogout={jest.fn()} />);
    expect(screen.queryByText('Rule Management')).not.toBeInTheDocument();
  });

  test('calls onLogout when logout button is clicked', () => {
    mockJwt();
    const mockLogout = jest.fn();
    render(<Dashboard onLogout={mockLogout} />);
    fireEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
  });
});
