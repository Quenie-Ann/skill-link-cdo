import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import Card from '../components/common/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Users, ClipboardList, Zap, Star, BarChart3 } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    totalRequests: 0,
    activeJobs: 0,
    avgRating: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    // Fetch worker count
    const { count: workerCount } = await supabase
      .from('workers')
      .select('*', { count: 'exact', head: true })

    // Fetch request count
    const { count: requestCount } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })

    // Fetch active jobs
    const { count: activeCount } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'assigned')

    setStats({
      totalWorkers: workerCount || 0,
      totalRequests: requestCount || 0,
      activeJobs: activeCount || 0,
      avgRating: 4.5 // Calculate from reviews
    })
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
    <div className="p-8 bg-skill-light min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-skill-dark">Analytics Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Workers</p>
              <p className="text-3xl font-bold mt-1">{stats.totalWorkers}</p>
            </div>
            
            <div className="p-3 bg-green-100 rounded-full text-skill-dark">
               <Users size={28} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Service Requests</p>
              <p className="text-3xl font-bold mt-1">{stats.totalRequests}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
               <ClipboardList size={28} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Jobs</p>
              <p className="text-3xl font-bold mt-1">{stats.activeJobs}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
               <Zap size={28} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Rating</p>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-3xl font-bold">{stats.avgRating}</p>
                <Star className="fill-yellow-400 text-yellow-400" size={20} />
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
               <BarChart3 size={28} />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Section */}
      <Card title="Service Request Trends">
        <div className="h-[300px] w-full">
            {/* Responsive container for mobile-responsive design*/}
            <LineChart width={800} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="requests" 
                stroke="#065f46" //dark palette
                strokeWidth={3} 
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
        </div>
      </Card>
    </div>
  )
}