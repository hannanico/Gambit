"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

export function InstallGambitButton() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        onBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!installEvent) return;

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  if (installed) {
    return (
      <span className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-800">
        Installed
      </span>
    );
  }

  if (!installEvent) return null;

  return (
    <button
      className="rounded-lg bg-sky-400 px-3 py-2 text-sm font-black text-slate-950 transition hover:bg-sky-300"
      onClick={() => void installApp()}
      type="button"
    >
      Install app
    </button>
  );
}