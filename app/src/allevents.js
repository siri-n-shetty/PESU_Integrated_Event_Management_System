import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Info, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const AllEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/events');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events);
          setError(null);
        } else {
          setError('No events found or unexpected response format');
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to fetch events');
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No events available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="bg-white shadow-md py-4 px-8 flex items-center justify-between mb-8">
        <img 
          src="https://i.ibb.co/YWyX0Tr/logoPesu.png" 
          alt="PESU Logo" 
          className="h-16"
        />
        <h1 className="text-3xl font-bold text-blue-800">
          All PESU Events
        </h1>
        <div className="w-16"></div> {/* Spacer for symmetry */}
      </header>

      <button 
          onClick={() => navigate('/')} 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft className="mr-2" />
          Back
        </button>

      <div className="max-w-4xl mx-auto space-y-8">
        {events.map((event) => (
          <motion.div
            key={event.event_id}
            onClick={() => navigate(`/events/${event.event_id}`)}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <img 
                src={event.event_image || 'https://via.placeholder.com/800x400'} 
                alt={event.event_name} 
                className="w-full h-96 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                <h2 className="text-2xl font-bold">{event.event_name}</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
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
              
              <div className="flex items-center space-x-2 text-gray-700">
                <Info className="text-purple-600" size={24} />
                <span className="text-lg font-medium">Hosted by {event.club_name}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AllEvents;