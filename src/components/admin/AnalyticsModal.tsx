import React from 'react';
import { X, TrendingUp, Users, Home, Eye, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from
  'recharts';
interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: any;
}
const GROWTH_DATA = [
  {
    name: 'Jan',
    users: 120,
    properties: 80
  },
  {
    name: 'Feb',
    users: 150,
    properties: 90
  },
  {
    name: 'Mar',
    users: 180,
    properties: 110
  },
  {
    name: 'Apr',
    users: 220,
    properties: 130
  },
  {
    name: 'May',
    users: 280,
    properties: 160
  },
  {
    name: 'Jun',
    users: 350,
    properties: 190
  }];

const TRAFFIC_DATA = [
  {
    day: 'Mon',
    visits: 1200
  },
  {
    day: 'Tue',
    visits: 1500
  },
  {
    day: 'Wed',
    visits: 1700
  },
  {
    day: 'Thu',
    visits: 1600
  },
  {
    day: 'Fri',
    visits: 2100
  },
  {
    day: 'Sat',
    visits: 1400
  },
  {
    day: 'Sun',
    visits: 1300
  }];

const CATEGORY_DATA = [
  {
    name: 'Hostels',
    value: 45,
    color: '#4ade80'
  },
  {
    name: 'Apartments',
    value: 30,
    color: '#60a5fa'
  },
  {
    name: 'Hotels',
    value: 15,
    color: '#facc15'
  },
  {
    name: 'Villas',
    value: 10,
    color: '#f87171'
  } // red-400
];
export function AnalyticsModal({ isOpen, onClose, stats }: AnalyticsModalProps) {
  if (!isOpen) return null;

  // Process historical data if available
  const growthData = stats?.historical ? stats.historical.users.map((u: any, i: number) => ({
    name: u._id, // e.g. "2024-01"
    users: u.count,
    properties: stats.historical.properties[i]?.count || 0
  })) : GROWTH_DATA;

  const displayStats = stats || {
    users: { total: 0 },
    properties: { total: 0 },
    bookings: { total: 0 },
    reviews: { total: 0 }
  };
  const handleDownloadPDF = () => {
    // In a real app, this would capture the charts and generate a PDF
    alert('Preparing analytics PDF report...');
    setTimeout(() => {
      alert('Analytics report downloaded successfully!');
    }, 1500);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-6xl bg-[#0f0f0f] border border-[#333] rounded-2xl shadow-2xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-[#333] flex justify-between items-center sticky top-0 bg-[#0f0f0f] z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#222] rounded-lg border border-[#333]">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Platform Analytics
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg text-sm font-medium transition-colors border border-[#333]">

              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-white transition-colors">

              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#161616] border border-[#333] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4 text-gray-400">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Total Users</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {displayStats.users.total}
              </div>
              <div className="text-sm font-medium text-green-400 bg-green-900/20 inline-block px-2 py-1 rounded border border-green-900/30">
                +12% from last month
              </div>
            </div>

            <div className="bg-[#161616] border border-[#333] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4 text-gray-400">
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">Properties</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {displayStats.properties.total}
              </div>
              <div className="text-sm font-medium text-green-400 bg-green-900/20 inline-block px-2 py-1 rounded border border-green-900/30">
                +8% from last month
              </div>
            </div>

            <div className="bg-[#161616] border border-[#333] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4 text-gray-400">
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">Total Bookings</span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {displayStats.bookings.total}
              </div>
              <div className="text-sm font-medium text-green-400 bg-green-900/20 inline-block px-2 py-1 rounded border border-green-900/30">
                +24% from last month
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User & Property Growth */}
            <div className="bg-[#161616] border border-[#333] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">
                User & Property Growth
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#333"
                      vertical={false} />

                    <XAxis
                      dataKey="name"
                      stroke="#666"
                      tick={{
                        fill: '#888'
                      }}
                      axisLine={false}
                      tickLine={false} />

                    <YAxis
                      stroke="#666"
                      tick={{
                        fill: '#888'
                      }}
                      axisLine={false}
                      tickLine={false} />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#222',
                        borderColor: '#333',
                        color: '#fff'
                      }}
                      itemStyle={{
                        color: '#fff'
                      }}
                      cursor={{
                        fill: '#333',
                        opacity: 0.4
                      }} />

                    <Legend />
                    <Bar
                      dataKey="users"
                      name="Users"
                      fill="#dc2626"
                      radius={[4, 4, 0, 0]}
                      barSize={20} />

                    <Bar
                      dataKey="properties"
                      name="Properties"
                      fill="#4ade80"
                      radius={[4, 4, 0, 0]}
                      barSize={20} />

                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Traffic */}
            <div className="bg-[#161616] border border-[#333] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">
                Weekly Traffic
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={TRAFFIC_DATA}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#333"
                      vertical={false} />

                    <XAxis
                      dataKey="day"
                      stroke="#666"
                      tick={{
                        fill: '#888'
                      }}
                      axisLine={false}
                      tickLine={false} />

                    <YAxis
                      stroke="#666"
                      tick={{
                        fill: '#888'
                      }}
                      axisLine={false}
                      tickLine={false} />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#222',
                        borderColor: '#333',
                        color: '#fff'
                      }}
                      itemStyle={{
                        color: '#fff'
                      }} />

                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="#4ade80"
                      strokeWidth={3}
                      dot={{
                        fill: '#4ade80',
                        strokeWidth: 2
                      }}
                      activeDot={{
                        r: 8
                      }} />

                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Property Categories */}
          <div className="bg-[#161616] border border-[#333] rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">
              Property Categories
            </h3>
            <div className="h-[300px] w-full flex flex-col md:flex-row items-center justify-center">
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CATEGORY_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value">

                      {CATEGORY_DATA.map((entry, index) =>
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none" />

                      )}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#222',
                        borderColor: '#333',
                        color: '#fff'
                      }}
                      itemStyle={{
                        color: '#fff'
                      }} />

                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center gap-4 pl-0 md:pl-10">
                {CATEGORY_DATA.map((category, index) =>
                  <div
                    key={index}
                    className="flex items-center justify-between max-w-xs">

                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: category.color
                        }} />

                      <span className="text-white font-medium">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-gray-400">({category.value}%)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}