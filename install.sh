#!/bin/bash

# exit when any command fails
set -e

# create nvim directory
echo ">> creating nvim directory, if there isn't one"
mkdir -p ~/.config/nvim

# Copy bashrc and zshrc
echo ">> Copying system aliases"
cat ./system/.rc >> ~/.zshrc
cat ./system/.rc >> ~/.bashrc

# git setup
echo ">> Setting global git editor to nvim, if exists"
if command -v nvim &> /dev/null
then
    echo "nvm found, setting global git editor"
    git config --global core.editor "nvim"
fi

# Copy run-com files if they don't already exist
echo ">> Copying run-com files"
cp -n ./runcom/.tmux.conf ~/.tmux.conf
cp -n ./runcom/.vimrc ~/.vimrc
cp -n ./runcom/init.vim ~/.config/nvim/init.vim

# Copy aliases
echo ">> Copying system aliases"
cat ./system/.aliases >> ~/.zshrc
cat ./system/.aliases >> ~/.bashrc

# Setup nvim and helpers
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends neovim wget gnupg curl \
    && apt-get clean

# setup vim-plug
sh -c 'curl -fLo "${XDG_DATA_HOME:-$HOME/.local/share}"/nvim/site/autoload/plug.vim --create-dirs \
       https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'

echo ">> Done!"
