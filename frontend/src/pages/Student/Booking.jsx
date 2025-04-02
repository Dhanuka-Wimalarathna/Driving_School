import React, { useState } from 'react';
import Calendar from 'react-calendar';
import Sidebar from '../../components/Sidebar';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Booking.css';

const Booking = () => {
  const [date, setDate] = useState(new Date());
  const [instructor, setInstructor] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  const mockInstructors = [
    { id: 1, name: "Mr. Smith", avatar: "SM" },
    { id: 2, name: "Ms. Davis", avatar: "MD" },
  ];

  const timeSlots = [
    { id: 1, time: "09:00 AM - 10:30 AM" },
    { id: 2, time: "11:00 AM - 12:30 PM" },
    { id: 3, time: "01:00 PM - 02:30 PM" },
    { id: 4, time: "03:00 PM - 04:30 PM" },
  ];

  return (
    <div className="booking-container">
      <div className="booking-layout">
        {/* Sidebar */}
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="booking-content">
          <div className="booking-wrapper">
            <div className="booking-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="bi bi-calendar-plus"></i>
                </div>
                <div className="header-text">
                  <h1 className="page-title">
                    Book Your Driving Lesson
                  </h1>
                  <p className="page-subtitle">Select your preferred date, instructor, and time slot</p>
                </div>
              </div>
            </div>

            <div className="booking-grid">
              {/* Calendar Section */}
              <div className="booking-card calendar-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-calendar-date"></i>
                    Select Date
                  </h2>
                  <span className="selected-date">
                    {date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="card-body">
                  <div className="calendar-container">
                    <Calendar 
                      onChange={setDate} 
                      value={date} 
                      minDate={new Date()}
                      className="modern-calendar"
                    />
                  </div>
                </div>
              </div>

              {/* Details Selection Section */}
              <div className="booking-card details-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-person-badge"></i>
                    Booking Details
                  </h2>
                </div>
                <div className="card-body">
                  {/* Instructor Selection */}
                  <div className="form-group">
                    <label className="form-label">Select Instructor</label>
                    <div className="instructor-options">
                      {mockInstructors.map((inst) => (
                        <div 
                          key={inst.id}
                          className={`instructor-option ${instructor === inst.id.toString() ? 'selected' : ''}`}
                          onClick={() => setInstructor(inst.id.toString())}
                        >
                          <div className="instructor-avatar">{inst.avatar}</div>
                          <span className="instructor-name">{inst.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Slot Selection */}
                  <div className="form-group">
                    <label className="form-label">Select Time Slot</label>
                    <div className="time-slots">
                      {timeSlots.map((slot) => (
                        <div 
                          key={slot.id}
                          className={`time-slot ${timeSlot === slot.id.toString() ? 'selected' : ''}`}
                          onClick={() => setTimeSlot(slot.id.toString())}
                        >
                          <i className="bi bi-clock"></i>
                          <span>{slot.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <div className="booking-action">
                    <button 
                      className={`confirm-button ${instructor && timeSlot ? 'active' : 'disabled'}`}
                      disabled={!instructor || !timeSlot}
                    >
                      <i className="bi bi-check-circle"></i>
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;