import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileInput } from 'lucide-react';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [clubData, setClubData] = useState(JSON.parse(localStorage.getItem('clubData')));
  const [eventName, setEventName] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const [eventFields, setEventFields] = useState([]);
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false });

  const handleAddField = () => {
    if (newField.label.trim()) {
      setEventFields([...eventFields, { ...newField }]);
      setNewField({ label: '', type: 'text', required: false });
    }
  };

  const handleRemoveField = (index) => {
    const updatedFields = [...eventFields];
    updatedFields.splice(index, 1);
    setEventFields(updatedFields);
  };

  const handleCreateEvent = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubData.club_id,
          eventName,
          eventImage,
          eventDate,
          eventTime,
          eventVenue,
          eventDescription,
          eventFields
        })
      });

      const data = await response.json();
      if (data.success) {
        navigate('/dashboard');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Create New Event</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Event Image URL"
            value={eventImage}
            onChange={(e) => setEventImage(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Event Venue"
            value={eventVenue}
            onChange={(e) => setEventVenue(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-full"
          />
          <textarea
            placeholder="Event Description"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-full"
            rows="4"
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Event Application Form</h3>
          {eventFields.map((field, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
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
          
          <div className="flex space-x-2 mt-4">
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
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateEvent}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <FileInput className="w-5 h-5 mr-2" />
            Create Event
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateEvent;