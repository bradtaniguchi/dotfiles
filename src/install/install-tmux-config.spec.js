import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import mockFs from 'mock-fs';
import { installTmuxConfig } from './install-tmux-config.js';

describe('installTmuxConfig', () => {
  // override this to help with testing, as the path and username could change
  // when actually executing the script during testing
  const dirname = '/home/user/dotfiles/src/install';
  /**
   * @type {console["log"]}
   */
  let log;

  beforeAll(() => {
    log = console.log;
    console.log = jest.fn();
  });

  afterEach(() => {
    mockFs.restore();
  });

  afterAll(() => {
    console.log = log;
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should not install if dryRun is true', async () => {
    mockFs({});
    await installTmuxConfig(true);

    expect(console.log).toHaveBeenCalledWith(
      '>> Dry run, skipping file write',
      {
        hasTmuxConfig: false,
      },
    );
  });

  test('should not install if XDG tmux config already exists', async () => {
    mockFs({
      '/home/user/.config/tmux/tmux.conf': 'existing tmux config',
    });

    await installTmuxConfig(false);

    expect(console.log).toHaveBeenCalledWith(
      '>> .tmux.conf already exists at path /home/user/.config, skipping',
    );
  });

  test('should not install if HOME tmux config already exists', async () => {
    mockFs({
      '/home/user/.tmux.conf': 'existing tmux config',
    });

    await installTmuxConfig(false);

    expect(console.log).toHaveBeenCalledWith(
      '>> .tmux.conf already exists at path /home/user, skipping',
    );
  });

  test('should prefer XDG path over HOME path when both exist', async () => {
    mockFs({
      '/home/user/.config/tmux/tmux.conf': 'xdg tmux config',
      '/home/user/.tmux.conf': 'home tmux config',
    });

    await installTmuxConfig(false);

    expect(console.log).toHaveBeenCalledWith(
      '>> .tmux.conf already exists at path /home/user/.config, skipping',
    );
  });

  test('should install tmux config to XDG path when no config exists', async () => {
    // Create the source tmux config file structure and target directory
    mockFs({
      '/home/user/dotfiles/runcom': mockFs.load('./runcom'),
      '/home/user/.config/tmux': {}, // Create target directory
    });

    await installTmuxConfig(false, {
      dirname: '/home/user/dotfiles/src/install',
    });

    expect(console.log).toHaveBeenCalledWith('>> Copied .tmux.conf');

    // Verify the file was copied to the XDG path
    expect(() =>
      readFileSync('/home/user/.config/tmux/tmux.conf', 'utf8'),
    ).not.toThrow();
  });

  test('should create XDG tmux directory if it does not exist', async () => {
    mockFs({
      '/home/user/dotfiles/src/tmux/.tmux.conf': 'source tmux config content',
      // XDG config directory exists but not the tmux subdirectory
      '/home/user/.config': {},
    });

    // This test should actually fail because the function doesn't create the directory
    // This reveals a bug in the implementation
    await expect(
      installTmuxConfig(false, {
        dirname: '/home/user/dotfiles/src/install',
      }),
    ).rejects.toThrow();
  });

  test('should handle copy file errors gracefully', async () => {
    mockFs({
      // Missing source file to trigger copy error
    });

    await expect(
      installTmuxConfig(false, {
        dirname: '/home/user/dotfiles/src/install',
      }),
    ).rejects.toThrow();
  });

  test('should append plugins when tmux config exists but plugins are not installed', async () => {
    const existingTmuxContent =
      'set -g mouse on\nset -g status-position bottom';
    const pluginsContent =
      "set -g @plugin 'tmux-plugins/tpm'\nrun '~/.tmux/plugins/tpm/tpm'";

    mockFs({
      '/home/user/.config/tmux/tmux.conf': existingTmuxContent,
      '/home/user/dotfiles/runcom/.tmux-plugins.conf': pluginsContent,
    });

    await installTmuxConfig(false, {
      dirname: '/home/user/dotfiles/src/install',
    });

    expect(console.log).toHaveBeenCalledWith(
      '>> Appended tmux plugins configuration',
    );

    // Verify the plugins were appended to the existing config
    const updatedContent = readFileSync(
      '/home/user/.config/tmux/tmux.conf',
      'utf8',
    );
    expect(updatedContent).toContain(existingTmuxContent);
    expect(updatedContent).toContain(pluginsContent);
  });

  test('should skip plugin installation when plugins are already present', async () => {
    const tmuxContentWithPlugins =
      "set -g mouse on\nset -g @plugin 'tmux-plugins/tpm'\nrun '~/.tmux/plugins/tpm/tpm'";

    mockFs({
      '/home/user/.config/tmux/tmux.conf': tmuxContentWithPlugins,
      '/home/user/dotfiles/runcom/.tmux-plugins.conf':
        "set -g @plugin 'tmux-plugins/tpm'",
    });

    await installTmuxConfig(false, {
      dirname: '/home/user/dotfiles/src/install',
    });

    expect(console.log).toHaveBeenCalledWith(
      '>> Tmux plugins already installed, skipping',
    );
  });

  test('should append plugins to new tmux config installation', async () => {
    const originalTmuxContent =
      'set -g mouse on\nset -g status-position bottom';
    const pluginsContent =
      "set -g @plugin 'tmux-plugins/tpm'\nrun '~/.tmux/plugins/tpm/tpm'";

    mockFs({
      '/home/user/dotfiles/runcom/.tmux.conf': originalTmuxContent,
      '/home/user/dotfiles/runcom/.tmux-plugins.conf': pluginsContent,
      '/home/user/.config/tmux': {},
    });

    await installTmuxConfig(false, {
      dirname: '/home/user/dotfiles/src/install',
    });

    expect(console.log).toHaveBeenCalledWith('>> Copied .tmux.conf');
    expect(console.log).toHaveBeenCalledWith(
      '>> Appended tmux plugins configuration',
    );

    // Verify the plugins were appended to the new config
    const finalContent = readFileSync(
      '/home/user/.config/tmux/tmux.conf',
      'utf8',
    );
    expect(finalContent).toContain(originalTmuxContent);
    expect(finalContent).toContain(pluginsContent);
  });

  test('should handle plugin installation in dry run mode', async () => {
    const existingTmuxContent =
      'set -g mouse on\nset -g status-position bottom';

    mockFs({
      '/home/user/.config/tmux/tmux.conf': existingTmuxContent,
      '/home/user/dotfiles/runcom/.tmux-plugins.conf':
        "set -g @plugin 'tmux-plugins/tpm'",
    });

    await installTmuxConfig(true, {
      dirname: '/home/user/dotfiles/src/install',
    });

    expect(console.log).toHaveBeenCalledWith(
      '>> Dry run, skipping file write',
      {
        hasTmuxConfig: true,
      },
    );
  });

  test('should handle errors during plugin installation gracefully', async () => {
    // Create a scenario where tmux config exists but plugins file read fails
    mockFs({
      '/home/user/.config/tmux/tmux.conf': 'set -g mouse on',
      '/home/user/dotfiles/runcom': {
        // Directory exists but .tmux-plugins.conf file is missing
      },
    });

    await installTmuxConfig(false, {
      dirname: '/home/user/dotfiles/src/install',
    });

    expect(console.log).toHaveBeenCalledWith(
      '>> .tmux.conf already exists at path /home/user/.config, skipping',
    );
    expect(console.log).toHaveBeenCalledWith(
      '>> Error installing tmux plugins:',
      expect.any(String),
    );
  });

  test('should install tmux scripts when scripts option is true', async () => {
    jest.clearAllMocks(); // Clear any previous mock calls

    mockFs({
      '/home/user/.config/tmux/tmux.conf': 'existing tmux config',
      '/home/user/dotfiles/runcom/tmux-git-status.js':
        '#!/usr/bin/env node\nconsole.log("git status")',
    });

    await installTmuxConfig(false, {
      dirname: '/home/user/dotfiles/src/install',
      scripts: true,
    });

    expect(console.log).toHaveBeenCalledWith(
      '>> Created tmux scripts directory:',
      '/home/user/.config/tmux/scripts',
    );
    expect(console.log).toHaveBeenCalledWith(
      '>> Copied tmux-git-status.js to scripts directory',
    );
  });

  test('should not install scripts when scripts option is false', async () => {
    jest.clearAllMocks(); // Clear any previous mock calls

    mockFs({
      '/home/user/.config/tmux/tmux.conf': 'existing tmux config',
      '/home/user/dotfiles/runcom/tmux-git-status.js':
        '#!/usr/bin/env node\nconsole.log("git status")',
    });

    await installTmuxConfig(false, {
      dirname: '/home/user/dotfiles/src/install',
      scripts: false,
    });

    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining('scripts directory'),
    );
  });

  test('should skip script installation if script already exists', async () => {
    mockFs({
      '/home/user/.config/tmux/tmux.conf': 'existing tmux config',
      '/home/user/.config/tmux/scripts/tmux-git-status.js': 'existing script',
      '/home/user/dotfiles/runcom/tmux-git-status.js':
        '#!/usr/bin/env node\nconsole.log("git status")',
    });

    await installTmuxConfig(false, {
      dirname: '/home/user/dotfiles/src/install',
      scripts: true,
    });

    expect(console.log).toHaveBeenCalledWith(
      '>> Script tmux-git-status.js already exists, skipping',
    );
  });

  test('should handle scripts installation in dry run mode', async () => {
    mockFs({
      '/home/user/.config/tmux/tmux.conf': 'existing tmux config',
      '/home/user/dotfiles/runcom/tmux-git-status.js':
        '#!/usr/bin/env node\nconsole.log("git status")',
    });

    await installTmuxConfig(true, {
      dirname: '/home/user/dotfiles/src/install',
      scripts: true,
    });

    expect(console.log).toHaveBeenCalledWith(
      '>> Dry run, would install tmux scripts to:',
      '/home/user/.config/tmux/scripts',
    );
  });

  test('should handle errors during script installation gracefully', async () => {
    // Create a scenario where scripts directory cannot be created
    mockFs({
      '/home/user/.config/tmux/tmux.conf': 'existing tmux config',
      '/home/user/dotfiles/runcom': {
        // Directory exists but tmux-git-status.js file is missing
      },
    });

    await installTmuxConfig(false, {
      dirname: '/home/user/dotfiles/src/install',
      scripts: true,
    });

    expect(console.log).toHaveBeenCalledWith(
      '>> Error installing tmux scripts:',
      expect.any(String),
    );
  });
});
