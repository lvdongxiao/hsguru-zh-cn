/**
 * 合并同一批 DOM 变更中的重复和嵌套节点，只保留需要遍历的最外层根节点。
 */
export function findOutermostNodes<T>(
  nodes: Iterable<T>,
  getParent: (node: T) => T | null,
): T[] {
  const uniqueNodes = [...new Set(nodes)];
  const candidates = new Set(uniqueNodes);

  return uniqueNodes.filter((node) => {
    let parent = getParent(node);
    while (parent) {
      if (candidates.has(parent)) return false;
      parent = getParent(parent);
    }
    return true;
  });
}
