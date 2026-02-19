import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; // Siguraduhin na tama ang path papunta sa api.js mo

function ListItem() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [listTitle, setListTitle] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemTitle, setEditingItemTitle] = useState("");

  // 1. LOAD ITEMS - Dito natin kukunin ang data mula sa index.js mo
  const loadItems = useCallback(async () => {
    try {
      const res = await api.get(`/get-items/${listId}`);
      // Sa index.js mo, ang structure ay { items: [...], listInfo: {...} }
      // Kaya kailangan res.data.items ang i-set natin
      setItems(res.data.items || []); 
      setListTitle(res.data.listInfo?.title || "Board");
    } catch (err) { 
      console.error("Fetch error:", err);
      if (err.response?.status === 401) navigate("/");
    }
  }, [listId, navigate]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const showToast = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  // 2. ADD ITEM - Siguradong tatawag ng loadItems() pagkatapos mag-save
  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      const res = await api.post("/add-item", { listId, title: newItem });
      if (res.data.success) {
        setNewItem(""); 
        await loadItems(); // Eto ang magpapakita ng task agad sa screen!
        showToast("Task added! ✨");
      }
    } catch (err) { 
      showToast("Error adding task", "error"); 
    }
  };

  const saveEditItem = async (itemId) => {
    if (!editingItemTitle.trim()) return setEditingItemId(null);
    try {
      const res = await api.put(`/edit-item/${itemId}`, { title: editingItemTitle });
      if (res.data.success) {
        setEditingItemId(null); 
        await loadItems();
        showToast("Updated! ✅");
      }
    } catch { showToast("Edit failed", "error"); }
  };

  const handleDeleteItem = async () => {
    try {
      const res = await api.delete(`/delete-item/${itemToDelete}`);
      if (res.data.success) {
        setShowDeleteModal(false); 
        await loadItems();
        showToast("Removed 🗑️");
      }
    } catch { showToast("Delete failed", "error"); }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center p-6 md:p-12 font-sans text-slate-800">
      {msg.text && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl font-bold text-white ${msg.type === 'error' ? 'bg-rose-500' : 'bg-slate-800'} animate-bounce`}>
          {msg.text}
        </div>
      )}

      <div className="w-full max-w-2xl flex items-center justify-between mb-12">
        <button onClick={() => navigate("/home")} className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">← Back</button>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight underline decoration-slate-200 underline-offset-8">{listTitle}</h1>
      </div>

      <div className="w-full max-w-2xl bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
        <form onSubmit={addItem} className="flex gap-3">
          <input 
            value={newItem} 
            onChange={(e) => setNewItem(e.target.value)} 
            className="flex-1 px-5 py-4 border border-slate-100 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-slate-200" 
            placeholder="Add a new task..." 
          />
          <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold active:scale-95 transition-all shadow-lg hover:bg-black">Add</button>
        </form>

        <div className="mt-8 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-10 text-slate-300 font-medium italic">No tasks found. Add one above!</div>
          ) : (
            items.map((i) => (
              <div key={i.id} className="flex justify-between items-center p-5 bg-white border border-slate-50 rounded-2xl hover:shadow-md transition-all group">
                <div className="flex-1">
                  {editingItemId === i.id ? (
                    <input 
                      autoFocus 
                      value={editingItemTitle} 
                      onChange={(e) => setEditingItemTitle(e.target.value)} 
                      onBlur={() => saveEditItem(i.id)} 
                      onKeyDown={(e) => e.key === "Enter" && saveEditItem(i.id)} 
                      className="text-lg font-bold outline-none w-full bg-white px-2 rounded-lg border border-slate-300" 
                    />
                  ) : (
                    <span className="text-lg font-medium text-slate-700">{i.title}</span>
                  )}
                </div>
                <div className="flex gap-4 ml-4 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black text-slate-300">
                  <button onClick={() => { setEditingItemId(i.id); setEditingItemTitle(i.title); }} className="hover:text-slate-900 uppercase tracking-tighter">Edit</button>
                  <button onClick={() => { setItemToDelete(i.id); setShowDeleteModal(true); }} className="hover:text-rose-500 uppercase tracking-tighter">Del</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-2xl font-black mb-2 text-slate-900">Delete Task?</h3>
            <p className="text-slate-500 mb-8 font-medium">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600">No</button>
              <button onClick={handleDeleteItem} className="flex-1 py-4 rounded-2xl font-bold bg-rose-500 text-white shadow-lg active:scale-95 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListItem;