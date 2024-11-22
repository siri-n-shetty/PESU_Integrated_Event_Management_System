import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, FileInput, List, Download, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [clubData, setClubData] = useState(null);
  const [events, setEvents] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationFields, setRegistrationFields] = useState([]);
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false });
  const [recruitmentExists, setRecruitmentExists] = useState(false);
  const [recruitmentResponses, setRecruitmentResponses] = useState([]);

  useEffect(() => {
    const storedClubData = localStorage.getItem('clubData');
    if (!storedClubData) {
      navigate('/');
      return;
    }

    const parsedClubData = JSON.parse(storedClubData);
    setClubData(parsedClubData);

    fetchClubDetails(parsedClubData.club_id);
    fetchEvents(parsedClubData.club_id);
    checkRecruitmentStatus(parsedClubData.club_id);
  }, [navigate]);

  const fetchClubDetails = async (clubId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/club/${clubId}`);
      const data = await response.json();
      if (data.success) {
        setClubData(prev => ({ ...prev, ...data.club }));
      }
    } catch (error) {
      console.error('Failed to fetch club details:', error);
    }
  };

  const handleCreateEvent = () => {
    console.log('Navigating to /create-event');
    navigate('/create-event');
  };

  const fetchEvents = async (clubId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${clubId}`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleEventClick = (event) => {
    navigate(`/view-event/${event.event_id}`, { state: { event } });
  };

  const checkRecruitmentStatus = async (clubId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/recruitment/status/${clubId}`);
      const data = await response.json();
      setRecruitmentExists(data.exists);
    } catch (error) {
      console.error('Failed to check recruitment status:', error);
    }
  };

  const handleAddField = () => {
    if (newField.label.trim()) {
      setRegistrationFields([...registrationFields, { ...newField }]);
      setNewField({ label: '', type: 'text', required: false });
    }
  };

  const handleRemoveField = (index) => {
    const updatedFields = [...registrationFields];
    updatedFields.splice(index, 1);
    setRegistrationFields(updatedFields);
  };

  const handleCreateRecruitment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recruitment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubData.club_id,
          clubName: clubData.club_name,
          fields: registrationFields
        })
      });
      const data = await response.json();
      if (data.success) {
        setRecruitmentExists(true);
        setShowRegistrationModal(false);
      }
    } catch (error) {
      console.error('Failed to create recruitment form:', error);
    }
  };

  const fetchRecruitmentResponses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/recruitment/responses/${clubData.club_id}`);
      const data = await response.json();
      if (data.success) {
        setRecruitmentResponses(data.responses);
      }
    } catch (error) {
      console.error('Failed to fetch recruitment responses:', error);
    }
  };

  const handleDownloadRecruitmentResponses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/recruitment/download_responses/${clubData.club_id}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${clubData.club_name}_recruitment_responses.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        console.error('Failed to download responses:', errorData.message);
      }
    } catch (error) {
      console.error('Error downloading recruitment responses:', error);
    }
  };
  
  const handleCloseRecruitments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/recruitment/close/${clubData.club_id}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        setRecruitmentExists(false);
        alert('Recruitment closed successfully');
      } else {
        console.error('Failed to close recruitments:', data.message);
      }
    } catch (error) {
      console.error('Error closing recruitments:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clubData');
    navigate('/');
  };

  if (!clubData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {clubData.club_logo_image && (
                <img
                  src={clubData.club_logo_image}
                  alt={`${clubData.club_name} logo`}
                  className="h-16 w-16 object-contain rounded-full mr-4"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/64/64'; // Fallback to placeholder if image fails to load
                    e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                  }}
                />
              )}
              <h1 className="text-3xl font-bold text-gray-900">{clubData.club_name}</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Club Description */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Club</h2>
          <p className="text-gray-600">{clubData.club_description || 'No description available.'}</p>
        </div>

        <div className="mb-8 flex space-x-4">
          <button
            onClick={() => setShowRegistrationModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            <FileInput className="w-5 h-5 mr-2" />
            {recruitmentExists ? 'Edit Recruitment Form' : 'Start Club Member Registration'}
          </button>
          {recruitmentExists && (
          <div className="flex space-x-4">
            <button
              onClick={fetchRecruitmentResponses}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              <List className="w-5 h-5 mr-2" />
              View Recruitment Responses
            </button>
            <button
              onClick={handleDownloadRecruitmentResponses}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Responses
            </button>
            <button
              onClick={handleCloseRecruitments}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
            >
              <X className="w-5 h-5 mr-2" />
              Close Recruitments
            </button>
          </div>
        )}
        </div>

        {/* Recruitment Modal */}
        {showRegistrationModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-semibold mb-4">
                {recruitmentExists ? 'Edit Recruitment Form' : 'Create Recruitment Form'}
              </h2>
              
              <div className="space-y-4">
                {registrationFields.map((field, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={field.label}
                      readOnly
                      className="flex-grow px-2 py-1 border rounded"
                    />
                    <select
                      value={field.type}
                      readOnly
                      className="px-2 py-1 border rounded"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                    </select>
                    <input
                      type="checkbox"
                      checked={field.required}
                      readOnly
                    />
                    <button 
                      onClick={() => handleRemoveField(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Field Label"
                    value={newField.label}
                    onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                    className="flex-grow px-2 py-1 border rounded"
                  />
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value }))}
                    className="px-2 py-1 border rounded"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                  </select>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                    />
                    Required
                  </label>
                  <button 
                    onClick={handleAddField}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setShowRegistrationModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRecruitment}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {recruitmentExists ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Recruitment Responses Modal */}
        {recruitmentResponses.length > 0 && (
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recruitment Responses</h3>
            </div>
            <div className="border-t border-gray-200">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(recruitmentResponses[0] || {}).map(key => (
                      <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recruitmentResponses.map((response, index) => (
                    <tr key={index}>
                      {Object.values(response).map((value, idx) => (
                        <td key={idx} className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Event Button */}
        <div className="mb-8">
        <button
          onClick={handleCreateEvent}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Event
        </button>

        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Events</h3>
          </div>
          <div className="p-4">
            {events.length === 0 ? (
              <p className="text-gray-500">No events created yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <div key={event.event_id} 
                  className="bg-gray-100 rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => handleEventClick(event)}
                  >
                    {event.event_image && (
                      <img
                        src={event.event_image}
                        alt={event.event_name}
                        className="w-full h-48 object-cover rounded-md mb-4"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/400/300';
                          e.target.onerror = null;
                        }}
                      />
                    )}
                    <h4 className="text-lg font-semibold mb-2">{event.event_name}</h4>
                    <div className="text-gray-600">
                      <p>{event.event_date} at {event.event_time}</p>
                      <p>{event.event_venue}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        
      </main>
    </div>
  );
};

export default Dashboard;