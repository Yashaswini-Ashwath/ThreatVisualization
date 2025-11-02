import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RuleManagement from '../components/RuleManagement.jsx';
import * as api from '../utils/api.js';

// Mock graphqlRequest
jest.mock('../utils/api', () => ({
  graphqlRequest: jest.fn()
}));

describe('RuleManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form inputs and button', () => {
    render(<RuleManagement />);
    expect(screen.getByLabelText(/Rule Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Severity Level/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Rule/i })).toBeInTheDocument();
  });

  test('updates input and select values', () => {
    render(<RuleManagement />);
    const ruleInput = screen.getByLabelText(/Rule Description/i);
    const severitySelect = screen.getByLabelText(/Severity Level/i);

    fireEvent.change(ruleInput, { target: { value: 'Block SQL Injection' } });
    fireEvent.change(severitySelect, { target: { value: 'high' } });

    expect(ruleInput.value).toBe('Block SQL Injection');
    expect(severitySelect.value).toBe('high');
  });

  test('submits form and shows success message', async () => {
    api.graphqlRequest.mockResolvedValueOnce({
      addRule: { id: '1', rule: 'Block SQL Injection', severity: 'high' }
    });

    render(<RuleManagement />);
    fireEvent.change(screen.getByLabelText(/Rule Description/i), {
      target: { value: 'Block SQL Injection' }
    });
    fireEvent.change(screen.getByLabelText(/Severity Level/i), {
      target: { value: 'high' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Rule/i }));

    await waitFor(() => {
      expect(screen.getByText(/Rule added successfully!/i)).toBeInTheDocument();
    });
  });

  test('shows error message on mutation failure', async () => {
    api.graphqlRequest.mockRejectedValueOnce(new Error('Mutation failed'));

    render(<RuleManagement />);
    fireEvent.change(screen.getByLabelText(/Rule Description/i), {
      target: { value: 'Block XSS' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Rule/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error: Mutation failed/i)).toBeInTheDocument();
    });
  });

  test('disables inputs and button during loading', async () => {
    api.graphqlRequest.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({}), 100)));

    render(<RuleManagement />);
    fireEvent.change(screen.getByLabelText(/Rule Description/i), {
      target: { value: 'Block XSS' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Rule/i }));

    expect(screen.getByLabelText(/Rule Description/i)).toBeDisabled();
    expect(screen.getByLabelText(/Severity Level/i)).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent(/Adding Rule.../i);
  });
});
