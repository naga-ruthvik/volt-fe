import { generateHeatmapDates, getIntensityLevel } from './dateUtils';
import type { HeatmapData } from '../types/heatmap';

const getSvgColor = (level: number, theme: string) => {
  if (theme === 'MATRIX') {
    switch (level) {
      case 1: return { fill: '#003300', stroke: '#004400' };
      case 2: return { fill: '#006600', stroke: '#008800' };
      case 3: return { fill: '#00cc00', stroke: '#00dd00' };
      case 4: return { fill: '#00ff00', stroke: '#00ff00' };
      default: return { fill: '#1a1a1a', stroke: '#222222' }; 
    }
  } else if (theme === 'CYBER') {
    switch (level) {
      case 1: return { fill: '#002244', stroke: '#003355' };
      case 2: return { fill: '#004488', stroke: '#0055aa' };
      case 3: return { fill: '#0088ff', stroke: '#0099ff' };
      case 4: return { fill: '#00ffff', stroke: '#00ffff' };
      default: return { fill: '#1a1a1a', stroke: '#222222' }; 
    }
  } else if (theme === 'MAGENTA') {
    switch (level) {
      case 1: return { fill: '#330022', stroke: '#440033' };
      case 2: return { fill: '#880055', stroke: '#aa0066' };
      case 3: return { fill: '#dd0088', stroke: '#ee0099' };
      case 4: return { fill: '#ff00aa', stroke: '#ff00bb' };
      default: return { fill: '#1a1a1a', stroke: '#222222' }; 
    }
  }
  // Default MONOCHROME
  switch (level) {
    case 1: return { fill: '#333333', stroke: '#444444' };
    case 2: return { fill: '#777777', stroke: '#888888' };
    case 3: return { fill: '#cccccc', stroke: '#dddddd' };
    case 4: return { fill: '#ffffff', stroke: '#ffffff' };
    default: return { fill: '#1a1a1a', stroke: '#222222' };
  }
};

export const generateHeatmapSvgString = (data: HeatmapData, theme: string): string => {
  const dates = generateHeatmapDates(52);
  
  // Grid config
  const squareSize = 12;
  const gap = 4;
  const paddingX = 20;
  const paddingTop = 40;
  const paddingBottom = 20;
  
  const cols = Math.ceil(dates.length / 7);
  const rows = 7;
  
  // Calculate total dimensions
  const width = paddingX * 2 + (cols * squareSize) + ((cols - 1) * gap);
  const height = paddingTop + paddingBottom + (rows * squareSize) + ((rows - 1) * gap);
  
  let rects = '';
  
  // Group into weeks
  const weeks: string[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }
  
  const monthLabels: { label: string; index: number }[] = [];
  let lastMonth = -1;
  let isFirstLabel = true;
  let lastLabelIndex = -10;
  let lastLabelWasLong = false;

  weeks.forEach((week, wIndex) => {
    const d = new Date(week[0]);
    const month = d.getMonth();
    
    if (month !== lastMonth && wIndex < weeks.length - 2) {
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const year = d.getFullYear();
      
      let labelText = monthNames[month];
      let isLongLabel = false;
      
      if (isFirstLabel || month === 0) {
        labelText = `${monthNames[month]} ${year}`;
        isFirstLabel = false;
        isLongLabel = true;
      }
      
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

  let labelsSvg = '';
  monthLabels.forEach(m => {
    const x = paddingX + (m.index * (squareSize + gap));
    const y = paddingTop - 12;
    
    labelsSvg += `
      <text 
        x="${x}" 
        y="${y}" 
        fill="#666666" 
        font-family="monospace" 
        font-size="9px" 
        letter-spacing="0.1em"
      >
        ${m.label}
      </text>`;
  });
  
  weeks.forEach((week, colIndex) => {
    week.forEach((date, rowIndex) => {
      const dayData = data[date];
      const intensity = getIntensityLevel(dayData?.total || 0);
      const colors = getSvgColor(intensity, theme);
      
      const x = paddingX + (colIndex * (squareSize + gap));
      const y = paddingTop + (rowIndex * (squareSize + gap));
      
      rects += `
        <rect 
          x="${x}" 
          y="${y}" 
          width="${squareSize}" 
          height="${squareSize}" 
          fill="${colors.fill}" 
          stroke="${colors.stroke}" 
          stroke-width="1"
        />`;
    });
  });
  
  return `<?xml version="1.0" encoding="UTF-8" ?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#050505" />
  ${labelsSvg}
  ${rects}
</svg>`;
};

export const downloadSvg = (svgString: string, filename: string) => {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
