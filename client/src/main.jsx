import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

if (!localStorage.getItem('cc_clean_ls')) {
  localStorage.clear();
  localStorage.setItem('cc_clean_ls', 'true');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
