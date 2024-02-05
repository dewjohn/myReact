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

export function pop(heap) {
    if (heap.length === 0) {
        return null
    }
    const first = heap[0]
    const last = heap.pop()
    if (last !== first) {
        heap[0] = last
        siftDown(heap, last, 0)
    }
}

export function siftDown(heap, node, i) {
    let index = i
    const length = heap.length
    const halfLength = length >>> 1
    while (index < halfLength) {
        const leftIndex = (index + 1) * 2 - 1
        const left = heap[leftIndex]
        const rightIndex = (index + 1) * 2 + 1
        const right = heap[rightIndex]
        // 如果左子树小于根节点
        if (compare(left, node) < 0 ) {
            // 如果此时右子树还比左子树还要小
            if (rightIndex < length && compare(right, left) < 0) {
                heap[index] = right
                heap[rightIndex] = node
                index = rightIndex
            } else {
                heap[index] = left
                heap[leftIndex] = node
                index = leftIndex
            }
        } else if (rightIndex < length && compare(right, node) < 0) {
            heap[index] = right
            heap[rightIndex] = node
            index = rightIndex
        } else {
            // 子树都比根节点大
            return
        }
    }
}

export function peek(heap) {
    return heap.length === 0 ? null : heap[0]
}

export function compare(a, b) {
    const diff = a.sortIndex - b.sortIndex
    return diff !== 0 ? diff : a.id - b.id
}