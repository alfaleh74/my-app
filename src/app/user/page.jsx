"use client";

import { useEffect, useRef, useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_STREAM_SERVER_URL || "ws://localhost:4000/ws";

export default function UserStreamPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [fps, setFps] = useState(10);
  const [error, setError] = useState("");

  useEffect(() => {
    let mediaStream;
    const start = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
      } catch (e) {
        setError("Could not access webcam");
      }
    };
    start();
    return () => {
      mediaStream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    let intervalId;
    if (isStreaming) {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "start", role: "publisher", streamId: "default" }));
        fetch("/api/stream/start", { method: "POST", body: JSON.stringify({ streamId: "default" }) });
      };
      ws.onerror = () => setError("WebSocket error. Is the server running?");
      ws.onclose = () => setIsStreaming(false);

      const sendFrame = () => {
        try {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas) return;
          const width = video.videoWidth;
          const height = video.videoHeight;
          if (!width || !height) return;
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
          ws.send(JSON.stringify({ type: "frame", streamId: "default", data: dataUrl, ts: Date.now() }));
        } catch {}
      };
      intervalId = setInterval(sendFrame, 1000 / Math.max(1, Math.min(30, fps)));

      return () => {
        clearInterval(intervalId);
        try { ws.close(); } catch {}
        fetch("/api/stream/stop", { method: "POST", body: JSON.stringify({ streamId: "default" }) });
      };
    }
  }, [isStreaming, fps]);

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-zinc-50 p-8 dark:bg-black">
      <h1 className="mt-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Regular User - Stream Webcam</h1>
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      <video ref={videoRef} className="h-[360px] w-[640px] rounded-lg bg-black" muted playsInline />
      <div className="flex items-center gap-4">
        <button
          className={`rounded-md px-4 py-2 text-white ${isStreaming ? "bg-red-600" : "bg-green-600"}`}
          onClick={() => setIsStreaming((v) => !v)}
        >
          {isStreaming ? "Stop Streaming" : "Start Streaming"}
        </button>
        <label className="text-sm text-zinc-700 dark:text-zinc-300">FPS:
          <input
            type="number"
            min={1}
            max={30}
            value={fps}
            onChange={(e) => setFps(parseInt(e.target.value || "10", 10))}
            className="ml-2 w-16 rounded border px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

