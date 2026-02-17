import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

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

  const loadItems = async () => {
    try {
      const res = await api.get(`/get-items/${listId}`);
      setItems(res.data.items || []);
      setListTitle(res.data.listInfo?.title || "Board");
    } catch { }
  };

  useEffect(() => { loadItems(); }, [listId]);

  const showToast = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      await api.post("/add-item", { listId, title: newItem });
      setNewItem(""); loadItems();
      showToast("Added! ✨");
    } catch { showToast("Error", "error"); }
  };

  const saveEditItem = async (itemId) => {
    if (!editingItemTitle.trim()) return setEditingItemId(null);
    try {
      await api.put(`/edit-item/${itemId}`, { title: editingItemTitle });
      setEditingItemId(null); loadItems();
      showToast("Updated! ✅");
    } catch { }
  };

  const handleDeleteItem = async () => {
    try {
      await api.delete(`/delete-item/${itemToDelete}`);
      setShowDeleteModal(false); loadItems();
      showToast("Removed 🗑️");
    } catch { }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] flex flex-col items-center p-6 md:p-12 text-slate-800">
      
      {/* CENTERED TOAST */}
      {msg.text && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-5 duration-300 px-8 py-4 rounded-2xl shadow-2xl font-bold text-white whitespace-nowrap ${msg.type === 'error' ? 'bg-rose-500' : 'bg-slate-800'}`}>
          {msg.text}
        </div>
      )}

      <div className="w-full max-w-2xl flex items-center justify-between mb-12">
        <button onClick={() => navigate("/home")} className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">← Back</button>
        <div className="text-right">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{listTitle}</h1>
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Workspace</p>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-slate-200/50 mb-8">
        <form onSubmit={addItem} className="flex gap-3">
          <input value={newItem} onChange={(e) => setNewItem(e.target.value)} className="flex-1 px-5 py-4 bg-white border border-slate-200 rounded-xl outline-none text-lg" placeholder="I-type ang iyong task..." />
          <button className="bg-slate-800 text-white px-8 py-4 rounded-xl font-bold shadow-md active:scale-95 transition-all">Add</button>
        </form>

        <div className="space-y-2 mt-8">
          {items.map((i) => (
            <div key={i.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl">
              <div className="flex-1">
                {editingItemId === i.id ? (
                  <input autoFocus value={editingItemTitle} onChange={(e) => setEditingItemTitle(e.target.value)} onBlur={() => saveEditItem(i.id)} onKeyDown={(e) => e.key === "Enter" && saveEditItem(i.id)} className="text-lg font-bold text-slate-800 outline-none w-full bg-slate-50 px-2 rounded-lg" />
                ) : (
                  <span className="text-lg font-medium text-slate-700">{i.title}</span>
                )}
              </div>
              <div className="flex gap-4 ml-4 text-xs font-black text-slate-300">
                <button onClick={() => { setEditingItemId(i.id); setEditingItemTitle(i.title); }} className="hover:text-slate-600 transition-colors">EDIT</button>
                <button onClick={() => { setItemToDelete(i.id); setShowDeleteModal(true); }} className="hover:text-rose-400 transition-colors">DEL</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Task?</h3>
            <p className="text-slate-500 mb-8">Permanently remove this task?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600">No</button>
              <button onClick={handleDeleteItem} className="flex-1 py-4 rounded-2xl font-bold bg-rose-500 text-white shadow-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ListItem;