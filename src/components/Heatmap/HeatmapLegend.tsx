import React from 'react';
import { getIntensityColor } from '../../utils/dateUtils';

interface HeatmapLegendProps {
  theme?: string;
}

export const HeatmapLegend: React.FC<HeatmapLegendProps> = ({ theme = 'MONOCHROME' }) => {
  const levels = [0, 1, 2, 3, 4];

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-[10px] text-[#666] font-mono uppercase tracking-widest">
        Less
      </div>
      <div className="flex gap-1 mx-3">
        {levels.map((level) => (
          <div 
            key={level} 
            className={`w-3 h-3 border ${getIntensityColor(level, theme)}`} 
          />
        ))}
      </div>
      <div className="text-[10px] text-[#666] font-mono uppercase tracking-widest">
        More
      </div>
    </div>
  );
};
