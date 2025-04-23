import React, { useState, useEffect } from "react";
import { Eye, Edit } from "lucide-react";
import "./InstructorSchedule.css"; // Add CSS for styling

const InstructorSchedule = () => {
  const [schedule, setSchedule] = useState([]);

  // Dummy data for the schedule (replace with real data from API later)
  const dummySchedule = [
    { id: 1, day: "Monday", timeSlot: "9:00 AM - 10:00 AM", student: "John Doe", status: "Booked" },
    { id: 2, day: "Monday", timeSlot: "10:00 AM - 11:00 AM", student: "Jane Smith", status: "Available" },
    { id: 3, day: "Tuesday", timeSlot: "1:00 PM - 2:00 PM", student: "Michael Lee", status: "Booked" },
    { id: 4, day: "Wednesday", timeSlot: "11:00 AM - 12:00 PM", student: "Sarah Miller", status: "Available" },
    { id: 5, day: "Thursday", timeSlot: "2:00 PM - 3:00 PM", student: "Mark Johnson", status: "Booked" },
  ];

  useEffect(() => {
    // Simulate fetching schedule from an API or server
    setSchedule(dummySchedule);
  }, []);

  return (
    <div className="schedule-container">
      <h2>Instructor Schedule</h2>
      <div className="schedule-table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time Slot</th>
              <th>Student</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((slot) => (
              <tr key={slot.id}>
                <td>{slot.day}</td>
                <td>{slot.timeSlot}</td>
                <td>{slot.student}</td>
                <td>
                  <span className={`status-badge ${slot.status === "Booked" ? "booked" : "available"}`}>
                    {slot.status}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="view-btn" title="View details">
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                    <button className="edit-btn" title="Edit schedule">
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorSchedule;
