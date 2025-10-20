import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Main() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Fetch patients
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/patients');
        setPatients(response.data.patients || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch patients');
        setLoading(false);
      }
    };

    fetchPatients();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-xl font-semibold">Loading...</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Patients</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          {error ? (
            <p className="p-4 text-red-500">{error}</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {patients.map((patient, index) => (
                <li 
                  key={index}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedPatient === patient ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  {patient}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        {selectedPatient ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">{selectedPatient}</h2>
            <p className="text-gray-600">Select a patient from the sidebar to view their medical reports.</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Please select a patient from the sidebar
          </div>
        )}
      </div>
    </div>
  );
}