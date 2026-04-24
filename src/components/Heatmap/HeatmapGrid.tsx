import React, { useState } from 'react';
import { generateHeatmapDates, formatDateDisplay } from '../../utils/dateUtils';
import { HeatmapSquare } from './HeatmapSquare';
import { Tooltip } from '../Tooltip/Tooltip';
import type { HeatmapData, ActivityData } from '../../types/heatmap';

interface HeatmapGridProps {
  data: HeatmapData | null;
  isLoading: boolean;
  theme?: string;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({ data, isLoading, theme = 'MONOCHROME' }) => {
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: { date: string; total: number; sources: Record<string, number | undefined> | null } | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: null
  });

  // 52 weeks = 364 days.
  const dates = generateHeatmapDates(52);

  // Group by weeks for the grid columns
  const weeks: string[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  const handleHover = (e: React.MouseEvent, dayData: ActivityData | undefined, dateString: string) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltipState({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: {
        date: formatDateDisplay(dateString),
        total: dayData?.total || 0,
        sources: dayData?.sources || null
      }
    });
  };

  const handleLeave = () => {
    setTooltipState(prev => ({ ...prev, visible: false }));
  };

  const monthLabels: { label: string; index: number }[] = [];
  let lastMonth = -1;
  let isFirstLabel = true;
  let lastLabelIndex = -10;
  let lastLabelWasLong = false;

  weeks.forEach((week, wIndex) => {
    const d = new Date(week[0]);
    const month = d.getMonth();
    
    // Only show label if the month changes and we aren't too close to the end
    if (month !== lastMonth && wIndex < weeks.length - 2) {
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const year = d.getFullYear();
      
      let labelText = monthNames[month];
      let isLongLabel = false;
      
      // Include year if it's the very first label on the chart or if it's January
      if (isFirstLabel || month === 0) {
        labelText = `${monthNames[month]} ${year}`;
        isFirstLabel = false;
        isLongLabel = true;
      }
      
      // Calculate minimum index distance required to prevent overlap.
      // Long labels (e.g. "APR 2025") take up about 4-5 columns of space.
      // Normal labels take up about 2-3 columns.
      const minDistance = lastLabelWasLong ? 5 : 3;
      
      if (wIndex - lastLabelIndex >= minDistance) {
        monthLabels.push({
          label: labelText,
          index: wIndex
        });
        lastLabelIndex = wIndex;
        lastLabelWasLong = isLongLabel;
      }
      
      lastMonth = month;
    }
  });

  return (
    <div className="relative overflow-x-auto pb-4 custom-scrollbar">
      {isLoading ? (
        <div className="h-[120px] flex items-center justify-center border border-[#222] bg-[#0a0a0a]">
          <div className="text-[#666] font-mono text-xs animate-pulse tracking-widest">LOADING_DATA...</div>
        </div>
      ) : (
        <div className="p-4 border border-[#222] bg-[#050505] min-w-max">
          {/* Month/Year Labels */}
          <div className="relative h-6 w-full mb-1">
            {monthLabels.map((m, i) => (
              <div 
                key={i} 
                className="absolute text-[#666] font-mono text-[9px] tracking-widest uppercase"
                style={{ left: m.index * 16 }} // 12px (w-3) + 4px (gap-1)
              >
                {m.label}
              </div>
            ))}
          </div>
          
          {/* Heatmap Squares */}
          <div className="flex gap-1">
            {weeks.map((week, wIndex) => (
              <div key={`week-${wIndex}`} className="flex flex-col gap-1">
                {week.map((date) => (
                  <HeatmapSquare
                    key={date}
                    date={date}
                    data={data ? data[date] : undefined}
                    onHover={handleHover}
                    onLeave={handleLeave}
                    theme={theme}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <Tooltip
        x={tooltipState.x}
        y={tooltipState.y}
        visible={tooltipState.visible}
        content={tooltipState.content}
      />
    </div>
  );
};
