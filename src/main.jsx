import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AudioStoreProvider } from './lib/audioStore';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AudioStoreProvider>
        <App />
      </AudioStoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
