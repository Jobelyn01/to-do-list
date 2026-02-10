import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function Home() {
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const navigate = useNavigate();

  const loadLists = async () => {
    try {
      const res = await api.get("/get-list");
      setLists(res.data.list || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const addList = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/add-list", { title });
    setTitle("");
    loadLists();
  };

  const startEdit = (list) => {
    setEditing(list.id);
    setEditTitle(list.title);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;

    await api.put(`/edit-list/${id}`, {
      title: editTitle,
      description: ""
    });

    setEditing(null);
    loadLists();
  };

  const deleteList = async (id) => {
    if (!window.confirm("Delete this list?")) return;
    await api.delete(`/delete-list/${id}`);
    loadLists();
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {}
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-wide">
              My To-Do Lists
            </h1>
            <button
              onClick={logout}
              className="text-white/80 hover:text-white text-sm"
            >
              Logout
            </button>
          </div>

          <form
            onSubmit={addList}
            className="flex gap-3 mb-8"
          >
            <input
              className="flex-1 px-5 py-3 rounded-xl bg-white/90 outline-none focus:ring-4 focus:ring-purple-300"
              placeholder="Create new list..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <button
              className="px-6 py-3 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-indigo-500 to-purple-600
                         hover:scale-105 transition"
            >
              Add
            </button>
          </form>

          <div className="grid sm:grid-cols-2 gap-5">
            {lists.length === 0 && (
              <p className="text-white/80 col-span-full text-center">
                No lists yet.
              </p>
            )}

            {lists.map((l) => (
              <div
                key={l.id}
                className="group bg-white/90 rounded-2xl p-5 shadow-lg
                           hover:-translate-y-1 transition"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/list/${l.id}`)}
                >
                  {editing === l.id ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full border rounded-lg px-2 py-1"
                    />
                  ) : (
                    <>
                      <h3 className="font-bold text-xl text-gray-800">
                        {l.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {l.item_count ?? 0} tasks
                      </p>
                    </>
                  )}
                </div>

                <div className="flex gap-4 mt-4 justify-end text-sm">
                  {editing === l.id ? (
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
    </div>
  );
}

export default Home;
