import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import Sidebar from '../../components/Sidebar';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Booking.css';

const Booking = () => {
  const [date, setDate] = useState(() => {
    // Set initial date to exactly one week from today
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    return oneWeekFromNow;
  });
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [instructors, setInstructors] = useState({});
  const [instructorForVehicle, setInstructorForVehicle] = useState({});
  const [loading, setLoading] = useState(true);
  const [existingBookings, setExistingBookings] = useState([]);

  // Calculate one week from today for minDate
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

  const vehicles = ['Bike', 'Tricycle', 'Van'];

  const vehicleToGrade = {
    Bike: 'bike',
    Tricycle: 'tricycle',
    Van: 'van'
  };

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8081/api/instructors')
      .then(res => res.json())
      .then(data => {
        console.log("Raw instructor data:", data);
        console.log("Sample instructor fields:", data.length > 0 ? Object.keys(data[0]) : "No instructors");
        const instructorsMap = {};
        data.forEach(instructor => {
          // Use vehicleCategory instead of grade
          const category = instructor.vehicleCategory;
          if (!instructorsMap[category]) {
            instructorsMap[category] = [];
          }
          instructorsMap[category].push(instructor);
        });
        console.log("Processed instructor map:", instructorsMap); // Debug the processed map
        setInstructors(instructorsMap);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching instructors:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchExistingBookings(date);
  }, [date]);

  const getInstructorsByVehicle = (vehicle) => {
    const grade = vehicleToGrade[vehicle];
    return instructors[grade] || [];
  };

  // New function to check if an instructor is on leave
  const isInstructorOnLeave = (instructor) => {
    return instructor.status === 'on_leave';
  };

  // New function to get instructor status display class
  const getInstructorStatusClass = (instructor) => {
    if (instructor.status === 'on_leave') {
      return 'instructor-on-leave';
    }
    return '';
  };

  const timeRanges = {
    Bike: generateTimeSlots('08:00', '10:00'),
    Tricycle: generateTimeSlots('10:00', '11:00'),
    Van: generateTimeSlots('11:00', '14:00')
  };

  const handleVehicleSelect = (vehicle) => {
    // Check if vehicle is already booked
    const alreadyBooked = existingBookings.some(booking => booking.vehicle === vehicle);
    
    if (alreadyBooked) {
      showToast(`You already have a ${vehicle} session booked for this date`, 'error');
      return;
    }
    
    if (selectedVehicles.includes(vehicle)) {
      setSelectedVehicles(prev => prev.filter(v => v !== vehicle));
      setSelectedSlots(prev => {
        const newSlots = { ...prev };
        delete newSlots[vehicle];
        return newSlots;
      });
      setInstructorForVehicle(prev => {
        const newInstructors = { ...prev };
        delete newInstructors[vehicle];
        return newInstructors;
      });
    } else {
      setSelectedVehicles(prev => [...prev, vehicle]);
    }
  };

  const handleTimeSlotSelect = (vehicle, slot) => {
    setSelectedSlots(prev => ({
      ...prev,
      [vehicle]: slot
    }));
  };

  const handleInstructorSelect = (vehicle, instructorId) => {
    // Get the instructor object
    const grade = vehicleToGrade[vehicle];
    const instructor = instructors[grade]?.find(ins => ins.ins_id === instructorId);
    
    // Check if instructor is on leave
    if (instructor && instructor.status === 'on_leave') {
      showToast('This instructor is on leave and cannot be selected.', 'error');
      return;
    }
    
    // If not on leave, proceed with selection
    setInstructorForVehicle(prev => ({
      ...prev,
      [vehicle]: instructorId
    }));
  };

  const isSunday = date.getDay() === 0;

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const handleConfirmBooking = async () => {
    // Validate selections
    const validationErrors = [];
    
    // First check if date is Sunday
    if (isSunday) {
      showToast('No sessions available on Sunday.', 'error');
      return;
    }
    
    // Check for any attempt to book already booked categories
    const bookedCategories = existingBookings.map(booking => booking.vehicle);
    const attemptingToBookAlreadyBooked = selectedVehicles.some(v => bookedCategories.includes(v));
    
    if (attemptingToBookAlreadyBooked) {
      showToast('You cannot book the same vehicle category twice in one day', 'error');
      return;
    }
    
    // Check if selections are complete
    if (selectedVehicles.length === 0) {
      validationErrors.push('Please select at least one vehicle');
    }
    
    selectedVehicles.forEach(vehicle => {
      if (!selectedSlots[vehicle]) {
        validationErrors.push(`Please select a time slot for ${vehicle}`);
      }
      if (!instructorForVehicle[vehicle]) {
        validationErrors.push(`Please select an instructor for ${vehicle}`);
      }
    });

    if (validationErrors.length > 0) {
      showToast(validationErrors.join('\n'), 'error');
      return;
    }

    const token = localStorage.getItem('authToken');

    const bookingPayload = {
      date: date.toLocaleDateString('en-CA'),
      vehicle_slots: selectedVehicles.map(vehicle => ({
        vehicle,
        time_slot: selectedSlots[vehicle],
        instructor_id: instructorForVehicle[vehicle]
      }))
    };

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
        setSelectedVehicles([]);
        setSelectedSlots({});
        setInstructorForVehicle({});
        
        // Refresh bookings to update UI with the new booking
        refreshBookings();
      } else {
        console.error('Booking failed:', result);
        showToast(result.message || 'Error while booking.', 'error');
      }
    } catch (error) {
      console.error('Error booking:', error);
      showToast('An error occurred while booking.', 'error');
    }
  };

  const fetchExistingBookings = async (selectedDate) => {
    try {
      const token = localStorage.getItem('authToken');
      const formattedDate = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      const response = await fetch(`http://localhost:8081/api/booking/student-bookings?date=${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const bookings = await response.json();
        setExistingBookings(bookings);
        
        // Reset selections for already booked vehicle categories
        const bookedCategories = bookings.map(booking => booking.vehicle);
        
        // Remove any selected vehicles that are already booked
        setSelectedVehicles(prev => prev.filter(v => !bookedCategories.includes(v)));
        
        // Remove any selected slots for vehicles that are already booked
        setSelectedSlots(prev => {
          const newSlots = {...prev};
          bookedCategories.forEach(category => {
            delete newSlots[category];
          });
          return newSlots;
        });
        
        // Remove any selected instructors for vehicles that are already booked
        setInstructorForVehicle(prev => {
          const newInstructors = {...prev};
          bookedCategories.forEach(category => {
            delete newInstructors[category];
          });
          return newInstructors;
        });
      } else {
        console.error('Failed to fetch existing bookings');
      }
    } catch (error) {
      console.error('Error fetching existing bookings:', error);
    }
  };

  const refreshBookings = () => {
    fetchExistingBookings(date);
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
                  <p className="page-subtitle">Choose your preferred sessions (01 vehicle - 15 mins each)</p>
                </div>
              </div>
            </div>

            <div className="booking-grid">
              <div className="calendar-instructor-row">
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
                        minDate={oneWeekFromNow}
                        className="modern-calendar"
                      />
                      {isSunday && (
                        <p className="text-danger mt-2">No sessions available on Sunday.</p>
                      )}
                      <p className="mt-2" style={{ color: 'black' }}>
                        <i className="bi bi-info-circle"></i> Bookings are only available starting one week from today.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="booking-card instructor-card">
                  <div className="card-header">
                    <h2 className="card-title">
                      <i className="bi bi-person-circle"></i>
                      Instructor Selection
                    </h2>
                  </div>
                  <div className="card-body">
                    {loading ? (
                      <div className="loading-message">Loading instructors...</div>
                    ) : (
                      <div className="all-instructors">
                        {vehicles.map((vehicle) => (
                          <div key={vehicle} className="vehicle-instructors">
                            <h4 className="vehicle-title">
                              {vehicle} Instructors
                              {selectedVehicles.includes(vehicle) && <span className="selected-label">(Selected)</span>}
                            </h4>
                            {getInstructorsByVehicle(vehicle).map((instructor) => (
                              <div 
                                key={instructor.ins_id} 
                                className={`instructor-name ${getInstructorStatusClass(instructor)} ${selectedVehicles.includes(vehicle) && instructorForVehicle[vehicle] === instructor.ins_id ? 'selected' : selectedVehicles.includes(vehicle) ? 'vehicle-active' : ''}`}
                                onClick={() => {
                                  if (isInstructorOnLeave(instructor)) {
                                    showToast('This instructor is on leave and cannot be selected.', 'error');
                                    return;
                                  }
                                  
                                  if (selectedVehicles.includes(vehicle)) {
                                    handleInstructorSelect(vehicle, instructor.ins_id);
                                  } else {
                                    // First select the vehicle, then the instructor
                                    handleVehicleSelect(vehicle);
                                    handleInstructorSelect(vehicle, instructor.ins_id);
                                  }
                                }}
                              >
                                <i className={`bi ${selectedVehicles.includes(vehicle) && instructorForVehicle[vehicle] === instructor.ins_id ? 'bi-check-circle-fill' : 'bi-circle'}`}></i> 
                                {`${instructor.firstName} ${instructor.lastName}`}
                                {instructor.status === 'on_leave' && <span className="on-leave-badge">On Leave</span>}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
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
                  {vehicles.map((vehicle) => {
                    const alreadyBooked = existingBookings.some(booking => booking.vehicle === vehicle);
                    return (
                      <div key={vehicle} className="vehicle-section">
                        <div
                          className={`vehicle-name ${selectedVehicles.includes(vehicle) ? 'selected' : ''} ${alreadyBooked ? 'disabled' : ''}`}
                          onClick={() => {
                            if (!alreadyBooked) {
                              handleVehicleSelect(vehicle);
                            } else {
                              showToast(`You already have a ${vehicle} session booked for this date`, 'error');
                            }
                          }}
                        >
                          <i className={`bi ${selectedVehicles.includes(vehicle) ? 'bi-check-circle-fill' : 'bi-circle'}`}></i> 
                          {vehicle}
                          {alreadyBooked && <span className="booked-badge">Already Booked</span>}
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
                    );
                  })}
                </div>
              </div>

              <div className="booking-action">
                <button
                  className={`confirm-button`}
                  disabled={selectedVehicles.length === 0 || isSunday}
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