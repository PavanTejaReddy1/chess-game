import React from "react";
import { useState } from "react";
import { api } from "../api/client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { TfiCup } from "react-icons/tfi";
import { IoShield } from "react-icons/io5";
import { FaGamepad } from "react-icons/fa";
import { FaFire } from "react-icons/fa";
import { FaStar } from "react-icons/fa";

function Leaderboard() {

    const [data, setData] = useState([]);
    const user = useSelector(state => state.auth.user);

    async function loadData() {
        try {
            const res = await api.get("/leaderboard");
            setData(res.data);
        } catch (err) {
            console.log(err.message);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="flex flex-col mx-auto shadow-xl rounded-2xl p-6 w-[90vw] mt-10">
            <div className="flex gap-4 items-center">
                <p className="mb-5 bg-blue-500/50 p-4 rounded-xl backdrop-blur-sm"><TfiCup size={50}/></p>
                <div className=""> 
                    <p className="text-4xl text-white/90">Leaderboard</p>
                    <p className="text-xl text-white/90">Top players ranked by performance</p>
                </div>
            </div>
            <div className="rounded-xl overflow-hidden">
                <table className="text-center text-lg w-[90vw]">
                    <thead>
                        <tr className="bg-blue-500/50">
                            <th className="p-4 flex justify-center items-center">#</th>
                            <th>Name</th>
                            <th><div className="flex justify-center items-center gap-2"><TfiCup />Wins</div></th>
                            <th><div className="flex justify-center items-center gap-2"><IoShield />Loses</div></th>
                            <th><div className="flex justify-center items-center gap-2"><FaGamepad/>Games Played</div></th>
                            <th><div className="flex justify-center items-center gap-2"><FaFire />Streak</div></th>
                            <th className="pr-6"><div className="flex justify-center items-center gap-2"><FaStar />Rating</div></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(u => (
                            <tr className={`${user.user._id.toString() === u._id.toString() ? `bg-yellow-500/50` : " bg-white/20 backdrop-blur-lg"}`}>
                                <td className="p-2">{u.rank}</td>
                                <td className="p-2">{u.name}</td>
                                <td className="p-2">{u.stats.wins}</td>
                                <td className="p-2">{u.stats.losses}</td>
                                <td className="p-2">{u.stats.gamesPlayed}</td>
                                <td className="p-2">{u.stats.bestStreak}</td>
                                <td className="p-2">{u.stats.rating}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Leaderboard;