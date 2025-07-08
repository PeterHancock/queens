import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders the welcome message', () => {
    render(<App />);
    expect(screen.getByText(/LinkedIn's "Queens"/)).toBeInTheDocument();
  });

  it('renders the Vite logo', () => {
    render(<App />);
    const logo = screen.getByAltText('logo');
    expect(logo).toBeInTheDocument();
  });
});
