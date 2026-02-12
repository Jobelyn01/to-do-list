import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function Home() {
  const [lists, setLists] = useState([]);
  const [newList, setNewList] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const navigate = useNavigate();

  const loadLists = async () => {
    try {
      const res = await api.get("/get-list");
      setLists(res.data.list || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/");
      else setMessage({ text: "Failed to load lists", type: "error" });
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const addList = async (e) => {
    e.preventDefault();
    if (!newList) return;
    try {
      await api.post("/add-list", { title: newList });
      setNewList("");
      loadLists();
      setMessage({ text: "Success! New list created.", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: "Failed to add list", type: "error" });
    }
  };

  const startEdit = (e, list) => {
    e.stopPropagation(); // Para hindi mag-trigger ang navigate pag pinindot ang edit
    setEditingId(list.id);
    setEditingTitle(list.title);
  };

  const saveEdit = async (e, id) => {
    e.stopPropagation();
    try {
      await api.put(`/edit-list/${id}`, { title: editingTitle });
      setEditingId(null);
      loadLists();
      setMessage({ text: "List title updated!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch {
      setMessage({ text: "Failed to update list", type: "error" });
    }
  };

  const deleteList = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this entire list?")) return;
    try {
      await api.delete(`/delete-list/${id}`);
      loadLists();
      setMessage({ text: "List deleted.", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch {
      setMessage({ text: "Failed to delete list", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              My Workspace
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage your daily goals efficiently.</p>
          </div>
          <button
            onClick={async () => {
              await api.post("/logout");
              navigate("/");
            }}
            className="px-6 py-2 border border-rose-100 text-rose-500 font-bold rounded-2xl hover:bg-rose-50 transition-all active:scale-95"
          >
            Logout
          </button>
        </header>

        {/* Feedback Message */}
        {message.text && (
          <div className={`mb-8 p-4 rounded-2xl animate-in slide-in-from-top-2 duration-300 border ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
          }`}>
            <p className="font-semibold">{message.text}</p>
          </div>
        )}

        {/* Add New List Card */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-12">
          <h2 className="text-lg font-bold mb-4 text-slate-700 ml-1">Create New List</h2>
          <form onSubmit={addList} className="flex flex-col md:flex-row gap-3">
            <input
              value={newList}
              onChange={(e) => setNewList(e.target.value)}
              placeholder="e.g. Shopping List, Work Projects..."
              className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-lg"
            />
            <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
              Create List
            </button>
          </form>
        </section>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-medium text-lg">No lists found. Start by creating one!</p>
            </div>
          ) : (
            lists.map((l) => (
              <div
                key={l.id}
                onClick={() => navigate(`/list/${l.id}`)}
                className="group bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 cursor-pointer relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-300">
                      <span className="text-xl group-hover:scale-110 transition-transform">📋</span>
                    </div>
                  </div>

                  {editingId === l.id ? (
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(e, l.id)}
                      className="w-full bg-slate-50 px-3 py-2 rounded-xl border-b-2 border-indigo-500 outline-none font-bold text-xl mb-2"
                    />
                  ) : (
                    <h3 className="font-extrabold text-xl text-slate-800 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {l.title}
                    </h3>
                  )}
                  
                  <p className="text-slate-400 font-medium">
                    {l.item_count || 0} Task{l.item_count !== "1" ? 's' : ''}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-4">
                  {editingId === l.id ? (
                    <button 
                      onClick={(e) => saveEdit(e, l.id)} 
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Save
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => startEdit(e, l)} 
                      className="text-slate-400 hover:text-indigo-600 font-bold transition-colors"
                    >
                      Rename
                    </button>
                  )}
                  
                  <button 
                    onClick={(e) => deleteList(e, l.id)} 
                    className="text-slate-400 hover:text-rose-500 font-bold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;