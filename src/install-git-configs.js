import { access, copyFile } from 'fs/promises';
import { join } from 'path';
import { log } from './log.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './constants/env.js';

const dirname = path.dirname(fileURLToPath(import.meta.url)); // get the name of the directory

/**
 * Install git configs, generally adds them to global.
 *
 * Will skip if file already exists.
 * @param {boolean} [dryRun] whether to run in dry run mode, will not throw
 */
export async function installGitConfigs(dryRun = false) {
  const [hasGitConfig, hasGitIgnoreGlobal] = await Promise.all([
    access(join(ENV.HOME_DIR, '.gitconfig'))
      .then(() => true)
      .catch(() => false),

    access(join(ENV.HOME_DIR, '.gitignore_global'))
      .then(() => true)
      .catch(() => false),
  ]);

  if (dryRun) {
    log('Dry run, skipping file write', {
      hasGitConfig,
      hasGitIgnoreGlobal,
    });
    return;
  } else {
    log('checked git related files', {
      hasGitConfig,
      hasGitIgnoreGlobal,
    });
  }

  if (!hasGitConfig) {
    await copyFile(
      join(dirname, '../git/.gitconfig'),
      join(ENV.HOME_DIR, '.gitconfig'),
    )
      .then(() => log('Copied .gitconfig'))
      .catch((err) => {
        console.error('Failed to copy .gitconfig', err);
        throw err;
      });
  } else {
    log('.gitconfig already exists, skipping');
  }

  if (!hasGitIgnoreGlobal) {
    await copyFile(
      join(dirname, '../git/.gitignore_global'),
      join(ENV.HOME_DIR, '.gitignore_global'),
    )
      .then(() => log('Copied .gitignore_global'))
      .catch((err) => {
        console.error('Failed to copy .gitignore_global', err);
        throw err;
      });
  } else {
    log('.gitignore_global already exists, skipping');
  }

  return;
}
