import { useEffect, useState } from "react";
import {
  isOnline,
  onOnline,
  onOffline,
  removeOnline,
  removeOffline,
} from "../services/networkService";

export function useOnlineStatus() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const handleOnline = () => {
      console.log("🌐 Maia: Back online");
      setOnline(true);
    };

    const handleOffline = () => {
      console.log("📴 Maia: Offline");
      setOnline(false);
    };

    onOnline(handleOnline);
    onOffline(handleOffline);

    return () => {
      removeOnline(handleOnline);
      removeOffline(handleOffline);
    };
  }, []);

  return online;
}