# Driving_School
Web based project for Madushani Driving School.

## Recent Updates
- Added instructor status management feature
- Improved profile management for instructors

## Setup and Deployment

### Database Setup
1. Create the initial database if it doesn't exist:
   ```sql
   CREATE DATABASE drivingschool_db;
   USE drivingschool_db;
   ```

2. Run the schema update script to add new columns and indexes:
   ```bash
   mysql -u username -p drivingschool_db < database/update_schema.sql
   ```

### Backend
1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Start the server:
   ```bash
   node server.js
   ```

### Admin Panel
1. Install dependencies:
   ```bash
   cd admin
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Student Portal
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Instructor Status Management
The system now supports different instructor statuses:
- Available: Ready to take lessons
- On Leave: Temporarily unavailable
- Sick: Unavailable due to sickness
- Training: Unavailable due to training

Instructors can update their status from their profile page, and it will be reflected across the system.
