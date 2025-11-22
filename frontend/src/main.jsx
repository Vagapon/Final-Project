import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.jsx";

import AdminLayout from "./components/dashboard/AdminLayout.jsx"; 
import Overview from "./pages/Admin/Event/Overview.jsx"; 
import User from "./pages/Admin/Users/User.jsx"; 
import Event from "./pages/Admin/Event/Event.jsx"; 
import Profile from "./pages/Admin/Users/Profile.jsx";
import Chat from "./components/Chat/ChatApp.jsx"; 
import Login from "./pages/Authen/Login.jsx"; 
import ForgotPassword from "./pages/Authen/ForgotPassword.jsx";
import Team from "./pages/Admin/Users/Team.jsx"; 
import Ranking from "./pages/Admin/Users/Ranking.jsx";
import Home from "./pages/HomePage/Home.jsx";
import MyTeam from "./pages/MyTeam/TeamPage.jsx";
import Blog from "./pages/Blogs/Blog.jsx"; 
import Challenge from "./pages/Challenges/Challenge.jsx";
import Booking from "./pages/FieldBooking/FieldBooking.jsx";
import BookingPage from "./pages/FieldBooking/BookingPage.jsx";
import BookingHistory from "./pages/FieldBooking/BookingHistory.jsx";
import Match from "./pages/Admin/Event/Match.jsx"; 
import Register from "./pages/Authen/Register.jsx"; 
import ProtectedRoute from "./routes/ProtectedRoute.jsx"; 
import { AuthProvider } from "./pages/Authen/AuthContext.jsx";
import { SocketProvider } from "./contexts/SocketContext.jsx";
import Unauthorized from "./pages/Authen/Unauthorized.jsx";
import CreateStaff from "./pages/Admin/Users/CreateStaff.jsx"; 
import Season from "./pages/Admin/Event/Season.jsx"; 
import Stadium from "./pages/Admin/Booking/Stadium.jsx";
import BlogManagement from "./pages/Admin/Blog/BlogManagement.jsx";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find root element");

createRoot(rootElement).render(
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/myteam" element={<MyTeam />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/challenge" element={<Challenge />} />
              <Route path="/book" element={<Booking />} />
              <Route path="/booking-history" element={<BookingHistory />} />
              <Route path="/booking/:fieldId/:timeSlotId/:date" element={<BookingPage />} />
            </Route>
          </Route>
          {/* </Route> */}

          {/* Layout admin */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN" || "STAFF"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Overview />} />
              <Route path="users" element={<User />} />
              <Route path="events" element={<Event />} />
              <Route path="profile" element={<Profile />} />
              <Route path="teams" element={<Team />} />
              <Route path="ranks" element={<Ranking />} />
              <Route path="matches" element={<Match />} />
              <Route path="create-staff" element={<CreateStaff />} />
              <Route path="seasons" element={<Season />} />
              <Route path="stadium" element={<Stadium />} />
              <Route path="blogs" element={<BlogManagement />} />
            </Route>
          </Route>

          {/* Layout staff */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STAFF"]} />}>
            <Route path="/staff" element={<AdminLayout />}>
              <Route index element={<Overview />} />
              <Route path="events" element={<Event />} />
              <Route path="profile" element={<Profile />} />
              <Route path="matches" element={<Match />} />
            </Route>
          </Route>

          {/* Chat dùng chung? */}
          <Route path="/chat" element={<Chat />} />

          {/* Login/Register */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Unauthorized route */}
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);
