import { access, appendFile, copyFile, mkdir, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { ENV } from '../constants/env.js';
import { log } from '../utils/log.js';

const __dirname = dirname(new URL(import.meta.url).pathname);

/**
 * Installs the neovim configuration
 *
 * @param {boolean} [dryRun] whether to run in dry mode, which will
 * prevent writes
 * @param {Object} [options]
 * @param {boolean} [options.installPlugins=false] whether to install plugins for neovim
 * @param {boolean} [options.force] force overwrite of existing files
 */
export async function installNvimConfig(
  dryRun,
  { installPlugins = false, force = false } = {},
) {
  log('Installing vim and neovim configs', { dryRun, __dirname });

  const nvimConfigDir = join(ENV.XDG_CONFIG_HOME, 'nvim');
  const configPath = join(nvimConfigDir, 'init.lua');

  const hasNeoVimConfig = await access(configPath)
    .then(() => true)
    .catch(() => false);

  if (dryRun) {
    log('Dry run, skipping file write', { hasVimConfig: hasNeoVimConfig });
    return;
  }

  if (force || !hasNeoVimConfig) {
    // Ensure the nvim config directory exists
    await mkdir(nvimConfigDir, { recursive: true });

    await copyFile(
      join(__dirname, '../../runcom', 'neovim-init.lua'),
      // update to xdg path if neither is there
      configPath,
    );
    log('Copied init.lua');

    if (installPlugins) {
      log('will install plugins');

      // Check if plugins are already installed by looking for the plug#begin call
      const initLuaContent = await readFile(configPath, 'utf-8');
      const hasPlugins = initLuaContent.includes("vim.call('plug#begin')");

      if (!hasPlugins) {
        // Read the plugin configuration
        const pluginsPath = join(
          __dirname,
          '../runcom',
          'neovim-init-plugins.lua',
        );
        const pluginsContent = await readFile(pluginsPath, 'utf-8');

        // Append the plugins to the init.lua file
        await appendFile(configPath, '\n' + pluginsContent);
        log('Added plugin configuration to init.lua');
      } else {
        log('Plugin configuration already exists in init.lua, skipping');
      }
    }
  } else {
    log('init.lua already exists, skipping');
  }
}
