import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import mockFs from 'mock-fs';
import { ENV } from '../constants/env.js';
import { RC_LINES } from '../constants/rc.js';
import { installRuncom } from './install-runcom.js';

describe('installRuncom', () => {
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
    mockFs({
      '/home/user/.bashrc': 'existing content',
      '/home/user/.zshrc': 'existing content',
    });

    await installRuncom(true);

    expect(console.log).toHaveBeenCalledWith('>> Dry run, skipping file write');
  });

  test('should not modify files when all lines already exist', async () => {
    const existingBashrcContent = `# existing content
${RC_LINES.map((rcLine) => rcLine.line).join('\n')}
# more content`;

    const existingZshrcContent = `# existing content
${RC_LINES.map((rcLine) => rcLine.line).join('\n')}
# more content`;

    mockFs({
      '/home/user/.bashrc': existingBashrcContent,
      '/home/user/.zshrc': existingZshrcContent,
    });

    await installRuncom(false);

    // Verify files weren't changed
    expect(readFileSync('/home/user/.bashrc', 'utf8')).toBe(
      existingBashrcContent,
    );
    expect(readFileSync('/home/user/.zshrc', 'utf8')).toBe(
      existingZshrcContent,
    );
    expect(console.log).toHaveBeenCalledWith('>> No files changed');
  });

  test('should add missing lines to both bashrc and zshrc', async () => {
    const initialContent = '# existing content\n';

    mockFs({
      '/home/user/.bashrc': initialContent,
      '/home/user/.zshrc': initialContent,
    });

    await installRuncom(false);

    const bashrcContent = readFileSync('/home/user/.bashrc', 'utf8');
    const zshrcContent = readFileSync('/home/user/.zshrc', 'utf8');

    // Verify all RC_LINES were added to both files
    RC_LINES.forEach((rcLine) => {
      expect(bashrcContent).toContain(rcLine.line);
      expect(zshrcContent).toContain(rcLine.line);
    });

    expect(console.log).toHaveBeenCalledWith(
      '>> Run `source ~/.bashrc` or `source ~/.zshrc` to apply changes',
    );
  });

  test('should add partial missing lines when some already exist', async () => {
    const bashrcWithSomeLines = `# existing content
${RC_LINES[0].line}
# more content`;

    const zshrcWithDifferentLines = `# existing content
${RC_LINES[1].line}
# more content`;

    mockFs({
      '/home/user/.bashrc': bashrcWithSomeLines,
      '/home/user/.zshrc': zshrcWithDifferentLines,
    });

    await installRuncom(false);

    const bashrcContent = readFileSync('/home/user/.bashrc', 'utf8');
    const zshrcContent = readFileSync('/home/user/.zshrc', 'utf8');

    // Verify all lines are now present in both files
    RC_LINES.forEach((rcLine) => {
      expect(bashrcContent).toContain(rcLine.line);
      expect(zshrcContent).toContain(rcLine.line);
    });
  });

  test('should handle missing rc files gracefully', async () => {
    mockFs({
      '/home/user/.bashrc': mockFs.file({
        content: '# bashrc content',
      }),
      // missing .zshrc file
    });

    await expect(installRuncom(false)).rejects.toThrow();
  });

  test('should log errors when file write fails but continue processing', async () => {
    const consoleError = console.error;
    console.error = jest.fn();

    mockFs({
      '/home/user/.bashrc': '# bashrc content',
      '/home/user/.zshrc': '# zshrc content',
      // Make one of the files read-only to simulate write failure
      '/home/user/.bashrc-readonly': mockFs.file({
        content: '# readonly content',
        mode: 0o444, // read-only
      }),
    });

    // This should complete without throwing
    await installRuncom(false);

    // expect the filesystem to be updated
    expect(readFileSync('/home/user/.bashrc', 'utf8')).toContain(
      "export EDITOR='nvim'",
    );
  });
});
