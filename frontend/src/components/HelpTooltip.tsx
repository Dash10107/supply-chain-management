import { useState } from 'react';

interface HelpTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const HelpTooltip = ({ content, position = 'top' }: HelpTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 text-xs font-semibold"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        ?
      </button>
      {isVisible && (
        <div
          className={`absolute z-50 w-64 p-3 text-xs text-white bg-gray-900 rounded-lg shadow-lg ${positionClasses[position]}`}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          {content}
          <div className={`absolute w-0 h-0 border-4 ${
            position === 'top' ? 'top-full border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent' :
            position === 'bottom' ? 'bottom-full border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent' :
            position === 'left' ? 'left-full border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent' :
            'right-full border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent'
          }`} />
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;

