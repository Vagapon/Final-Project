// src/main.jsx
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

// Import layout và các page con
import AdminLayout from "./components/dashboard/AdminLayout.jsx"; // layout admin
import Overview from "./pages/Admin/Overview.jsx"; // trang chính /admin
import User from "./pages/Admin/User.jsx"; // trang /admin/users
import Event from "./pages/Admin/Event.jsx"; // ví dụ trang khác
import Profile from "./pages/Admin/Profile.jsx";
import Chat from "./components/Chat/ChatApp.jsx"; // ví dụ trang khác
import Login from "./pages/Ahthen/Login.jsx"; // trang đăng nhập
import Team from "./pages/Admin/Team.jsx"; // trang team
import Ranking from "./pages/Admin/Ranking.jsx";
import Home from "./pages/HomePage/Home.jsx";
import MyTeam from "./pages/MyTeam/TeamPage.jsx";
import Blog from "./pages/Blogs/Blog.jsx"; // trang blog, nếu có
import Challenge from "./pages/Challenges/Challenge.jsx";
import Highlight from "./pages/Blogs/HighLight.jsx"
import Match from "./pages/Admin/Match.jsx"; // trang quản lý trận đấu
import Register from "./pages/Ahthen/Register.jsx"; // trang đăng ký
import LandingPage from "./pages/LandingPage.jsx";
import ThreeExperience from "./pages/ThreeExperience.jsx";
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find root element");

createRoot(rootElement).render(
  <BrowserRouter>
    <Routes>
        {/* Route dành cho người dùng với layout App.jsx */}
      <Route path="/" element={<App />}>
       
        <Route path="/home" element={<Home />} />
        <Route path="/myteam" element={<MyTeam />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/challenge" element={<Challenge />} />
        <Route path="/highlight" element={<Highlight />} />
        {/* Bạn có thể thêm các route khác tại đây */}
      </Route>
      <Route index element={<LandingPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Overview />} /> {/* /admin */}
        <Route path="users" element={<User />} />
        <Route path="events" element={<Event />} /> {/* /admin/users */}
        <Route path="profile" element={<Profile />} />
        <Route path="teams" element={<Team />} /> {/* /admin/users */}
        <Route path="ranks" element={<Ranking />} /> {/* /admin/users */}
        <Route path="matches" element={<Match />} /> {/* /admin/users */}
        {/* bạn có thể thêm các route con khác tại đây */}
      </Route>
      <Route path="/three" element={<ThreeExperience />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register/>} />
    </Routes>
  </BrowserRouter>
);
