import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ViewClub = () => {
  const { clubId } = useParams();
  const [clubDetails, setClubDetails] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        // Fetch club details
        const clubResponse = await fetch(`http://localhost:5000/api/club/${clubId}`);
        const clubData = await clubResponse.json();

        // Fetch club events
        const eventsResponse = await fetch(`http://localhost:5000/api/events/${clubId}`);
        const eventsData = await eventsResponse.json();

        if (clubData.success && eventsData.success) {
          setClubDetails(clubData.club);
          setClubEvents(eventsData.events);
        } else {
          setError('Failed to fetch club details');
        }
        setIsLoading(false);
      } catch (err) {
        setError('An error occurred while fetching data');
        setIsLoading(false);
      }
    };

    fetchClubDetails();
  }, [clubId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading club details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Club Header */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8 flex items-center"
      >
        <img 
          src={clubDetails.club_logo_image || 'https://via.placeholder.com/150'} 
          alt={clubDetails.club_name} 
          className="w-32 h-32 object-contain rounded-full mr-6"
        />
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            {clubDetails.club_name}
          </h1>
          <p className="text-gray-600">{clubDetails.club_description}</p>
          <p className="text-sm text-gray-500 mt-2">
            Contact: {clubDetails.club_email_id}
          </p>
        </div>
      </motion.div>

      {/* Club Events Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Upcoming Club Events
        </h2>
        {clubEvents.length === 0 ? (
          <div className="text-center text-gray-500">
            No upcoming events for this club
          </div>
        ) : (
          <div className="space-y-4">
            {clubEvents.map((event) => (
              <motion.div
                key={event.event_id}
                onClick={() => navigate(`/events/${event.event_id}`)}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-md p-4 flex"
              >
                <img 
                  src={event.event_image || 'https://via.placeholder.com/200'} 
                  alt={event.event_name} 
                  className="w-48 h-32 object-cover rounded-lg mr-4"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {event.event_name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {event.event_description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="mr-2 w-4 h-4" />
                      {event.event_date}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 w-4 h-4" />
                      {event.event_venue}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewClub;