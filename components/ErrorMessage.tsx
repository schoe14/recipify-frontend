
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);


export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="mt-6 p-4 sm:p-5 bg-[#FFF0E6] border border-[#FFCCBC] text-[#D84315] rounded-lg shadow-lg flex items-start gap-3 sm:gap-4"> {/* Light Soft Coral BG, Darker Coral Border/Text */}
      <ExclamationTriangleIcon className="text-[#FF8A65] w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 mt-0.5 sm:mt-1" /> {/* Soft Coral Icon */}
      <div className="min-w-0 flex-1"> 
        <h4 className="text-md sm:text-lg font-semibold text-[#BF360C] font-['Poppins']">Recipe Hiccup!</h4> {/* Darker Soft Coral for Title */}
        <p className="text-sm sm:text-base text-[#D84315] mt-1 font-['Roboto']">{message}</p> {/* Darker Soft Coral for Message */}
      </div>
    </div>
  );
};