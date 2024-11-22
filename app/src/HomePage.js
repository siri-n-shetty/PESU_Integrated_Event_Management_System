import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecruitingClubs = () => {
  const navigate = useNavigate();
  const [recruitingClubs, setRecruitingClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecruitingClubs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recruiting-clubs');
        const data = await response.json();
        
        if (data.success) {
          setRecruitingClubs(data.clubs);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching recruiting clubs:', error);
        setIsLoading(false);
      }
    };

    fetchRecruitingClubs();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading recruiting clubs...
      </div>
    );
  }

  if (recruitingClubs.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-8 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center">
        <UserPlus className="mr-2" /> Clubs Recruiting Now
      </h2>
      <div className="grid grid-cols-3 gap-6">
        {recruitingClubs.map((club) => (
          <motion.div
            key={club.club_id}
            onClick={() => navigate(`/clubs/${club.club_id}/recruitment`)}
            className="bg-white rounded-lg shadow-md p-4 text-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img 
              src={club.club_logo_image || 'https://via.placeholder.com/150'} 
              alt={club.club_name} 
              className="w-32 h-32 object-contain mx-auto mb-4 rounded-full"
            />
            <h3 className="text-lg font-semibold">{club.club_name}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Event Slider Component
const EventSlider = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        const data = await response.json();
        if (data.success) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const timer = events.length > 0 && setInterval(() => {
      setCurrentEventIndex((prevIndex) => 
        (prevIndex + 1) % events.length
      );
    }, 5000);

    return () => timer && clearInterval(timer);
  }, [events]);

  const handleEventClick = (eventId) => {
    navigate(`/events`); // Navigate to all events page
  };

  if (events.length === 0) return (
    <div className="text-center py-8 text-gray-500">
      No events available
    </div>
  );

  const currentEvent = events[currentEventIndex];

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto my-8 p-4 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={handleEventClick}
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Upcoming Events</h2>
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        <img 
          src={currentEvent.event_image || 'https://via.placeholder.com/800x400'} 
          alt={currentEvent.event_name} 
          className="w-full h-96 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
          <h3 className="text-xl font-semibold">{currentEvent.event_name}</h3>
          <div className="flex items-center space-x-2 mt-2">
            <Calendar size={20} />
            <span>{currentEvent.event_date} | {currentEvent.event_time}</span>
          </div>
          <p className="text-sm mt-1">Hosted by {currentEvent.club_name}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Clubs Grid Component
const ClubsGrid = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/clubs');
        const data = await response.json();
        if (data.success) {
          setClubs(data.clubs);
        }
      } catch (error) {
        console.error('Error fetching clubs:', error);
      }
    };

    fetchClubs();
  }, []);

  if (clubs.length === 0) return (
    <div className="text-center py-8 text-gray-500">
      No clubs available
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto my-8 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center">
        <Users className="mr-2" /> PESU Clubs
      </h2>
      <div className="grid grid-cols-3 gap-6">
        {clubs.map((club) => (
          <motion.div
            key={club.club_id}
            onClick={() => navigate(`/clubs/${club.club_id}`)}
            className="bg-white rounded-lg shadow-md p-4 text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img 
              src={club.club_logo_image || 'https://via.placeholder.com/150'} 
              alt={club.club_name} 
              className="w-32 h-32 object-contain mx-auto mb-4 rounded-full"
            />
            <h3 className="text-lg font-semibold">{club.club_name}</h3>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {club.club_description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-white shadow-md py-4 px-8 flex items-center justify-between">
        <img 
          src="https://i.ibb.co/YWyX0Tr/logoPesu.png" 
          alt="PESU Logo" 
          className="h-16"
        />
        <h1 className="text-3xl font-bold text-blue-800">
          PESU Clubs and Events
        </h1>
        <div className="w-16"></div> {/* Spacer for symmetry */}
      </header>

      {/* Main Content */}
      <main>
        <RecruitingClubs />
        <EventSlider />
        <ClubsGrid />
      </main>
    </div>
  );
};

export default HomePage;