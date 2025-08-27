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

      .option('-f, --force', 'Force overwrite of existing files', false)
      .helpOption('-h, --help', 'Show this help message')
      .parse();

    const options = program.opts();

    const dryRun = options.dryRun;
    const parallel = options.parallel;
    const installPlugins = options.plugins;
    const force = options.force;

    log('starting install, with args', { dryRun, force, HOME_DIR: ENV.HOME });

    const manualInstallation$ = verifyManualInstallation(dryRun);

    const installRuncom$ = installRuncom(dryRun, { force });

    const installGitConfigs$ = installGitConfigs(dryRun, { force });

    const installTmuxConfig$ = installTmuxConfig(dryRun, { force });

    const installNvimConfig$ = installNvimConfig(dryRun, {
      installPlugins,
      force,
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
    log('Error installing dotfiles: ', err);
    process.exit(1);
  }
})();
