import React from 'react';
import { Calendar, CreditCard, Check } from 'lucide-react';

const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, title: 'Chọn ngày & giờ', icon: Calendar, description: 'Chọn ngày, giờ và thông tin người đặt' },
    { id: 2, title: 'Thanh toán', icon: CreditCard, description: 'Thanh toán online banking' },
    { id: 3, title: 'Hoàn tất', icon: Check, description: 'Xác nhận đặt sân thành công' }
  ];

  return (
    <div className="bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 ">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white shadow-lg scale-110' 
                  : 'bg-white text-gray-400 border-2 border-gray-300'
              }`}>
                <step.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <div className={`text-sm font-semibold transition-colors ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-6 transition-colors ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
