#!/usr/bin/env node

import { installRumcom } from './src/install-runcom.js';
import commandLineArgs from 'command-line-args';
import { log } from './src/log.js';
import { verifyManualInstallation } from './src/verify-manual-installation.js';

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
    const { 'dry-run': dryRun } = commandLineArgs([
      {
        name: 'dry-run',
        alias: 'd',
        type: Boolean,
        defaultValue: false,
      },
    ]);

    const HOME_DIR = process.env.HOME;

    log('starting install, with args', { dryRun, HOME_DIR });

    if (!HOME_DIR) {
      throw new Error('HOME environment variable not set');
    }

    await verifyManualInstallation(dryRun);

    await installRumcom(dryRun);

    log('done installing dotfiles!');
  } catch (err) {
    console.error('Error installing dotfiles: ', err);
    process.exit(1);
  }
})();
