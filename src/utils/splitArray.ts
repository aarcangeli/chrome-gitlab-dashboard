export function splitArray<T>(array: Array<T>, maxLength: number): Array<Array<T>> {
  const result: Array<Array<T>> = [];
  let current: Array<T> = [];
  for (const item of array) {
    if (current.length >= maxLength) {
      result.push(current);
      current = [];
    }
    current.push(item);
  }
  if (current.length > 0) {
    result.push(current);
  }
  return result;
}
