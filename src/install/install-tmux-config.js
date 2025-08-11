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
 * @param {boolean} [options.scripts] whether to install tmux scripts
 */
export async function installTmuxConfig(dryRun, options = {}) {
  const dirname = options.dirname || __dirname;
  log('Installing tmux.config file', {
    dryRun,
    dirname,
    scripts: options.scripts,
  });

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

    // Handle scripts in dry run mode
    if (options.scripts === true) {
      await installTmuxScripts(dirname, true);
    }
    return;
  }

  let tmuxConfigPath;

  if (!hasXdgPathTmux && !hasHomePathTmux) {
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

  // Install tmux scripts if requested
  if (options.scripts === true) {
    await installTmuxScripts(dirname, !!dryRun);
  }
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

/**
 * Available tmux scripts to install
 */
const TMUX_SCRIPTS = [
  {
    name: 'tmux-git-status.js',
    source: '../../runcom/tmux-git-status.js',
  },
  // Future scripts can be added here
];

/**
 * Installs tmux scripts to the XDG config scripts folder
 * @param {string} dirname - directory name for source files
 * @param {boolean} dryRun - whether to run in dry run mode
 */
async function installTmuxScripts(dirname, dryRun) {
  const scriptsPath = join(ENV.XDG_CONFIG_HOME, 'tmux', 'scripts');

  try {
    if (dryRun) {
      log('Dry run, would install tmux scripts to:', scriptsPath);
      return;
    }

    // Create scripts directory if it doesn't exist
    await mkdir(scriptsPath, { recursive: true });
    log('Created tmux scripts directory:', scriptsPath);

    // Install each script
    for (const script of TMUX_SCRIPTS) {
      const targetPath = join(scriptsPath, script.name);
      const sourcePath = join(dirname, script.source);

      // Check if script already exists
      const scriptExists = await access(targetPath)
        .then(() => true)
        .catch(() => false);

      if (scriptExists) {
        log(`Script ${script.name} already exists, skipping`);
        continue;
      }

      // Copy the script
      await copyFile(sourcePath, targetPath);
      log(`Copied ${script.name} to scripts directory`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log('Error installing tmux scripts:', errorMessage);
  }
}
