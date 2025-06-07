import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SilverStore from '../SilverStore';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SilverStore />
  </React.StrictMode>
);
