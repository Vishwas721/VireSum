import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Background3D from './Background3D';
import FloatingCard from './FloatingCard';
import LoadingSpinner from './LoadingSpinner';

export default function Main() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

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
    <div className="relative min-h-screen flex items-center justify-center">
      <Background3D />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center space-y-4"
      >
        <LoadingSpinner />
        <span className="text-xl font-semibold text-white">Loading...</span>
      </motion.div>
    </div>
  );

  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-50">
      <Background3D />
      
      {/* Sidebar Toggle Button */}
      <motion.button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-screen w-72 z-40"
          >
            <FloatingCard>
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                    Patient List
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {error ? (
                    <p className="p-6 text-red-500">{error}</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {patients.map((patient, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 cursor-pointer transition-all duration-200 ${
                            selectedPatient === patient 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedPatient(patient)}
                        >
                          {patient}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                  >
                    Logout
                  </motion.button>
                </div>
              </div>
            </FloatingCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        layout
        className="flex-1 p-8 ml-72"
        animate={{ marginLeft: isSidebarOpen ? "18rem" : "0" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <FloatingCard delay={0.2}>
          <div className="p-8">
            {selectedPatient ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                  {selectedPatient}
                </h2>
                <p className="text-gray-600">
                  Select a patient from the sidebar to view their medical reports.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-48 text-gray-500"
              >
                Please select a patient from the sidebar
              </motion.div>
            )}
          </div>
        </FloatingCard>
      </motion.div>
    </div>
  );
}