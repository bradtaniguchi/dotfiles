/**
 * Wrapper around console.log, automatically adds a prefix
 *
 * @param {string} message the message to print to the log
 * @param {Array<any>} otherParams params to add to the end of the log
 */

export const log = (
  message,
  ...otherParams // eslint-disable-next-line no-console
) => console.log(`>> ${message}`, ...otherParams);
