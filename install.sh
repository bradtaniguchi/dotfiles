#!/bin/bash


if [ -z "$USER" ]; then
    USER=$(id -un)
fi

echo >&2 "====================================================================="
echo >&2 " Setting up codespaces environment"
echo >&2 ""
echo >&2 " USER        $USER"
echo >&2 " HOME        $HOME"
echo >&2 "====================================================================="

cd $HOME

# exit when any command fails
set -e

# Install neovim
NVIM_VERSION=0.7.0
sudo apt-get install -y libfuse2
curl -L -o $HOME/bin/nvim https://github.com/neovim/neovim/releases/download/v${NVIM_VERSION}/nvim.appimage
chmod a+x $HOME/bin/nvim

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

echo ">> installing nvchad"
# if this has issues check here:
# https://nvchad.com/quickstart/install
git clone https://github.com/NvChad/NvChad ~/.config/nvim --depth 1 && nvim

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
