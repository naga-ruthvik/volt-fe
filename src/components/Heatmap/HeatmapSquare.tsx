import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { getIntensityLevel, getIntensityColor } from '../../utils/dateUtils';
import type { ActivityData } from '../../types/heatmap';

interface HeatmapSquareProps {
  date: string;
  data?: ActivityData;
  onHover: (e: React.MouseEvent, data: ActivityData | undefined, date: string) => void;
  onLeave: () => void;
  theme?: string;
}

export const HeatmapSquare: React.FC<HeatmapSquareProps> = ({ date, data, onHover, onLeave, theme = 'MONOCHROME' }) => {
  const intensity = getIntensityLevel(data?.total || 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`w-3 h-3 rounded-none border transition-colors duration-300 hover:border-white hover:z-20 cursor-crosshair ${getIntensityColor(intensity, theme)}`}
      onMouseEnter={(e) => onHover(e, data, date)}
      onMouseLeave={onLeave}
      data-date={date}
    />
  );
};
