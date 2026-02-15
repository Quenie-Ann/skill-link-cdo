import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import Card from '../components/common/Card'

export default function Workers() {
  const [workers, setWorkers] = useState([])

  useEffect(() => {
    fetchWorkers()
  }, [])

  async function fetchWorkers() {
    const { data } = await supabase
      .from('workers')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
    
    setWorkers(data || [])
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Workers Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map((worker) => (
          <Card key={worker.id}>
            <h3 className="font-bold text-lg">{worker.profiles?.full_name || 'Unknown'}</h3>
            <p className="text-gray-600 text-sm mb-2">{worker.profiles?.email}</p>
            <p className="text-sm mb-2">Skills: {worker.skills?.join(', ')}</p>
            <p className="text-sm">Experience: {worker.experience_years} years</p>
            <p className="text-sm">Rate: ₱{worker.hourly_rate}/hr</p>
            <p className="text-sm">Rating: {worker.rating} ⭐</p>
          </Card>
        ))}
        
        {workers.length === 0 && (
          <p className="text-gray-500">No workers registered yet</p>
        )}
      </div>
    </div>
  )
}