"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Users,
  Settings,
  Loader2,
} from "lucide-react";

interface LessonRoomProps {
  lessonId: string;
  currentUser: {
    id: string;
    name: string;
    image?: string | null;
  };
}

const STUN_SERVERS = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ],
};

export default function LessonRoom({ lessonId, currentUser }: LessonRoomProps) {
  const router = useRouter();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const rtcConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);

  // Realtime state
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );

  // New state for panels
  const [activePanel, setActivePanel] = useState<
    "chat" | "users" | "settings" | null
  >(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Initialize WebRTC (Local Stream)
    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize Supabase Realtime
        const roomChannel = supabase.channel(`lesson:${lessonId}`, {
          config: {
            presence: {
              key: currentUser.id,
            },
          },
        });

        roomChannel
          .on("presence", { event: "sync" }, async () => {
            const newState = roomChannel.presenceState();
            const users = Object.values(newState).flat() as any[];
            const others = users.filter((u) => u.userId !== currentUser.id);
            setRemoteUsers(others);

            // Simple signaling strategy: If I am the "host" (lower ID) and not connected, I initiate
            if (others.length > 0) {
              const targetUser = others[0]; // 1:1 for now

              // Prevent duplicate connections or glare
              // We only initiate if we are the "lower" ID to be deterministic
              const isInitiator = currentUser.id < targetUser.userId;

              if (isInitiator && !rtcConnectionRef.current) {
                console.log("I am the initiator, starting call...");
                await createPeerConnection(roomChannel);
                const offer = await rtcConnectionRef.current!.createOffer();
                await rtcConnectionRef.current!.setLocalDescription(offer);

                await roomChannel.send({
                  type: "broadcast",
                  event: "signal",
                  payload: {
                    type: "offer",
                    sdp: offer,
                    senderId: currentUser.id,
                  },
                });
              }
            }

            if (others.length > 0) {
              setJoined(true);
            }
          })
          .on("broadcast", { event: "chat" }, ({ payload }) => {
            setMessages((prev) => [...prev, payload]);
          })
          .on("broadcast", { event: "signal" }, async ({ payload }) => {
            if (payload.senderId === currentUser.id) return; // Ignore own messages

            // Initialize PeerConnection if not exists (for the receiver)
            if (!rtcConnectionRef.current) {
              await createPeerConnection(roomChannel);
            }

            const pc = rtcConnectionRef.current!;

            if (payload.type === "offer") {
              console.log("Received offer");
              await pc.setRemoteDescription(
                new RTCSessionDescription(payload.sdp)
              );
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);

              await roomChannel.send({
                type: "broadcast",
                event: "signal",
                payload: {
                  type: "answer",
                  sdp: answer,
                  senderId: currentUser.id,
                },
              });
            } else if (payload.type === "answer") {
              console.log("Received answer");
              await pc.setRemoteDescription(
                new RTCSessionDescription(payload.sdp)
              );
            } else if (payload.type === "ice-candidate") {
              if (payload.candidate) {
                try {
                  await pc.addIceCandidate(
                    new RTCIceCandidate(payload.candidate)
                  );
                } catch (e) {
                  console.error("Error adding ice candidate", e);
                }
              }
            }
          })
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              await roomChannel.track({
                userId: currentUser.id,
                name: currentUser.name,
                image: currentUser.image,
                onlineAt: new Date().toISOString(),
              });
            }
          });

        channelRef.current = roomChannel;
      } catch (err: any) {
        console.error("Error accessing media devices:", err);
        setError(
          "Could not access camera/microphone. Please check permissions."
        );
      }
    }

    startMedia();

    return () => {
      // Cleanup tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      // Cleanup PC
      if (rtcConnectionRef.current) {
        rtcConnectionRef.current.close();
      }
      // Cleanup channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [lessonId, currentUser]);

  const createPeerConnection = async (channel: any) => {
    if (rtcConnectionRef.current) return;

    const pc = new RTCPeerConnection(STUN_SERVERS);

    // Add local tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current!);
      });
    }

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await channel.send({
          type: "broadcast",
          event: "signal",
          payload: {
            type: "ice-candidate",
            candidate: event.candidate,
            senderId: currentUser.id,
          },
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Received remote track");
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    rtcConnectionRef.current = pc;
    return pc;
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = !micOn));
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = !cameraOn));
      setCameraOn(!cameraOn);
    }
  };

  const handleEndCall = () => {
    router.back();
  };

  const togglePanel = (panel: "chat" | "users" | "settings") => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channelRef.current) return;

    const payload = { sender: currentUser.name, text: newMessage };

    // Send to others
    await channelRef.current.send({
      type: "broadcast",
      event: "chat",
      payload,
    });

    // Add to local state
    setMessages([...messages, { sender: "You", text: newMessage }]);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
            {currentUser.name[0]}
          </div>
          <div>
            <h1 className="font-semibold">Lesson Room</h1>
            <p className="text-xs text-gray-400">
              {remoteUsers.length > 0 ? "Connected" : "Waiting for others..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Live
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 p-4 flex flex-col md:flex-row gap-4 overflow-hidden relative">
          {/* Remote Feed (Tutor) - Real Video */}
          <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden relative flex items-center justify-center min-h-[300px]">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${
                remoteUsers.length === 0 ? "hidden" : ""
              }`}
            />

            {/* Placeholder / Waiting State */}
            {remoteUsers.length === 0 && (
              <div className="flex flex-col items-center text-gray-400 gap-3 p-4 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span>Waiting for participant...</span>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                <div className="text-red-400 p-4 text-center">
                  <p className="font-bold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Self View (Local Stream) */}
            <div className="absolute bottom-4 right-4 w-32 md:w-64 aspect-video bg-gray-900 rounded-lg border border-gray-700 shadow-xl overflow-hidden group z-10 transition-transform hover:scale-105">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform scale-x-[-1] ${
                  !cameraOn ? "hidden" : ""
                }`}
              />

              {!cameraOn && (
                <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium bg-gray-800 text-xs md:text-base">
                  Camera Off
                </div>
              )}

              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-[10px] md:text-xs text-white">
                You {!micOn && "(Muted)"}
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {activePanel && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center text-white">
              <h2 className="font-semibold capitalize">{activePanel}</h2>
              <button
                onClick={() => setActivePanel(null)}
                className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activePanel === "chat" && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 space-y-4 mb-4">
                    {messages.length === 0 ? (
                      <p className="text-gray-500 text-center text-sm mt-4">
                        No messages yet
                      </p>
                    ) : (
                      messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col ${
                            msg.sender === "You" ? "items-end" : "items-start"
                          }`}>
                          <span className="text-xs text-gray-400 mb-1">
                            {msg.sender === "You" ? "You" : msg.sender}
                          </span>
                          <div
                            className={`px-3 py-2 rounded-lg text-sm ${
                              msg.sender === "You"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-700 text-gray-200"
                            }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <form
                    onSubmit={sendMessage}
                    className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 p-2 rounded text-white hover:bg-purple-700">
                      Send
                    </button>
                  </form>
                </div>
              )}

              {activePanel === "users" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                      {currentUser.name[0]}
                    </div>
                    <span>You</span>
                    <Mic className="w-4 h-4 ml-auto text-gray-400" />
                  </div>
                  {remoteUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center gap-3 text-gray-400">
                      <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center text-xs font-bold overflow-hidden">
                        {user.image ? (
                          <img
                            src={user.image}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name[0]
                        )}
                      </div>
                      <span>{user.name}</span>
                      <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  ))}
                  {remoteUsers.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">
                      Waiting for others...
                    </p>
                  )}
                </div>
              )}

              {activePanel === "settings" && (
                <div className="space-y-6 text-white">
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-bold mb-2">
                      Video Input
                    </label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-300 outline-none focus:border-purple-500">
                      <option>Default Camera</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-bold mb-2">
                      Audio Input
                    </label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-300 outline-none focus:border-purple-500">
                      <option>Default Microphone</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-6">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={toggleMic}
            className={`p-4 rounded-full transition ${
              micOn
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}>
            {micOn ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition ${
              cameraOn
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}>
            {cameraOn ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white">
            <PhoneOff className="w-6 h-6" />
          </button>
          <button
            onClick={() => togglePanel("chat")}
            className={`p-4 rounded-full transition ${
              activePanel === "chat"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}>
            <MessageSquare className="w-6 h-6" />
            {messages.length > 0 && activePanel !== "chat" && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => togglePanel("users")}
            className={`p-4 rounded-full transition ${
              activePanel === "users"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}>
            <Users className="w-6 h-6" />
            {remoteUsers.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">
                {remoteUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => togglePanel("settings")}
            className={`p-4 rounded-full transition ${
              activePanel === "settings"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}>
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
