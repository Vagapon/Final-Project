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

  return (
    <div className="bg-black-100 min-h-screen text-gray-900">
      <Header />

      {/* Hiển thị Banner cho trang chủ */}
      {isHomePage && <Banner />}

      {/* Hiển thị PageBanner cho các trang khác (trừ blog) */}
      {!isHomePage && !isBlogPage && (
        <PageBanner pathname={location.pathname} />
      )}

      {/* Nếu là blog mà không có PageBanner thì thêm khoảng trống */}
      {isBlogPage && <div className="pt-28 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100"></div>} 
      {/* pt-24 = khoảng cách bằng chiều cao Header, chỉnh lại nếu Header cao khác */}

      <Outlet />
      <Footer />
    </div>
  );
}

export default App;
