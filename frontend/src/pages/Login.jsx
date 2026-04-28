import React from "react";
import { useDispatch } from "react-redux";
import { fetchMe, login } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from 'notistack';

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            await dispatch(login({ email, password })).unwrap();
            await dispatch(fetchMe()).unwrap();

            navigate("/lobby");
            enqueueSnackbar("Login successfull", { varient: "success" });
        } catch (err) {
            enqueueSnackbar(err.message, { varient: "error" });
        }
    }

    return (
        <div className="flex items-start justify-center h-screen">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-10 w-[350px] mt-10">

                <h1 className="text-3xl font-bold text-center mb-6 text-white/80">♟️ Login</h1>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input type="email" name="email" placeholder="Email" className="p-2 rounded bg-white-/20 border border-white/30 outline-none text-white" />
                    <input type="password" name="password" placeholder="Password" className="p-2 rounded bg-white-/20 border border-white/30 outline-none text-white" />
                    <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded font-semibold cursor-pointer">
                        Login
                    </button>
                </form>

                <p className="text-center text-white/70 mt-6">
                    Don’t have an account?{" "}
                    <span
                        onClick={() => navigate("/signup")}
                        className="text-blue-400 hover:underline cursor-pointer"
                    >
                        Sign up
                    </span>
                </p>
            </div>
        </div>
    )
}

export default Login;