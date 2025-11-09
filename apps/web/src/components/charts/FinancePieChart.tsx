import { useMemo } from 'react';

interface BudgetData {
  projectName: string;
  allocated: number;
  used: number;
  currency: string;
}

interface FinancePieChartProps {
  budgetAllocation: BudgetData[];
}

export default function FinancePieChart({ budgetAllocation }: FinancePieChartProps) {
  const chartData = useMemo(() => {
    const total = budgetAllocation.reduce((sum, item) => sum + item.allocated, 0);
    let currentAngle = 0;

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return budgetAllocation.map((item, index) => {
      const percentage = (item.allocated / total) * 100;
      const angle = (item.allocated / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      currentAngle += angle;

      // Calculate pie slice path
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      const radius = 80;
      const centerX = 100;
      const centerY = 100;

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      return {
        ...item,
        percentage,
        color: colors[index % colors.length],
        pathData,
        usagePercentage: (item.used / item.allocated) * 100
      };
    });
  }, [budgetAllocation]);

  const totalAllocated = budgetAllocation.reduce((sum, item) => sum + item.allocated, 0);
  const totalUsed = budgetAllocation.reduce((sum, item) => sum + item.used, 0);
  const overallUsage = (totalUsed / totalAllocated) * 100;

  return (
    <div className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg" style={{ width: '320px' }}>
      <h3 className="text-white font-bold text-sm mb-3">Budget Allocation</h3>

      {/* Pie Chart */}
      <div className="flex items-center justify-center mb-3">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {chartData.map((item, index) => (
            <g key={index}>
              <path
                d={item.pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
                opacity="0.8"
              />
            </g>
          ))}
          {/* Center circle for donut effect */}
          <circle cx="100" cy="100" r="50" fill="#1f2937" />
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
          >
            {overallUsage.toFixed(0)}%
          </text>
          <text
            x="100"
            y="110"
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="10"
          >
            Used
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-300 truncate" title={item.projectName}>
                {item.projectName}
              </span>
            </div>
            <div className="text-right ml-2">
              <div className="text-white font-semibold">
                ${(item.used / 1000).toFixed(0)}k / ${(item.allocated / 1000).toFixed(0)}k
              </div>
              <div className={`text-xs ${item.usagePercentage > 80 ? 'text-red-400' : 'text-green-400'}`}>
                {item.usagePercentage.toFixed(0)}% used
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Total Budget</span>
          <span className="text-white font-bold">
            ${(totalUsed / 1000).toFixed(0)}k / ${(totalAllocated / 1000).toFixed(0)}k
          </span>
        </div>
      </div>
    </div>
  );
}
