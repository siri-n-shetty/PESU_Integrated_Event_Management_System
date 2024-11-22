import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import CreateEvent from './createevent';
import ViewEvent from './view_event';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/view-event/:event_id" element={<ViewEvent />} />
      </Routes>
    </Router>
  );
};

export default App;