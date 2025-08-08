import React from 'react';
import { Shield, ArrowLeft, Home, Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          
          {/* Error code */}
          <h1 className="text-7xl font-light text-gray-900 mb-2 tracking-tight">
            401
          </h1>
          
          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Không có quyền truy cập
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed max-w-sm mx-auto">
            Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập hoặc liên hệ quản trị viên để được hỗ trợ.
          </p>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại trang trước
          </button>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Home className="h-4 w-4 mr-2" />
            Về trang chủ
          </button>
          
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Lock className="h-4 w-4 mr-2" />
            Đăng nhập
          </button>
        </div>
        
        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ? 
            <a 
              href="mailto:support@yoursite.com" 
              className="text-blue-600 hover:text-blue-700 ml-1 font-medium transition-colors duration-200"
            >
              Liên hệ với chúng tôi
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}