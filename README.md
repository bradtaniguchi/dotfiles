# dotfiles

Repo for dotfiles for Linux system configuration files.

## Installation

Installation is split into two steps, the manual checklist, and the automated install script.

### Manual checklist

- [ ] Install `neovim`
- [ ] Install `tmux`
- [ ] Install `htop`
- [ ] Install `nvm`
- [ ] Install `vim-plug`
- [ ] Install node lts via `nvm` (`nvm install --lts`)
  - **note** the install script only supports node 20+ automatically

### Install script

After the above manual steps are completed (which are done, manually due to ever changing install instructions)

Use the `install` script to install the dotfiles.

**note** this script requires/relies on node 20+, as I'm utilizing nodejs for the installation script, rather than bash. (good practice!)

## License

See [LICENSE](./LICENSE)
