import {
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
} from "./SchedulerPriorities";

let getCurrentTime = () => performance.now();

function unstable_scheduleCallback(priorityLevel, callback, options) {
  requestIdleCallback(callback)
}

export {
  getCurrentTime as unstable_now,
  ImmediatePriority as unstable_ImmediatePriority,
  UserBlockingPriority as unstable_UserBlockingPriority,
  NormalPriority as unstable_NormalPriority,
  IdlePriority as unstable_IdlePriority,
  LowPriority as unstable_LowPriority,
  unstable_scheduleCallback,
};
