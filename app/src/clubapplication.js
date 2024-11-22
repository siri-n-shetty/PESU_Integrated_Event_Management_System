import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ClubApplication = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [clubDetails, setClubDetails] = useState(null);
  const [recruitmentFields, setRecruitmentFields] = useState([]);
  const [formData, setFormData] = useState({});

  // Fetch club details and recruitment form fields
  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        // Fetch club details
        const clubResponse = await fetch(`http://localhost:5000/api/club/${clubId}`);
        const clubData = await clubResponse.json();

        // Fetch recruitment form fields
        const recruitmentResponse = await fetch(`http://localhost:5000/api/recruitment/details/${clubId}`);
        const recruitmentData = await recruitmentResponse.json();

        if (clubData.success && recruitmentData.success) {
          setClubDetails(clubData.club);
          setRecruitmentFields(recruitmentData.fields);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchClubDetails();
  }, [clubId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit application
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/recruitment/apply/${clubId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        alert('Application submitted successfully!');
        navigate('/');
      } else {
        alert('Application submission failed.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application.');
    }
  };

  if (!clubDetails) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        {/* Club Details Section */}
        <div className="flex items-center mb-8">
          <img 
            src={clubDetails.club_logo_image || 'https://via.placeholder.com/150'} 
            alt={clubDetails.club_name} 
            className="w-32 h-32 object-contain rounded-full mr-6"
          />
          <div>
            <h1 className="text-3xl font-bold text-blue-800">{clubDetails.club_name}</h1>
            <p className="text-gray-600 mt-2">{clubDetails.club_description}</p>
            <p className="text-sm text-gray-500 mt-1">Contact: {clubDetails.club_email_id}</p>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Application Form</h2>
          {recruitmentFields.map((field) => (
            <div key={field.name} className="mb-4">
              <label 
                htmlFor={field.name} 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type === 'email' ? 'email' : 
                      field.type === 'number' ? 'number' : 'text'}
                id={field.name}
                name={field.name}
                required={field.required}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
              />
            </div>
          ))}
          
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Application
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ClubApplication;