import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress cross-origin iframe security errors (e.g. from Razorpay or Extensions) logs
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes("SecurityError: Failed to read a named property 'document' from 'Window'")) {
    e.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <App />
)
