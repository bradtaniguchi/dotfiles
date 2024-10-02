import { appendFile, readFile } from 'fs/promises';
import { join } from 'path';
import { log } from './log.js';
import { HOME_DIR } from './constants/home-dir.js';
import { RC_LINES } from './constants/rc.js';

/**
 * Function that handles installing the run-com files, vim, neovim and tmux
 * @param {boolean} [dryRun] whether to run in dry run mode, will not throw
 * @returns {Promise<void>}
 */
export async function installRumcom(dryRun = false) {
  log('Installing .rc files');

  /**
   * @type {Array<'bashrc' | 'zshrc'>}
   */
  const rcFiles = ['bashrc', 'zshrc'];

  let filesChanged = 0;

  for (let rcLine of RC_LINES) {
    for (let rcFile of rcFiles) {
      const rcFilePath = join(HOME_DIR, `.${rcFile}`);
      const rcFileContents = await readFile(rcFilePath, 'utf-8');

      if (await rcLine.addLineCheckFn({ rcFile, rcFileContents })) {
        try {
          if (dryRun) {
            log('Dry run, skipping file write');
          } else {
            await appendFile(rcFilePath, `${rcLine.line}\n`);
          }
          log(`Added line to ${rcFile}: ${rcLine.line}`);
          filesChanged++;
        } catch (err) {
          console.error(
            `Error adding line to ${rcFile}: ${rcLine.line}, skipping`,
            err,
          );
          continue;
        }
      } else {
        log(`Line already exists in ${rcFile}: ${rcLine.line}`);
      }
    }
  }

  if (filesChanged === 0) {
    log('No files changed');
  }

  if (filesChanged > 0) {
    log('Run `source ~/.bashrc` or `source ~/.zshrc` to apply changes');
  }

  log('Done installing .rc files');
}
