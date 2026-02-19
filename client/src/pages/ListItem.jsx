import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; // Siguraduhin na tama ang path papunta sa api.js mo

function ListItem() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [listTitle, setListTitle] = useState("Loading...");
  const [msg, setMsg] = useState({ text: "", type: "" });

  // 1. LOAD ITEMS: Dito tayo kumukuha ng data mula sa index.js
  const loadItems = useCallback(async () => {
    try {
      const res = await api.get(`/get-items/${listId}`);
      
      // TAMA NA ITO: Sa index.js mo, 'items' ang key ng array
      if (res.data && res.data.items) {
        setItems(res.data.items); 
        setListTitle(res.data.listInfo?.title || "Task Corner");
      }
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

  // 2. ADD ITEM: Pagka-save sa Neon, hihilahin ulit ang data
 const addItem = async (e) => {
  e.preventDefault();
  if (!newItem.trim()) return;

  try {
    // SIGURADUHIN na 'listId' (galing sa useParams) ang ipinapadala
    const res = await api.post("/add-item", { 
      listId: listId, // Dapat may value ito (hal. 13)
      title: newItem 
    });
    
    if (res.data.success) {
      setNewItem("");
      await loadItems(); // Refresh the list
      showToast("Task added! ✨");
    }
  } catch (err) {
    console.error("Add error:", err);
  }
};

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-10 font-sans">
      {/* Notification Toast */}
      {msg.text && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce">
          {msg.text}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/home")} className="mb-4 text-slate-400 hover:text-black font-bold text-sm tracking-widest uppercase">
          ← Back to Dashboard
        </button>
        
        <h1 className="text-4xl font-black text-slate-900 mb-8">{listTitle}</h1>

        <form onSubmit={addItem} className="flex gap-2 mb-10">
          <input 
            className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
            placeholder="What needs to be done?"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-md">
            Add
          </button>
        </form>

        <div className="space-y-3">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group">
                <span className="text-lg text-slate-700 font-medium">{item.title}</span>
                <button 
                  onClick={async () => {
                    await api.delete(`/delete-item/${item.id}`);
                    loadItems();
                  }}
                  className="text-xs font-black text-slate-200 group-hover:text-rose-500 uppercase tracking-tighter transition-colors"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold italic uppercase tracking-widest text-sm">
                No tasks found in this board.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListItem;