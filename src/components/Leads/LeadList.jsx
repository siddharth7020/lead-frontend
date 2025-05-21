import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function LeadList() {
  const [leads, setLeads] = useState([]);
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState({ status: '', tag: '', search: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, tagsRes] = await Promise.all([
          axios.get('/api/leads', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get('/api/tags', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        ]);
        setLeads(leadsRes.data);
        setTags(tagsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = async () => {
    try {
      const res = await axios.get('/api/leads/export', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await axios.delete(`/api/leads/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setLeads(leads.filter((lead) => lead._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredLeads = leads.filter((lead) => {
    return (
      (!filters.status || lead.status === filters.status) &&
      (!filters.tag || lead.tags.some((tag) => tag._id === filters.tag)) &&
      (!filters.search ||
        lead.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        lead.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        lead.phone?.includes(filters.search)) &&
      (!filters.startDate || new Date(lead.createdAt) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(lead.createdAt) <= new Date(filters.endDate))
    );
  });

  if (loading) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Leads</h2>
        <div className="space-x-4">
          <Link to="/leads/new" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Add Lead
          </Link>
          <Link to="/leads/import" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Import Leads
          </Link>
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Export to Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-white p-4 rounded-lg shadow">
        <div>
          <label className="block text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
            <option value="Won">Won</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Tag</label>
          <select
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            {tags.map((tag) => (
              <option key={tag._id} value={tag._id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Name, Email, Phone"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Lead Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Tags</th>
              <th className="p-3 text-left">Assigned To</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{lead.name}</td>
                <td className="p-3">{lead.email}</td>
                <td className="p-3">{lead.phone || '-'}</td>
                <td className="p-3">{lead.status}</td>
                <td className="p-3">{lead.tags.map((tag) => tag.name).join(', ') || '-'}</td>
                <td className="p-3">{lead.assignedTo?.name || 'Unassigned'}</td>
                <td className="p-3">
                  <Link
                    to={`/leads/edit/${lead._id}`}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </Link>
                  {(user.role === 'super_admin' || user.role === 'sub_admin') && (
                    <button
                      onClick={() => handleDelete(lead._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeadList;