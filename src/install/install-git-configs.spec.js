import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import mockFs from 'mock-fs';
import { ENV } from '../constants/env.js';
import { installGitConfigs } from './install-git-configs.js';

describe('installGitConfigs', () => {
  // override this to help with testing, as the path and username could change
  // when actually executing the script during testing
  const dirname = '/home/user/dotfiles/src/install';
  /**
   * @type {typeof ENV}
   */
  let prevEnv;
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
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should not install if dryRun is true', async () => {
    await installGitConfigs(true, {
      dirname,
    });

    expect(console.log).toHaveBeenCalledWith(
      '>> Dry run, skipping file write',
      {
        hasGitConfig: false,
        hasGitIgnoreGlobal: false,
      },
    );
  });

  test('should return when dryRun is true, and files exist', async () => {
    // override the default filesystem
    mockFs({
      '/home/user/.gitignore_global': mockFs.file({
        content: 'brad was already here',
      }),
      '/home/user/.gitconfig': mockFs.file({
        content: 'brad was already here',
      }),
    });

    await installGitConfigs(true, {
      dirname,
    });

    // check the contents of the files
    expect(readFileSync('/home/user/.gitignore_global', 'utf8')).toBe(
      'brad was already here',
    );
    expect(readFileSync('/home/user/.gitconfig', 'utf8')).toBe(
      'brad was already here',
    );
    // verify the xdg files did not get created, these are at /home/user/.config/git/
    expect(() =>
      readFileSync('/home/user/.config/git/ignore', 'utf8'),
    ).toThrow();
    expect(() =>
      readFileSync('/home/user/.config/git/config', 'utf8'),
    ).toThrow();
  });

  test('should create files if they do not exist', async () => {
    await installGitConfigs(false, {
      dirname,
    });
    expect(console.log).toHaveBeenCalledWith('>> Installing git config files', {
      gitConfigPath: '/home/user/.config/git/config',
      gitIgnoreGlobalPath: '/home/user/.config/git/ignore',
      dirname: '/home/user/dotfiles/src/install',
    });
    // expect git files to be installed into the xdg path
    expect(() =>
      readFileSync('/home/user/.config/git/ignore', 'utf8'),
    ).not.toThrow();
    expect(() =>
      readFileSync('/home/user/.config/git/config', 'utf8'),
    ).not.toThrow();
  });
});
