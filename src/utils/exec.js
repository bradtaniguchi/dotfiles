import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const _exec = promisify(execCallback);

/**
 * Async execute a command, will throw if the command logs to
 * stderr. Otherwise returns stdout
 *
 * @param {string} command the command to execute
 */
export async function exec(command) {
  const { stderr, stdout } = await _exec(command);

  if (stderr) {
    throw new Error(stderr);
  }

  return stdout;
}
