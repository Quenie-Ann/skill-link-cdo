import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import Card from '../components/common/Card'

export default function Workers() {
  const [workers, setWorkers] = useState([])

  // Form state (controlled inputs)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [experience, setExperience] = useState("")
  const [rate, setRate] = useState("")

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

  // Form submit handler
  async function handleAddWorker(e) {
    e.preventDefault()

    // Meaningful UI update (temporary local add)
    const newWorker = {
      id: Date.now(),
      profiles: {
        full_name: fullName,
        email: email
      },
      experience_years: experience,
      hourly_rate: rate,
      rating: 0,
      skills: []
    }

    setWorkers([newWorker, ...workers])

    // clear inputs
    setFullName("")
    setEmail("")
    setExperience("")
    setRate("")
  }

  // Summary calculations
  const totalWorkers = workers.length
  const averageRating =
    workers.length > 0
      ? (
          workers.reduce((acc, w) => acc + (w.rating || 0), 0) /
          workers.length
        ).toFixed(1)
      : "0.0"

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Workers Management</h1>

      {/* Worker Registraion form */}
      <Card>
        <form onSubmit={handleAddWorker} className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Worker</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border p-2 rounded"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded"
              required
            />

            <input
              type="number"
              placeholder="Experience (years)"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="border p-2 rounded"
              required
            />

            <input
              type="number"
              placeholder="Hourly Rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="border p-2 rounded"
              required
            />

          </div>

          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            Add Worker
          </button>
        </form>
      </Card>

      {/* Summary Section */}
      <div className="mb-8 mt-6">
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Workers</p>
              <h2 className="text-2xl font-bold">{totalWorkers}</h2>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Average Rating</p>
              <h2 className="text-2xl font-bold">{averageRating} ⭐</h2>
            </div>
          </div>
        </Card>
      </div>

      {/* Existing Worker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map((worker) => (
          <Card key={worker.id}>
            <h3 className="font-bold text-lg">
              {worker.profiles?.full_name || 'Unknown'}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              {worker.profiles?.email}
            </p>
            <p className="text-sm mb-2">
              Skills: {worker.skills?.join(', ')}
            </p>
            <p className="text-sm">
              Experience: {worker.experience_years} years
            </p>
            <p className="text-sm">
              Rate: ₱{worker.hourly_rate}/hr
            </p>
            <p className="text-sm">
              Rating: {worker.rating} ⭐
            </p>
          </Card>
        ))}

        {workers.length === 0 && (
          <p className="text-gray-500">
            No workers registered yet
          </p>
        )}
      </div>
    </div>
  )
}