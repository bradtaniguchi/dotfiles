#!/bin/bash

# WIP

# create nvim directory
echo ">> creating nvim directory, if there isn't one"
mkdir -p ~/.config/nvim

# alias vim to nvim
echo ">> Adding vim alias to ~/.bashrc and ~/.zshrc"
echo "alias vim='nvim'" >> ~/.bashrc
echo "alias vim='nvim'" >> ~/.zshrc

# set editors to nvim
echo ">> Setting VISUAL in ~/.bashrc and ~/.zshrc"
echo "export VISUAL=nvim" >> ~/.bashrc
echo "export VISUAL=nvim" >> ~/.zshrc

# set editors to nvim
echo ">> Setting EDITOR in ~/.bashrc and ~/.zshrc"
echo "export EDITOR=nvim" >> ~/.bashrc
echo "export EDITOR=nvim" >> ~/.zshrc

# git setup
echo ">> Setting global git editor to nvim"
git config --global core.editor "nvim"

# setup git completion
echo ">> Setting git completion to ~/.bashrc and ~/.zshrc"=
echo "# auto-completion
if [ -f /opt/local/etc/profile.d/bash_completion.sh ]; then
  . /opt/local/etc/profile.d/bash_completion.sh
fi
" >> ~/.zshrc
echo "# auto-completion
if [ -f /opt/local/etc/profile.d/bash_completion.sh ]; then
  . /opt/local/etc/profile.d/bash_completion.sh
fi
" >> ~/.bashrc

# Copy run-com files if they don't already exist
echo ">> Copying run-com files"
cp -n ./runcom/.tmux.conf ~/.tmux.conf
cp -n ./runcom/.vimrc ~/.vimrc
cp -n ./runcom/.init.vim ~/.config/nvim/init.vim

# Copy aliases
cat ./runcom/.aliases >> ~/.zshrc
cat ./runcom/.aliases >> ~/.bashrc
