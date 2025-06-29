import React, { useState, useEffect } from "react";
import { MapPin, Send, ArrowUp } from "lucide-react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the data to your backend
    alert("Message sent successfully!");

    // Reset form
    setFormData({
      name: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Main Content Container */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Map Section */}
        <div className="w-full lg:w-1/2 relative h-64 lg:h-screen">
          {/* Map placeholder with location marker */}
          {/* Google Maps Embedded */}
          <div className="w-full h-full relative overflow-hidden rounded-lg shadow-lg">
            <iframe
              title="Hà Nội Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.511188064388!2d105.81505331488374!3d21.011153386007503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9c23b1e4f7%3A0x4e0de1faed5c6c25!2zSOG6o2kgTuG7mWkgLSBIw6AgTuG7mWkgQ2l0eQ!5e0!3m2!1svi!2s!4v1719574757555!5m2!1svi!2s"
              className="w-full h-full border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>

            {/* Location Info Box */}
            <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md border text-sm font-medium text-gray-700">
              📍 Hà Nội, Việt Nam
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-lg">
            {/* Contact Us Header */}
            <div className="text-center mb-8">
              <p className="text-sm font-medium text-gray-500 mb-2 tracking-wider uppercase">
                CONTACT US
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                Have Questions?
              </h1>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Get in Touch!
              </h2>
            </div>

            {/* Contact Form */}
            <div className="space-y-6">
              {/* Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Email and Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <textarea
                  name="message"
                  placeholder="Message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-500 resize-vertical"
                  required
                />
              </div>

              {/* Submit Button */}
              <div>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Send className="w-5 h-5" />
                  <span>Get In Touch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 transform hover:-translate-y-1"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Demo Content for Scroll Testing */}
    </div>
  );
}

export default Contact;
