import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../components/Login.jsx';

// ✅ Mock fetch globally
global.fetch = jest.fn();

// ✅ Mock image import
jest.mock('../assets/cybersecurity-bg.jpg', () => 'mock-image.jpg');

describe('Login Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders login form inputs and button', () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('updates username and password fields', () => {
    render(<Login onLogin={mockOnLogin} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } });

    expect(screen.getByLabelText(/Username/i).value).toBe('admin');
    expect(screen.getByLabelText(/Password/i).value).toBe('secret');
  });

  test('successful login sets token and calls onLogin', async () => {
    const mockToken = 'mock-jwt-token';
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: mockToken })
    });

    render(<Login onLogin={mockOnLogin} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(localStorage.getItem('jwt')).toBe(mockToken);
      expect(mockOnLogin).toHaveBeenCalledWith(mockToken);
    });
  });

  test('shows error for invalid credentials', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    render(<Login onLogin={mockOnLogin} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument();
    });
  });

  test('shows error for network failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Login onLogin={mockOnLogin} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  test('disables button and shows loading text during login', async () => {
    fetch.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({ token: 'mock' }) }), 100))
    );

    render(<Login onLogin={mockOnLogin} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(screen.getByRole('button')).toHaveTextContent(/Logging in.../i);
    expect(screen.getByRole('button')).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent(/Login/i);
    });
  });

  // ✅ New test: background image rendering
  test('applies background image to login container', () => {
    const { container } = render(<Login onLogin={mockOnLogin} />);
    const loginContainer = container.querySelector('.login-container');
    expect(loginContainer).toHaveStyle(
      `background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(mock-image.jpg)`
    );
  });
});
