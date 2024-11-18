import mockFs from 'mock-fs';
import { installGitConfigs } from './install-git-configs.js';
import { jest } from '@jest/globals';
import { ENV } from './constants/env.js';

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
    prevHomeDir = ENV.HOME_DIR;
    // make this easily testable with mock-fs
    ENV.HOME_DIR = '/home/user';
  });

  afterAll(() => {
    console.log = log;
    mockFs.restore();
    jest.restoreAllMocks();
    jest.resetAllMocks();
    ENV.HOME_DIR = prevHomeDir;
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

  test('should return true when dryRun is true, and files exist', async () => {
    mockFs({
      '/home/user/.gitignore_global': 'gitignore_global',
      '/home/user/.gitconfig': 'gitconfig',
    });

    await installGitConfigs(true);
    expect(console.log).toHaveBeenCalledWith(
      '>> Dry run, skipping file write',
      {
        hasGitConfig: true,
        hasGitIgnoreGlobal: true,
      },
    );
  });
  // TODO: make sure mock-fs is actually working here
  test('should create files if they do not exist', async () => {
    mockFs({
      './git/.gitignore_global': 'gitignore_global',
      './git/.gitconfig': 'gitconfig',
      '/home/user': {},
      // '/home/user/.gitignore_global': 'gitignore_global',
      // '/home/user/.gitconfig': 'gitconfig',
    });

    await installGitConfigs();

    expect(console.log).toHaveBeenCalledWith('>> checked git related files', {
      hasGitConfig: false,
      hasGitIgnoreGlobal: false,
    });

    expect(console.log).toHaveBeenCalledWith('>> Copied .gitconfig');
    expect(console.log).toHaveBeenCalledWith('>> Copied .gitignore_global');
  });
});
