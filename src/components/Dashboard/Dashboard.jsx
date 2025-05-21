import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await axios.get('/api/leads', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setLeads(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const recentActivity = leads
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  if (loading) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{status}</h3>
            <p className="text-3xl font-bold">{count}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <ul>
          {recentActivity.map((lead) => (
            <li key={lead._id} className="py-2 border-b last:border-b-0">
              {lead.name} - {lead.status} (Updated: {new Date(lead.updatedAt).toLocaleDateString()})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;