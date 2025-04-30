import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./MarkProgress.css"; // (optional if you want to style it)

const MarkProgress = () => {
  const { id } = useParams(); // booking ID
  const location = useLocation();
  const navigate = useNavigate();

  const lesson = location.state?.lesson;

  const handleSubmitProgress = async () => {
    try {
      console.log("Submitting progress for:", lesson);

      // Example: you could add API to POST student progress here

      // After marking progress, delete session
      const res = await fetch(`http://localhost:8081/api/bookings/session/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete session");

      // After success, go back
      navigate(`/instructor/mark-progress/${lesson.id}`);
    } catch (err) {
      console.error("Error submitting progress:", err);
    }
  };

  if (!lesson) {
    return <p>No lesson data found. Please go back.</p>;
  }

  return (
    <div className="mark-progress-page">
      <h1>Mark Progress</h1>
      <div className="lesson-details">
        <p><strong>Student:</strong> {lesson.studentName}</p>
        <p><strong>Date:</strong> {lesson.date}</p>
        <p><strong>Time:</strong> {lesson.timeSlot}</p>
        <p><strong>Vehicle:</strong> {lesson.vehicle}</p>
      </div>

      {/* In future: Add text areas, rating dropdowns etc */}

      <button className="submit-btn" onClick={handleSubmitProgress}>
        Submit Progress
      </button>
    </div>
  );
};

export default MarkProgress;
