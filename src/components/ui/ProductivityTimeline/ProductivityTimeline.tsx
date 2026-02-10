"use client";

import { useState, useRef } from "react";
import { cn } from "@/utils/tw";
import Modal from "../Modal/Modal";

export interface TimeSlotData {
  time: string; // Format: "HH:MM" (e.g., "09:00")
  productive: number; // Percentage 0-100
  unproductive: number; // Percentage 0-100
  neutral: number; // Percentage 0-100
  totalActivity: number; // Total activity percentage (0-100)
  isTracked: boolean; // Whether this slot has tracked data
}

interface ProductivityTimelineProps {
  data: TimeSlotData[];
  onAddOfflineTime?: (time: string, category: "productive" | "unproductive" | "neutral", duration: number) => void;
  className?: string;
}

// Generate time labels for the axis (every 2 hours)
const generateTimeLabels = () => {
  const labels: string[] = [];
  for (let hour = 0; hour < 24; hour += 2) {
    const timeStr = `${hour.toString().padStart(2, "0")}:00`;
    labels.push(timeStr);
  }
  return labels;
};

// Convert time string to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};


// Generate all 5-minute slots for 24 hours
const generateAllSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    }
  }
  return slots;
};


// Offline Time Modal
const OfflineTimeModal = ({
  isOpen,
  onClose,
  timeSlot,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  timeSlot: string | null;
  onSave: (category: "productive" | "unproductive" | "neutral", duration: number) => void;
}) => {
  const [category, setCategory] = useState<"productive" | "unproductive" | "neutral">("productive");
  const [duration, setDuration] = useState(5); // Default 5 minutes

  const handleSave = () => {
    if (timeSlot) {
      onSave(category, duration);
      onClose();
      // Reset form
      setCategory("productive");
      setDuration(5);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Offline Time" size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Time Slot
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400">{timeSlot}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="productive"
                checked={category === "productive"}
                onChange={() => setCategory("productive")}
                className="w-4 h-4 text-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Productive</span>
              <div className="w-4 h-4 rounded bg-green-500 ml-auto" />
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="unproductive"
                checked={category === "unproductive"}
                onChange={() => setCategory("unproductive")}
                className="w-4 h-4 text-orange-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Unproductive</span>
              <div className="w-4 h-4 rounded bg-orange-500 ml-auto" />
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value="neutral"
                checked={category === "neutral"}
                onChange={() => setCategory("neutral")}
                className="w-4 h-4 text-gray-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Neutral</span>
              <div className="w-4 h-4 rounded bg-gray-500 ml-auto" />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="60"
            step="5"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export function ProductivityTimeline({
  data,
  onAddOfflineTime,
  className,
}: ProductivityTimelineProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const allSlots = generateAllSlots();
  const timeLabels = generateTimeLabels();

  // Create a map of time slots to data for quick lookup
  const dataMap = new Map<string, TimeSlotData>();
  data.forEach((item) => {
    dataMap.set(item.time, item);
  });

  const handleSlotClick = (time: string) => {
    const slotData = dataMap.get(time);
    if (!slotData || !slotData.isTracked) {
      // Empty slot - open modal
      setSelectedSlot(time);
      setIsModalOpen(true);
    }
  };

  const handleSaveOfflineTime = (
    category: "productive" | "unproductive" | "neutral",
    duration: number
  ) => {
    if (selectedSlot && onAddOfflineTime) {
      onAddOfflineTime(selectedSlot, category, duration);
    }
  };

  const handleMouseMove = (e: React.MouseEvent, slotData: TimeSlotData | undefined, time: string) => {
    if (slotData && slotData.isTracked) {
      const tooltip = `Time: ${time}\nProductive: ${slotData.productive}%\nUnproductive: ${slotData.unproductive}%\nNeutral: ${slotData.neutral}%\nTotal Activity: ${slotData.totalActivity}%`;
      setTooltipContent(tooltip);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Productivity Timeline</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          24-hour view with 5-minute intervals. Click empty slots to add offline time.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto">
        {/* Timeline Container */}
        <div className="relative min-w-[2880px]" style={{ paddingLeft: "60px" }}>
          {/* Timeline Bars */}
          <div
            ref={containerRef}
            className="relative flex gap-0.5 h-32 mb-2"
          >
          {allSlots.map((time) => {
            const slotData = dataMap.get(time);
            const hasData = slotData && slotData.isTracked;
            const totalHeight = hasData ? slotData.totalActivity : 0;

            return (
              <div
                key={time}
                className={cn(
                  "relative flex flex-col justify-end cursor-pointer transition-all hover:opacity-80",
                  !hasData && "hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                )}
                style={{ width: "10px", minHeight: "100%" }}
                onClick={() => handleSlotClick(time)}
                onMouseMove={(e) => handleMouseMove(e, slotData, time)}
                onMouseLeave={handleMouseLeave}
              >
                {hasData ? (
                  <div
                    className="w-full flex flex-col-reverse rounded-sm"
                    style={{ height: `${totalHeight}%`, minHeight: totalHeight > 0 ? "2px" : "0" }}
                  >
                    {/* Calculate relative percentages within the bar */}
                    {(() => {
                      const total = slotData.productive + slotData.unproductive + slotData.neutral;
                      if (total === 0) return null;
                      
                      const productivePercent = (slotData.productive / total) * 100;
                      const unproductivePercent = (slotData.unproductive / total) * 100;
                      const neutralPercent = (slotData.neutral / total) * 100;
                      
                      return (
                        <>
                          {/* Neutral (gray) - bottom */}
                          {neutralPercent > 0 && (
                            <div
                              className="bg-gray-400 dark:bg-gray-500"
                              style={{ height: `${neutralPercent}%`, minHeight: neutralPercent > 0 ? "1px" : "0" }}
                            />
                          )}
                          {/* Unproductive (orange) - middle */}
                          {unproductivePercent > 0 && (
                            <div
                              className="bg-orange-500"
                              style={{ height: `${unproductivePercent}%`, minHeight: unproductivePercent > 0 ? "1px" : "0" }}
                            />
                          )}
                          {/* Productive (green) - top */}
                          {productivePercent > 0 && (
                            <div
                              className="bg-green-500"
                              style={{ height: `${productivePercent}%`, minHeight: productivePercent > 0 ? "1px" : "0" }}
                            />
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="w-full h-full border border-dashed border-gray-300 dark:border-gray-600 rounded-sm" />
                )}
              </div>
            );
          })}
          </div>

          {/* Time Labels - positioned at bottom */}
          <div className="relative flex" style={{ height: "24px" }}>
            {timeLabels.map((label) => {
              const labelMinutes = timeToMinutes(label);
              const position = (labelMinutes / 5) * 10; // 10px per 5-minute slot
              return (
                <div
                  key={label}
                  className="absolute text-xs text-gray-600 dark:text-gray-400 font-medium"
                  style={{ left: `${position}px`, transform: "translateX(-50%)" }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tooltip */}
        {tooltipContent && (
          <div
            className="fixed z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2 rounded shadow-lg pointer-events-none whitespace-pre-line"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y - 10}px`,
              transform: "translateX(-50%)",
            }}
          >
            {tooltipContent}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-gray-700 dark:text-gray-300">Productive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-gray-700 dark:text-gray-300">Unproductive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400 dark:bg-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">Neutral</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-4 h-4 border border-dashed border-gray-300 dark:border-gray-600 rounded" />
            <span className="text-gray-700 dark:text-gray-300">Empty (click to add)</span>
          </div>
        </div>
      </div>

      {/* Offline Time Modal */}
      <OfflineTimeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
        }}
        timeSlot={selectedSlot}
        onSave={handleSaveOfflineTime}
      />
    </div>
  );
}
