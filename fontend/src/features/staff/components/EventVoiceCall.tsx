"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, Phone, PhoneOff, Users } from "lucide-react";

interface Peer {
    id: string;
    name: string;
}

interface SignalDescription {
    type: "offer" | "answer";
    sdp?: string;
}

interface SignalCandidate {
    candidate: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string | null;
}

function RemoteAudio({ stream }: { stream: MediaStream }) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) audioRef.current.srcObject = stream;
    }, [stream]);

    return <audio ref={audioRef} autoPlay playsInline />;
}

export function EventVoiceCall({
    concertId,
    token,
    userName,
}: {
    concertId: string;
    token: string | null;
    userName?: string;
}) {
    const [inCall, setInCall] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [muted, setMuted] = useState(false);
    const [error, setError] = useState("");
    const [peers, setPeers] = useState<Peer[]>([]);
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
    const socketRef = useRef<Socket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const connectionsRef = useRef(new Map<string, RTCPeerConnection>());
    const pendingCandidatesRef = useRef(new Map<string, SignalCandidate[]>());

    const closePeer = useCallback((peerId: string) => {
        connectionsRef.current.get(peerId)?.close();
        connectionsRef.current.delete(peerId);
        pendingCandidatesRef.current.delete(peerId);
        setRemoteStreams(current => {
            const next = { ...current };
            delete next[peerId];
            return next;
        });
        setPeers(current => current.filter(peer => peer.id !== peerId));
    }, []);

    const createPeer = useCallback((peer: Peer) => {
        const existing = connectionsRef.current.get(peer.id);
        if (existing) return existing;

        const connection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        const localStream = localStreamRef.current;
        localStream?.getTracks().forEach(track => {
            connection.addTrack(track, localStream);
        });
        connection.onicecandidate = event => {
            if (event.candidate) {
                socketRef.current?.emit("call:ice-candidate", {
                    targetId: peer.id,
                    candidate: event.candidate.toJSON(),
                });
            }
        };
        connection.ontrack = event => {
            const stream = event.streams[0];
            if (stream) setRemoteStreams(current => ({ ...current, [peer.id]: stream }));
        };
        connection.onconnectionstatechange = () => {
            if (connection.connectionState === "failed" || connection.connectionState === "closed") {
                closePeer(peer.id);
            }
        };

        connectionsRef.current.set(peer.id, connection);
        setPeers(current => current.some(item => item.id === peer.id)
            ? current.map(item => item.id === peer.id ? { ...item, name: peer.name || item.name } : item)
            : [...current, peer]);
        return connection;
    }, [closePeer]);

    const flushCandidates = useCallback(async (peerId: string, connection: RTCPeerConnection) => {
        const pending = pendingCandidatesRef.current.get(peerId) || [];
        pendingCandidatesRef.current.delete(peerId);
        for (const candidate of pending) {
            await connection.addIceCandidate(candidate);
        }
    }, []);

    const leaveCall = useCallback(() => {
        socketRef.current?.emit("call:leave");
        socketRef.current?.disconnect();
        socketRef.current = null;
        connectionsRef.current.forEach(connection => connection.close());
        connectionsRef.current.clear();
        pendingCandidatesRef.current.clear();
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        setRemoteStreams({});
        setPeers([]);
        setInCall(false);
        setConnecting(false);
        setMuted(false);
    }, []);

    useEffect(() => () => {
        socketRef.current?.emit("call:leave");
        socketRef.current?.disconnect();
        connectionsRef.current.forEach(connection => connection.close());
        connectionsRef.current.clear();
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
    }, [concertId, token]);

    const joinCall = async () => {
        if (!token) {
            setError("Vui lòng đăng nhập để tham gia cuộc gọi.");
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
            setError("Trình duyệt này không hỗ trợ truy cập micro.");
            return;
        }

        setError("");
        setConnecting(true);
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = localStream;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const socketOrigin = apiUrl.startsWith("/") ? window.location.origin : apiUrl;
            const socket = io(socketOrigin, {
                auth: { token },
                transports: ["websocket", "polling"],
            });
            socketRef.current = socket;

            socket.on("connect", () => socket.emit("call:join", { concertId }));
            socket.on("call:participants", async ({ peers: currentPeers }: { peers: Peer[] }) => {
                setConnecting(false);
                setInCall(true);
                for (const peer of currentPeers) {
                    if (socket.id && socket.id > peer.id) {
                        const connection = createPeer(peer);
                        try {
                            const offer = await connection.createOffer();
                            await connection.setLocalDescription(offer);
                            socket.emit("call:offer", {
                                targetId: peer.id,
                                description: connection.localDescription?.toJSON(),
                            });
                        } catch {
                            setError(`Không thể kết nối với ${peer.name}.`);
                        }
                    }
                }
            });
            socket.on("call:peer-joined", ({ peerId, name }: { peerId: string; name: string }) => {
                setPeers(current => current.some(peer => peer.id === peerId)
                    ? current
                    : [...current, { id: peerId, name }]);
                if (socket.id && socket.id > peerId) {
                    createPeer({ id: peerId, name });
                }
            });
            socket.on("call:peer-left", ({ peerId }: { peerId: string }) => closePeer(peerId));
            socket.on("call:offer", async ({ from, description, name }: {
                from: string;
                description: SignalDescription;
                name?: string;
            }) => {
                const connection = createPeer({ id: from, name: name || "Thành viên" });
                try {
                    await connection.setRemoteDescription(description);
                    await flushCandidates(from, connection);
                    const answer = await connection.createAnswer();
                    await connection.setLocalDescription(answer);
                    socket.emit("call:answer", {
                        targetId: from,
                        description: connection.localDescription?.toJSON(),
                    });
                } catch {
                    setError("Không thể thiết lập kết nối âm thanh.");
                }
            });
            socket.on("call:answer", async ({ from, description }: {
                from: string;
                description: SignalDescription;
            }) => {
                const connection = connectionsRef.current.get(from);
                if (!connection) return;
                try {
                    await connection.setRemoteDescription(description);
                    await flushCandidates(from, connection);
                } catch {
                    setError("Không thể hoàn tất kết nối âm thanh.");
                }
            });
            socket.on("call:ice-candidate", async ({ from, candidate }: {
                from: string;
                candidate: SignalCandidate;
            }) => {
                const connection = connectionsRef.current.get(from);
                if (!connection?.remoteDescription) {
                    const pending = pendingCandidatesRef.current.get(from) || [];
                    pendingCandidatesRef.current.set(from, [...pending, candidate]);
                    return;
                }
                try {
                    await connection.addIceCandidate(candidate);
                } catch {
                    setError("Không thể thiết lập tuyến âm thanh với một thành viên.");
                }
            });
            socket.on("call:error", ({ message }: { message: string }) => {
                setError(message);
                leaveCall();
            });
            socket.on("connect_error", () => {
                setError("Không kết nối được máy chủ gọi. Hãy kiểm tra mạng và thử lại.");
                leaveCall();
            });
            socket.on("disconnect", reason => {
                if (reason !== "io client disconnect") {
                    setError("Đã mất kết nối với phòng gọi.");
                    leaveCall();
                }
            });
        } catch (reason) {
            localStreamRef.current?.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
            setConnecting(false);
            const message = reason instanceof Error ? reason.message : "";
            setError(message.includes("Permission") || message.includes("denied")
                ? "Bạn cần cấp quyền micro để tham gia cuộc gọi."
                : "Không thể mở micro. Hãy kiểm tra thiết bị và quyền truy cập.");
        }
    };

    const toggleMute = () => {
        const nextMuted = !muted;
        localStreamRef.current?.getAudioTracks().forEach(track => {
            track.enabled = !nextMuted;
        });
        setMuted(nextMuted);
    };

    return (
        <section className="border border-[#d6d1c7] bg-[#fbf9f4] p-6 sm:p-8" aria-label="Phòng gọi sự kiện">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8553f]">Kênh nội bộ · âm thanh</p>
                    <h3 className="font-serif text-3xl tracking-tight text-[#24231f]">Phòng liên lạc</h3>
                    <p className="mt-2 text-sm text-[#77756e]">
                        {inCall ? `${peers.length + 1} người đang trong cuộc gọi` : "Gọi nhóm trực tiếp với đội ngũ sự kiện."}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {inCall ? (
                        <>
                            <button
                                type="button"
                                onClick={toggleMute}
                                aria-label={muted ? "Bật micro" : "Tắt micro"}
                                className="inline-flex items-center gap-2 border border-[#d6d1c7] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#24231f] hover:border-[#d8553f]"
                            >
                                {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                {muted ? "Bật mic" : "Tắt mic"}
                            </button>
                            <button
                                type="button"
                                onClick={leaveCall}
                                className="inline-flex items-center gap-2 bg-[#d8553f] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#b94330]"
                            >
                                <PhoneOff className="h-4 w-4" /> Rời cuộc gọi
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={joinCall}
                            disabled={connecting}
                            className="inline-flex items-center gap-2 bg-[#24231f] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#d8553f] disabled:opacity-50"
                        >
                            <Phone className="h-4 w-4" />
                            {connecting ? "Đang kết nối..." : "Tham gia cuộc gọi"}
                        </button>
                    )}
                </div>
            </div>

            {inCall && (
                <div className="mt-6 flex flex-wrap gap-2" aria-live="polite">
                    <span className="inline-flex items-center gap-2 border border-[#d6d1c7] px-3 py-2 text-xs text-[#24231f]">
                        <span className="h-2 w-2 rounded-full bg-[#66836c]" />
                        {userName || "Bạn"} · {muted ? "đã tắt mic" : "đang tham gia"}
                    </span>
                    {peers.map(peer => (
                        <span key={peer.id} className="inline-flex items-center gap-2 border border-[#d6d1c7] px-3 py-2 text-xs text-[#24231f]">
                            <Users className="h-3.5 w-3.5 text-[#d8553f]" />
                            {peer.name}
                        </span>
                    ))}
                    {Object.entries(remoteStreams).map(([id, stream]) => (
                        <RemoteAudio key={id} stream={stream} />
                    ))}
                </div>
            )}
            {error && <p className="mt-4 text-sm text-[#b94330]" role="alert">{error}</p>}
        </section>
    );
}
