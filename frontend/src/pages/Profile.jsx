import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "../api/client";
import { setUser } from "../slices/authSlice"; 
import { TbUserEdit } from "react-icons/tb";
import { VscClose } from "react-icons/vsc";
import { toast } from "react-toastify";

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
      toast.info("Please select a file");
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

      toast.success("Upload successful");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-start text-white p-4 sm:p-6">

      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6">

        <div className="relative">
          <img
            src={user?.avatar || "https://via.placeholder.com/150"}
            alt="avatar"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white"
          />

          <div
            onClick={() => setEditProfile(true)}
            className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600"
          >
            <TbUserEdit />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold">
            {user.user.name || "User Name"}
          </h2>
          <p className="text-white/70 text-sm sm:text-base">{user?.email}</p>
        </div>

        <button
          onClick={() => setEditProfile(true)}
          className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 cursor-pointer w-full sm:w-auto"
        >
          Change Profile
        </button>
      </div>

      <div className="w-full max-w-4xl mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

        <div className="bg-white/10 p-3 sm:p-4 rounded-xl text-center flex flex-col justify-center items-center">
          <p className="text-xs sm:text-sm text-white flex justify-center items-center text-lg sm:text-xl font-bold">⭐Rating</p>
          <p className="text-base sm:text-lg font-bold text-lg sm:text-xl">{Math.floor(user.user.stats.rating) || 1200}</p>
        </div>

        <div className="bg-white/10 p-3 sm:p-4 rounded-xl text-center flex flex-col justify-center items-center">
        <p className="text-xs sm:text-sm text-white flex justify-center items-center text-lg sm:text-xl font-bold">♟️Games played</p>
          <p className="text-base sm:text-lg font-bold text-lg sm:text-xl">{user.user.stats.gamesPlayed || 0}</p>

        </div>

        <div className="bg-white/10 p-3 sm:p-4 rounded-xl text-center flex flex-col justify-center items-center">
          <p className="text-xs sm:text-sm text-white flex justify-center items-center text-lg sm:text-xl font-bold">🏆Wins</p>
          <p className="text-base sm:text-lg font-bold text-lg sm:text-xl">{user.user.stats.wins || 0}</p>

        </div>

        <div className="bg-white/10 p-3 sm:p-4 rounded-xl text-center flex flex-col justify-center items-center">
          <p className="text-xs sm:text-sm text-white flex justify-center items-center text-lg sm:text-xl font-bold">❌Draws</p>
          <p className="text-base sm:text-lg font-bold text-lg sm:text-xl">{user.user.stats.draws || 0}</p>
        </div>
      </div>

      <div className="w-full max-w-4xl mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-white/10 p-4 rounded-xl">
          <h3 className="font-semibold mb-3">Achievements</h3>
          <div className="flex flex-wrap gap-3 sm:gap-4 text-center justify-center sm:justify-start">
            <div className="flex flex-col items-center">🏅<p className="text-xs sm:text-sm">Champion</p></div>
            <div className="flex flex-col items-center">⭐<p className="text-xs sm:text-sm">Unbeaten</p></div>
            <div className="flex flex-col items-center">🔥<p className="text-xs sm:text-sm">First Win</p></div>
            <div className="flex flex-col items-center">🎯<p className="text-xs sm:text-sm">10 Games</p></div>
          </div>
        </div>

        <div className="bg-white/10 p-4 rounded-xl">
          <h3 className="font-semibold mb-3">Recent Matches</h3>
          <div className="text-sm space-y-2 text-white/80">

          </div>
        </div>

      </div>


      {editProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4">

          <div className="bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-[350px] relative">

            <VscClose
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setEditProfile(false)}
            />

            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">
              Upload Profile Picture
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto object-cover border-2 border-white"
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