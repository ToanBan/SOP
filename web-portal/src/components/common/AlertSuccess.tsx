import React from 'react';

interface Props {
  message: string;
  description?: string; // Thêm mô tả chi tiết nếu cần
}

const AlertSuccess = ({ message, description }: Props) => {
  return (
    <div className="max-w-sm w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 border-emerald-500 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex-1 p-4">
        <div className="flex items-start">
          {/* Icon Success - Vòng tròn xanh */}
          <div className="flex-shrink-0">
            <svg 
              className="h-6 w-6 text-emerald-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="2" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                pathLength="1"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>

          {/* Nội dung tin nhắn */}
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {message}
            </p>
            {description && (
              <p className="mt-1 text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>

          {/* Nút đóng (X) */}
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => {/* Logic đóng nếu cần */}}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 0114.14 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertSuccess;