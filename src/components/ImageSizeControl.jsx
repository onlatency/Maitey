import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';

// Size presets with exact dimensions and ratios (all divisible by 16)
const GUIDE_PRESETS = [
  { name: 'Square (Default)', width: 1024, height: 1024, ratio: '1:1' },
  { name: 'Landscape (3:2)', width: 1152, height: 768, ratio: '3:2' },
  { name: 'Cinema (16:9)', width: 1280, height: 720, ratio: '16:9' },
  { name: 'Tall (9:16)', width: 720, height: 1280, ratio: '9:16' },
  { name: 'Portrait (2:3)', width: 832, height: 1248, ratio: '2:3' },
  { name: 'Instagram (4:5)', width: 1024, height: 1280, ratio: '4:5' }
];

// Constraints and parameters
const SNAP_TOLERANCE = 20;    // px - how close the handle must be to snap
const MAX_SIDE = 1280;        // px - maximum size allowed
const MIN_SIDE = 256;         // px - minimum dimension size
const GRID_SIZE = 16;         // px - all dimensions must be divisible by this value

function ImageSizeControl() {
  const { settings, updateSettings } = useChatContext();
  const [size, setSize] = useState({ w: settings.width || 848, h: settings.height || 1264 });
  const [active, setActive] = useState(() => {
    // Find preset that matches current dimensions
    const preset = GUIDE_PRESETS.find(p => 
      p.width === settings.width && p.height === settings.height
    );
    return preset ? preset.name : 'Custom';
  });
  
  const dragRef = useRef(null);
  const containerRef = useRef(null);
  
  // Update context settings when size changes
  useEffect(() => {
    updateSettings({ width: size.w, height: size.h });
  }, [size, updateSettings]);
  
  /* ----- Helper Functions --------------------------------------------- */
  
  // Calculate aspect ratio as a string
  const calculateRatio = (width, height) => {
    if (width === height) return '1:1';
    
    // Check if it matches a known preset ratio
    const matchingPreset = GUIDE_PRESETS.find(p => 
      p.width === width && p.height === height
    );
    
    if (matchingPreset) return matchingPreset.ratio;
    
    // Calculate the greatest common divisor
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    
    if (divisor > 1) {
      const ratioW = width / divisor;
      const ratioH = height / divisor;
      
      // If the ratio is simple enough (small numbers), display as whole numbers
      if (ratioW <= 16 && ratioH <= 16 && Number.isInteger(ratioW) && Number.isInteger(ratioH)) {
        return `${ratioW}:${ratioH}`;
      }
    }
    
    // Otherwise display decimal ratio to 2 places
    return (width / height).toFixed(2) + ':1';
  };
  
  // Ensure dimensions snap to grid (divisible by GRID_SIZE)
  const snapToGrid = (value) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };
  
  const snapIfNeeded = (w, h) => {
    // First snap to grid
    let gridW = snapToGrid(w);
    let gridH = snapToGrid(h);
    
    // Clamp to min/max
    gridW = Math.min(MAX_SIDE, Math.max(MIN_SIDE, gridW));
    gridH = Math.min(MAX_SIDE, Math.max(MIN_SIDE, gridH));
    
    // Check if close to any preset
    for (const p of GUIDE_PRESETS) {
      if (Math.abs(gridW - p.width) < SNAP_TOLERANCE && 
          Math.abs(gridH - p.height) < SNAP_TOLERANCE) {
        setActive(p.name);
        return { w: p.width, h: p.height };
      }
    }
    
    setActive('Custom');
    return { w: gridW, h: gridH };
  };
  
  /* ----- Drag logic (mousedown / mousemove / mouseup) ------------------- */
  
  const startDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const { w: startW, h: startH } = size;
    
    const onMove = (ev) => {
      if (!containerRef.current) return;
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;
      const newW = Math.min(MAX_SIDE, Math.max(MIN_SIDE, startW + deltaX));
      const newH = Math.min(MAX_SIDE, Math.max(MIN_SIDE, startH + deltaY));
      const snapped = snapIfNeeded(newW, newH);
      setSize(snapped);
    };
    
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
  
  /* ----- Render --------------------------------------------------------- */
  
  // Calculate current ratio for display
  const currentRatio = calculateRatio(size.w, size.h);
  const displayName = active === 'Custom' ? `Custom (${currentRatio})` : active;
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Image Size</label>
        <span className="text-purple-700 font-medium">{size.w} × {size.h}</span>
      </div>
      
      <div className="relative aspect-square bg-white rounded-md border-2 border-purple-300 shadow-sm overflow-hidden">
        {/* Guide rectangles */}
        {GUIDE_PRESETS.map(p => {
          const pctW = (p.width / MAX_SIDE) * 100;
          const pctH = (p.height / MAX_SIDE) * 100;
          return (
            <div
              key={p.name}
              className="absolute border-2 border-dotted border-purple-200 pointer-events-none"
              style={{ width: `${pctW}%`, height: `${pctH}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              {/* bottom-right guide dot */}
              <div
                className="absolute w-3 h-3 bg-purple-300 rounded-full"
                style={{ bottom: -4, right: -4 }}
              />
            </div>
          );
        })}
        
        {/* Draggable selection rectangle */}
        <div
          ref={containerRef}
          className="absolute inset-4"
        >
          <div
            className="absolute bg-purple-200/30 border-2 border-purple-500"
            style={{ 
              width: (size.w / MAX_SIDE) * 100 + '%', 
              height: (size.h / MAX_SIDE) * 100 + '%',
              top: '50%', 
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* label overlay */}
            <span className="absolute top-1 left-1 text-xs font-semibold text-purple-900 bg-white/80 px-1.5 py-0.5 rounded shadow-sm">
              {displayName}
            </span>
            
            {/* bottom-right handle */}
            <div
              ref={dragRef}
              onMouseDown={startDrag}
              className="absolute -right-3 -bottom-3 h-6 w-6 rounded-full bg-white border-2 border-purple-500 shadow-md cursor-se-resize"
            />
          </div>
        </div>
      </div>
      
      {/* pixel read-out */}
      <div className="text-xs text-gray-500 text-right mt-2">
        Current ratio: {currentRatio}
      </div>
    </div>
  );
}

export default ImageSizeControl;
