import React, { useState, useRef, useEffect, useCallback } from 'react';
import { OLD_BARRONS, NEW_BARRONS } from '../constants';
import { Connection, Point } from '../types';
import { SketchItem } from './SketchItem';

interface SketchConnectProps {
  connections: Connection[];
  onConnectionsChange: (connections: Connection[]) => void;
}

// Deterministic random number generator (0-1) based on string seed
// Ensures the "randomness" of a line persists between renders unless the connection changes
const seededRandom = (seed: string) => {
  let h = 0xdeadbeef;
  for(let i = 0; i < seed.length; i++)
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
}

export const SketchConnect: React.FC<SketchConnectProps> = ({ connections, onConnectionsChange }) => {
  // Local state for dragging only. Connections state is now managed by parent (App.tsx)
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point | null>(null);
  
  // Refs to track DOM elements for coordinates
  const leftRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rightRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to get coordinates relative to the container
  const getPointCoords = useCallback((id: string, side: 'left' | 'right'): Point | null => {
    const map = side === 'left' ? leftRefs.current : rightRefs.current;
    const el = map.get(id);
    const container = containerRef.current;
    
    if (!el || !container) return null;
    
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return {
      x: elRect.left + elRect.width / 2 - containerRect.left,
      y: elRect.top + elRect.height / 2 - containerRect.top
    };
  }, []);

  // Force re-render on window resize to update lines
  const [, setTick] = useState(0);
  useEffect(() => {
    const handleResize = () => setTick(t => t + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragStart = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    // Check if it's a touch event or mouse event to get coordinates
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      e.preventDefault(); // Prevent text selection on mouse drag
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Remove any existing connection starting from this node
    const newConnections = connections.filter(c => c.from !== id);
    onConnectionsChange(newConnections);
    
    setDragStart(id);
    
    // Set initial drag position
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDragCurrent({
            x: clientX - rect.left,
            y: clientY - rect.top
        });
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!dragStart || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setDragCurrent({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleDragEnd = (targetId: string) => {
    if (dragStart) {
      // Filter out existing connections from the same start or to the same target to avoid duplicates/multigraphs
      const filtered = connections.filter(c => c.from !== dragStart && c.to !== targetId);
      const newConnections = [...filtered, { from: dragStart, to: targetId }];
      
      onConnectionsChange(newConnections);
    }
    setDragStart(null);
    setDragCurrent(null);
  };

  const handleGlobalEnd = () => {
    if (dragStart) {
      setDragStart(null);
      setDragCurrent(null);
    }
  };

  // Custom hit detection for touch end since 'touchend' fires on the start element, not the drop target
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragStart) return;

    const touch = e.changedTouches[0];
    const endElement = document.elementFromPoint(touch.clientX, touch.clientY);

    // Find if the end element is within a connection point or the item itself
    // We look for the data-id attribute on the SketchItem container or point
    // Since we didn't add data attributes to SketchItem, we need to check if the touch is near a target
    
    // A simpler robust way: Check distance to all right-side connection points
    let foundTargetId: string | null = null;
    
    rightRefs.current.forEach((el, id) => {
        const rect = el.getBoundingClientRect();
        // Add some padding for "fat finger" tolerance
        if (
            touch.clientX >= rect.left - 20 &&
            touch.clientX <= rect.right + 20 &&
            touch.clientY >= rect.top - 20 &&
            touch.clientY <= rect.bottom + 20
        ) {
            foundTargetId = id;
        }
    });

    if (foundTargetId) {
        handleDragEnd(foundTargetId);
    } else {
        handleGlobalEnd();
    }
  };

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto p-4 md:p-8 select-none touch-none" // touch-none prevents scrolling while drawing
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleGlobalEnd}
      onMouseLeave={handleGlobalEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleGlobalEnd}
    >
      <div className="grid grid-cols-2 gap-4 md:gap-24 relative z-10">
        {/* Left Column */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6 underline decoration-wavy decoration-2 underline-offset-4">Old Barrons</h2>
          {OLD_BARRONS.map(item => (
            <SketchItem
              key={item.id}
              item={item}
              side="left"
              isConnected={connections.some(c => c.from === item.id)}
              pointRef={(el) => {
                if (el) leftRefs.current.set(item.id, el);
                else leftRefs.current.delete(item.id);
              }}
              onPointMouseDown={(e) => handleDragStart(item.id, e)}
              onTouchStart={(e) => handleDragStart(item.id, e)}
            />
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6 underline decoration-wavy decoration-2 underline-offset-4">New Barrons</h2>
          {NEW_BARRONS.map(item => (
            <SketchItem
              key={item.id}
              item={item}
              side="right"
              isConnected={connections.some(c => c.to === item.id)}
              pointRef={(el) => {
                if (el) rightRefs.current.set(item.id, el);
                else rightRefs.current.delete(item.id);
              }}
              onPointMouseUp={() => handleDragEnd(item.id)}
            />
          ))}
        </div>
      </div>

      {/* SVG Layer for Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
        <defs>
          <filter id="marker-wobble" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Active Drag Line */}
        {dragStart && dragCurrent && (() => {
          const start = getPointCoords(dragStart, 'left');
          if (!start) return null;
          return (
            <path 
              d={`M ${start.x} ${start.y} L ${dragCurrent.x} ${dragCurrent.y}`} 
              stroke="#9CA3AF" 
              strokeWidth="3" 
              strokeDasharray="10,5"
              strokeLinecap="round"
              fill="none"
              style={{ filter: 'url(#marker-wobble)' }}
            />
          );
        })()}

        {/* Established Connections */}
        {connections.map((conn) => {
          const start = getPointCoords(conn.from, 'left');
          const end = getPointCoords(conn.to, 'right');
          if (!start || !end) return null;
          
          const seed = conn.from + conn.to;
          const r1 = seededRandom(seed);
          const r2 = seededRandom(seed + 'A');
          const r3 = seededRandom(seed + 'B');
          
          // Bezier control point offsets to make it imperfect/hand-drawn
          const cp1x = start.x + 50 + (r1 * 60 - 30);
          const cp1y = start.y + (r2 * 40 - 20);
          const cp2x = end.x - 50 + (r3 * 60 - 30);
          const cp2y = end.y + (r1 * 40 - 20);

          // Generate a randomized dash array to simulate broken marker strokes
          // Large fill segments with small random gaps
          const dash1 = 100 + (r1 * 200);
          const gap1 = 2 + (r2 * 8); 
          const dash2 = 50 + (r3 * 150);
          const gap2 = 3 + (r1 * 10);
          const dash3 = 100 + (r2 * 100);

          return (
            <path
              key={`${conn.from}-${conn.to}`}
              d={`M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`}
              fill="none"
              stroke="#2563eb" 
              strokeWidth="5" // Medium marker thickness
              strokeLinecap="round"
              strokeDasharray={`${dash1} ${gap1} ${dash2} ${gap2} ${dash3}`}
              className="drop-shadow-sm opacity-90"
              style={{ filter: 'url(#marker-wobble)' }}
            />
          );
        })}
      </svg>
    </div>
  );
};