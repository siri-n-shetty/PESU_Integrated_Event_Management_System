import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoPesu from './logoPesu.png'; // Import the logo

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('clubData', JSON.stringify(data.club));
        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-4 relative">
      {/* Logo at top-right */}
      <img
        src={logoPesu}
        alt="PES University Logo"
        className="absolute top-6 right-6 w-64 h-32"
      />
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2">PESU Admin Portal</h1>
        <p className="text-lg text-gray-600 max-w-md">
          Welcome to the centralized management system for PES University clubs and events.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sign In</h2>
          <p className="text-gray-600">Please login to access the admin dashboard</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">
            Forgot your password?
          </a>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} PES University. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;
