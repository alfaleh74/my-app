export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col items-center gap-8 rounded-2xl border bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Choose your role</h1>
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <a href="/user" className="flex-1 rounded-lg border p-6 text-center hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800">
            <div className="text-lg font-medium">Regular User</div>
            <div className="text-sm text-zinc-500">Stream your webcam</div>
          </a>
          <a href="/admin" className="flex-1 rounded-lg border p-6 text-center hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800">
            <div className="text-lg font-medium">Admin</div>
            <div className="text-sm text-zinc-500">View live stream (login)</div>
          </a>
        </div>
        <p className="text-xs text-zinc-500">
          Tip: Start the Express server first so the stream can connect.
        </p>
      </main>
    </div>
  );
}

