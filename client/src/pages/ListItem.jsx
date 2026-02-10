import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";

function ListItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [listInfo, setListInfo] = useState(null);
  const [newItem, setNewItem] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const loadData = async () => {
    try {
      const res = await api.get(`/get-items/${id}`);
      setItems(res.data.items || []);
      setListInfo(res.data.listInfo || null);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    await api.post("/add-item", {
      listId: id,
      title: newItem
    });

    setNewItem("");
    loadData();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const saveEdit = async (itemId) => {
    if (!editTitle.trim()) return;

    await api.put(`/edit-item/${itemId}`, {
      title: editTitle
    });

    setEditingId(null);
    loadData();
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/delete-item/${itemId}`);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">

          <button
            onClick={() => navigate("/home")}
            className="text-white/80 hover:text-white text-sm mb-6"
          >
            ← Back
          </button>

          {listInfo && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">
                {listInfo.title}
              </h1>
              {listInfo.description && (
                <p className="text-white/70 mt-1">
                  {listInfo.description}
                </p>
              )}
            </div>
          )}

          <form onSubmit={addItem} className="flex gap-3 mb-8">
            <input
              className="flex-1 px-5 py-3 rounded-xl bg-white/90 outline-none focus:ring-4 focus:ring-purple-300"
              placeholder="Add new task..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />

            <button
              className="px-6 py-3 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-indigo-500 to-purple-600
                         hover:scale-105 transition"
            >
              Add
            </button>
          </form>

          <div className="space-y-4">
            {items.length === 0 && (
              <p className="text-white/80 text-center">
                No tasks yet.
              </p>
            )}

            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white/90 rounded-2xl p-4 flex justify-between items-center
                           shadow hover:shadow-lg transition"
              >
                <div className="flex-1">
                  {editingId === item.id ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full border rounded-lg px-2 py-1"
                    />
                  ) : (
                    <span className="text-gray-800 text-lg">
                      {item.title}
                    </span>
                  )}
                </div>

                <div className="flex gap-4 ml-4 text-sm">
                  {editingId === item.id ? (
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="text-green-600 font-semibold"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(item)}
                      className="text-indigo-600 font-semibold"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => deleteItem(item.id)}
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
    </div>
  );
}

export default ListItem;
