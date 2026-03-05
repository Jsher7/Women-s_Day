import React, { useState, useEffect } from 'react';
import { pricingAPI } from '../utils/api';
import { FiBarChart2, FiTrendingUp, FiDollarSign, FiBox } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);


const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await pricingAPI.getPriceAnalytics();
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">No analytics data available yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Business Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalProducts}</p>
              </div>
              <FiBox className="text-purple-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Average Price</p>
                <p className="text-3xl font-bold text-green-600">₹{analytics.averagePrice}</p>
              </div>
              <FiDollarSign className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Avg Profit Margin</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.averageProfitMargin}%</p>
              </div>
              <FiTrendingUp className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Profit</p>
                <p className="text-3xl font-bold text-orange-600">₹{analytics.totalProfit}</p>
              </div>
              <FiBarChart2 className="text-orange-500" size={40} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Monthly Sales Revenue</h2>
              <div className="h-64">
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                      label: 'Revenue (₹)',
                      data: [1200, 1900, 1500, 2200, 3100, 4500],
                      borderColor: 'rgb(147, 51, 234)',
                      backgroundColor: 'rgba(147, 51, 234, 0.1)',
                      tension: 0.4,
                      fill: true
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Sales by Category</h2>
              <div className="h-64">
                <Bar
                  data={{
                    labels: ['Embroidery', 'Crochet', 'Jewelry', 'DIY Crafts'],
                    datasets: [{
                      label: 'Units Sold',
                      data: [45, 32, 60, 25],
                      backgroundColor: [
                        'rgba(147, 51, 234, 0.6)',
                        'rgba(236, 72, 153, 0.6)',
                        'rgba(59, 130, 246, 0.6)',
                        'rgba(16, 185, 129, 0.6)'
                      ],
                      borderRadius: 4
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
