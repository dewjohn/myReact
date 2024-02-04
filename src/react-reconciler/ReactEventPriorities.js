import {NoLane, SyncLane, InputContinuousLane, getHighestPriorityLane, includesNonIdleWork} from "./ReactFiberLane";

let currentUpdatePriority = NoLane;
export const DiscreteEventPriority = SyncLane;
export const ContinuousEventPriority = InputContinuousLane; // 连续
export const DefaultEventPriority = DefaultLane; // 默认事件优先级
export const IdleEventPriority = IdleLane; // 空闲

// 优先级
export function lanesToEventPriority(lanes) {
    // 获取最高优先级的lane return lanes & -lanes;
    const lane = getHighestPriorityLane(lanes);
    // lane越小优先级越高
    if (!isHigherEventPriority(DiscreteEventPriority, lane)) {
        return DiscreteEventPriority;
    }
    if (!isHigherEventPriority(ContinuousEventPriority, lane)) {
        return ContinuousEventPriority;
    }
    if (includesNonIdleWork(lane)) {
        return DefaultEventPriority;
    }
    return IdleEventPriority;
}

export function isHigherEventPriority(a, b) {
    return a !== 0 && a < b;
}


export function getCurrentUpdatePriority() {
    return currentUpdatePriority;
}

export function setCurrentUpdatePriority(newPriority) {
    currentUpdatePriority = newPriority;
}
