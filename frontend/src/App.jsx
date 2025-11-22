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
    location.pathname.startsWith("/booking/") ||
    location.pathname.startsWith("/book/") ||
    location.pathname.startsWith("/booking-history");

  return (
    <div className="bg-black-100 min-h-screen text-gray-900">
      <Header />
      {/* Spacer to place content under the absolute header on non-home pages */}
      {!isHomePage && <div className="pt-24" />}

      {/* Hiển thị Banner cho trang chủ */}
      {isHomePage && <Banner />}

      {/* Hiển thị PageBanner cho các trang khác (trừ blog) */}
      {!isHomePage && !isBlogPage && !isBookingPage && (
        <PageBanner pathname={location.pathname} />
      )}

      {/* Blog không có PageBanner, nhưng đã có spacer chung ở trên */}
      {/* pt-20 = khoảng cách cho Header, giảm từ pt-28 để tối ưu không gian */}

      <Outlet />
      <Footer />
    </div>
  );
}

export default App;
