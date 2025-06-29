import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white text-sm mt-10">
      {/* Newsletter */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">Stay in the Loop</h2>
            <p className="text-gray-400 mt-1">Get the latest updates on matches, tickets and news.</p>
          </div>
          <form className="w-full md:w-auto flex">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-3 rounded-l-md bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-r-md font-medium transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Description */}
        <div className="md:col-span-2">
          <img
            src="https://ext.same-assets.com/2224353730/263125055.png"
            alt="FC United"
            className="h-10 mb-4"
          />
          <p className="text-gray-400 leading-relaxed">
            FC United isn't just a football club — it's a passion-driven community. Follow us for live updates, match schedules, and exclusive content.
          </p>
          <div className="flex space-x-4 mt-5">
            <a href="#" className="hover:text-red-500 transition-colors">
              <FaFacebookF />
            </a>
            <a href="#" className="hover:text-red-500 transition-colors">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-red-500 transition-colors">
              <FaInstagram />
            </a>
            <a href="#" className="hover:text-red-500 transition-colors">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-base font-semibold mb-4 text-white">Quick Links</h4>
          <ul className="space-y-3">
            {["Home", "Matches", "About Us", "Contact"].map((link) => (
              <li key={link}>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-base font-semibold mb-4 text-white">Contact</h4>
          <div className="space-y-2 text-gray-400">
            <p>📧 info@fcunited.com</p>
            <p>📞 +1 (555) 123-4567</p>
            <p>📍 123 Football Ave, Sports City</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs gap-4">
          <p>© 2025 FC United. All Rights Reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
