import React, { useState } from 'react';
import { OvertimeRecord } from '../types';
import { formatDate, decimalToHoursMinutesStr } from '../utils/timeCalculations';

interface OvertimeChartProps {
  records: OvertimeRecord[];
  selectedMonth: string; // 'YYYY-MM'
  currency: string;
}

export default function OvertimeChart({ records, selectedMonth, currency }: OvertimeChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Filter and sort records for the selected month
  const monthRecords = records
    .filter((r) => r.date.startsWith(selectedMonth))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (monthRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-6 text-center">
        <p className="text-slate-400 text-sm">No daily entries for this month yet.</p>
        <p className="text-slate-500 text-xs mt-1">Log hours below to see the visualization!</p>
      </div>
    );
  }

  // Dimensions
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 24;
  const height = 180;
  const width = 340;

  // Find max hours to scale Y axis
  const maxHours = Math.max(
    12, // default minimum Y-max
    ...monthRecords.map((r) => r.totalHours)
  );

  // Chart boundaries
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Generate Y axis ticks
  const yTicks = [0, Math.round(maxHours / 2), Math.round(maxHours)];

  return (
    <div className="bg-slate-900/75 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overtime & Work Trends</h3>
          <p className="text-xs text-slate-500">Daily breakdown (Double color represents regular/OT hours)</p>
        </div>
        <div className="flex gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-700 block"></span>
            <span className="text-slate-400">Regular</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 block"></span>
            <span className="text-slate-400">Overtime</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* SVG Drawing */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const y = paddingTop + chartHeight - (tick / maxHours) * chartHeight;
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.75"
                  strokeDasharray="3,3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {tick}h
                </text>
              </g>
            );
          })}

          {/* Bar Chart Data */}
          {monthRecords.map((record, index) => {
            const barWidth = Math.max(4, Math.min(16, (chartWidth / monthRecords.length) * 0.6));
            const spacing = chartWidth / monthRecords.length;
            const x = paddingLeft + index * spacing + (spacing - barWidth) / 2;

            // Heights
            const regHeight = (record.regularHours / maxHours) * chartHeight;
            const otHeight = (record.overtimeHours / maxHours) * chartHeight;

            // Y coordinates (SVG 0,0 is top-left)
            const regY = paddingTop + chartHeight - regHeight;
            const otY = regY - otHeight;

            const isHovered = hoveredIdx === index;

            return (
              <g
                key={record.id}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                onTouchStart={() => setHoveredIdx(index)}
                className="cursor-pointer"
              >
                {/* Background interaction area */}
                <rect
                  x={paddingLeft + index * spacing}
                  y={paddingTop}
                  width={spacing}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Regular hours bar */}
                {record.regularHours > 0 && (
                  <rect
                    x={x}
                    y={regY}
                    width={barWidth}
                    height={regHeight}
                    rx={record.overtimeHours === 0 ? 2 : 0}
                    className={`transition-all duration-200 ${
                      isHovered ? 'fill-slate-500' : 'fill-slate-700/80'
                    }`}
                  />
                )}

                {/* Overtime hours bar */}
                {record.overtimeHours > 0 && (
                  <rect
                    x={x}
                    y={otY}
                    width={barWidth}
                    height={otHeight}
                    rx={2}
                    className={`transition-all duration-200 ${
                      isHovered ? 'fill-emerald-400' : 'fill-emerald-500'
                    }`}
                  />
                )}

                {/* X Axis Label (Date short day/num) */}
                {monthRecords.length <= 15 || index % 3 === 0 ? (
                  <text
                    x={x + barWidth / 2}
                    y={height - 6}
                    fill={isHovered ? '#34d399' : '#64748b'}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="font-medium"
                  >
                    {record.date.split('-')[2]}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        {/* Hover/Tap Tooltip details inside dark box */}
        <div className="mt-3 h-11 flex items-center justify-center bg-slate-950/50 rounded-xl px-3 border border-slate-800/60">
          {hoveredIdx !== null && monthRecords[hoveredIdx] ? (
            <div className="flex items-center justify-between w-full text-xs animate-fade-in">
              <span className="font-semibold text-emerald-400">
                {formatDate(monthRecords[hoveredIdx].date)}:
              </span>
              <div className="flex gap-4">
                <span className="text-slate-300">
                  Total: <strong className="text-white">{decimalToHoursMinutesStr(monthRecords[hoveredIdx].totalHours)}</strong>
                </span>
                <span className="text-emerald-400">
                  OT: <strong className="text-emerald-300 font-mono">{decimalToHoursMinutesStr(monthRecords[hoveredIdx].overtimeHours)}</strong>
                </span>
                <span className="text-slate-300">
                  Pay: <strong className="text-white font-mono">{currency}{monthRecords[hoveredIdx].totalEarnings}</strong>
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 text-center w-full italic">
              {monthRecords.length > 0
                ? 'Tap or hover over a bar to view daily hours & earnings'
                : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
