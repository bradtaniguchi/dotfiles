import { access, copyFile } from 'fs/promises';
import { dirname, join } from 'path';
import { ENV } from '../constants/env.js';
import { log } from '../utils/log.js';

const __dirname = dirname(new URL(import.meta.url).pathname);

/**
 * Installs the tmux config, if it does not exist
 * @param {boolean} [dryRun] whether to run in dry run mode, will not throw
 */
export async function installTmuxConfig(dryRun) {
  log('Installing tmux.config file', { dryRun, __dirname });

  const hasXdgPathTmux = await access(
    join(ENV.XDG_CONFIG_HOME, 'tmux', 'tmux.conf'),
  )
    .then(() => true)
    .catch(() => false);

  const hasHomePathTmux = await access(join(ENV.HOME, '.tmux.conf'))
    .then(() => true)
    .catch(() => false);

  if (dryRun) {
    log('Dry run, skipping file write', { hasTmuxConfig: hasXdgPathTmux });
    return;
  }

  if (!hasXdgPathTmux && !hasHomePathTmux) {
    await copyFile(
      join(__dirname, '../tmux/.tmux.conf'),
      // update to xdg path if neither is there
      join(ENV.XDG_CONFIG_HOME, 'tmux', 'tmux.conf'),
    ).then(() => log('Copied .tmux.conf'));
  } else {
    log(
      `.tmux.conf already exists at path ${hasXdgPathTmux ? ENV.XDG_CONFIG_HOME : ENV.HOME}, skipping`,
    );
  }
}
