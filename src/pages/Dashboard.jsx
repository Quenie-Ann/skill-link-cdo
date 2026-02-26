import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import Card from '../components/common/Card'
import { 
  LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts'
import { Users, ClipboardList, Zap, Star, BarChart3 } from 'lucide-react'

export default function Dashboard() {

  const [stats, setStats] = useState({
    totalWorkers: 0,
    totalRequests: 0,
    activeJobs: 0,
    avgRating: 0
  })

  // system status State
  const [systemStatus, setSystemStatus] = useState("Online")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const { count: workerCount } = await supabase
        .from('workers')
        .select('*', { count: 'exact', head: true })

      const { count: requestCount } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })

      const { count: activeCount } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'assigned')

      setStats({
        totalWorkers: workerCount || 0,
        totalRequests: requestCount || 0,
        activeJobs: activeCount || 0,
        avgRating: 4.5
      })

    } catch (error) {
      console.error('Dashboard fetch error:', error)
    }
  }

  const chartData = [
    { month: 'Jan', requests: 45 },
    { month: 'Feb', requests: 52 },
    { month: 'Mar', requests: 61 },
    { month: 'Apr', requests: 58 },
    { month: 'May', requests: 70 },
    { month: 'Jun', requests: 68 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-800">
          Analytics Dashboard
        </h1>
        <p className="text-slate-500 mt-2">
          Overview of platform performance
        </p>
      </div>

      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow">
        <div>
          <p className="text-sm text-gray-500">System Status</p>
          <p className={`font-bold text-lg ${
            systemStatus === "Online" ? "text-green-600" : "text-red-600"
          }`}>
            {systemStatus}
          </p>
        </div>

        <button
          onClick={() =>
            setSystemStatus(
              systemStatus === "Online" ? "Maintenance" : "Online"
            )
          }
          className="bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          Toggle Status
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-10">

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Workers</p>
              <p className="text-4xl font-bold mt-2 text-slate-800">
                {stats.totalWorkers}
              </p>
            </div>
            <div className="p-4 bg-green-100 rounded-2xl text-green-700 shadow-sm">
              <Users size={32} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Service Requests</p>
              <p className="text-4xl font-bold mt-2 text-slate-800">
                {stats.totalRequests}
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-2xl text-blue-700 shadow-sm">
              <ClipboardList size={32} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Jobs</p>
              <p className="text-4xl font-bold mt-2 text-slate-800">
                {stats.activeJobs}
              </p>
            </div>
            <div className="p-4 bg-yellow-100 rounded-2xl text-yellow-600 shadow-sm">
              <Zap size={32} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Rating</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-4xl font-bold text-slate-800">
                  {stats.avgRating}
                </p>
                <Star className="fill-yellow-400 text-yellow-400" size={22} />
              </div>
            </div>
            <div className="p-4 bg-purple-100 rounded-2xl text-purple-600 shadow-sm">
              <BarChart3 size={32} />
            </div>
          </div>
        </Card>

      </div>

      {/* Chart Section */}
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            Service Request Trends
          </h2>
          <p className="text-sm text-slate-500">
            Monthly performance overview
          </p>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#065f46"
                strokeWidth={4}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  )
}