import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, List, X, Download } from 'lucide-react';

const ViewEvent = () => {
  const { event_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [responses, setResponses] = useState([]);
  const [showResponses, setShowResponses] = useState(false);

  useEffect(() => {
    const eventFromState = location.state?.event;
    
    if (eventFromState) {
      setEvent(eventFromState);
    } else {
      fetchEventDetails();
    }
  }, [event_id]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/details/${event_id}`);
      const data = await response.json();
      if (data.success) {
        setEvent(data.event);
      }
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    }
  };

  const fetchEventResponses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/application/responses/${event_id}`);
      const data = await response.json();
      if (data.success) {
        setResponses(data.responses);
        setShowResponses(true);
      }
    } catch (error) {
      console.error('Failed to fetch event responses:', error);
    }
  };

  const closeEventRegistrations = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/close_registrations/${event_id}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert('Event registrations closed successfully');
      } else {
        alert('Failed to close registrations: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to close event registrations:', error);
      alert('An error occurred while closing registrations');
    }
  };

  const downloadResponses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/download_responses/${event_id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.event_name}_responses.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Failed to download responses:', error);
      alert('An error occurred while downloading responses');
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {event.event_image && (
            <img 
              src={event.event_image} 
              alt={event.event_name} 
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.target.src = '/api/placeholder/800/400';
                e.target.onerror = null;
              }}
            />
          )}
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.event_name}</h1>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600 font-semibold">Date</p>
                <p>{event.event_date}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Time</p>
                <p>{event.event_time}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Venue</p>
                <p>{event.event_venue}</p>
              </div>
            </div>

            {event.event_description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700">{event.event_description}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={fetchEventResponses}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                <List className="w-5 h-5 mr-2" />
                View Responses
              </button>

              <button
                onClick={closeEventRegistrations}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              >
                <X className="w-5 h-5 mr-2" />
                Close Event Registrations
              </button>

              {showResponses && (
                <button
                  onClick={downloadResponses}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Responses
                </button>
              )}
            </div>
          </div>
        </div>

        {showResponses && responses.length > 0 && (
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Event Responses</h3>
            </div>
            <div className="border-t border-gray-200">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(responses[0] || {}).map(key => (
                      <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {responses.map((response, index) => (
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
      </div>
    </div>
  );
};

export default ViewEvent;