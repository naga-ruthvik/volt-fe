import React, { useState } from 'react';
import { Download, Code, Palette } from 'lucide-react';
import { useHeatmapData } from '../../hooks/useHeatmapData';
import { HeatmapGrid } from './HeatmapGrid';
import { HeatmapLegend } from './HeatmapLegend';
import { generateHeatmapSvgString, downloadSvg } from '../../utils/svgGenerator';

export const Heatmap: React.FC<{ isDemo?: boolean }> = ({ isDemo = false }) => {
  const { data: realData, isLoading: isRealLoading, error: realError } = useHeatmapData(isDemo);
  const [theme, setTheme] = useState('MONOCHROME');

  // If in demo mode, create some random data on the fly and disable loading/errors
  const [demoData] = useState(() => {
    if (!isDemo) return null;
    const data: any = {};
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      // 40% chance of activity to look reasonably busy
      if (Math.random() > 0.6) {
        const count = Math.floor(Math.random() * 15) + 1;
        data[dateStr] = { date: dateStr, total: count, sources: { GITHUB: count } };
      }
    }
    return data;
  });

  const data = isDemo ? demoData : realData;
  const isLoading = isDemo ? false : isRealLoading;
  const error = isDemo ? null : realError;

  const handleDownloadSvg = () => {
    if (!data) return;
    const svgStr = generateHeatmapSvgString(data, theme);
    downloadSvg(svgStr, `volt_matrix_${theme.toLowerCase()}.svg`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 mb-24 relative z-10">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-white"></div>
            <h2 className="text-xl font-bold tracking-[0.2em] text-white">ACTIVITY_MATRIX</h2>
          </div>
          <p className="text-[#666] font-mono text-xs uppercase tracking-widest pl-5">
            [SYS.LOG] Aggregate solving & commit data // 52 Weeks
          </p>
        </div>
        <HeatmapLegend theme={theme} />
      </div>

      {error ? (
        <div className="p-8 border border-[#222] bg-[#050505] text-[#888] font-mono text-sm flex items-center justify-center">
          [ERROR_STATE]: Unable to retrieve matrix data.
        </div>
      ) : (
        <>
          <HeatmapGrid data={data} isLoading={isLoading} theme={theme} />
          
          {/* Controls */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[#666] font-mono text-[10px] tracking-widest uppercase">
            <div className="flex gap-2">
              <button 
                onClick={handleDownloadSvg}
                className="flex items-center gap-2 border border-[#333] px-3 py-1.5 hover:bg-white hover:text-black hover:border-white transition-all"
              >
                <Download className="w-3 h-3" /> DOWNLOAD_SVG
              </button>
              <button className="flex items-center gap-2 border border-[#333] px-3 py-1.5 hover:bg-white hover:text-black hover:border-white transition-all">
                <Code className="w-3 h-3" /> EMBED_LINK
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="w-3 h-3" /> THEME:
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-black border border-[#333] text-[#888] px-2 py-1.5 outline-none hover:border-white focus:border-white hover:text-white focus:text-white transition-all cursor-pointer"
              >
                <option value="MONOCHROME">MONOCHROME</option>
                <option value="MATRIX">MATRIX_GREEN</option>
                <option value="CYBER">CYBER_BLUE</option>
                <option value="MAGENTA">NEON_MAGENTA</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
