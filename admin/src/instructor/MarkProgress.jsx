import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import './MarkProgress.css';

const MarkProgress = () => {
  const { id } = useParams();
  const location = useLocation();
  const student = location.state?.student || {};
  const [summary, setSummary] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8081/api/student-progress/${id}`)
      .then(res => {
        setSummary(res.data.summary);
        setDetails(res.data.details);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading progress…</p>;

  return (
    <div className="mark-progress-container">
      <h2>{student.firstName} {student.lastName}'s Progress</h2>

      <h3>Summary by Vehicle</h3>
      <table className="summary-table">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Done</th>
            <th>Remaining</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {summary.map(row => (
            <tr key={row.vehicle_id}>
              <td>{row.vehicleType}</td>
              <td>{row.completedSessions}</td>
              <td>{row.remainingSessions}</td>
              <td>{row.totalSessions}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Completed Sessions</h3>
      <table className="details-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Vehicle</th>
            <th>Time</th>
            <th>Marked At</th>
          </tr>
        </thead>
        <tbody>
          {details.map(sess => (
            <tr key={sess.id}>
              <td>{new Date(sess.date).toLocaleDateString()}</td>
              <td>{sess.vehicleType}</td>
              <td>{sess.timeSlot}</td>
              <td>{new Date(sess.completedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarkProgress;
