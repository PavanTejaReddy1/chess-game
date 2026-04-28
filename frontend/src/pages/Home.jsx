import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen text-white">

      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 flex flex-col justify-center items-center h-screen text-center px-4">

        <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">
          ♟️ Chess Arena
        </h1>


        <p className="text-xl text-white/80 mb-8 max-w-2xl">
          Play real-time chess with friends, challenge opponents, and climb the leaderboard.
        </p>

        <div className="flex gap-6">
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-lg shadow-lg"
          >
            Login to Play
          </button>

          <button
            onClick={() => navigate("/guest")}
            className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl text-lg backdrop-blur-lg"
          >
            Play as Guest
          </button>
        </div>

      </div>
    </div>
  );
}

export default Home;