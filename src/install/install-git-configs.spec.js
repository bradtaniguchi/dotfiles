import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import mockFs from 'mock-fs';
import { ENV } from '../constants/env.js';
import { installGitConfigs } from './install-git-configs.js';

describe('installGitConfigs', () => {
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
    prevEnv = { ...ENV };
    // make this easily testable with mock-fs
    ENV.HOME = '/home/user';
    ENV.XDG_CONFIG_HOME = '/home/user/.config';
  });

  afterEach(() => {
    mockFs.restore();
  });

  afterAll(() => {
    console.log = log;
    jest.restoreAllMocks();
    jest.resetAllMocks();
    for (const key in prevEnv) {
      // @ts-ignore
      ENV[key] = prevEnv[key];
    }
  });

  test('should not install if dryRun is true', async () => {
    mockFs({});
    await installGitConfigs(true);

    expect(console.log).toHaveBeenCalledWith(
      '>> Dry run, skipping file write',
      {
        hasGitConfig: false,
        hasGitIgnoreGlobal: false,
      },
    );
  });

  test('should return when dryRun is true, and files exist', async () => {
    mockFs({
      '/home/user/.gitignore_global': mockFs.file({
        content: 'brad was here',
      }),
      '/home/user/.gitconfig': mockFs.file({
        content: 'brad was here',
      }),
    });

    await installGitConfigs(true);

    // check the contents of the files
    expect(readFileSync('/home/user/.gitignore_global', 'utf8')).toBe(
      'brad was here',
    );
    expect(readFileSync('/home/user/.gitconfig', 'utf8')).toBe('brad was here');
    // verify the xdg files did not get created, these are at /home/user/.config/git/
    expect(() =>
      readFileSync('/home/user/.config/git/ignore', 'utf8'),
    ).toThrow();
    expect(() =>
      readFileSync('/home/user/.config/git/config', 'utf8'),
    ).toThrow();
  });

  test('should create files if they do not exist', async () => {
    // return ENV.XDG_CONFIG_HOME to be /home/user/.config
    ENV.XDG_CONFIG_HOME = '/home/user/.config';
    mockFs({
      '/home/user/dotfiles/git': mockFs.load('./git', {
        recursive: true,
      }),
      '/home/user/dotfiles/src': mockFs.load('./src', {
        recursive: true,
      }),
    });
    // override __dirname in install-git-config to help with testing

    await installGitConfigs(false, {
      dirname: '/home/user/dotfiles/src/install',
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
