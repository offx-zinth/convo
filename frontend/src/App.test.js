import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the AI Voice Assistant heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/AI Voice Assistant/i);
  expect(headingElement).toBeInTheDocument();
});
