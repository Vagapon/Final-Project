// src/pages/Admin/Overview.jsx
import React, { useEffect, useState } from 'react';
import VenueMap from '../../../components/chart/VenueMap';
import Chart from '../../../components/chart/Charts';
import Statistics from '../../../components/chart/Statistics';
import { Users, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { userApi } from '../../../api';
import { eventApi } from '../../../api/eventManagement';
import bookingService from '../../../api/bookingManagement/bookingService';
import axiosClient from '../../../api/axiosClient';

const Overview = () => {
  const [metrics, setMetrics] = useState({
    users: 0,
    events: 0,
    stadiums: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const [usersRes, eventsRes, fieldStatsRes, bookingsRes] = await Promise.allSettled([
          userApi.getAllUsers({ page: 1, limit: 1 }),
          eventApi.getAllEvents({ page: 1, limit: 1 }),
          axiosClient.get('/fields/stats'),
          bookingService.getAllBookings({ page: 1, limit: 500 }),
        ]);

        const usersTotal =
          usersRes.status === 'fulfilled'
            ? usersRes.value?.data?.pagination?.total ||
              usersRes.value?.data?.total ||
              (usersRes.value?.data?.data?.length ?? 0)
            : 0;

        const eventsTotal =
          eventsRes.status === 'fulfilled'
            ? eventsRes.value?.data?.pagination?.total ||
              eventsRes.value?.data?.total ||
              (eventsRes.value?.data?.data?.length ?? 0)
            : 0;

        const fieldsTotal =
          fieldStatsRes.status === 'fulfilled'
            ? fieldStatsRes.value?.data?.data?.totalFields ?? fieldStatsRes.value?.data?.totalFields ?? 0
            : 0;

        const bookings =
          bookingsRes.status === 'fulfilled'
            ? bookingsRes.value?.data?.data || bookingsRes.value?.data || []
            : [];

        const revenue = Array.isArray(bookings)
          ? bookings.reduce((sum, b) => {
              const isPaid = b.paymentStatus === 'paid';
              const amount = Number(b.totalPrice) || 0;
              return isPaid ? sum + amount : sum;
            }, 0)
          : 0;

        setMetrics({
          users: usersTotal,
          events: eventsTotal,
          stadiums: fieldsTotal,
          revenue,
        });
      } catch (err) {
        console.error('Dashboard metrics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formatNumber = (value) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  };

  const formatCurrency = (value) =>
    value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sport Events Dashboard
        </h1>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : formatNumber(metrics.users)}
                </p>
              </div>
            </div>
          </div>
          <div className="h-3" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : formatNumber(metrics.events)}
                </p>
              </div>
            </div>
          </div>
          <div className="h-3" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stadiums</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : formatNumber(metrics.stadiums)}
                </p>
              </div>
            </div>
          </div>
          <div className="h-3" />
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">Revenue (paid bookings)</p>
              <p className="text-3xl font-bold">{loading ? '...' : formatCurrency(metrics.revenue)}</p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="h-3" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Events</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Event registrations over time</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 rounded-full">
                This Year
              </button>
            </div>
          </div>
          <Chart />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Statistics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Key performance metrics</p>
          </div>
          <Statistics />
        </div>
      </div>

      {/* Additional Quick Stats */}
<div className="mt-6">
  <VenueMap />
</div>
    </div>
  );
};

export default Overview;