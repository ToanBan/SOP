import React from 'react';

interface Props {
  message: string;
  description?: string;
}

const AlertError = ({ message, description }: Props) => {
  return (
    <div className="max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-rose-500 ring-opacity-10 overflow-hidden border-l-4 border-rose-500 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex-1 p-4">
        <div className="flex items-start">
          {/* Icon Error - Dấu chấm than trong hình tròn */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-100">
              <svg 
                className="h-5 w-5 text-rose-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="2.5" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
                />
              </svg>
            </div>
          </div>

          {/* Nội dung lỗi */}
          <div className="ml-4 flex-1">
            <p className="text-sm font-bold text-rose-900">
              Có lỗi xảy ra
            </p>
            <p className="mt-1 text-sm text-rose-700 leading-relaxed">
              {message}
            </p>
            {description && (
              <p className="mt-2 text-xs text-rose-500 italic">
                {description}
              </p>
            )}
          </div>

          {/* Nút đóng (X) */}
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              className="inline-flex text-rose-400 hover:text-rose-600 transition-colors focus:outline-none"
              onClick={() => {}}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertError;