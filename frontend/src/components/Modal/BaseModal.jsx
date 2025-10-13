import { useEffect } from "react";
import { X } from "lucide-react";

const BaseModal = ({ isOpen, onClose, title, size = "lg", children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          sizeClasses[size]
        } ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
};

export default BaseModal;
