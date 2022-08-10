"""""
" Brad Taniguchi
" nvim configuration
" 2021-05-21
" Partially based off of:
" https://github.com/Optixal/neovim-init.vim/blob/master/init.vim
"""""

"""""
" Coloring
"""""
syntax on
highlight Pmenu guibg=white guifg=black gui=bold
highlight Comment gui=bold
highlight Normal gui=none
highlight NonText guibg=none

"""""
" Editor Settings
"""""
filetype plugin indent on
set tabstop=4 softtabstop=4 shiftwidth=4 expandtab smarttab autoindent
set incsearch ignorecase smartcase hlsearch
set ruler laststatus=2 showcmd showmode
set list listchars=trail:»,tab:»-
set fillchars+=vert:\ 
set wrap breakindent
set encoding=utf-8
set number
set title

"""""
" Plugins
"""""
" call plug#begin()

"" Make sure you use single quotes
" Plug 'junegunn/vim-easy-align'
" Plug 'scrooloose/nerdtree'
" Plug 'junegunn/fzf'
" Plug 'jose-elias-alvarez/null-ls.nvim'
" Plug 'MunifTanjim/prettier.nvim'
" Plug 'kyazdani42/nvim-web-devicons'
" Plug 'romgrk/barbar.nvim'

" call plug#end()
