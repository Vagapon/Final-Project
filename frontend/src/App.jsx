// App.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './components/homelayout/Footer';
import Banner from './components/homelayout/Banner';
import PageBanner from './components/PageBanner';
import Header from './components/homelayout/Header';

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/home';

  return (
    <div className="bg-black-100 min-h-screen text-gray-900">
      <Header />
      
      {/* Hiển thị Banner cho trang chủ */}
      {isHomePage && <Banner />}
      
      {/* Hiển thị PageBanner cho các trang khác */}
      {!isHomePage && <PageBanner pathname={location.pathname} />}
      
      <Outlet />
      <Footer />
    </div>
  );
}

export default App;