# Skill Swap Platform

A full-stack MERN application that enables users to list their skills and request skill swaps with other users.

## Features

### User Features
- User registration and authentication
- Profile management with skills offered/wanted
- Browse and search other users by skills
- Send and manage swap requests
- Rate and provide feedback after swaps
- Public/private profile settings
- Availability scheduling

### Admin Features
- User management (ban/unban users)
- Monitor all swaps and requests
- Handle reports and inappropriate content
- Send platform-wide messages
- Download activity reports

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd skill-swap-platform
\`\`\`

### 2. Install Dependencies
\`\`\`bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run install-server
\`\`\`

### 3. Environment Setup
Create a `.env` file in the `server` directory:
\`\`\`bash
cd server
cp .env.example .env
\`\`\`

Edit the `.env` file with your configuration:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_super_secret_jwt_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
\`\`\`

### 4. Start MongoDB
Make sure MongoDB is running on your system:
\`\`\`bash
# If using local MongoDB
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod
\`\`\`

### 5. Run the Application

#### Development Mode (Recommended)
\`\`\`bash
# Terminal 1: Start the backend server
npm run server

# Terminal 2: Start the frontend development server
npm run dev
\`\`\`

#### Production Mode
\`\`\`bash
# Build the frontend
npm run build

# Start the backend server
cd server
npm start
\`\`\`

## Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts
- `npm run server` - Start backend development server
- `cd server && npm start` - Start backend production server
- `cd server && npm run dev` - Start backend with nodemon

### Combined Scripts
- `npm run setup` - Install all dependencies
- `npm run install-server` - Install server dependencies only

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/browse` - Browse public users
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user dashboard stats
- `GET /api/users/:id` - Get user by ID

### Swaps
- `POST /api/swaps/request` - Create swap request
- `GET /api/swaps/my-requests` - Get user's swap requests
- `PUT /api/swaps/:id/accept` - Accept swap request
- `PUT /api/swaps/:id/reject` - Reject swap request
- `PUT /api/swaps/:id/complete` - Mark swap as completed
- `DELETE /api/swaps/:id` - Delete swap request
- `POST /api/swaps/:id/feedback` - Submit feedback

### Admin (Admin only)
- `GET /api/admin/stats` - Get admin dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/swaps` - Get all swaps
- `PUT /api/admin/users/:id/ban` - Ban user
- `PUT /api/admin/users/:id/unban` - Unban user
- `POST /api/admin/broadcast` - Send platform message
- `GET /api/admin/reports/:type` - Download reports

## Default Admin Account

To create an admin account, you can either:

1. Register normally and manually update the user role in MongoDB:
\`\`\`javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
\`\`\`

2. Or modify the registration route temporarily to create an admin account.

## Project Structure

\`\`\`
skill-swap-platform/
├── public/                 # Static files
├── src/                   # Frontend source code
│   ├── components/        # Reusable components
│   ├── contexts/         # React contexts
│   ├── pages/            # Page components
│   ├── services/         # API services
│   └── main.jsx          # App entry point
├── server/               # Backend source code
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── server.js         # Server entry point
└── README.md
\`\`\`

## Usage

1. **Register/Login**: Create an account or sign in
2. **Setup Profile**: Add your skills, location, and availability
3. **Browse Users**: Search for people with skills you want to learn
4. **Request Swaps**: Send swap requests to other users
5. **Manage Requests**: Accept/reject incoming requests
6. **Complete Swaps**: Mark swaps as completed after meeting
7. **Leave Feedback**: Rate your experience with other users

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
