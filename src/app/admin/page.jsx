"use client";

import { useEffect, useRef, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";

const WS_URL = process.env.NEXT_PUBLIC_STREAM_SERVER_URL || "ws://localhost:4000/ws";

function Viewer() {
  const imgRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastTs, setLastTs] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "subscribe", role: "viewer", streamId: "default" }));
    };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg?.type === "frame") {
          if (imgRef.current) imgRef.current.src = msg.data;
          setLastTs(msg.ts || Date.now());
        }
      } catch {}
    };
    ws.onclose = () => setConnected(false);
    return () => ws.close();
  }, []);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        {connected ? "Connected to stream" : "Connecting..."}
        {lastTs && ` • Last frame: ${new Date(lastTs).toLocaleTimeString()}`}
      </div>
      <img ref={imgRef} alt="Live stream" className="h-[360px] w-[640px] rounded-lg bg-black object-contain" />
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-zinc-50 p-8 dark:bg-black">
      <h1 className="mt-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Admin - Live Stream</h1>
      {!session ? (
        <div className="w-full max-w-md rounded-xl border bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} />
        </div>
      ) : (
        <>
          <div className="flex w-full max-w-3xl items-center justify-between">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">Signed in</div>
            <button
              className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-white dark:bg-zinc-700"
              onClick={() => supabase.auth.signOut()}
            >
              Sign out
            </button>
          </div>
          <Viewer />
        </>
      )}
    </div>
  );
}

