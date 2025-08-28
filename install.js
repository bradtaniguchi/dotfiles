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

    // Shared options for all commands
    function addCommonOptions(cmd) {
      return cmd
        .option('-d, --dry-run', 'Run the installation in dry-run mode', false)
        .option('-f, --force', 'Force overwrite of existing files', false);
    }

    // Main install command
    addCommonOptions(program)
      .name('install')
      .description('Install dotfiles')
      .option('-p, --parallel', 'Run installations in parallel', false)
      .option('--plugins', 'Install plugins for neo-vim', false)
      .helpOption('-h, --help', 'Show this help message')
      .action(
        async (
          /** @type {{ dryRun: any; parallel: any; plugins: any; force: any; }} */ options,
        ) => {
          const dryRun = options.dryRun;
          const parallel = options.parallel;
          const installPlugins = options.plugins;
          const force = options.force;

          log('starting install, with args', {
            dryRun,
            force,
            HOME_DIR: ENV.HOME,
          });

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
        },
      );

    // Subcommand: runcom
    addCommonOptions(
      program.command('runcom').description('Install only runcom config'),
    ).action(async (/** @type {{ dryRun: any; force: any; }} */ options) => {
      const dryRun = options.dryRun;
      const force = options.force;
      log('installing runcom config', { dryRun, force });
      await installRuncom(dryRun, { force });
      log('done installing runcom config!');
    });

    // Subcommand: tmux
    addCommonOptions(
      program.command('tmux').description('Install only tmux config'),
    ).action(async (/** @type {{ dryRun: any; force: any; }} */ options) => {
      const dryRun = options.dryRun;
      const force = options.force;
      log('installing tmux config', { dryRun, force });
      await installTmuxConfig(dryRun, { force });
      log('done installing tmux config!');
    });

    // Subcommand: neovim
    addCommonOptions(
      program
        .command('neovim')
        .description('Install only neovim config')
        .option('--plugins', 'Install plugins for neo-vim', false),
    ).action(
      async (
        /** @type {{ dryRun: any; force: any; plugins: any; }} */ options,
      ) => {
        const dryRun = options.dryRun;
        const force = options.force;
        const installPlugins = options.plugins;
        log('installing neovim config', { dryRun, force, installPlugins });
        await installNvimConfig(dryRun, { installPlugins, force });
        log('done installing neovim config!');
      },
    );

    await program.parseAsync();
  } catch (err) {
    log('Error installing dotfiles: ', err);
    process.exit(1);
  }
})();
