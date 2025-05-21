import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LeadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [lead, setLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'New',
    tags: [],
    notes: [],
    assignedTo: '',
  });
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsRes, usersRes] = await Promise.all([
          axios.get('/api/tags', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get('/api/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
         console.log(localStorage.getItem('token'))
        ]);
        setTags(tagsRes.data);
        setUsers(usersRes.data.filter((u) => u.role === 'support_agent'));

        if (id) {
          const leadRes = await axios.get(`/api/leads/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setLead(leadRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`/api/leads/${id}`, lead, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      } else {
        await axios.post('/api/leads', lead, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }
      navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lead');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await axios.post(
        `/api/leads/${id}/notes`,
        { content: newNote },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setLead(res.data);
      setNewNote('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note');
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      const res = await axios.post(
        '/api/tags',
        { name: newTag },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTags([...tags, res.data]);
      setNewTag('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tag');
    }
  };

  const handleTagToggle = async (tagId) => {
    try {
      if (lead.tags.includes(tagId)) {
        await axios.delete(`/api/leads/${id}/tags`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          data: { tagId },
        });
        setLead({ ...lead, tags: lead.tags.filter((t) => t !== tagId) });
      } else {
        await axios.post(
          `/api/leads/${id}/tags`,
          { tagId },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setLead({ ...lead, tags: [...lead.tags, tagId] });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update tags');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">{id ? 'Edit Lead' : 'Add Lead'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={lead.name}
              onChange={(e) => setLead({ ...lead, name: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={lead.email}
              onChange={(e) => setLead({ ...lead, email: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              value={lead.phone}
              onChange={(e) => setLead({ ...lead, phone: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Source</label>
            <input
              type="text"
              value={lead.source}
              onChange={(e) => setLead({ ...lead, source: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <select
              value={lead.status}
              onChange={(e) => setLead({ ...lead, status: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
              <option value="Won">Won</option>
            </select>
          </div>
          {(user.role === 'super_admin' || user.role === 'sub_admin') && (
            <div>
              <label className="block text-gray-700 mb-2">Assign To</label>
              <select
                value={lead.assignedTo}
                onChange={(e) => setLead({ ...lead, assignedTo: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <button
                key={tag._id}
                type="button"
                onClick={() => handleTagToggle(tag._id)}
                className={`px-3 py-1 rounded ${
                  lead.tags.includes(tag._id) ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Add Tag
            </button>
          </div>
        </div>

        {/* Notes */}
        {id && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Add Note</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddNote}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Add Note
              </button>
            </div>
            <ul className="space-y-2">
              {lead.notes.map((note, index) => (
                <li key={index} className="p-2 bg-gray-100 rounded">
                  {note.content} <span className="text-sm text-gray-500">({new Date(note.createdAt).toLocaleDateString()})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/leads')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            {id ? 'Update Lead' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LeadForm;