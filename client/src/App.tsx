import { useEffect, useState } from 'react';
import axios from 'axios';

// Interfaces for Type Safety
interface Slot {
  id: number;
  doctor_name: string;
  start_time: string;
  total_seats: number;
  booked_seats: number;
}

// Ensure this matches your backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API_URL}/slots`);
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleBook = async (slotId: number) => {
    setLoading(true);
    setMsg('');
    try {
      // Create a random User ID for demo purposes
      const userId = `user_${Math.floor(Math.random() * 1000)}`;

      const res = await axios.post(`${API_URL}/book`, {
        userId,
        slotId
      });

      setMsg(`✅ ${res.data.message}`);
      fetchSlots(); // Refresh data to show new seat count immediately
    } catch (error: any) {
      setMsg(`❌ ${error.response?.data?.message || 'Error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-blue-600 tracking-tight">
        MediQueue <span className="text-gray-500 text-lg font-normal">| Vaccination Drive</span>
      </h1>

      {msg && (
        <div className={`text-center mb-8 p-4 rounded-lg font-bold max-w-lg mx-auto shadow-sm
          ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {slots.map((slot) => {
          const isFull = slot.booked_seats >= slot.total_seats;
          const percentage = (slot.booked_seats / slot.total_seats) * 100;

          return (
            <div key={slot.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{slot.doctor_name}</h2>
                  <p className="text-sm text-gray-500 font-medium">
                    {new Date(slot.start_time).toLocaleDateString()} • {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {isFull ? 'SOLD OUT' : 'OPEN'}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm font-semibold mb-2 text-gray-600">
                  <span>Availability</span>
                  <span>{slot.booked_seats} / {slot.total_seats}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${isFull ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => handleBook(slot.id)}
                disabled={loading || isFull}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all transform active:scale-95
                  ${isFull 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
              >
                {loading ? 'Processing...' : isFull ? 'No Seats Available' : 'Book Appointment'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;