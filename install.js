#!/usr/bin/env node

import { Command } from 'commander';
import { ENV } from './src/constants/env.js';
import { installGitConfigs } from './src/install/install-git-configs.js';
import { installNvimConfig } from './src/install/install-neovim-config.js';
import { installRuncom } from './src/install/install-runcom.js';
import { installTmuxConfig } from './src/install/install-tmux-config.js';
import { log } from './src/utils/log.js';
import { verifyManualInstallation } from './src/verify/verify-manual-installation.js';

(async () => {
  try {
    const program = new Command();

    program
      .name('install')
      .description('Install dotfiles')
      .option('-d, --dry-run', 'Run the installation in dry-run mode', false)
      .option('-p, --parallel', 'Run installations in parallel', false)
      .option('--plugins', 'Install plugins for neo-vim', false)
      .helpOption('-h, --help', 'Show this help message')
      .parse();

    const options = program.opts();
    const dryRun = options.dryRun;
    const parallel = options.parallel;
    const installPlugins = options.plugins;

    log('starting install, with args', { dryRun, HOME_DIR: ENV.HOME });

    const manualInstallation$ = verifyManualInstallation(dryRun);

    const installRuncom$ = installRuncom(dryRun);

    const installGitConfigs$ = installGitConfigs(dryRun);

    const installTmuxConfig$ = installTmuxConfig(dryRun);

    const installNvimConfig$ = installNvimConfig(dryRun, {
      installPlugins,
    });

    if (parallel) {
      await Promise.all([
        manualInstallation$,
        installRuncom$,
        installGitConfigs$,
        installTmuxConfig$,
        installNvimConfig$,
      ]);
    } else {
      await manualInstallation$;
      await installRuncom$;
      await installGitConfigs$;
      await installTmuxConfig$;
      await installNvimConfig$;
    }

    log('done installing dotfiles!');
  } catch (err) {
    console.error('Error installing dotfiles: ', err);
    process.exit(1);
  }
})();
