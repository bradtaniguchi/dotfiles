/**
 * Array of rc values that need to be added to the zshrc and bashrc files,
 * if they aren't already there.
 *
 * Where the line is added/not-added depending on if the `addLineCheckFn`
 * returns true or false.
 *
 * @type {Array<{
 *   line: string,
 *   addLineCheckFn: (params: {
 *     rcFile: 'zshrc' | 'bashrc',
 *     rcFileContents: string
 *   }) => boolean | Promise<boolean>
 * }>} RC_LINES
 */
export const RC_LINES = [
  {
    line: `alias vim='nvim'`,
    addLineCheckFn: ({ rcFileContents }) =>
      !rcFileContents.includes(`alias vim='nvim'`),
  },

  {
    line: `export EDITOR='nvim'`,
    addLineCheckFn: ({ rcFileContents }) =>
      !rcFileContents.includes(`export EDITOR='nvim'`),
  },
  {
    line: `export VISUAL='nvim'`,
    addLineCheckFn: ({ rcFileContents }) =>
      !rcFileContents.includes(`export VISUAL='nvim'`),
  },
];
