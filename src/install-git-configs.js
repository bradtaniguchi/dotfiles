import { access, copyFile } from 'fs/promises';
import { join } from 'path';
import { HOME_DIR } from './constants/home-dir.js';
import { log } from './log.js';

/**
 * Install git configs, generally adds them to global.
 *
 * Will skip if file already exists.
 * @param {boolean} [dryRun] whether to run in dry run mode, will not throw
 */
export async function installGitConfigs(dryRun = false) {
  const [hasGitConfig, hasGitIgnoreGlobal] = await Promise.all([
    access(join(HOME_DIR, '.gitconfig'))
      .then(() => true)
      .catch(() => false),

    access(join(HOME_DIR, '.gitignore_global'))
      .then(() => true)
      .catch(() => false),
  ]);

  if (dryRun) {
    log('Dry run, skipping file write', {
      hasGitConfig,
      hasGitIgnoreGlobal,
    });
    return;
  }

  if (!installGitConfigs) {
    await copyFile(
      join(__dirname, '../git/.gitconfig'),
      join(HOME_DIR, '.gitconfig'),
    ).then(() => log('Copied .gitconfig'));
  } else {
    log('.gitconfig already exists, skipping');
  }

  if (!hasGitIgnoreGlobal) {
    await copyFile(
      join(__dirname, '../git/.gitignore_global'),
      join(HOME_DIR, '.gitignore_global'),
    ).then(() => log('Copied .gitignore_global'));
  } else {
    log('.gitignore_global already exists, skipping');
  }

  return;
}
