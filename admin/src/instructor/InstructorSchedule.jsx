import React, { useState, useEffect } from "react";
import { Calendar, Clock, Car, User, AlertCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./InstructorSchedule.css";
import InstructorSidebar from "../components/Sidebar/InstructorSidebar";

const InstructorSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [filteredSchedule, setFilteredSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const instructorId = localStorage.getItem("instructorId");

  useEffect(() => {
    if (!instructorId) {
      setError("Instructor ID is missing. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8081/api/booking/schedule/${instructorId}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        const formattedData = data.map((item) => ({
          id: item.booking_id,
          date: item.date,
          timeSlot: item.time_slot || "-",
          vehicle: item.vehicle || "-",
          studentName: item.studentName || "-",
          status: item.status || "Unknown",
        }));

        setSchedule(formattedData);
        setFilteredSchedule(formattedData);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [instructorId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSchedule(schedule);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = schedule.filter(
        (lesson) =>
          lesson.studentName.toLowerCase().includes(query) ||
          lesson.vehicle.toLowerCase().includes(query) ||
          lesson.timeSlot.toLowerCase().includes(query) ||
          lesson.status.toLowerCase().includes(query) ||
          lesson.date.toLowerCase().includes(query)
      );
      setFilteredSchedule(filtered);
    }
  }, [searchQuery, schedule]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCompleteSession = (lesson) => {
    navigate(`/instructor/mark-progress/${lesson.id}`, { state: { lesson } });
  };  

  return (
    <div className="dashboard-layout">
      <InstructorSidebar />
      <main className="schedule-main-content">
        <div className="schedule-container">
          <header className="schedule-header">
            <div className="header-title">
              <h1>
                <span className="title-icon">
                  <Calendar size={24} />
                </span>
                My Schedule
              </h1>
              <p className="subtitle">
                {filteredSchedule.length}{" "}
                {filteredSchedule.length === 1 ? "lesson" : "lessons"} scheduled
              </p>
            </div>

            <div className="search-wrapper">
              <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by student..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </header>

          {error ? (
            <div className="error-container">
              <AlertCircle size={24} />
              <p>{error}</p>
              <button
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading schedule...</p>
            </div>
          ) : filteredSchedule.length === 0 ? (
            <div className="empty-schedule">
              <Calendar size={48} />
              <h3>No Lessons Found</h3>
              <p>Try a different search or check again later.</p>
              {searchQuery && (
                <button
                  className="clear-search"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="schedule-cards-container">
              {filteredSchedule.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`schedule-card status-${lesson.status.toLowerCase()}`}
                >
                  <div className="card-header">
                    <div className="lesson-status">
                      <span
                        className={`status-badge ${lesson.status.toLowerCase()}`}
                      >
                        {lesson.status}
                      </span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="lesson-info">
                      <div className="info-item">
                        <Calendar size={16} className="info-icon" />
                        <span className="info-label">Date:</span>
                        <span className="info-value">{formatDate(lesson.date)}</span>
                      </div>

                      <div className="info-item">
                        <Clock size={16} className="info-icon" />
                        <span className="info-label">Time:</span>
                        <span className="info-value">{lesson.timeSlot}</span>
                      </div>

                      <div className="info-item">
                        <User size={16} className="info-icon" />
                        <span className="info-label">Student:</span>
                        <span className="info-value">{lesson.studentName}</span>
                      </div>

                      <div className="info-item">
                        <Car size={16} className="info-icon" />
                        <span className="info-label">Vehicle:</span>
                        <span className="info-value">{lesson.vehicle}</span>
                      </div>
                    </div>

                    <div className="session-actions">
                      <button
                        onClick={() => handleCompleteSession(lesson)}
                        className="btn-complete"
                      >
                        Session Completed
                      </button>
                      <button className="btn-incomplete">
                        Session Not Completed
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InstructorSchedule;
