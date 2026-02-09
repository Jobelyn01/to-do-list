import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Siguraduhin na tama ang port ng iyong backend
  const API = "http://localhost:3000";

  const fetchLists = async () => {
    try {
      console.log("Fetching lists from server...");
      const res = await axios.get(`${API}/get-list`, { withCredentials: true });
      
      if (res.data.success) {
        console.log("Lists received:", res.data.list);
        setLists(res.data.list);
      }
    } catch (err) {
      console.error("Fetch Error:", err.response?.status, err.response?.data);
      
      // KUNG 401 (Unauthorized), ibig sabihin hindi gumana ang session/login
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const addList = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await axios.post(
        `${API}/add-list`, 
        { title }, 
        { withCredentials: true }
      );
      
      if (res.data.success) {
        setTitle("");
        fetchLists(); // I-refresh ang listahan pagkatapos mag-add
      }
    } catch (err) {
      console.error("Add List Error:", err);
    }
  };

  const deleteList = async (id) => {
    if (!window.confirm("Are you sure you want to delete this list?")) return;

    try {
      const res = await axios.delete(`${API}/delete-list/${id}`, { withCredentials: true });
      if (res.data.success) {
        fetchLists();
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading your lists...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My To-Do Lists</h2>
        <button 
            onClick={() => {
                // Logout logic: Simple redirect back to login for now
                navigate("/");
            }}
            style={{ padding: '5px 10px', cursor: 'pointer' }}
        >
            Logout
        </button>
      </div>

      <hr />

      {/* FORM PARA MAG-ADD NG LIST */}
      <form onSubmit={addList} style={{ marginBottom: '30px', marginTop: '20px' }}>
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Enter List Title (e.g. Grocery, Work)" 
          style={{ padding: '10px', width: '70%', marginRight: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          required 
        />
        <button 
          type="submit" 
          style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          + Add List
        </button>
      </form>

    
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {lists.length === 0 ? (
          <p style={{ color: 'gray' }}>No lists found. Create one above!</p>
        ) : (
          lists.map(l => (
            <div 
              key={l.id} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '10px', 
                padding: '15px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <div 
                onClick={() => navigate(`/list/${l.id}`)} 
                style={{ cursor: 'pointer', flex: 1 }}
              >
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b' }}>
                  {l.title}
                </span>
                <p style={{ margin: '5px 0 0 0', color: 'gray', fontSize: '0.9rem' }}>
                  {l.item_count || 0} items
                </p>
              </div>
              
              <button 
                onClick={() => deleteList(l.id)} 
                style={{ 
                  backgroundColor: '#fee2e2', 
                  color: '#dc2626', 
                  border: 'none', 
                  padding: '8px 12px', 
                  borderRadius: '5px', 
                  cursor: 'pointer' 
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;