-- Brad Taniguchi
-- nvim configuration
-- 2025-08-05
-- Partially based off of:
-- https://github.com/Optixal/neovim-init.vim/blob/master/init.vim

vim.cmd('syntax on')

---------------------
-- Editor Settings
---------------------
vim.cmd('filetype plugin indent on')

-- Tab and indentation settings
vim.opt.tabstop = 4
vim.opt.softtabstop = 4
vim.opt.shiftwidth = 4
vim.opt.expandtab = true
vim.opt.smarttab = true
vim.opt.autoindent = true

-- Search settings
vim.opt.incsearch = true
vim.opt.ignorecase = true
vim.opt.smartcase = true
vim.opt.hlsearch = true

-- UI settings
vim.opt.ruler = true
vim.opt.laststatus = 2
vim.opt.showcmd = true
vim.opt.showmode = true
vim.opt.number = true
vim.opt.title = true

-- Character and wrapping settings
vim.opt.list = true
vim.opt.listchars = 'trail:»,tab:»-'
-- In Lua, the backslash needs to be escaped
vim.opt.fillchars:append('vert:\\')
vim.opt.wrap = true
vim.opt.breakindent = true

-- Encoding
vim.opt.encoding = 'utf-8'

-- Disable CoC startup warning (global variable)
vim.g.coc_disable_startup_warning = 1

---------------------
-- Plugins
---------------------

local vim = vim
local Plug = vim.fn['plug#']

vim.call('plug#begin')

-- fzf native plugin
Plug('junegunn/fzf')
-- fzf.vim
Plug('junegunn/fzf.vim')

Plug('preservim/nerdtree', { ['on'] = 'NERDTreeToggle' })

Plug('nvim-treesitter/nvim-treesitter', {['do'] = ':TSUpdate'})

vim.cmd('silent! colorscheme seoul256')

-- others?
-- lua require'nvim-treesitter.configs'.setup{highlight={enable=true}}  " At the bottom of your init.vim, keep all configs on one line
