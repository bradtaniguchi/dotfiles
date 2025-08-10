import { exec } from './exec.js';

// this test is mostly a sanity test against jest setups itself
describe('exec', () => {
  test('should execute a command, and return stdout', async () => {
    const result = await exec('echo "hello world"');

    expect(result).toBe('hello world\n');
  });

  test('should throw if the command logs to stderr', async () => {
    await expect(exec('echo "hello world" 1>&2')).rejects.toThrow(
      'hello world',
    );
  });
});
