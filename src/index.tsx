import { createRoot } from 'react-dom/client';
import React from 'react';
import '@/normalize.css';
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
