import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import * as useInactivityLogoutHook from '../hooks/useInactivityLogout';

// Mock child components
jest.mock('../components/Login.jsx', () => ({ onLogin }) => (
  <button onClick={() => onLogin('mockToken')}>Mock Login</button>
));

jest.mock('../components/Dashboard.jsx', () => ({ onLogout }) => (
  <button onClick={onLogout}>Mock Dashboard</button>
));


// Mock useInactivityLogout hook
jest.spyOn(useInactivityLogoutHook, 'useInactivityLogout').mockImplementation(() => {});
describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders Login when no token is present', () => {
    render(<App />);
    expect(screen.getByText('Mock Login')).toBeInTheDocument();
  });

  test('renders Dashboard when token is present', () => {
    localStorage.setItem('jwt', 'mockToken');
    render(<App />);
    expect(screen.getByText('Mock Dashboard')).toBeInTheDocument();
  });

  test('sets token after login', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Mock Login'));
    expect(screen.getByText('Mock Dashboard')).toBeInTheDocument();
  });

  test('clears token and localStorage on logout', () => {
    localStorage.setItem('jwt', 'mockToken');
    render(<App />);
    fireEvent.click(screen.getByText('Mock Dashboard'));
    expect(screen.getByText('Mock Login')).toBeInTheDocument();
    expect(localStorage.getItem('jwt')).toBeNull();
  });

  test('calls useInactivityLogout with handleLogout when token is present', () => {
    const spy = jest.spyOn(useInactivityLogoutHook, 'useInactivityLogout');
    localStorage.setItem('jwt', 'mockToken');
    render(<App />);
    expect(spy).toHaveBeenCalledWith(expect.any(Function));
  });

  test('calls useInactivityLogout with null when token is absent', () => {
    const spy = jest.spyOn(useInactivityLogoutHook, 'useInactivityLogout');
    render(<App />);
    expect(spy).toHaveBeenCalledWith(null);
  });
});
