import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';

// Layout Components
const Navbar = () => (
  <nav className="bg-gray-800 p-4">
    <div className="container mx-auto">
      <h1 className="text-white text-xl font-bold">Medical Summarizer</h1>
    </div>
  </nav>
);

// Pages
const HomePage = () => {
  const [patients, setPatients] = useState([]);

  // Function to fetch patients from the API
  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/patients');
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Patient List</h2>
      <button 
        onClick={fetchPatients}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Load Patients
      </button>
      
      <div className="grid gap-4">
        {patients.map((patient, index) => (
          <div key={index} className="bg-white p-4 rounded shadow">
            {patient}
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
