import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress ResizeObserver and runtime error noise
window.addEventListener('error', (e) => {
  if (e.message?.includes('ResizeObserver loop completed')) {
    e.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  console.warn('Unhandled Promise Rejection:', e.reason);
  // Prevent the rejection from propagating further
  e.preventDefault();
});

// Override console.error to filter ResizeObserver warnings
const originalError = console.error;
console.error = (...args) => {
  const message = String(args[0] || '');
  if (message.includes('ResizeObserver loop completed')) {
    return; // Silently ignore these warnings
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById("root")!).render(<App />);
