import {
  getCurrentUpdatePriority,
  setCurrentUpdatePriority,
  DiscreteEventPriority,
} from "./ReactEventPriorities";

let syncQueue = null;
let includesLegacySyncCallbacks = false;
let isFlushingSyncQueue = false;

export function scheduleLegacySyncCallback(callback) {
  includesLegacySyncCallbacks = true;
  scheduleSyncCallback(callback);
}

export function scheduleSyncCallback(callback) {
  if (syncQueue === null) {
    syncQueue = [callback];
  } else {
    syncQueue.push(callback);
  }
}

export function flushSyncCallbacks() {
  if (!isFlushingSyncQueue && syncQueue !== null) {
    isFlushingSyncQueue = true;
    let i = 0;
    const previousUpdatePriority = getCurrentUpdatePriority();
    try {
      const isSync = true;
      const queue = syncQueue;
      // SyncLane
      setCurrentUpdatePriority(DiscreteEventPriority);
      for (; i < queue.length; i++) {
        let callback = queue[i];
        do {
          callback = callback(isSync);
        } while (callback !== null);
      }
    } finally {
      setCurrentUpdatePriority(previousUpdatePriority);
      isFlushingSyncQueue = false;
    }
  }
  return null;
}
