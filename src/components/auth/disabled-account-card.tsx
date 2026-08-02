"use client";

import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function DisabledAccountCard() {
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] =
    useState(true);

  useEffect(() => {
    let isMounted = true;

    async function clearSession() {
      await authClient.signOut();

      if (isMounted) {
        setIsSigningOut(false);
      }
    }

    void clearSession();

    return () => {
      isMounted = false;
    };
  }, []);

  function goToLogin() {
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={goToLogin}
      disabled={isSigningOut}
      className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
    >
      <LogIn size={18} />

      {isSigningOut
        ? "Ending session..."
        : "Return to Login"}
    </button>
  );
}