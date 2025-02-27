import React, { useState } from 'react';
import Calendar from 'react-calendar';
import Sidebar from '../../components/Sidebar'; // Keep Sidebar
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Booking.css';

const Booking = () => {
  const [date, setDate] = useState(new Date());
  const [instructor, setInstructor] = useState('');

  const mockInstructors = [
    { id: 1, name: "Mr. Smith" },
    { id: 2, name: "Ms. Davis" },
  ];

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 sidebar-container">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="col-md-9 main-content p-4">
          <div className="container d-flex justify-content-center align-items-center">
            <div className="booking-card card p-4 shadow-lg">
              <h2 className="text-center text-primary mb-4">Book a Lesson</h2>
              
              {/* Calendar */}
              <div className="calendar-container mb-4">
                <Calendar onChange={setDate} value={date} />
              </div>

              {/* Instructor Selection */}
              <div className="mb-4">
                <label className="form-label fw-bold">Select Instructor</label>
                <select 
                  className="form-select" 
                  value={instructor} 
                  onChange={(e) => setInstructor(e.target.value)}
                >
                  <option value="">Choose an instructor</option>
                  {mockInstructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>

              {/* Confirm Button */}
              <div className="text-center">
                <button className="btn btn-primary btn-lg">Confirm Booking</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Booking;
