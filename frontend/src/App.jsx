import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Main from './components/Main';
import './App.css';

function App() {
  // Health check effect
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await axios.get('http://localhost:8000/');
        console.log('Backend health check response:', response.data);
      } catch (error) {
        console.error('Backend health check failed:', error);
      }
    };

    checkBackendHealth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
