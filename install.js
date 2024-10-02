#!/usr/bin/env node

import { installRumcom } from './src/install-runcom.js';
import commandLineArgs from 'command-line-args';
import { log } from './src/log.js';
import { verifyManualInstallation } from './src/verify-manual-installation.js';
import { HOME_DIR } from './src/constants/home-dir.js';
import { installGitConfigs } from './src/install-git-configs.js';
import { installTmuxConfig } from './src/install-tmux-config.js';
import { installVimAndNvimConfigs } from './src/install-vim-and-nvim-configs.js';

(async () => {
  /**
   * 1. move .gitconfig to ~/.gitconfig
   * 2. move .gitignore_global to ~/.gitignore_global
   * 3. move run-com files
   *   - will require checks against pre-existing files
   * 4. move .rc file into `~/.bashrc` or `~/.zshrc`
   */

  try {
    /**
     * @type {{
     *  'dry-run': boolean
     * }}
     */
    // @ts-ignore
    const { 'dry-run': dryRun, parallel } = commandLineArgs([
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
    ]);

    log('starting install, with args', { dryRun, HOME_DIR });

    const manualInstallation$ = verifyManualInstallation(dryRun);

    const installRumcom$ = installRumcom(dryRun);

    const installGitConfigs$ = installGitConfigs(dryRun);

    const installTmuxConfig$ = installTmuxConfig(dryRun);

    const installVimAndNvimConfigs$ = installVimAndNvimConfigs(dryRun);

    if (parallel) {
      await Promise.all([
        manualInstallation$,
        installRumcom$,
        installGitConfigs$,
        installTmuxConfig$,
        installVimAndNvimConfigs$,
      ]);
    } else {
      await manualInstallation$;
      await installRumcom$;
      await installGitConfigs$;
      await installTmuxConfig$;
      await installVimAndNvimConfigs$;
    }

    log('done installing dotfiles!');
  } catch (err) {
    console.error('Error installing dotfiles: ', err);
    process.exit(1);
  }
})();
