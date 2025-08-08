import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import mockFs from 'mock-fs';
import { ENV } from '../constants/env.js';
import { installGitConfigs } from './install-git-configs.js';

describe('installGitConfigs', () => {
  /**
   * @type {string}
   */
  let prevHomeDir;
  /**
   * @type {console["log"]}
   */
  let log;

  beforeAll(() => {
    log = console.log;
    console.log = jest.fn();
    prevHomeDir = ENV.HOME;
    // make this easily testable with mock-fs
    ENV.HOME = '/home/user';
  });

  afterEach(() => {
    mockFs.restore();
  });

  afterAll(() => {
    console.log = log;
    jest.restoreAllMocks();
    jest.resetAllMocks();
    ENV.HOME = prevHomeDir;
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
    // TODO: fix pathing
    mockFs({
      '/home/user/dotfiles/git': mockFs.load('./git'),
      '/home/user/dotfiles/src/install': mockFs.load('./'),
    });
    // override __dirname in install-git-config to help with testing

    await installGitConfigs(false, {
      dirname: '/home/user/dotfiles/src/install',
    });

    // expect(console.log).toHaveBeenCalledWith('>> checked git related files', {
    //   hasGitConfig: false,
    //   hasGitIgnoreGlobal: false,
    // });

    // expect(console.log).toHaveBeenCalledWith('>> Copied .gitconfig');
    // expect(console.log).toHaveBeenCalledWith('>> Copied .gitignore_global');
  });
});
