#!/usr/bin/env node

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
    log('starting install');

    const homeDir = process.env.HOME;

    if (!homeDir) {
      throw new Error('HOME environment variable not set');
    }

    await verifyManualInstallation(false);

    log('done installing dotfiles!');
  } catch (err) {
    console.error('Error installing dotfiles: ', err);
    process.exit(1);
  }
})();
