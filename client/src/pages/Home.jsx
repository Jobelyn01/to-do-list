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
      setMessage({ text: "List added successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: "Failed to add list", type: "error" });
    }
  };

  const startEdit = (list) => {
    setEditingId(list.id);
    setEditingTitle(list.title);
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/edit-list/${id}`, { title: editingTitle, description: "" });
      setEditingId(null);
      loadLists();
      setMessage({ text: "List updated!", type: "success" });
    } catch {
      setMessage({ text: "Failed to update list", type: "error" });
    }
  };

  const deleteList = async (id) => {
    if (!window.confirm("Delete this list?")) return;
    try {
      await api.delete(`/delete-list/${id}`);
      loadLists();
      setMessage({ text: "List deleted!", type: "success" });
    } catch {
      setMessage({ text: "Failed to delete list", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My To-Do Lists</h1>
          <button
            onClick={async () => {
              await api.post("/logout");
              navigate("/");
            }}
            className="text-sm text-red-500 font-semibold"
          >
            Logout
          </button>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Add new list */}
        <form onSubmit={addList} className="flex gap-2 mb-6">
          <input
            value={newList}
            onChange={(e) => setNewList(e.target.value)}
            placeholder="New list title..."
            className="flex-1 px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button className="px-5 py-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition">
            Add
          </button>
        </form>

        {/* List display */}
        <div className="space-y-4">
          {lists.length === 0 && (
            <p className="text-center text-gray-500">No lists yet.</p>
          )}

          {lists.map((l) => (
            <div
              key={l.id}
              className="flex justify-between items-center p-4 rounded-2xl bg-white shadow"
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => navigate(`/list/${l.id}`)}
              >
                {editingId === l.id ? (
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  <>
                    <h3 className="font-bold text-lg">{l.title}</h3>
                    <p className="text-sm text-gray-500">
                      {l.item_count} items
                    </p>
                  </>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                {editingId === l.id ? (
                  <button
                    onClick={() => saveEdit(l.id)}
                    className="text-green-600 font-semibold"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(l)}
                    className="text-indigo-600 font-semibold"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => deleteList(l.id)}
                  className="text-red-500 font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
