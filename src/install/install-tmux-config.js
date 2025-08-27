import { access, appendFile, copyFile, mkdir, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { ENV } from '../constants/env.js';
import { log } from '../utils/log.js';

const __dirname = dirname(new URL(import.meta.url).pathname);

/**
 * Installs the tmux config, if it does not exist
 * @param {boolean} [dryRun] whether to run in dry run mode, will not throw
 * @param {Object} [options] options for the installation
 * @param {string} [options.dirname] the directory name to use
 * @param {boolean} [options.force] force overwrite of existing files
 */
export async function installTmuxConfig(dryRun, options = {}) {
  const { dirname = __dirname, force = false } = options;
  log('Installing tmux.config file', { dryRun, dirname, force });

  const xdgTmuxPath = join(ENV.XDG_CONFIG_HOME, 'tmux', 'tmux.conf');
  const homeTmuxPath = join(ENV.HOME, '.tmux.conf');

  const hasXdgPathTmux = await access(xdgTmuxPath)
    .then(() => true)
    .catch(() => false);

  const hasHomePathTmux = await access(homeTmuxPath)
    .then(() => true)
    .catch(() => false);

  if (dryRun) {
    log('Dry run, skipping file write', { hasTmuxConfig: hasXdgPathTmux });
    return;
  }

  let tmuxConfigPath;

  if (force || (!hasXdgPathTmux && !hasHomePathTmux)) {
    // make tmux config folder path if missing
    await mkdir(join(ENV.XDG_CONFIG_HOME, 'tmux'), { recursive: true });

    await copyFile(
      join(dirname, '../../runcom/.tmux.conf'),
      // update to xdg path if neither is there
      xdgTmuxPath,
    ).then(() => log('Copied .tmux.conf'));

    tmuxConfigPath = xdgTmuxPath;
  } else {
    const existingPath = hasXdgPathTmux ? ENV.XDG_CONFIG_HOME : ENV.HOME;
    log(`.tmux.conf already exists at path ${existingPath}, skipping`);
    tmuxConfigPath = hasXdgPathTmux ? xdgTmuxPath : homeTmuxPath;
  }

  // Check if plugins are already installed
  await installTmuxPlugins(tmuxConfigPath, dirname, !!dryRun);
}

/**
 * Installs tmux plugins if they're not already present in the config
 * @param {string} tmuxConfigPath - path to the tmux.conf file
 * @param {string} dirname - directory name for source files
 * @param {boolean} dryRun - whether to run in dry run mode
 */
async function installTmuxPlugins(tmuxConfigPath, dirname, dryRun) {
  try {
    const tmuxConfig = await readFile(tmuxConfigPath, 'utf8');

    // Check if plugins are already installed
    if (tmuxConfig.includes("set -g @plugin 'tmux-plugins/tpm'")) {
      log('Tmux plugins already installed, skipping');
      return;
    }

    if (dryRun) {
      log('Dry run, would append tmux plugins');
      return;
    }

    // Read the plugins config file
    const pluginsConfig = await readFile(
      join(dirname, '../../runcom/.tmux-plugins.conf'),
      'utf8',
    );

    // Append plugins to the tmux config
    await appendFile(tmuxConfigPath, '\n' + pluginsConfig);
    log('Appended tmux plugins configuration');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log('Error installing tmux plugins:', errorMessage);
  }
}
