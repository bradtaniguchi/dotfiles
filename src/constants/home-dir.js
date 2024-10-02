/**
 * @type {string}
 */
// @ts-ignore
export const HOME_DIR = process.env.HOME;

if (!HOME_DIR) {
  throw new Error('HOME environment variable not set, throwing immediately');
}
