import mockFs from 'mock-fs';
import { ENV } from './src/constants/env.js';

let originalEnv = { ...ENV };

beforeEach(() => {
  console.log('Jest setup file executed');
  // force sensible default environment variables
  ENV.HOME = '/home/user';
  ENV.XDG_CONFIG_HOME = '/home/user/.config';

  // always force every test mock the local filesystem
  mockFs({
    '/home/user/dotfiles/': mockFs.load('./runcom', {
      recursive: true,
    }),
    '/home/user/dotfiles/git': mockFs.load('./git', {
      recursive: true,
    }),
    '/home/user/dotfiles/src': mockFs.load('./src', {
      recursive: true,
    }),
  });
});

afterEach(() => {
  mockFs.restore();
  for (const key in originalEnv) {
    // @ts-ignore
    ENV[key] = originalEnv[key];
  }
});
