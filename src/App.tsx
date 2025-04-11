import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FormPage from './pages/FormPage';
import ConfirmationPage from './pages/ConfirmationPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

const App: React.FC = () => {
  const [donorData, setDonorData] = useState<any>(null);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage setDonorData={setDonorData} />} />
          {/* Route cho trường hợp quét QR code */}
          <Route
            path="/donor/:donorId"
            element={<FormPage donorData={donorData} setDonorData={setDonorData} />}
          />
          {/* Route cho trường hợp nhập tay thông tin (tạo mới) */}
          <Route
            path="/donor/new"
            element={<FormPage donorData={donorData} setDonorData={setDonorData} />}
          />
          <Route path="/confirmation" element={<ConfirmationPage donorData={donorData} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;