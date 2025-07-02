import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the main title', () => {
    render(<App />);
    expect(screen.getByText('QUEENS')).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<App />);
    expect(screen.getByText(/A clone of the the Linked in Queens game/)).toBeInTheDocument();
  });

  it('renders the Vite logo', () => {
    render(<App />);
    const logo = screen.getByAltText('logo');
    expect(logo).toBeInTheDocument();
  });
});
