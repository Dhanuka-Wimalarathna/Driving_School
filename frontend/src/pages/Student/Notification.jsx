// Notification.jsx
import React from 'react';
import './Notification.css';

const Notification = ({ notifications, markAsRead, unreadCount, notificationOpen, toggleNotifications }) => {
  return (
    <div className="notification-wrapper">
      <button 
        className="action-button notification-button"
        onClick={toggleNotifications}
      >
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
      
      {/* Notification Panel */}
      {notificationOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read">Mark all as read</button>
            )}
          </div>
          
          <div className="notification-body">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {notification.type === 'confirmation' && <i className="bi bi-check-circle"></i>}
                    {notification.type === 'feedback' && <i className="bi bi-chat-left-text"></i>}
                    {notification.type === 'achievement' && <i className="bi bi-trophy"></i>}
                  </div>
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-date">{notification.date}</span>
                  </div>
                  {!notification.read && <div className="unread-dot"></div>}
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;