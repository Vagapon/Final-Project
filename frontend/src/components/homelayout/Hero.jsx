import React, { useState, useEffect } from "react";

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image:
        "https://i.eurosport.com/2019/08/13/2654862-54919550-2560-1440.jpg",
      title: "Champions League",
      subtitle: "Teams, Leagues and Competitions",
      buttonText: "Join Our Club",
    },
    {
      image:
        "https://bcp.cdnchinhphu.vn/Uploaded/buithuhuong/2018_07_12/u23.jpg",
      title: "Premium Experience",
      subtitle: "Professional Training & Championship Events",
      buttonText: "Book Now",
    },
    {
      image:
        "https://cdn.pixabay.com/photo/2016/11/29/07/06/bleachers-1867992_1280.jpg",
      title: "Elite Coaching",
      subtitle: "Learn from the Best Professional Instructors",
      buttonText: "Start Training",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Slider */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay - nhẹ hơn để không che nhiều ảnh */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/30"></div>
          </div>
        ))}
      </div>

      {/* Content - Đặt ở bên trái để không che ảnh */}
      <div className="absolute inset-0 flex items-center justify-start text-left text-white z-20 px-6 sm:px-12 lg:px-16">
        <div className="max-w-2xl w-full">
          <h1
            key={currentSlide}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-3 sm:mb-4 animate-fade-in-up"
            style={{
              fontFamily: "Arial Black, sans-serif",
              textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
              animation: "fadeInUp 1s ease-out",
              lineHeight: "1.1",
            }}
          >
            {slides[currentSlide].title}
          </h1>
          <p
            key={`subtitle-${currentSlide}`}
            className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 opacity-95 font-light tracking-wide animate-fade-in-up max-w-lg"
            style={{
              animationDelay: "0.3s",
              animation: "fadeInUp 1s ease-out 0.3s both",
              textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
            }}
          >
            {slides[currentSlide].subtitle}
          </p>
          <button
            key={`button-${currentSlide}`}
            className="bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold rounded-sm uppercase tracking-wider transition-all duration-300 hover:scale-105 shadow-2xl animate-fade-in-up"
            style={{
              animationDelay: "0.6s",
              animation: "fadeInUp 1s ease-out 0.6s both",
            }}
          >
            {slides[currentSlide].buttonText}
          </button>
        </div>
      </div>

      {/* Content overlay cho mobile - center aligned */}
      <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10 px-4 sm:hidden">
        <div className="max-w-sm w-full bg-black/40 backdrop-blur-sm rounded-lg p-6">
          <h1
            key={`mobile-${currentSlide}`}
            className="text-2xl font-black mb-3 animate-fade-in-up"
            style={{
              fontFamily: "Arial Black, sans-serif",
              textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
              animation: "fadeInUp 1s ease-out",
            }}
          >
            {slides[currentSlide].title}
          </h1>
          <p
            className="text-sm mb-4 opacity-95 font-light"
            style={{
              textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
            }}
          >
            {slides[currentSlide].subtitle}
          </p>
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 text-sm font-bold rounded-sm uppercase tracking-wider transition-all duration-300">
            {slides[currentSlide].buttonText}
          </button>
        </div>
      </div>

      {/* Arrows - Responsive */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Counter - Responsive và thu gọn */}
      <div className="absolute left-2 sm:left-4 lg:left-8 bottom-4 sm:bottom-8 z-30 text-white text-lg sm:text-xl lg:text-2xl font-light">
        <span className="font-bold">0{currentSlide + 1}</span>
        <span className="opacity-50">/0{slides.length}</span>
      </div>

      <div className="absolute right-2 sm:right-4 lg:right-8 bottom-4 sm:bottom-8 z-30 text-white text-lg sm:text-xl lg:text-2xl font-light">
        <span className="font-bold">
          0{((currentSlide + 1) % slides.length) + 1}
        </span>
        <span className="opacity-50">/0{slides.length}</span>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-12 sm:bottom-16 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>

      {/* Side Buttons - Hidden on mobile, thu gọn */}
      <div className="hidden lg:flex fixed right-0 top-1/2 transform -translate-y-1/2 z-40 flex-col space-y-1">
        <button className="bg-green-500 hover:bg-green-600 text-white p-3 transition-all duration-300 hover:scale-110">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white p-3 transition-all duration-300 hover:scale-110">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        <button className="bg-green-500 hover:bg-green-600 text-white p-3 transition-all duration-300 hover:scale-110">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </button>
      </div>

      {/* Chat Button - Responsive và thu gọn */}
      <button className="fixed bottom-4 sm:bottom-6 left-2 sm:left-4 z-40 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="font-medium text-sm">Chat</span>
      </button>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Banner;