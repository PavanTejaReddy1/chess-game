import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMe, signup } from "../slices/authSlice";
import { enqueueSnackbar } from "notistack";


function Signup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault;

        const formData = new FormData(e.target);

        const name = formData.get("name");
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            await dispatch(signup({ name, email, password })).unwrap();
            await dispatch(fetchMe()).unwrap();

            navigate("/lobby");
            enqueueSnackbar("Signup success", { varient: "success" });
        } catch (err) {
            enqueueSnackbar(err.message, { varient: "error" });
        }
    }

    return (
        <div className="flex items-start justify-center h-screen">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-10 w-[350px] mt-10">

                <h1 className="text-3xl font-bold text-center mb-6">♟️ Signup</h1>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input type="text" name="name" placeholder="Name" className="p-2 rounded bg-white/20 border border-white/30 outline-none" />
                    <input type="email" name="email" placeholder="Email" className="p-2 rounded bg-white/20 border border-white/30 outline-none" />
                    <input type="password" name="password" placeholder="Password" className="p-2 rounded bg-white/20 border border-white/30 outline-none" />
                    <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded font-semibold cursor-pointer">
                        Signup
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Signup;