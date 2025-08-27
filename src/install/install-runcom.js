import { appendFile, readFile } from 'fs/promises';
import { join } from 'path';
import { ENV } from '../constants/env.js';
import { RC_LINES } from '../constants/rc.js';
import { log } from '../utils/log.js';

/**
 * Function that handles installing the run-com files, specifically bashrc and zshrc
 *
 * @param {boolean} [dryRun] whether to run in dry run mode, will not throw
 * @param {Object} [options] options for the function
 * @param {boolean} [options.force] force overwrite of existing files
 * @returns {Promise<void>}
 */
export async function installRuncom(dryRun = false, options = {}) {
  const { force = false } = options;
  log('Installing .rc files');

  /**
   * @type {Array<'bashrc' | 'zshrc'>}
   */
  const rcFiles = ['bashrc', 'zshrc'];

  let filesChanged = 0;

  for (let rcLine of RC_LINES) {
    for (let rcFile of rcFiles) {
      const rcFilePath = join(ENV.HOME, `.${rcFile}`);
      const rcFileContents = await readFile(rcFilePath, 'utf-8').catch(
        (err) => {
          log(`error reading rcFile contents, might not exist ${err}`);
        },
      );

      if (!rcFileContents) continue;

      if (force || (await rcLine.addLineCheckFn({ rcFile, rcFileContents }))) {
        try {
          if (dryRun) {
            log('Dry run, skipping file write');
          } else {
            await appendFile(rcFilePath, `${rcLine.line}\n`);
          }
          log(`Added line to ${rcFile}: ${rcLine.line}`);
          filesChanged++;
        } catch (err) {
          log(`Error adding line to ${rcFile}: ${rcLine.line}, skipping`, err);
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
