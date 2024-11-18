import { exec } from './exec.js';
import { log } from './log.js';

/**
 * Helper function to execute a single command, with possible alias, and
 * error throwing on stderr output.
 *
 * @param {string} command the command to verify, usually a version check
 * @param {object} [options] function options
 * @param {boolean} [options.dryRun] whether to run in dry run mode, will not throw
 * @param {string} [options.commandName] the command to display in the logs, rather than
 *   the actual command
 * @returns {Promise<string>} returns the stdout of the command, or the error
 *   message if in dry-run mode
 */
export async function verifySingleCommand(
  command,
  options = {
    dryRun: false,
    commandName: command,
  },
) {
  const { commandName } = options;

  try {
    log(`verifying: "${commandName}", with ${command}`);

    const stdout = await exec(command);
    return stdout;
  } catch (err) {
    console.error(`${commandName} threw`, err);

    if (err instanceof Error && options.dryRun) {
      return err.message;
    }
    if (options.dryRun) {
      // this assumes the actual thrown error is not actually an
      // instance error, which would be an unexpected edge case
      return `Error running ${commandName}`;
    }

    throw err;
  }
}
