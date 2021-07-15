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
echo "export VISUAL=nvim" >> ~/.bashrc
echo "export EDITOR=\"$VISUAL\"" >> ~/.bashrc


# git setup
git config --global core.editor "nim"

# setup git completion
echo "source /usr/share/bash-completion/completions/git" >> ~/.bashrc
echo "source /usr/share/bash-completion/completions/git" >> ~/.zshrc
