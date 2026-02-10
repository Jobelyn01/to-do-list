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

  useEffect(() => {
    loadItems();
  }, [id]);

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem) return;

    try {
      await api.post("/add-item", { listId: id, title: newItem });
      setNewItem("");
      loadItems();
      setMessage({ text: "Task added!", type: "success" });
    } catch {
      setMessage({ text: "Failed to add task", type: "error" });
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await api.delete(`/delete-item/${itemId}`);
      loadItems();
      setMessage({ text: "Task deleted!", type: "success" });
    } catch {
      setMessage({ text: "Failed to delete task", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl">
        <button
          onClick={() => navigate("/home")}
          className="text-gray-400 mb-4 hover:text-pink-600"
        >
          ← Back to lists
        </button>

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

        {listInfo && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{listInfo.title}</h1>
            <p className="text-gray-500">{listInfo.description}</p>
          </div>
        )}

        {/* Add task */}
        <form onSubmit={addItem} className="flex gap-2 mb-6">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button className="px-5 py-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition">
            Add
          </button>
        </form>

        {/* Tasks list */}
        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-gray-500 text-center">No tasks yet.</p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 rounded-2xl bg-white shadow"
            >
              <span className="text-gray-700">{item.title}</span>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-red-500 font-semibold"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ListItem;
