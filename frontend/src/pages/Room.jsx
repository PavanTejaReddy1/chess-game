import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { connectSocket, socket } from "../socket";
import { useSelector } from "react-redux";
import { Chessboard } from "@gustavotoyota/react-chessboard";
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoPeopleCircleOutline } from "react-icons/io5";
import { IoExitOutline } from "react-icons/io5";
import { FaRegCopy } from "react-icons/fa6";
import { IoMdTime } from "react-icons/io";
import { MdPeople } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { CiCircleAlert } from "react-icons/ci";
import { SlCalender } from "react-icons/sl";
import { FaChess } from "react-icons/fa";
import { FaRegLightbulb } from "react-icons/fa";
import { enqueueSnackbar } from "notistack";
import { FaRegCircle } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { toast } from "react-toastify";

function Room() {
    const { roomCode } = useParams();

    const [room, setRoom] = useState(null);
    const [fen, setFen] = useState(null);
    const [turn, setTurn] = useState(null);
    const [color, setColor] = useState(null);
    const [whiteMs, setWhiteMs] = useState(null);
    const [blackMs, setBlackMs] = useState(null);
    const [showReady, setShowReady] = useState(false);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);

    const guest = JSON.parse(localStorage.getItem("guest"));
    const user = useSelector((state) => state.auth.user) || { _id: guest?.id, name: guest?.name };
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        setLoading(true);
        setRoom(null);
        setFen(null);
        setTurn(null);
        setMessages([]);
        setText("");

        connectSocket();

        socket.emit("room:join", roomCode, (response) => {
            if (!isMounted) return;

            if (!response?.ok) {
                toast(response?.message || "Room not found");
                navigate("/lobby");
                return;
            }

            setRoom(response.room);

            socket.emit("game:state", roomCode, (res) => {
                if (!isMounted) return;

                if (!res?.ok) return;

                setFen(res.state.fen);
                setTurn(res.state.turn);

                setLoading(false);
            });
        });

        const onPresence = (data) => {
            setRoom(data);
        };

        socket.on("room:presence", onPresence);

        const onUpdate = (state) => {
            setFen(state.fen);
            setTurn(state.turn);
        };

        socket.on("game:update", onUpdate);

        const onEnd = (result) => {
            toast(result, {
                position: "top-left",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light"
            });
        };

        socket.on("game:over", onEnd);

        function onClock(c) {
            if (roomCode != c.roomCode) return;

            setWhiteMs(c.whiteMs);
            setBlackMs(c.blackMs);
        }

        socket.on("clock:update", onClock);

        socket.emit("chat:history", roomCode, (response) => {
            if (!response?.ok) {
                (toast.error(response?.message, {
                    position: "top-left",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light"
                }) || "Failed to fetch chat");
                return;
            }
            setMessages(response.messages);
        });

        const onMessage = (message) => {
            setMessages((prev) => [...prev, message]);
        };

        socket.on("chat:message", onMessage);

        return () => {
            socket.off("room:presence", onPresence);
            socket.off("game:update", onUpdate);
            socket.off("game:over", onEnd);
            socket.off("clock:update", onClock);
            socket.off("chat:message", onMessage);
            isMounted = false;
        };
    }, [roomCode]);

    function leaveRoom() {
        socket.emit("room:leave", roomCode, (response) => {
            if (!response?.ok)
                return (toast.error(response?.message, {
                    position: "top-left",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light"
                }) || "Failed to leave room");

            setRoom(response?.room);
            navigate("/lobby");
        });
    }

    function startGame() {
        socket.emit("game:start", roomCode, (response) => {
            if (!response?.ok)
                return (toast.error(response?.message, {
                    position: "top-left",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light"
                }) || "Failed to start game");
        });
    }

    function onDrop(sourceSquare, targetSquare) {

        if (!fen) return false;
        socket.emit(
            "game:move",
            roomCode,
            sourceSquare,
            targetSquare,
            "q",
            (response) => {
                if (!response?.ok) return (toast.info(response?.message, {
                    position: "top-left",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light"
                }) || "Invalid move");
            },
        );

        return true;
    }

    function convertTime(ms) {
        if (!ms) return "--:--";
        const total = Math.floor(ms / 1000);
        const m = String(Math.floor(total / 60)).padStart(2, "0");
        const s = String(Math.floor(total % 60)).padStart(2, "0");
        return `${m}:${s}`;
    }

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            enqueueSnackbar("Text copied to clipboard", { varient: "success" });
        } catch (err) {
            enqueueSnackbar(err.message, { varient: "error" });
        }
    }

    function onSend() {
        if (!text.trim()) return;

        socket.emit("chat:send", roomCode, text, (response) => {
            if (!response?.ok) {
                alert(response.message);
                return;
            }
            setText("");
        });
    }

    useEffect(() => {
        if (room?.status === "ready") {
            setShowReady(true);
            const timer = setTimeout(() => {
                setShowReady(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [room?.status]);

    useEffect(() => {
        let timer;

        if (room?.status === "active" || (fen && room?.status !== "waiting")) {
            timer = setInterval(() => {
                if (turn === "w") {
                    setWhiteMs((prev) => (prev > 0 ? prev - 1000 : 0));
                } else if (turn === "b") {
                    setBlackMs((prev) => (prev > 0 ? prev - 1000 : 0));
                }
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [turn, room?.status, fen]);

    function gameStatus() {
        if (showReady) {
            return (
                <p className="text-green-900 w-[300px] mb-4 flex gap-1 items-center justify-center bg-green-400 font-bold p-1 rounded-xl animate-pulse">
                    ✓ Ready to Play
                </p>
            );
        } else {
            return (
                <button className="text-white w-[200px] mb-4 flex gap-1 items-center justify-center bg-red-500/80 font-bold p-1 rounded-xl hover:bg-red-600 cursor-pointer" onClick={leaveRoom}><IoExitOutline size={20} />Leave Room</button>
            );
        }
    }

    if (!room) {
        return (
            <div className="flex justify-center items-center h-screen text-white text-2xl">
                Loading room...
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-white">

                <h1 className="text-4xl font-bold mb-6 animate-pulse">
                    ♟️ Chess Arena
                </h1>

                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6"></div>

                <p className="text-lg text-white/70">
                    Setting up your game...
                </p>

                <div className="mt-10 grid grid-cols-8 gap-1 opacity-50">
                    {Array.from({ length: 64 }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-8 ${(Math.floor(i / 8) + i) % 2 === 0
                                    ? "bg-white/20"
                                    : "bg-black/20"
                                }`}
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center mt-2 w-full">
            <div className="w-[80vw]">
                <button className="flex gap-2 items-center text-white/80 hover:text-white cursor-pointer" onClick={leaveRoom}><FaArrowLeftLong />Back to lobby</button>


                {room?.status === "waiting" ?
                    <>
                        <div className="flex justify-between w-full">
                            <div className="flex gap-2 items-center">
                                <IoPeopleCircleOutline size={90} />
                                <div className="mt-2">
                                    <h1 className={`${room?.status === "waiting" ? `text-3xl` : `text-2xl`} font-bold mb-2`}>Room Code: {roomCode}</h1>
                                    {room?.status === "waiting" ? <p className="text-orange-900 w-[300px] mb-4 flex gap-1 items-center justify-center bg-orange-300/90 font-bold p-1 rounded-xl"><IoMdTime size={30} /> Waiting for opponent</p> : gameStatus()}
                                </div>

                                {room?.status === "waiting" ? <p className="flex items-center gap-1 p-3 bg-white/10 rounded-xl ml-5 cursor-pointer hover:bg-white/30" onClick={() => copyText(roomCode)}><FaRegCopy size={20} />Copy Code</p> : null}
                            </div>
                        </div>

                        <hr className="p-1 w-full text-white/50 rounded-xl" />

                        <div className="flex gap-3">
                            <div className="flex flex-col gap-5">
                                <div className="border bg-white/10 backdrop-blur-sm border-white/50 rounded-xl w-[400px] p-6">
                                    <p className="flex items-center gap-1 text-xl font-bold m-2"><MdPeople size={30} />Players {room?.players.length === 1 ? "(1/2)" : "(2/2)"}</p>
                                    <ul className="space-y-2">
                                        {room?.players.map((p) => (
                                            <>
                                                <div className="bg-white/20 p-2 flex items-center text-white/80 gap-2 rounded-xl pl-5 flex">
                                                    <IoPerson size={40} />
                                                    <li key={p.userId}>
                                                        <div className="flex gap-1">
                                                            <p className="font-bold text-lg">{p.name}</p>
                                                            <p>{p.userId?.toString() === user?.user?._id?.toString() ? "(You)" : ""}{console.log(p)}</p>
                                                        </div>
                                                        <p>color : {p.userId === room?.whiteId ? "White" : "Black"}</p>
                                                    </li>
                                                </div>

                                                {room?.players.length === 1 ?
                                                    <div className="bg-white/20 p-2 flex items-center text-white/80 gap-2 rounded-xl pl-5 flex border border-dashed border-gray-400">
                                                        <IoPerson size={40} />
                                                        <li key={p.userId}>
                                                            <p className="font-bold text-lg">wating for opponent...</p>
                                                            <p className="text-sm text-white/60">share the room code to invite the friend</p>
                                                        </li>
                                                    </div>
                                                    : null
                                                }
                                            </>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border bg-white/10 backdrop-blur-sm border-white/50 rounded-xl w-[400px] p-6">
                                    <p className="flex gap-2 items-center font-bold text-white/80 text-xl"><CiCircleAlert size={30} /> Room Info</p>
                                    <span className="flex justify-between items-center mt-2 text-lg text-white/80">
                                        <p className="pl-2"># Room Code</p>
                                        <p className="p-2 bg-white/20 rounded-xl text-sm pr-2 cursor-pointer hover:bg-white/30" onClick={() => copyText(roomCode)}>{roomCode}</p>
                                    </span>

                                    <hr className="mt-2 mb-2 w-full text-white/20 " />

                                    <span className="flex justify-between items-center mt-2 text-lg text-white/80">
                                        <p className="flex items-center gap-2"><IoMdTime size={25} />Time Control</p>
                                        <p className="text-sm pr-2">5:00 + 0</p>
                                    </span>

                                    <hr className="mt-3 mb-3 w-full text-white/20 " />

                                    <span className="flex justify-between items-center mt-2 text-lg text-white/80">
                                        <p className="pl-1 flex items-center gap-3"><SlCalender size={20} />Created</p>
                                        <p className="text-sm pr-2">Junt now</p>
                                    </span>
                                </div>
                            </div>

                            <div className="w-full flex flex-col gap-2 items-center justify-center bg-white/10 backdrop-blur-sm border border-white/50 rounded-xl">
                                <FaChess size={100} />
                                <p className="text-4xl text-white">Wating for opponent</p>
                                <p className="text-lg text-white/80">Share the room with your friend to start the game.</p>

                                <div className="flex items-center justify-center gap-5">
                                    <hr className="border w-[100px] border-white/50" />
                                    <p className="text-lg">Room Code</p>
                                    <hr className="border w-[100px] border-white/50" />
                                </div>

                                <p className="text-2xl p-2 bg-white/20 rounded-xl pl-10 pr-10 border border-white/50 cursor-pointer hover:bg-white/30" onClick={() => copyText(roomCode)}>{roomCode}</p>

                                <p className="bg-white/20 mt-4 p-5 rounded-xl border border-white/50 flex items-center gap-2"><FaRegLightbulb size={20} /> Tip: Once another player joins, the game will automatically start and you'll be assigned a color.</p>
                            </div>
                        </div>
                    </>
                    :
                    <div className="flex gap-6 justify-center items-center">
                        <div className="flex flex-col gap-5">
                            <div className="flex justify-between w-full">
                                <div className="flex gap-2 items-center">
                                    <IoPeopleCircleOutline size={90} />
                                    <div className="mt-2">
                                        <h1 className={`${room?.status === "waiting" ? `text-3xl` : `text-2xl`} font-bold mb-2`}>Room Code: {roomCode}</h1>
                                        {room?.status === "waiting" ? <p className="text-orange-900 w-[300px] mb-4 flex gap-1 items-center justify-center bg-orange-300/90 font-bold p-1 rounded-xl"><IoMdTime size={30} /> Waiting for opponent</p> : gameStatus()}
                                    </div>

                                    {room?.status === "waiting" ? <p className="flex items-center gap-1 p-3 bg-white/10 rounded-xl ml-5 cursor-pointer hover:bg-white/30" onClick={() => copyText(roomCode)}><FaRegCopy size={20} />Copy Code</p> : null}
                                </div>
                            </div>

                            <hr className="p-1 w-[400px] text-white/50 rounded-xl" />

                            <div className="flex flex-col gap-5">
                                <div className="border bg-white/10 backdrop-blur-sm border-white/50 rounded-xl w-[400px] p-6">
                                    <p className="flex items-center gap-1 text-xl font-bold m-2"><MdPeople size={30} />Players {room?.players.length === 1 ? "(1/2)" : "(2/2)"}</p>
                                    <ul className="space-y-2">
                                        {room?.players.map((p) => (
                                            <>
                                                <div className="bg-white/20 p-2 flex items-center text-white/80 gap-2 rounded-xl pl-5 flex">
                                                    <IoPerson size={40} />
                                                    <li key={p.userId}>
                                                        <div className="flex gap-1">
                                                            <p className="font-bold text-lg">{p.name}</p>
                                                            <p>{p.userId?.toString() === user?.user?._id?.toString() ? "(You)" : ""}{console.log(p)}</p>
                                                        </div>
                                                        <p>color : {p.userId === room?.whiteId ? "White" : "Black"}</p>
                                                    </li>
                                                </div>

                                                {room?.players.length === 1 ?
                                                    <div className="bg-white/20 p-2 flex items-center text-white/80 gap-2 rounded-xl pl-5 flex border border-dashed border-gray-400">
                                                        <IoPerson size={40} />
                                                        <li key={p.userId}>
                                                            <p className="font-bold text-lg">wating for opponent...</p>
                                                            <p className="text-sm text-white/60">share the room code to invite the friend</p>
                                                        </li>
                                                    </div>
                                                    : null
                                                }
                                            </>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border bg-white/10 backdrop-blur-sm border-white/50 rounded-xl w-[400px] p-6">
                                    <p className="flex gap-2 items-center font-bold text-white/80 text-xl"><CiCircleAlert size={30} /> Room Info</p>
                                    <span className="flex justify-between items-center mt-2 text-lg text-white/80">
                                        <p className="pl-2"># Room Code</p>
                                        <p className="p-2 bg-white/20 rounded-xl text-sm pr-2 cursor-pointer hover:bg-white/30" onClick={() => copyText(roomCode)}>{roomCode}</p>
                                    </span>

                                    <hr className="mt-2 mb-2 w-full text-white/20 " />

                                    <span className="flex justify-between items-center mt-2 text-lg text-white/80">
                                        <p className="flex items-center gap-2"><IoMdTime size={25} />Time Control</p>
                                        <p className="text-sm pr-2">5:00 + 0</p>
                                    </span>

                                    <hr className="mt-3 mb-3 w-full text-white/20 " />

                                    <span className="flex justify-between items-center mt-2 text-lg text-white/80">
                                        <p className="pl-1 flex items-center gap-3"><SlCalender size={20} />Created</p>
                                        <p className="text-sm pr-2">Junt now</p>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-[190%] bg-white/10 p-2 rounded-xl shadow-xl border border-white/50">
                            <div className="flex justify-between p-2 ">
                                <div className="flex justify-center items-center gap-1 font-bold text-white/80 text-base"><FaRegCircle size={20} />Turn:{" "}
                                    {turn
                                        ? turn === "w"
                                            ? "White"
                                            : "Black"
                                        : "Loading..."}
                                </div>

                                <div className="flex gap-5 text-sm">
                                    <div className="flex gap-2 justify-center items-center bg-white/30 p-1 rounded shadow-xl pl-3 pr-3">
                                        <IoMdTime size={25} />
                                        <p className="flex items-center flex-col">
                                            White Time
                                            <span>{convertTime(whiteMs)}</span>
                                        </p>
                                    </div>

                                    <div className="flex gap-2 justify-center items-center bg-black/30 p-1 rounded shadow-xl pl-3 pr-3">
                                        <IoMdTime size={25} />
                                        <p className="flex items-center flex-col">
                                            Black Time
                                            <span>{convertTime(blackMs)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-[600px]">
                                <Chessboard id="room-board" position={fen || "start"} onPieceDrop={onDrop} />
                            </div>

                        </div>

                        <div className="bg-white/10 backdrop-blur-lg p-5 flex flex-col justify-between items-center shadow-xl border border-white/50 rounded-xl w-full h-[500px]">
                            <div className="flex flex-col justify-center items-center w-full">
                                <p className="text-lg font-bold text-white/85">Chat box</p>
                                <hr className="border w-full border-white/30 m-2" />
                            </div>
                            <div className="flex gap-2 justify-center items-center">

                                <input
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="border rounded-lg p-1 pl-2"
                                    placeholder="Send message..."
                                />
                                <button onClick={onSend} className="cursor-pointer bg-blue-500/80 p-1 pl-2 pr-2 rounded-lg hover:bg-blue-500 text-white/80"><IoSend size={25} /></button>
                            </div>
                        </div>
                    </div>
                }

            </div>
        </div>
    );
}

export default Room;
