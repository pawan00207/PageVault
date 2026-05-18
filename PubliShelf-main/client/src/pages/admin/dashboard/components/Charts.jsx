//client/src/pages/admin/dashboard/components/Charts.jsx
import React from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Charts = ({ analytics }) => {
  const genreData = analytics?.genreCounts?.length > 0 ? {
    labels: analytics.genreCounts.map(g => g.genre),
    datasets: [{
      data: analytics.genreCounts.map(g => g.count),
      backgroundColor: [
        "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe",
        "#6b7280", "#9ca3af", "#d1d5db"
      ],
    }]
  } : { labels: [], datasets: [{ data: [] }] };

  const revenueData = analytics?.revenueByGenre?.length > 0 ? {
    labels: analytics.revenueByGenre.map(r => r.genre),
    datasets: [{
      label: "Revenue (₹)",
      data: analytics.revenueByGenre.map(r => r.revenue),
      backgroundColor: "#8b5cf6",
      borderColor: "#6d28d9",
      borderWidth: 1
    }]
  } : { labels: [], datasets: [{ data: [] }] };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" }
    }
  };

  const barOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Revenue (₹)" } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Genre Distribution</h3>
        <div className="w-full h-64">
          <Pie data={genreData} options={pieOptions} />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Genre</h3>
        <div className="w-full h-64">
          <Bar data={revenueData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default Charts;