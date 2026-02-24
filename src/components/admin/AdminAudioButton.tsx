"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  initAdminAudio,
  isAdminAudioUnlocked,
  unlockAdminAudio,
} from "@/lib/helper/adminAudioManager";

export function AdminAudioGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initAdminAudio();
    setUnlocked(isAdminAudioUnlocked());
  }, []);

  const handleUnlock = async () => {
    setLoading(true);
    const ok = await unlockAdminAudio();
    setUnlocked(ok);
    setLoading(false);
  };

  if (unlocked) return null;

  return (
    <Button onClick={handleUnlock} disabled={loading} className="">
      {loading ? "Đang bật..." : "🔔 Bật âm thanh đơn mới"}
    </Button>
  );
}
