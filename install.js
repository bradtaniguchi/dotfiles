#!/usr/bin/env node

import commandLineArgs from 'command-line-args';
import { ENV } from './src/constants/env.js';
import { installGitConfigs } from './src/install/install-git-configs.js';
import { installNvimConfig } from './src/install/install-neovim-config.js';
import { installRuncom } from './src/install/install-runcom.js';
import { installTmuxConfig } from './src/install/install-tmux-config.js';
import { log } from './src/utils/log.js';
import { verifyManualInstallation } from './src/verify/verify-manual-installation.js';

(async () => {
  try {
    /**
     * @type {{
     *   'dry-run'?: boolean,
     *   parallel?: boolean,
     *   plugins?: boolean,
     *   help?: boolean
     * }}
     */
    // @ts-expect-error
    const {
      'dry-run': dryRun,
      parallel,
      plugins: installPlugins,
      help,
    } = commandLineArgs([
      {
        name: 'dry-run',
        alias: 'd',
        type: Boolean,
        defaultValue: false,
      },
      {
        name: 'parallel',
        alias: 'p',
        type: Boolean,
        defaultValue: false,
      },
      {
        name: 'plugins',
        type: Boolean,
        defaultValue: false,
      },
      {
        name: 'help',
        alias: 'h',
        type: Boolean,
        defaultValue: false,
      },
    ]);

    if (help) {
      log(`
        Usage: install [options]

        Options:
          -d, --dry-run      Run the installation in dry-run mode
          -p, --parallel     Run installations in parallel
          --plugins          Install plugins for neo-vim and tmux
          -h, --help         Show this help message
      `);
      process.exit(0);
    }

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
