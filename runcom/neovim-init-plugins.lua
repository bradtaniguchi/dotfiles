local vim = vim
local Plug = vim.fn['plug#']

vim.call('plug#begin')

-- fzf native plugin
Plug('junegunn/fzf')
Plug('junegunn/fzf.vim')

Plug('preservim/nerdtree')

Plug('nvim-treesitter/nvim-treesitter', {['do'] = ':TSUpdate'})

vim.cmd('silent! colorscheme seoul256')

vim.call('plug#end')
