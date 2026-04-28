import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "../api/client";
import { setUser } from "../slices/authSlice"; 
import { TbUserEdit } from "react-icons/tb";
import { VscClose } from "react-icons/vsc";

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [editProfile, setEditProfile] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      console.log(formData)

      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(setUser(res.data.user));

      setEditProfile(false);
      setPreview(null);
      setFile(null);

      alert("Upload successful!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-start text-white p-6">

      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl flex items-center gap-6">

        <div className="relative">
          <img
            src={user?.avatar || "https://via.placeholder.com/150"}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-white"
          />

          <div
            onClick={() => setEditProfile(true)}
            className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600"
          >
            <TbUserEdit />
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold">
            {user.user.name || "User Name"}
          </h2>
          <p className="text-white/70">{user?.email}</p>
        </div>

        <button
          onClick={() => setEditProfile(true)}
          className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 cursor-pointer"
        >
          Change Profile
        </button>
      </div>

      <div className="w-full max-w-4xl mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white/10 p-4 rounded-xl text-center flex flex-col justify-center items-center">
          <p className="text-sm text-white flex justify-center items-center text-xl font-bold">⭐Rating</p>
          <p className="text-lg font-bold text-xl">{Math.floor(user.user.stats.rating) || 1200}</p>
        </div>

        <div className="bg-white/10 p-4 rounded-xl text-center flex flex-col justify-center items-center">
        <p className="text-sm text-white flex justify-center items-center text-xl font-bold">♟️Games played</p>
          <p className="text-lg font-bold text-xl">{user.user.stats.gamesPlayed || 0}</p>
          
        </div>

        <div className="bg-white/10 p-4 rounded-xl text-center flex flex-col justify-center items-center">
          <p className="text-sm text-white flex justify-center items-center text-xl font-bold">🏆Wins</p>
          <p className="text-lg font-bold text-xl">{user.user.stats.wins || 0}</p>
          
        </div>

        <div className="bg-white/10 p-4 rounded-xl text-center flex flex-col justify-center items-center">
          <p className="text-sm text-white flex justify-center items-center text-xl font-bold">❌Draws</p>
          <p className="text-lg font-bold text-xl">{user.user.stats.draws || 0}</p>
        </div>
      </div>

      <div className="w-full max-w-4xl mt-6 grid md:grid-cols-2 gap-4">

        <div className="bg-white/10 p-4 rounded-xl">
          <h3 className="font-semibold mb-3">Achievements</h3>
          <div className="flex gap-4 text-center">
            <div>🏅<p className="text-sm">Champion</p></div>
            <div>⭐<p className="text-sm">Unbeaten</p></div>
            <div>🔥<p className="text-sm">First Win</p></div>
            <div>🎯<p className="text-sm">10 Games</p></div>
          </div>
        </div>

        <div className="bg-white/10 p-4 rounded-xl">
          <h3 className="font-semibold mb-3">Recent Matches</h3>
          <div className="text-sm space-y-2 text-white/80">
            
          </div>
        </div>

      </div>


      {editProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">

          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-[350px] relative">

            <VscClose
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setEditProfile(false)}
            />

            <h2 className="text-2xl font-bold mb-6 text-center">
              Upload Profile Picture
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="w-32 h-32 rounded-full mx-auto object-cover border-2 border-white"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="bg-gray-800 p-2 rounded"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 p-2 rounded font-semibold"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;