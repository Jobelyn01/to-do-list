import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; 

function ListItem() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [listTitle, setListTitle] = useState("Loading...");
  const [msg, setMsg] = useState({ text: "", type: "" });

  const loadItems = useCallback(async () => {
    if (!listId) return;
    try {
      const res = await api.get(`/get-items/${listId}`);
      if (res.data && res.data.items) {
        setItems(res.data.items);
        setListTitle(res.data.listInfo?.title || "Tasks");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) navigate("/");
    }
  }, [listId, navigate]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const showToast = (text) => {
    setMsg({ text, type: "success" });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const res = await api.post("/add-item", { 
        listId: Number(listId), // Pinipilit maging Number
        title: newItem 
      });
      
      if (res.data.success) {
        setNewItem("");
        await loadItems();
        showToast("Task added! ✨");
      }
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/delete-item/${id}`);
      loadItems();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-10 font-sans">
      {msg.text && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce">
          {msg.text}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/home")} className="mb-4 text-slate-400 hover:text-black font-bold text-sm uppercase tracking-widest">
          ← BACK
        </button>
        
        <h1 className="text-4xl font-black text-slate-900 mb-8">{listTitle}</h1>

        <form onSubmit={addItem} className="flex gap-2 mb-10">
          <input 
            className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm"
            placeholder="What needs to be done?"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all">
            Add
          </button>
        </form>

        <div className="space-y-3">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center group shadow-sm">
                <span className="text-lg text-slate-700 font-medium">{item.title}</span>
                <button 
                  onClick={() => deleteItem(item.id)}
                  className="text-xs font-black text-slate-200 group-hover:text-rose-500 uppercase tracking-tighter"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold italic uppercase text-sm tracking-widest">
                No tasks found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListItem;