import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  gradientFrom?: string;
  gradientTo?: string;
  lineColor?: string;
  pointColor?: string;
  fillColor?: string;
  className?: string;
  showLabels?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  gradientFrom = 'rgba(59, 130, 246, 0.8)',
  gradientTo = 'rgba(59, 130, 246, 0)',
  lineColor = 'rgba(59, 130, 246, 1)',
  pointColor = 'rgba(59, 130, 246, 1)',
  className = '',
  showLabels = true,
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, gradientFrom);
    gradient.addColorStop(1, gradientTo);

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.map(point => point.label),
        datasets: [
          {
            label: '',
            data: data.map(point => point.value),
            fill: true,
            backgroundColor: gradient,
            borderColor: lineColor,
            borderWidth: 3,
            pointBackgroundColor: pointColor,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3, // Smooth curve
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#1f2937',
            bodyColor: '#1f2937',
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            cornerRadius: 10,
            displayColors: false,
            padding: 10,
            boxPadding: 5,
          },
        },
        scales: {
          x: {
            display: showLabels,
            grid: {
              display: false,
            },
            ticks: {
              color: '#9ca3af',
              font: {
                size: 10,
              },
            },
          },
          y: {
            display: showLabels,
            beginAtZero: true,
            grid: {
              color: 'rgba(229, 231, 235, 0.5)',
            },
            ticks: {
              color: '#9ca3af',
              font: {
                size: 10,
              },
            },
          },
        },
        elements: {
          line: {
            tension: 0.3,
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    };

    // Create new chart
    chartInstance.current = new Chart(ctx, chartConfig);

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, height, gradientFrom, gradientTo, lineColor, pointColor, showLabels]);

  return (
    <div className={`${className}`} style={{ height: `${height}px` }}>
      <canvas ref={chartRef} />
    </div>
  );
};