import { log } from './log.js';
import { verifySingleCommand } from './verify-single-command-exists.js';

/**
 * Verifies the manual checklist has been completed, will throw
 * if any of the steps have not been completed.
 * @param {boolean} [dryRun] whether to run in dry run mode, will not throw
 */
export async function verifyManualInstallation(dryRun = false) {
  log('verifying');

  const homeDir = process.env.HOME;

  if (!homeDir) {
    throw new Error('HOME environment variable not set');
  }

  await verifySingleCommand('nvim --version', {
    dryRun,
    commandName: 'neovim',
  });

  // the flag `-V` is correct, its not uppercase.
  await verifySingleCommand('tmux -V', {
    dryRun,
    commandName: 'tmux',
  });

  await verifySingleCommand('htop --version', {
    dryRun,
    commandName: 'htop',
  });

  await verifySingleCommand('~/.nvm/nvm.sh --version', {
    dryRun,
    commandName: 'nvm',
  });

  // **note** node must be installed to run this anyways, so it can
  // be assumed, only check is that nvm is available rather than
  // localized node

  // TODO: its unclear how to verify neovim-plug is installed right now, add it later

  log('done verifying system setup');
}
