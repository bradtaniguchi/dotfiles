/**
 * Wrapper around env calls, created to help with testing, and typing
 */
export const ENV = {
  HOME: process.env.HOME ?? '',
  XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME ?? `${process.env.HOME}/.config`,
};

if (!ENV.HOME) {
  throw new Error('HOME environment variable is not set');
}
