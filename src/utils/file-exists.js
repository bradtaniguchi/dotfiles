import { access } from 'fs/promises';

/**
 * Helper function that returns if the given path was found, via access.
 *
 * @param {string} path the path to check for existence
 */
export async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
