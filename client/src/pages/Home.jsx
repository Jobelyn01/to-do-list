import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function Home() {
  const [lists, setLists] = useState([]);
  const [newList, setNewList] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const loadLists = async () => {
    try {
      const res = await api.get("/get-list");
      setLists(res.data.list || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/");
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const addList = async (e) => {
    e.preventDefault();
    if (!newList) return;
    setIsLoading(true);
    try {
      await api.post("/add-list", { title: newList });
      setNewList("");
      loadLists();
      // COOL NOTIFICATION DESIGN
      setMessage({ text: "List Added Successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: "Failed to add list", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (l) => {
    setEditingId(l.id);
    setEditingTitle(l.title);
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/edit-list/${id}`, { title: editingTitle });
      setEditingId(null);
      loadLists();
      setMessage({ text: "Updated Successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch {
      setMessage({ text: "Update failed", type: "error" });
    }
  };

  const deleteList = async (id) => {
    if (!window.confirm("Delete this list?")) return;
    try {
      await api.delete(`/delete-list/${id}`);
      loadLists();
      setMessage({ text: "Deleted Successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch {
      setMessage({ text: "Delete failed", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10 flex flex-col items-center">
      
      {/* HEADER SECTION */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Focus Hub</h1>
          <p className="text-slate-500 font-medium">Organize your daily grind.</p>
        </div>
        <button
          onClick={async () => { await api.post("/logout"); navigate("/"); }}
          className="px-5 py-2 rounded-xl border border-rose-200 text-rose-500 font-bold hover:bg-rose-50 transition-all active:scale-95"
        >
          Logout
        </button>
      </div>

      {/* SUCCESS NOTIFICATION (Floating) */}
      {message.text && (
        <div className="fixed top-10 z-[100] animate-in slide-in-from-top-5 duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
            message.type === "success" ? "bg-emerald-500 text-white border-emerald-400" : "bg-rose-500 text-white border-rose-400"
          }`}>
            <span className="font-bold">✓ {message.text}</span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT CARD */}
      <main className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-12 transition-all">
        
        {/* ADD LIST FORM */}
        <form onSubmit={addList} className="flex flex-col md:flex-row gap-3 mb-12">
          <input
            value={newList}
            onChange={(e) => setNewList(e.target.value)}
            placeholder="What's on your mind? (e.g. Work, Gym)"
            className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-lg"
          />
          <button 
            disabled={isLoading}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center min-w-[140px]"
          >
            {isLoading ? "Adding..." : "+ Create List"}
          </button>
        </form>

        {/* LIST DISPLAY */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Your Active Boards</h2>
          
          {lists.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium italic">Your hub is empty. Add a list to start.</p>
            </div>
          ) : (
            lists.map((l) => (
              <div 
                key={l.id}
                className="group flex flex-col md:flex-row justify-between items-center p-6 rounded-3xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex-1 w-full" onClick={() => navigate(`/list/${l.id}`)}>
                  {editingId === l.id ? (
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => saveEdit(l.id)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(l.id)}
                      className="text-xl font-bold text-indigo-600 outline-none w-full bg-indigo-50 px-3 py-1 rounded-lg"
                    />
                  ) : (
                    <div className="cursor-pointer">
                      <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">{l.title}</h3>
                      <p className="text-sm text-slate-400 font-medium">{l.item_count || 0} Tasks Available</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 md:mt-0">
                  {editingId === l.id ? (
                    <button onClick={() => saveEdit(l.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">Save</button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); startEdit(l); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); deleteList(l.id); }} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;