import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";

function ListItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [listInfo, setListInfo] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const loadItems = async () => {
    try {
      const res = await api.get(`/get-items/${id}`);
      setItems(res.data.items);
      setListInfo(res.data.listInfo);
    } catch (err) {
      if (err.response?.status === 401) navigate("/");
      else setMessage({ text: "Failed to load tasks", type: "error" });
    }
  };

  useEffect(() => { loadItems(); }, [id]);

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem) return;
    try {
      await api.post("/add-item", { listId: id, title: newItem });
      setNewItem("");
      setMessage({ text: "Success! Task added to your list.", type: "success" });
      loadItems();
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch { 
      setMessage({ text: "Something went wrong. Try again.", type: "error" }); 
    }
  };

  const saveEditItem = async (itemId) => {
    if (!editingTitle.trim()) return;
    try {
      await api.put(`/edit-item/${itemId}`, { title: editingTitle });
      setEditingId(null);
      loadItems();
      setMessage({ text: "Task updated successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch { 
      setMessage({ text: "Failed to update task.", type: "error" }); 
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/delete-item/${itemId}`);
      loadItems();
      setMessage({ text: "Task removed.", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch { 
      setMessage({ text: "Failed to delete task.", type: "error" }); 
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 mb-8">
          <button 
            onClick={() => navigate("/home")} 
            className="w-fit flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <span className="text-xl">←</span> Back to Dashboard
          </button>
          
          {listInfo && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
               {/* Decorative Gradient Blob */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
                {listInfo.title}
              </h1>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                {items.length} {items.length === 1 ? 'task' : 'tasks'} remaining
              </p>
            </div>
          )}
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
          }`}>
            <span className="font-bold">{message.type === "success" ? "✓" : "!"}</span>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Add Task Input */}
        <form onSubmit={addItem} className="relative group mb-10">
          <input 
            value={newItem} 
            onChange={(e) => setNewItem(e.target.value)} 
            placeholder="Write a new task..." 
            className="w-full pl-6 pr-32 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-lg" 
          />
          <button className="absolute right-2 top-2 bottom-2 px-8 bg-indigo-600 text-white rounded-[1.5rem] font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95">
            Add
          </button>
        </form>

        {/* Tasks List */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-medium">Your list is empty. Time to be productive!</p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="group flex justify-between items-center p-5 bg-white rounded-[1.8rem] shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex-1 flex items-center gap-4">
                  {editingId === item.id ? (
                    <input 
                      autoFocus 
                      value={editingTitle} 
                      onChange={(e) => setEditingTitle(e.target.value)} 
                      onKeyDown={(e) => e.key === "Enter" && saveEditItem(item.id)}
                      className="w-full bg-slate-50 px-4 py-2 rounded-xl border-b-2 border-indigo-500 outline-none font-medium"
                    />
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-400 transition-colors"></div>
                      <span className="text-slate-700 font-semibold text-lg">{item.title}</span>
                    </>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  {editingId === item.id ? (
                    <>
                      <button onClick={() => saveEditItem(item.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 text-slate-400 text-sm font-bold">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => { setEditingId(item.id); setEditingTitle(item.title); }} 
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Edit Task"
                      >
                        ✎
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id)} 
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Task"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ListItem;