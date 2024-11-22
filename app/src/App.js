import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import AllEvents from './allevents';
import ViewEvent from './viewevent';
import ViewClub from './viewclub';
import ClubApplication from './clubapplication';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<AllEvents />} />
        <Route path="/events/:eventId" element={<ViewEvent />} />
        <Route path="/clubs/:clubId" element={<ViewClub />} />
        <Route path="/clubs/:clubId/recruitment" element={<ClubApplication />} />
        </Routes>
    </Router>
  );
};

export default App;
