# PS 06: Student Club Event & Volunteer Management Platform

A full-stack MERN application for managing student club events, volunteer assignments, and attendance tracking.

## Live Demo

- **Frontend**: [Vercel URL](https://student-club-platform.vercel.app)
- **Backend API**: [Render URL](https://student-club-server.onrender.com/api)

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT with HTTP-only cookies

## Features

### Authentication & RBAC
- JWT-based login/signup with role selection (Student, Organizer, Admin)
- Protected routes with role-based access control

### Organizer Dashboard
- Create, update, delete events with capacity, venue, deadlines
- Define volunteer roles with slot limits per event
- Attendance tracking with QR token check-in
- Real-time statistics (registered, checked-in, remaining)

### Student Portal
- Event discovery with search and category filtering
- Register as Attendee or Volunteer
- Atomic capacity protection (prevents overbooking)
- Duplicate registration prevention
- View registered events and check-in tokens

### Attendance System
- Unique check-in token per registration
- One-time check-in enforcement
- Organizer scan/search check-in workflow
- Live attendance statistics

## Project Structure

```
/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # EventCard, Navbar, RegistrationModal
│   │   ├── context/            # AuthContext (global auth state)
│   │   ├── pages/              # LoginPage, SignupPage, StudentDashboard, OrganizerDashboard
│   │   ├── services/           # Axios API service
│   │   ├── App.js              # Router + role-based routing
│   │   └── index.js            # Entry point
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── server/                     # Express Backend
    ├── config/db.js            # MongoDB connection
    ├── middleware/auth.js       # protect + authorize() RBAC
    ├── models/                 # User, Event, Registration, VolunteerAssignment
    ├── controllers/            # authController, eventController, registrationController
    ├── routes/                 # auth, events, registrations
    ├── seeder.js               # Test data seeder
    └── server.js               # Express entry point
```

## API Endpoints

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Current user |
| GET | `/api/events` | Public | List events (with filters) |
| POST | `/api/events` | Organizer/Admin | Create event |
| PUT | `/api/events/:id` | Organizer/Admin | Update event |
| DELETE | `/api/events/:id` | Organizer/Admin | Delete event |
| POST | `/api/registrations` | Student | Register as attendee |
| POST | `/api/registrations/volunteer` | Student | Register as volunteer |
| POST | `/api/registrations/checkin` | Organizer/Admin | Check in student |
| GET | `/api/registrations/stats/:eventId` | Organizer/Admin | Event stats |

## Run Locally

### Prerequisites
- Node.js v16+
- MongoDB running locally or Atlas connection string

### Setup

```bash
# Clone the repo
git clone https://github.com/upadhayayashish617-prog/student-club-platform.git
cd student-club-platform

# Install dependencies
cd server && npm install
cd ../client && npm install

# Seed test data (from server/)
cd ../server
node seeder.js

# Start both servers (from root/)
cd ..
npm start
```

### Test Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@club.com | password123 | Admin |
| organizer@club.com | password123 | Organizer |
| student@club.com | password123 | Student |
| jane@club.com | password123 | Student |

## Key Business Logic

- **Atomic capacity protection**: Uses MongoDB `$inc` with conditional `{ availableSlots: { $gt: 0 } }` to prevent race conditions
- **Duplicate prevention**: Compound unique index `{ user: 1, event: 1 }` on Registration schema
- **One-time check-in**: Boolean toggle with explicit double-check guard
- **Auto status transitions**: Event status auto-updates to "Full" when slots reach 0

## Deployment

- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas (free M0 cluster)

## License

MIT
