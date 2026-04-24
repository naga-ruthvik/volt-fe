import { addDays, format, subDays, endOfWeek } from 'date-fns';

export const generateHeatmapDates = (weeks = 52): string[] => {
  const days: string[] = [];
  const today = new Date();
  
  // End on the most recent Saturday
  const endDate = endOfWeek(today, { weekStartsOn: 0 }); 
  const startDate = subDays(endDate, (weeks * 7) - 1);
  
  for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
    days.push(format(d, 'yyyy-MM-dd'));
  }
  
  return days;
};

export const getIntensityLevel = (count: number): number => {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 8) return 2;
  if (count <= 15) return 3;
  return 4;
};

export const getIntensityColor = (level: number, theme: string = 'MONOCHROME') => {
  if (theme === 'MATRIX') {
    switch (level) {
      case 1: return 'bg-[#003300] border-[#004400]';
      case 2: return 'bg-[#006600] border-[#008800]';
      case 3: return 'bg-[#00cc00] border-[#00dd00]';
      case 4: return 'bg-[#00ff00] border-[#00ff00] shadow-[0_0_8px_rgba(0,255,0,0.5)] z-10 relative';
      default: return 'bg-[#1a1a1a] border-[#222]'; 
    }
  } else if (theme === 'CYBER') {
    switch (level) {
      case 1: return 'bg-[#002244] border-[#003355]';
      case 2: return 'bg-[#004488] border-[#0055aa]';
      case 3: return 'bg-[#0088ff] border-[#0099ff]';
      case 4: return 'bg-[#00ffff] border-[#00ffff] shadow-[0_0_8px_rgba(0,255,255,0.5)] z-10 relative';
      default: return 'bg-[#1a1a1a] border-[#222]'; 
    }
  } else if (theme === 'MAGENTA') {
    switch (level) {
      case 1: return 'bg-[#330022] border-[#440033]';
      case 2: return 'bg-[#880055] border-[#aa0066]';
      case 3: return 'bg-[#dd0088] border-[#ee0099]';
      case 4: return 'bg-[#ff00aa] border-[#ff00bb] shadow-[0_0_8px_rgba(255,0,170,0.5)] z-10 relative';
      default: return 'bg-[#1a1a1a] border-[#222]'; 
    }
  }
  // Default MONOCHROME
  switch (level) {
    case 1: return 'bg-[#333333] border-[#444]';
    case 2: return 'bg-[#777777] border-[#888]';
    case 3: return 'bg-[#cccccc] border-[#ddd]';
    case 4: return 'bg-white border-white shadow-[0_0_8px_rgba(255,255,255,0.5)] z-10 relative';
    default: return 'bg-[#1a1a1a] border-[#222]';
  }
};

export const formatDateDisplay = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    return format(d, 'MMM dd, yyyy').toUpperCase();
  } catch (e) {
    return dateString;
  }
};
