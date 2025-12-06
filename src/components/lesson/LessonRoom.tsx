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

export default function LessonRoom({ lessonId, currentUser }: LessonRoomProps) {
  const router = useRouter();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Realtime state
  const [channel, setChannel] = useState<any>(null);
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
          .on("presence", { event: "sync" }, () => {
            const newState = roomChannel.presenceState();
            const users = Object.values(newState).flat() as any[];
            setRemoteUsers(users.filter((u) => u.userId !== currentUser.id));

            // If we have remote users, we are "joined/connected"
            if (users.length > 1) {
              setJoined(true);
            }
          })
          .on("broadcast", { event: "chat" }, ({ payload }) => {
            setMessages((prev) => [...prev, payload]);
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

        setChannel(roomChannel);
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
      // Cleanup channel
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [lessonId, currentUser]);

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
    if (!newMessage.trim() || !channel) return;

    const payload = { sender: currentUser.name, text: newMessage };

    // Send to others
    await channel.send({
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
        <div className="flex-1 p-4 flex gap-4 overflow-hidden relative">
          {/* Remote Feed (Tutor) - Placeholder for MVP */}
          <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden relative flex items-center justify-center">
            {error ? (
              <div className="text-red-400 p-4 text-center">
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : remoteUsers.length > 0 ? (
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-purple-900 mx-auto mb-6 flex items-center justify-center border-4 border-purple-500 overflow-hidden">
                  {remoteUsers[0].image ? (
                    <img
                      src={remoteUsers[0].image}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold">
                      {remoteUsers[0].name[0]}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {remoteUsers[0].name}
                </h2>
                <p className="text-gray-400">Connected</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span>Waiting for participant to join...</span>
              </div>
            )}

            {/* Self View (Local Stream) */}
            <div className="absolute bottom-4 right-4 w-64 aspect-video bg-gray-900 rounded-lg border border-gray-700 shadow-xl overflow-hidden group z-10">
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
                <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium bg-gray-800">
                  Camera Off
                </div>
              )}

              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
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
