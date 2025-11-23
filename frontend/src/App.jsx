// App.jsx
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./components/homelayout/Footer";
import Banner from "./components/homelayout/Banner";
import PageBanner from "./components/PageBanner";
import Header from "./components/homelayout/Header";

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isBlogPage = location.pathname.startsWith("/blog");
  const isBookingPage =
    location.pathname === "/book" ||
    location.pathname.startsWith("/booking/") ||
    location.pathname.startsWith("/book/") ||
    location.pathname === "/booking-history" ||
    location.pathname.startsWith("/booking-history/");
  const isMyTeamPage = location.pathname === "/myteam";
  const isChallengePage = location.pathname === "/challenge";

  // Danh sách các trang không hiển thị PageBanner
  const pagesWithoutPageBanner = isBlogPage || isBookingPage || isMyTeamPage || isChallengePage;

  // Xác định màu nền dựa trên trang
  const getBackgroundClass = () => {
    if (isHomePage) {
      return "bg-black-100"; // Giữ nguyên cho trang home
    }
    return "bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100"; // Màu nền cho các trang khác
  };

  return (
    <div className={`${getBackgroundClass()} min-h-screen text-gray-900`}>
      <Header />
      {/* Spacer to place content under the absolute header on non-home pages */}
      {!isHomePage && <div className="pt-32" />}

      {/* Hiển thị Banner cho trang chủ */}
      {isHomePage && <Banner />}

      {/* Hiển thị PageBanner cho các trang khác (trừ blog, booking, myteam, challenge) */}
      {!isHomePage && !pagesWithoutPageBanner && (
        <PageBanner pathname={location.pathname} />
      )}

      <Outlet />
      <Footer />
    </div>
  );
}

export default App;
