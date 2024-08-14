import React from 'react';
import { render, screen } from '@testing-library/react';
import ResearchApp from './ResearchApp';

test('renders learn react link', () => {
  render(<ResearchApp />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
