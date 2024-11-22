import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Info, ArrowLeft } from 'lucide-react';

const ViewEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [applicationFields, setApplicationFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/events_student/details/${eventId}`);
        const data = await response.json();
        
        if (data.success) {
          setEvent(data.event);
          // Ensure applicationFields is an array
          setApplicationFields(Array.isArray(data.applicationFields) ? data.applicationFields : []);
          setError(null);
        } else {
          setError('Failed to fetch event details');
          setEvent(null);
          setApplicationFields([]);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('An error occurred while fetching event details');
        setEvent(null);
        setApplicationFields([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
  
    try {
      const response = await fetch(`http://localhost:5000/api/events/apply/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
  
      const result = await response.json();
  
      if (result.success) {
        setSubmitMessage('Application submitted successfully!');
        setFormData({});
      } else {
        // Check if the error is due to registration limit
        if (response.status === 400 && result.message.includes('Registration limit reached')) {
          setSubmitMessage('Sorry, registrations are full for this event. Maximum limit of participants reached.');
        } else {
          setSubmitMessage(`Error: ${result.message}`);
        }
      }
    } catch (error) {
      setSubmitMessage('An error occurred while submitting the application');
    }
  
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Back to Events
        </button>
      </div>
    );
  }

  if (!event) {
    return <div className="text-center py-8">No event found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="bg-white shadow-md py-4 px-8 flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/')} 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft className="mr-2" />
          Back
        </button>
        <img 
          src="https://i.ibb.co/YWyX0Tr/logoPesu.png" 
          alt="PESU Logo" 
          className="h-16"
        />
        <div className="w-24"></div> {/* Spacer for symmetry */}
      </header>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Event Details Section */}
        <motion.div 
          className="bg-white rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src={event.event_image || 'https://via.placeholder.com/800x400'} 
            alt={event.event_name} 
            className="w-full h-64 object-cover"
          />
          
          <div className="p-6 space-y-4">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">{event.event_name}</h1>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-700">
                <Calendar className="text-blue-600" size={24} />
                <span className="text-lg">
                  {event.event_date} | {event.event_time}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-700">
                <MapPin className="text-green-600" size={24} />
                <span className="text-lg">{event.event_venue}</span>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-600">{event.event_description}</p>
            </div>
          </div>
        </motion.div>

        {/* Event Registration Section */}
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-6">Register for Event</h2>
          
          {applicationFields.length === 0 ? (
            <div className="text-center text-gray-500">
              Registration is not available for this event.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {applicationFields.map((field) => (
                <div key={field.name} className="mb-4">
                  <label 
                    htmlFor={field.name} 
                    className="block text-gray-700 font-medium mb-2"
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}

              {submitMessage && (
                <div className={`
                  p-3 rounded-md text-center 
                  ${submitMessage.includes('successfully') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'}
                `}>
                  {submitMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full py-3 rounded-md text-white font-semibold 
                  ${isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'}
                `}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ViewEvent;