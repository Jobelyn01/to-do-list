import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";

function ListItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [listInfo, setListInfo] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const loadData = async () => {
    try {
      const res = await api.get(`/get-items/${id}`);
      setItems(res.data.items);
      setListInfo(res.data.listInfo);
    } catch (err) {
      if (err.response?.status === 401) navigate("/");
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem) return;

    await api.post("/add-item", { listId: id, title: newItem });
    setNewItem("");
    loadData();
  };

  const deleteItem = async (itemId) => {
    await api.delete(`/delete-item/${itemId}`);
    loadData();
  };

  const startEdit = (item) => {
    setEditing(item.id);
    setEditTitle(item.title);
  };

  const saveEdit = async (itemId) => {
    await api.put(`/edit-item/${itemId}`, {
      title: editTitle,
      status: "pending"
    });

    setEditing(null);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur rounded-3xl p-8 shadow-xl">

        <button
          onClick={() => navigate("/home")}
          className="text-sm text-gray-500 mb-6"
        >
          ← Back
        </button>

        {listInfo && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{listInfo.title}</h1>
          </div>
        )}

        <form onSubmit={addItem} className="flex gap-2 mb-6">
          <input
            className="flex-1 px-4 py-2 rounded-xl border outline-none"
            placeholder="New task..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button className="px-5 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600">
            Add
          </button>
        </form>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-4 bg-white rounded-2xl shadow"
            >
              <div className="flex-1">
                {editing === item.id ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  <span className="text-lg">{item.title}</span>
                )}
              </div>

              <div className="flex gap-3 ml-4">
                {editing === item.id ? (
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
  );
}

export default ListItem;
