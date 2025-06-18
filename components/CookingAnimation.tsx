
import React from 'react';
import type { AnimationType } from '../types';

interface CookingAnimationProps {
  type: AnimationType;
}

const GeneratingAnimation: React.FC = () => (
  <div className="flex flex-col items-center">
    <svg width="120" height="120" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
      {/* Pot */}
      <path d="M30 110 Q30 90 50 90 H100 Q120 90 120 110 V130 H30 V110 Z" fill="#607D8B"/> {/* Slate Gray */}
      <ellipse cx="75" cy="90" rx="48" ry="10" fill="#78909C"/> {/* Lighter Slate Gray */}
      {/* Lid Handle */}
      <rect x="70" y="75" width="10" height="8" fill="#455A64" rx="2"/> {/* Darker Slate Gray */}
      {/* Steam */}
      <path d="M60 40 Q65 20 70 40 T80 40" stroke="#CFD8DC" strokeWidth="4" strokeLinecap="round"> {/* Lightest Slate Gray */}
        <animate attributeName="d" values="M60 70 Q65 50 70 70 T80 70; M60 40 Q65 20 70 40 T80 40; M60 70 Q65 50 70 70 T80 70" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
      </path>
      <path d="M75 50 Q80 30 85 50 T95 50" stroke="#CFD8DC" strokeWidth="4" strokeLinecap="round">
        <animate attributeName="d" values="M75 75 Q80 55 85 75 T95 75; M75 50 Q80 30 85 50 T95 50; M75 75 Q80 55 85 75 T95 75" dur="1.7s" repeatCount="indefinite" begin="0.2s"/>
        <animate attributeName="opacity" values="0;1;0" dur="1.7s" repeatCount="indefinite" begin="0.2s"/>
      </path>
      {/* Bubbles */}
      <circle cx="65" cy="100" r="3" fill="#B0BEC5"> {/* Medium Slate Gray */}
        <animate attributeName="cy" values="105;95;105" dur="1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.8;0" dur="1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="85" cy="102" r="4" fill="#B0BEC5">
        <animate attributeName="cy" values="107;97;107" dur="1.2s" repeatCount="indefinite" begin="0.3s"/>
         <animate attributeName="opacity" values="0;0.8;0" dur="1.2s" repeatCount="indefinite" begin="0.3s"/>
      </circle>
    </svg>
    <p className="text-xl font-semibold text-[#00796B] font-['Poppins']">Whipping up your recipe...</p> {/* Darker Teal */}
    <p className="text-[#607D8B] font-['Roboto']">Simmering ideas, please wait!</p> {/* Slate Gray */}
  </div>
);

const SurprisingAnimation: React.FC = () => (
  <div className="flex flex-col items-center">
     <svg width="120" height="120" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
        {/* Chef Hat Base */}
        <path d="M35 130 Q75 120 115 130 L110 90 Q75 80 40 90 Z" fill="#FFFFFF"/>
        <rect x="30" y="128" width="90" height="12" fill="#ECEFF1" rx="3"/> {/* Light Neutral */}
        {/* Chef Hat Puff */}
        <ellipse cx="75" cy="70" rx="50" ry="35" fill="#FFFFFF"/>
        <ellipse cx="55" cy="60" rx="25" ry="18" fill="#F5F5F5"/> {/* Lighter Neutral */}
        <ellipse cx="95" cy="60" rx="25" ry="18" fill="#F5F5F5"/>
        <ellipse cx="75" cy="50" rx="20" ry="15" fill="#FFFFFF"/>
        {/* Sparkles using Soft Coral */}
        <path d="M75 15 L78 25 L88 28 L78 31 L75 41 L72 31 L62 28 L72 25 Z" fill="#FF8A65"> {/* Soft Coral */}
            <animateTransform attributeName="transform" type="rotate" from="0 75 28" to="360 75 28" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
        </path>
        <path d="M45 40 L47 48 L55 50 L47 52 L45 60 L43 52 L35 50 L43 48 Z" fill="#FFAB91" opacity="0.7"> {/* Lighter Soft Coral */}
            <animateTransform attributeName="transform" type="rotate" from="30 45 50" to="390 45 50" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
            <animate attributeName="opacity" values="0;0.7;0" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
        </path>
         <path d="M105 40 L107 48 L115 50 L107 52 L105 60 L103 52 L95 50 L103 48 Z" fill="#FFAB91" opacity="0.7"> {/* Lighter Soft Coral */}
            <animateTransform attributeName="transform" type="rotate" from="-30 105 50" to="330 105 50" dur="2.5s" repeatCount="indefinite" begin="0.8s"/>
            <animate attributeName="opacity" values="0;0.7;0" dur="2.5s" repeatCount="indefinite" begin="0.8s"/>
        </path>
    </svg>
    <p className="text-xl font-semibold text-[#FF8A65] font-['Poppins']">Conjuring a surprise...</p> {/* Soft Coral */}
    <p className="text-[#607D8B] font-['Roboto']">Let's see what magic your kitchen holds!</p> {/* Slate Gray */}
  </div>
);


export const CookingAnimation: React.FC<CookingAnimationProps> = ({ type }) => {
  if (type === 'none') return null;

  return (
    <div 
        className="fixed inset-0 bg-[#FAFAFA]/90 flex flex-col items-center justify-center z-[100]" /* Cloud White semi-transparent */
        aria-live="assertive"
        role="alert"
    >
      {type === 'generating' && <GeneratingAnimation />}
      {type === 'surprising' && <SurprisingAnimation />}
    </div>
  );
};