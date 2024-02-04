import exp from "constants";

/**
 * 添加元素
 * @param {*} heap
 * @param {*} node
 */
export function push(heap, node) {
    const index = heap.length;
    // 每次都先添加到尾部
    heap.push(node);
    // 然后向上调整
    siftUp(heap, node, index);
}

export function  siftUp(head, node, i) {
    let index = i;
    while (true) {
        // >>> 1 相当于除以2取整
        const parentIndex = (index - 1) >>> 1;
        // 父节点
        const parent = head[parentIndex]
        // 不需要比较左右 只需要保证最小的在第一位
        if (compare(parent, node) > 0) {
            head[parentIndex] = node
            head[index] = parent
            index = parentIndex
        } else {
            return // 结束
        }
    }
}

export function compare(a, b) {
    const diff = a.sortIndex - b.sortIndex
    return diff !== 0 ? diff : a.id - b.id
}