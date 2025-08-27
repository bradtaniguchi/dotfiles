import { copyFile, mkdir } from 'fs/promises';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import { ENV } from '../constants/env.js';
import { fileExists } from '../utils/file-exists.js';
import { log } from '../utils/log.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // get the name of the directory

/**
 * Install git configs, generally adds them to XDG config directory.
 *
 * Will skip if file already exists.
 * @param {boolean} [dryRun] whether to run in dry run mode, will not throw
 * @param {Object} [options] options for the function
 * @param {string} [options.dirname] the directory to use for the relative path to the git files. Used for testing
 * @param {boolean} [options.force] force overwrite of existing files
 */
export async function installGitConfigs(dryRun = false, options = {}) {
  const { dirname = __dirname, force = false } = options;
  const gitConfigDir = join(ENV.XDG_CONFIG_HOME, 'git');
  const gitConfigPath = join(gitConfigDir, 'config');
  const gitIgnoreGlobalPath = join(gitConfigDir, 'ignore');

  log('Installing git config files', {
    gitConfigPath,
    gitIgnoreGlobalPath,
    dirname,
  });

  const [hasGitConfig, hasGitIgnoreGlobal] = await Promise.all([
    fileExists(gitConfigPath),
    fileExists(gitIgnoreGlobalPath),
  ]);

  if (dryRun) {
    log('Dry run, skipping file write', {
      hasGitConfig,
      hasGitIgnoreGlobal,
    });
    return;
  }
  log('checked git related files', {
    hasGitConfig,
    hasGitIgnoreGlobal,
  });

  if (force || !hasGitConfig) {
    try {
      // Ensure the git config directory exists
      await mkdir(gitConfigDir, { recursive: true });

      await copyFile(join(dirname, '../../git/', '.gitconfig'), gitConfigPath);

      log('Copied .gitconfig to XDG config directory');
    } catch (err) {
      log('Failed to copy .gitconfig', err);
      throw err;
    }
  } else {
    log('git config already exists, skipping');
  }

  if (force || !hasGitIgnoreGlobal) {
    try {
      // Ensure the git config directory exists (in case first file was skipped)
      await mkdir(gitConfigDir, { recursive: true });

      await copyFile(
        join(dirname, '../../git/', '.gitignore_global'),
        gitIgnoreGlobalPath,
      );
      log('Copied .gitignore_global to XDG config directory');
    } catch (err) {
      log('Failed to copy .gitignore_global', err);
      throw err;
    }
  } else {
    log('git ignore global already exists, skipping');
  }

  return;
}
