import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  User,
  CreditCard,
  Search,
} from "lucide-react";

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

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
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50"></div>
          </div>
        ))}
      </div>

      {/* Content - Improved Responsive */}
      <div className="absolute inset-0 flex items-center justify-center text-center text-white z-20 px-4 sm:px-6">
        <div className="max-w-4xl w-full">
          <h1
            key={currentSlide}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-6xl font-black mb-4 sm:mb-6 animate-fade-in-up"
            style={{
              fontFamily: "Arial Black, sans-serif",
              textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
              animation: "fadeInUp 1s ease-out",
            }}
          >
            {slides[currentSlide].title}
          </h1>
          <p
            key={`subtitle-${currentSlide}`}
            className="text-lg sm:text-xl md:text-xl lg:text-3xl mb-8 sm:mb-12 opacity-90 font-light tracking-wide animate-fade-in-up max-w-2xl mx-auto"
            style={{
              animationDelay: "0.3s",
              animation: "fadeInUp 1s ease-out 0.3s both",
            }}
          >
            {slides[currentSlide].subtitle}
          </p>
          <button
            key={`button-${currentSlide}`}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-base sm:text-lg font-semibold rounded-md uppercase tracking-wide transition-all duration-300 hover:scale-105 shadow-lg"
            style={{
              animationDelay: "0.6s",
              animation: "fadeInUp 1s ease-out 0.6s both",
            }}
          >
            {slides[currentSlide].buttonText}
          </button>
        </div>
      </div>

      {/* Arrows - Responsive */}
      <button
        onClick={prevSlide}
        className="hidden absolute left-2 sm:left-4 lg:left-8 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden absolute right-2 sm:right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Slide Counter - Responsive */}
      {/* <div className="absolute left-2 sm:left-4 lg:left-8 bottom-4 sm:bottom-8 z-30 text-white text-2xl sm:text-3xl lg:text-4xl font-light">
        <span className="font-bold">0{currentSlide + 1}</span>
        <span className="opacity-50">/0{slides.length}</span>
      </div> */}
{/* 
      <div className="absolute right-2 sm:right-4 lg:right-8 bottom-4 sm:bottom-8 z-30 text-white text-2xl sm:text-3xl lg:text-4xl font-light">
        <span className="font-bold">
          0{((currentSlide + 1) % slides.length) + 1}
        </span>
        <span className="opacity-50">/0{slides.length}</span>
      </div> */}

      {/* Indicators */}
      <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2 sm:space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>

      {/* Side Buttons - Hidden on mobile */}
      <div className="hidden lg:flex fixed right-0 top-1/2 transform -translate-y-1/2 z-40 flex-col space-y-1">
        {[Search, User, CreditCard].map((Icon, i) => (
          <button
            key={i}
            className="bg-green-500 hover:bg-green-600 text-white p-4 transition-all duration-300 hover:scale-110"
          >
            <Icon className="w-6 h-6" />
          </button>
        ))}
      </div>

      {/* Chat Button - Responsive */}
      <button className="fixed bottom-6 sm:bottom-8 left-4 sm:left-6 lg:left-8 z-50 group">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-green-400 rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity animate-pulse"></div>

          {/* Main button */}
          <div className="relative bg-gradient-to-tr bg-green-500 hover:bg-green-600 text-white p-4 sm:p-5 rounded-full shadow-xl transition-all duration-300 group-hover:scale-110 border border-green-300/30 flex items-center justify-center">
            {/* Icon container */}
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-12 transition-transform" />

              {/* Text appears on hover - desktop only */}
              <span className="hidden group-hover:block lg:group-hover:block text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                Chat với chúng tôi
              </span>
            </div>

            {/* Online indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
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
