import { access, copyFile } from 'fs/promises';
import { join } from 'path';
import { HOME_DIR } from './constants/home-dir.js';
import { log } from './log.js';
import { dirname } from 'path';
import { fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
cosnt __dirname = dirname(__filename);

/**
 * Installs the tmux config, if it does not exist
 * @param {boolean} [dryRun] whether to run in dry run mode, will not throw
 */
export async function installTmuxConfig(dryRun) {
  log('Installing tmux.config file');

  // TODO: change to xdg base path
  const hasTmuxConfig = await access(join(HOME_DIR, '.tmux.conf'))
    .then(() => true)
    .catch(() => false);

  if (dryRun) {
    log('Dry run, skipping file write', { hasTmuxConfig });
    return;
  }

  if (!hasTmuxConfig) {
    await copyFile(
      join(__dirname, '../tmux/.tmux.conf'),
      join(HOME_DIR, '.tmux.conf'),
    ).then(() => log('Copied .tmux.conf'));
  } else {
    log('.tmux.conf already exists, skipping');
  }
}
