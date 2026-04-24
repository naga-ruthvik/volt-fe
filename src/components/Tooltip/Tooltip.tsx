import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  x: number;
  y: number;
  visible: boolean;
  content: {
    date: string;
    total: number;
    sources: Record<string, number | undefined> | null;
  } | null;
}

export const Tooltip: React.FC<TooltipProps> = ({ x, y, visible, content }) => {
  if (!content) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full pb-2"
          style={{ left: x, top: y - 10 }} // Offset slightly above cursor
        >
          <div className="bg-black border border-[#333] px-3 py-2 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <div className="text-[10px] font-mono text-[#888] mb-1">
              [{content.date}]
            </div>
            <div className="text-xs font-mono font-bold text-white tracking-widest mb-1">
              {content.total > 0 ? `${content.total} ACTIVITIES` : 'NO ACTIVITY'}
            </div>
            {content.sources && content.total > 0 && (
              <div className="flex flex-col gap-[2px] mt-2 border-t border-[#333] pt-2">
                {Object.entries(content.sources).map(([platform, count]) => {
                  if (!count) return null;
                  return (
                    <div key={platform} className="flex justify-between items-center text-[9px] font-mono tracking-widest">
                      <span className="text-[#888] uppercase">{platform}</span>
                      <span className="text-white ml-3">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

    </AnimatePresence>
  );
};
