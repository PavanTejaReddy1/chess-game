import { useNavigate } from "react-router-dom";

function Guest() {
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const name = formData.get("name");
        const guest = { id: crypto.randomUUID(), name };

        localStorage.setItem("guest", JSON.stringify(guest));
        navigate("/lobby");
    }

    return (
        <div className="flex items-start justify-center min-h-screen px-4 py-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-10 w-full max-w-[350px] mt-4 sm:mt-10">

                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Join as Guest ♟️</h1>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        className="p-2 sm:p-3 rounded bg-white/20 border border-white/30 outline-none text-white placeholder-white/60"
                        required
                    />
                    <button className="bg-blue-500 hover:bg-blue-600 p-2 sm:p-3 rounded font-semibold cursor-pointer">
                        Join
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Guest;
