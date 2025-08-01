'use client';

import React from 'react';
import './ChartRegistry'; // Import to register components
import {
  Line,
  Bar,
  Pie,
  Doughnut,
} from 'react-chartjs-2';

// Common chart options
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1f2937',
      bodyColor: '#374151',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
    },
  },
};

// Interface for chart data
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

interface ChartProps {
  data: ChartData;
  options?: any;
  height?: number;
  className?: string;
}

// LineChart Component (replaces recharts LineChart)
export function LineChart({ data, options, height = 300, className }: ChartProps) {
  const chartOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins,
    },
  };

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <Line data={data} options={chartOptions} />
    </div>
  );
}

// AreaChart Component (replaces recharts AreaChart)
export function AreaChart({ data, options, height = 300, className }: ChartProps) {
  // Ensure fill is enabled for area chart
  const areaData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      fill: true,
      backgroundColor: dataset.backgroundColor || 'rgba(59, 130, 246, 0.1)',
      borderColor: dataset.borderColor || 'rgb(59, 130, 246)',
      tension: dataset.tension || 0.4,
    })),
  };

  const chartOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins,
    },
  };

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <Line data={areaData} options={chartOptions} />
    </div>
  );
}

// BarChart Component (replaces recharts BarChart)
export function BarChart({ data, options, height = 300, className }: ChartProps) {
  const chartOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins,
    },
  };

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <Bar data={data} options={chartOptions} />
    </div>
  );
}

// PieChart Component (replaces recharts PieChart)
export function PieChart({ data, options, height = 300, className }: ChartProps) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    ...options,
  };

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <Pie data={data} options={chartOptions} />
    </div>
  );
}

// DoughnutChart Component (additional option)
export function DoughnutChart({ data, options, height = 300, className }: ChartProps) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    ...options,
  };

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <Doughnut data={data} options={chartOptions} />
    </div>
  );
}

// Helper function to convert recharts data format to Chart.js format
export function convertRechartsData(
  rechartsData: any[],
  dataKeys: string[],
  colors?: string[]
): ChartData {
  const labels = rechartsData.map(item => 
    item.name || item.month || item.date || item.label || item.x || Object.keys(item)[0]
  );

  const datasets = dataKeys.map((key, index) => ({
    label: key,
    data: rechartsData.map(item => item[key] || 0),
    backgroundColor: colors?.[index] || `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
    borderColor: colors?.[index] || `hsl(${(index * 137.5) % 360}, 70%, 45%)`,
    borderWidth: 2,
  }));

  return { labels, datasets };
}

// Helper function to generate color palette
export function generateColors(count: number): string[] {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 137.5) % 360; // Golden angle for better color distribution
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
}

// ResponsiveContainer equivalent
export function ResponsiveContainer({ 
  children, 
  height = 300, 
  className 
}: { 
  children: React.ReactNode; 
  height?: number; 
  className?: string; 
}) {
  return (
    <div className={className} style={{ height: `${height}px`, width: '100%' }}>
      {children}
    </div>
  );
}

// Additional chart color schemes
export const chartColors = {
  primary: [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
  ],
  pastel: [
    '#bfdbfe', // blue-200
    '#a7f3d0', // emerald-200
    '#fde68a', // amber-200
    '#fecaca', // red-200
    '#ddd6fe', // violet-200
    '#a5f3fc', // cyan-200
    '#d9f99d', // lime-200
    '#fed7aa', // orange-200
  ],
  dark: [
    '#1e40af', // blue-800
    '#047857', // emerald-800
    '#d97706', // amber-800
    '#dc2626', // red-800
    '#7c3aed', // violet-800
    '#0891b2', // cyan-800
    '#65a30d', // lime-800
    '#ea580c', // orange-800
  ],
};

export default {
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
  DoughnutChart,
  ResponsiveContainer,
  convertRechartsData,
  generateColors,
  chartColors,
};