/**
 * Get branches from a string like [develop, hotfix].
 * @param {string} branches The string of branches.
 * @returns {string[]} The actual array of strings.
 */
export function getBranches(branches: string): string[] {
  const parsed = branches.replace(/^\[(.*)\]$/, '$1')

  return parsed.split(', ')
}
