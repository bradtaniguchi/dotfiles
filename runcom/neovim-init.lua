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
-- added conditionally via the script.
---------------------

