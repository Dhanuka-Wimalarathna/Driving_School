import React, { useState } from 'react';
import Calendar from 'react-calendar';
import Sidebar from '../../components/Sidebar';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Booking.css';

const Booking = () => {
  const [date, setDate] = useState(new Date());
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const vehicles = ['Bike', 'Tricycle', 'Van'];

  const timeRanges = {
    Bike: generateTimeSlots('08:00', '10:00'),
    Tricycle: generateTimeSlots('10:00', '11:00'),
    Van: generateTimeSlots('11:00', '14:00')
  };

  const handleVehicleSelect = (vehicle) => {
    if (selectedVehicles.includes(vehicle)) {
      setSelectedVehicles(prev => prev.filter(v => v !== vehicle));
      const newSlots = { ...selectedSlots };
      delete newSlots[vehicle];
      setSelectedSlots(newSlots);
    } else {
      if (selectedVehicles.length < 3) {
        setSelectedVehicles(prev => [...prev, vehicle]);
      }
    }
  };

  const handleTimeSlotSelect = (vehicle, slot) => {
    setSelectedSlots(prev => ({
      ...prev,
      [vehicle]: slot
    }));
  };

  const isSunday = date.getDay() === 0;

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
        
    toast.innerText = message;
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const handleConfirmBooking = async () => {
    if (
      selectedVehicles.length === 0 ||
      Object.keys(selectedSlots).length !== selectedVehicles.length
    ) {
      showToast('Please select a vehicle and its time slot.', 'error');
      return;
    }
  
    const token = localStorage.getItem('authToken'); // Auth token
  
    // Format the booking payload expected by backend
    const bookingPayload = {
      date: date.toISOString().split('T')[0], // Shared booking date (YYYY-MM-DD)
      vehicle_slots: selectedVehicles.map(vehicle => ({
        vehicle,
        time_slot: selectedSlots[vehicle]
      }))
    };
  
    console.log("Booking payload:", bookingPayload);
    console.log("Auth token:", token);
  
    try {
      const response = await fetch('http://localhost:8081/api/booking/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });
  
      const result = await response.json();
  
      if (response.ok) {
        showToast('Session successfully booked!', 'success');
        // Clear the selections after successful booking
        setSelectedVehicles([]);
        setSelectedSlots({});
      } else {
        console.error('Booking failed:', result);
        showToast(result.message || 'Error while booking.', 'error');
      }
    } catch (error) {
      console.error('Error booking:', error);
      showToast('An error occurred while booking.', 'error');
    }
  };
  
  return (
    <div className="booking-container">
      <div className="booking-layout">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>
        <div className="booking-content">
          <div className="booking-wrapper">
            <div className="booking-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="bi bi-calendar-plus"></i>
                </div>
                <div className="header-text">
                  <h1 className="page-title">Book Your Driving Lesson</h1>
                  <p className="page-subtitle">Choose your preferred sessions (01 vehicle-15 mins each)</p>
                </div>
              </div>
            </div>

            <div className="booking-grid vertical">
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
                    {isSunday && (
                      <p className="text-danger mt-2">No sessions available on Sunday.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="booking-card details-card">
                <div className="card-header">
                  <h2 className="card-title">
                    <i className="bi bi-car-front"></i>
                    Choose Vehicle & Time
                  </h2>
                </div>
                <div className="card-body">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle} className="vehicle-section">
                      <div
                        className={`vehicle-name ${selectedVehicles.includes(vehicle) ? 'selected' : ''}`}
                        onClick={() => handleVehicleSelect(vehicle)}
                      >
                        <i className={`bi ${selectedVehicles.includes(vehicle) ? 'bi-check-circle-fill' : 'bi-circle'}`}></i> {vehicle}
                      </div>

                      {selectedVehicles.includes(vehicle) && (
                        <div className="time-slots mt-2">
                          {timeRanges[vehicle].map((slot, idx) => (
                            <div
                              key={idx}
                              className={`time-slot ${selectedSlots[vehicle] === slot ? 'selected' : ''}`}
                              onClick={() => handleTimeSlotSelect(vehicle, slot)}
                            >
                              <i className="bi bi-clock"></i> {slot}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="booking-action mt-4">
                    <button
                      className={`confirm-button ${(selectedVehicles.length >= 1 && Object.keys(selectedSlots).length === selectedVehicles.length) && !isSunday ? 'active' : 'disabled'}`}
                      disabled={!(selectedVehicles.length >= 1 && Object.keys(selectedSlots).length === selectedVehicles.length) || isSunday}
                      onClick={handleConfirmBooking}
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
      {/* Toast notifications will be created dynamically */}
    </div>
  );
};

function generateTimeSlots(start, end) {
  const slots = [];
  let [sh, sm] = start.split(':').map(Number);
  let [eh, em] = end.split(':').map(Number);

  while (sh < eh || (sh === eh && sm < em)) {
    const nextMinutes = sm + 15;
    let nh = sh;
    let nm = nextMinutes;
    if (nextMinutes >= 60) {
      nh += 1;
      nm -= 60;
    }

    const from = formatTime(sh, sm);
    const to = formatTime(nh, nm);
    slots.push(`${from} - ${to}`);

    sh = nh;
    sm = nm;
  }

  return slots;
}

function formatTime(h, m) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = ((h + 11) % 12 + 1);
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

export default Booking;