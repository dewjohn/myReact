// import { clz32 } from "./clz32";
// react的lane赛道模型
// 一种有31个车道
export const TotalLanes = 31;

export const NoLanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane = /*                          */ 0b0000000000000000000000000000000;

export const SyncHydrationLane = /*               */ 0b0000000000000000000000000000001;
export const SyncLane = /*                        */ 0b0000000000000000000000000000010;

export const InputContinuousHydrationLane = /*    */ 0b0000000000000000000000000000100;
export const InputContinuousLane = /*             */ 0b0000000000000000000000000001000;

export const DefaultHydrationLane = /*            */ 0b0000000000000000000000000010000;
export const DefaultLane = /*                     */ 0b0000000000000000000000000100000;

const TransitionHydrationLane = /*                */ 0b0000000000000000000000001000000;
const TransitionLanes = /*                       */ 0b0000000011111111111111110000000;
const TransitionLane1 = /*                        */ 0b0000000000000000000000010000000;
const TransitionLane2 = /*                        */ 0b0000000000000000000000100000000;
const TransitionLane3 = /*                        */ 0b0000000000000000000001000000000;
const TransitionLane4 = /*                        */ 0b0000000000000000000010000000000;
const TransitionLane5 = /*                        */ 0b0000000000000000000100000000000;
const TransitionLane6 = /*                        */ 0b0000000000000000001000000000000;
const TransitionLane7 = /*                        */ 0b0000000000000000010000000000000;
const TransitionLane8 = /*                        */ 0b0000000000000000100000000000000;
const TransitionLane9 = /*                        */ 0b0000000000000001000000000000000;
const TransitionLane10 = /*                       */ 0b0000000000000010000000000000000;
const TransitionLane11 = /*                       */ 0b0000000000000100000000000000000;
const TransitionLane12 = /*                       */ 0b0000000000001000000000000000000;
const TransitionLane13 = /*                       */ 0b0000000000010000000000000000000;
const TransitionLane14 = /*                       */ 0b0000000000100000000000000000000;
const TransitionLane15 = /*                       */ 0b0000000001000000000000000000000;
const TransitionLane16 = /*                       */ 0b0000000010000000000000000000000;

const RetryLanes = /*                            */ 0b0000111100000000000000000000000;
const RetryLane1 = /*                             */ 0b0000000100000000000000000000000;
const RetryLane2 = /*                             */ 0b0000001000000000000000000000000;
const RetryLane3 = /*                             */ 0b0000010000000000000000000000000;
const RetryLane4 = /*                             */ 0b0000100000000000000000000000000;

export const SomeRetryLane = RetryLane1;

export const SelectiveHydrationLane = /*          */ 0b0001000000000000000000000000000;

const NonIdleLanes = /*                          */ 0b0001111111111111111111111111111;

export const IdleHydrationLane = /*               */ 0b0010000000000000000000000000000;
export const IdleLane = /*                        */ 0b0100000000000000000000000000000;

export const OffscreenLane = /*                   */ 0b1000000000000000000000000000000;

export const NoTimestamp = -1;

export function includesNonIdleWork(lanes) {
    return (lanes & NonIdleLanes) !== NoLanes;
}

export function createLaneMap(initial) {
    const laneMap = [];
    for (let i = 0; i < TotalLanes; i++) {
        laneMap.push(initial);
    }
    return laneMap;
}

export function mergeLanes(a, b) {
    return a | b;
}

export function markRootUpdated(root, updateLane, eventTime) {
    root.pendingLanes |= updateLane;
    if (updateLane !== IdleLane) {
        root.suspendedLanes = NoLanes;
        root.pingedLanes = NoLanes;
    }
    const eventTimes = root.eventTimes; // 31个赛道
    const index = laneToIndex(updateLane);
    // 每个lane对应一个time
    eventTimes[index] = eventTime;
}

function laneToIndex(lane) {
    return pickArbitraryLaneIndex(lane);
}

function pickArbitraryLaneIndex(lanes) {
    return 31 - Math.clz32(lanes);
}

export function includesSyncLane(lanes) {
    return (lanes & (SyncLane | SyncHydrationLane)) !== NoLanes;
}

export function getNextLanes(root, wipLanes) {
    // 1. 获取所有有更新的车道
    const pendingLanes = root.pendingLanes;
    if (pendingLanes === NoLanes) {
        return NoLanes;
    }

    let nextLanes = NoLanes;

    // const suspendedLanes = root.suspendedLanes;
    // // const pingedLanes = root.pingedLanes;
    // const nonIdlePendingLanes = pendingLanes & NonIdleLanes;
    // if (nonIdlePendingLanes !== NoLanes) {
    //   const nonIdleUnblockedLanes = nonIdlePendingLanes & ~suspendedLanes;
    //   if (nonIdleUnblockedLanes !== NoLanes) {
    //     nextLanes = getHighestPriorityLanes(nonIdleUnblockedLanes);
    //   }
    // }

    nextLanes = getHighestPriorityLanes(pendingLanes);
    if (nextLanes === NoLanes) {
        return NoLanes;
    }

    if (wipLanes !== NoLanes && wipLanes !== nextLanes) {
        const nextLane = getHighestPriorityLane(nextLanes);
        const wipLane = getHighestPriorityLane(wipLanes);
        // 如果新的车道比渲染的大 说明新的车道的优先级更低
        if (nextLane >= wipLane) {
            return wipLanes;
        }
    }

    return nextLanes;
}

function getHighestPriorityLanes(lanes) {
    switch (getHighestPriorityLane(lanes)) {
        case SyncLane:
            return SyncLane;
        default:
            return lanes;
    }
}

// lane越小 优先级越高
export function getHighestPriorityLane(lanes) {
    return lanes & -lanes;
}