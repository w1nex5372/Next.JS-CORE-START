"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type TelegramUser = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
};

export default function Home() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const tg = (typeof window !== "undefined" ? (window as any).Telegram?.WebApp : undefined);
    if (!tg) {
      setIsTelegram(false);
      return;
    }
    setIsTelegram(true);
    setStatus("syncing");

    try {
      tg.ready?.();
      tg.expand?.();

      const initData: string | undefined = tg.initData;
      if (!initData || initData.length === 0) {
        setStatus("error");
        setError("No Telegram initData found.");
        return;
      }

      fetch("/api/telegram/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      })
        .then(async (res) => {
          const json = await res.json();
          if (!res.ok || !json.ok) {
            throw new Error(json?.error || "Failed to sync with server");
          }
          setUser(json.user as TelegramUser);
          setStatus("done");
        })
        .catch((e) => {
          setError(e.message || "Sync failed");
          setStatus("error");
        });
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
      setStatus("error");
    }
  }, []);

  return (
    <div className="font-sans min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <main className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={160}
            height={34}
            priority
          />
        </div>

        {isTelegram ? (
          <div className="bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-xl shadow p-6">
            <h1 className="text-xl font-semibold mb-4">Telegram Mini App</h1>

            {status === "syncing" && (
              <p className="text-sm text-neutral-500">Registering your Telegram account…</p>
            )}

            {status === "error" && (
              <p className="text-sm text-red-600">Error: {error}</p>
            )}

            {status === "done" && user && (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                  {user.photo_url ? (
                    <img
                      src={user.photo_url}
                      alt={user.first_name ?? "Telegram user"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
                      N/A
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-lg truncate">
                    {[user.first_name, user.last_name].filter(Boolean).join(" ") || "Unknown"}
                  </div>
                  {user.username && (
                    <div className="text-neutral-500 truncate">@{user.username}</div>
                  )}
                  <div className="text-neutral-400 text-xs mt-1">ID: {user.id}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-xl shadow p-6">
            <h1 className="text-xl font-semibold mb-2">Not in Telegram</h1>
            <p className="text-sm text-neutral-500">
              Open this app inside your Telegram Mini App to be auto-identified and registered.
            </p>
          </div>
        )}

        <footer className="mt-10 flex items-center justify-center gap-6 text-sm text-neutral-500">
          <a
            className="hover:underline"
            href="https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram WebApp validation
          </a>
          <a
            className="hover:underline"
            href="https://supabase.com/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Supabase docs
          </a>
        </footer>
      </main>
    </div>
  );
}