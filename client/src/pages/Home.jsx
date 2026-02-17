import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Home() {
  const [lists, setLists] = useState([]);
  const [newList, setNewList] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const navigate = useNavigate();

  // Ginamit ang useCallback para i-optimize ang Vercel build
  const load = useCallback(async () => {
    try {
      const res = await api.get("/get-list");
      setLists(res.data.list || []);
    } catch (err) {
      console.error("Load error:", err);
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const showToast = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const add = async (e) => {
    e.preventDefault();
    if (!newList.trim()) return;
    try {
      await api.post("/add-list", { title: newList });
      setNewList("");
      load();
      showToast("Board created successfully! ✨");
    } catch {
      showToast("Error creating board", "error");
    }
  };

  const save = async (id) => {
    if (!editingTitle.trim()) return setEditingId(null);
    try {
      await api.put(`/edit-list/${id}`, { title: editingTitle });
      setEditingId(null);
      load();
      showToast("Board renamed! ✅");
    } catch {
      showToast("Update failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/delete-list/${listToDelete}`);
      setShowDeleteModal(false);
      load();
      showToast("Board deleted permanently", "success");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] flex flex-col items-center p-6 md:p-12 text-slate-800">
      
      {/* CENTERED TOAST (No more browser alerts) */}
      {msg.text && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl font-bold text-white whitespace-nowrap flex items-center gap-2 bg-slate-800 animate-bounce">
          {msg.type === 'error' ? '⚠️' : '✨'} {msg.text}
        </div>
      )}

      {/* HEADER */}
      <div className="w-full max-w-2xl flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Focus Hub</h1>
          <p className="text-slate-500 font-medium">Simplify your workflow.</p>
        </div>
        <button 
          onClick={async () => { await api.post("/logout"); navigate("/"); }} 
          className="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* CREATE INPUT */}
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-slate-200/50 mb-8">
        <form onSubmit={add} className="flex gap-3">
          <input 
            className="flex-1 bg-white border border-slate-200 p-4 rounded-xl outline-none text-lg focus:ring-2 focus:ring-slate-200" 
            placeholder="New board title..." 
            value={newList} 
            onChange={e => setNewList(e.target.value)} 
          />
          <button className="bg-slate-800 text-white px-6 py-4 rounded-xl font-bold shadow-md active:scale-95 transition-all">
            Create
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="w-full max-w-2xl space-y-3">
        {lists.map(l => (
          <div key={l.id} className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex-1">
              {editingId === l.id ? (
                <input 
                  autoFocus 
                  className="text-lg font-bold text-slate-800 outline-none w-full bg-slate-50 px-2 rounded-lg border border-slate-200" 
                  value={editingTitle} 
                  onChange={e => setEditingTitle(e.target.value)} 
                  onBlur={() => save(l.id)} 
                  onKeyDown={e => e.key === 'Enter' && save(l.id)} 
                />
              ) : (
                <div className="cursor-pointer" onClick={() => navigate(`/list/${l.id}`)}>
                  <h2 className="text-xl font-bold text-slate-800">{l.title}</h2>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{l.item_count || 0} items</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 ml-4 text-xs font-black text-slate-300">
              <button onClick={() => { setEditingId(l.id); setEditingTitle(l.title); }} className="hover:text-slate-600">EDIT</button>
              <button onClick={() => { setListToDelete(l.id); setShowDeleteModal(true); }} className="hover:text-rose-400">DELETE</button>
            </div>
          </div>
        ))}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h3>
            <p className="text-slate-500 mb-8 font-medium">Delete this board permanently?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl font-bold bg-rose-500 text-white shadow-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;