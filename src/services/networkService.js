// Check current network status
export function isOnline() {
  return navigator.onLine;
}

// Listen for internet connection
export function onOnline(callback) {
  window.addEventListener("online", callback);
}

// Listen for internet loss
export function onOffline(callback) {
  window.addEventListener("offline", callback);
}

// Remove listeners
export function removeOnline(callback) {
  window.removeEventListener("online", callback);
}

export function removeOffline(callback) {
  window.removeEventListener("offline", callback);
}