#!/usr/bin/env node

import { execSync } from 'child_process';

/**
 * Tmux Git Status Script
 * Displays git repository status with unicode characters and counts
 * for use in tmux status bar
 */

// Unicode symbols for different git states
const SYMBOLS = {
  branch: '⎇',
  ahead: '↑',
  behind: '↓',
  staged: '●',
  modified: '✚',
  deleted: '✖',
  renamed: '➜',
  untracked: '…',
  stashed: '⚑',
  clean: '✓',
  detached: '➦',
  conflict: '✗',
};

// Colors for tmux (using tmux color format)
const COLORS = {
  branch: '#[fg=blue]',
  ahead: '#[fg=green]',
  behind: '#[fg=red]',
  staged: '#[fg=green]',
  modified: '#[fg=yellow]',
  deleted: '#[fg=red]',
  renamed: '#[fg=magenta]',
  untracked: '#[fg=cyan]',
  stashed: '#[fg=yellow]',
  clean: '#[fg=green]',
  detached: '#[fg=red]',
  conflict: '#[fg=red]',
  reset: '#[fg=default]',
};

function isGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getBranchInfo() {
  try {
    // Get current branch name
    const branch = execSync(
      'git symbolic-ref --short HEAD 2>/dev/null || git describe --tags --exact-match 2>/dev/null || git rev-parse --short HEAD',
      { encoding: 'utf8' },
    ).trim();

    // Check if detached HEAD
    const isDetached =
      execSync('git symbolic-ref HEAD 2>/dev/null', {
        stdio: 'ignore',
      }).toString() === '';

    return { branch, isDetached };
  } catch {
    return { branch: 'unknown', isDetached: true };
  }
}

function getAheadBehind() {
  try {
    const output = execSync(
      'git rev-list --left-right --count HEAD...@{upstream} 2>/dev/null',
      { encoding: 'utf8' },
    ).trim();

    if (output) {
      const [ahead, behind] = output.split('\t').map(Number);
      return { ahead, behind };
    }
  } catch {
    // No upstream or other error
  }
  return { ahead: 0, behind: 0 };
}

function getStatusCounts() {
  try {
    const output = execSync('git status --porcelain', { encoding: 'utf8' });
    const lines = output
      .trim()
      .split('\n')
      .filter((line) => line.length > 0);

    const counts = {
      staged: 0,
      modified: 0,
      deleted: 0,
      renamed: 0,
      untracked: 0,
      conflict: 0,
    };

    lines.forEach((line) => {
      const status = line.substring(0, 2);
      const x = status[0]; // staged status
      const y = status[1]; // working tree status

      // Check for conflicts
      if (
        status === 'DD' ||
        status === 'AU' ||
        status === 'UD' ||
        status === 'UA' ||
        status === 'DU' ||
        status === 'AA' ||
        status === 'UU'
      ) {
        counts.conflict++;
        return;
      }

      // Staged changes
      if (x === 'A' || x === 'M' || x === 'D' || x === 'R' || x === 'C') {
        if (x === 'A' || x === 'M') counts.staged++;
        else if (x === 'D') counts.deleted++;
        else if (x === 'R' || x === 'C') counts.renamed++;
      }

      // Working tree changes
      if (y === 'M') counts.modified++;
      else if (y === 'D') counts.deleted++;
      else if (status === '??') counts.untracked++;
    });

    return counts;
  } catch {
    return {
      staged: 0,
      modified: 0,
      deleted: 0,
      renamed: 0,
      untracked: 0,
      conflict: 0,
    };
  }
}

function getStashCount() {
  try {
    const output = execSync('git stash list', { encoding: 'utf8' });
    return output
      .trim()
      .split('\n')
      .filter((line) => line.length > 0).length;
  } catch {
    return 0;
  }
}

function formatOutput() {
  if (!isGitRepo()) {
    return '';
  }

  const { branch, isDetached } = getBranchInfo();
  const { ahead, behind } = getAheadBehind();
  const counts = getStatusCounts();
  const stashCount = getStashCount();

  let output = [];

  // Branch name with symbol
  const branchSymbol = isDetached ? SYMBOLS.detached : SYMBOLS.branch;
  output.push(`${COLORS.branch}${branchSymbol} ${branch}${COLORS.reset}`);

  // Ahead/behind indicators
  if (ahead > 0) {
    output.push(`${COLORS.ahead}${SYMBOLS.ahead}${ahead}${COLORS.reset}`);
  }
  if (behind > 0) {
    output.push(`${COLORS.behind}${SYMBOLS.behind}${behind}${COLORS.reset}`);
  }

  // Status indicators
  if (counts.conflict > 0) {
    output.push(
      `${COLORS.conflict}${SYMBOLS.conflict}${counts.conflict}${COLORS.reset}`,
    );
  }
  if (counts.staged > 0) {
    output.push(
      `${COLORS.staged}${SYMBOLS.staged}${counts.staged}${COLORS.reset}`,
    );
  }
  if (counts.modified > 0) {
    output.push(
      `${COLORS.modified}${SYMBOLS.modified}${counts.modified}${COLORS.reset}`,
    );
  }
  if (counts.deleted > 0) {
    output.push(
      `${COLORS.deleted}${SYMBOLS.deleted}${counts.deleted}${COLORS.reset}`,
    );
  }
  if (counts.renamed > 0) {
    output.push(
      `${COLORS.renamed}${SYMBOLS.renamed}${counts.renamed}${COLORS.reset}`,
    );
  }
  if (counts.untracked > 0) {
    output.push(
      `${COLORS.untracked}${SYMBOLS.untracked}${counts.untracked}${COLORS.reset}`,
    );
  }

  // Stash indicator
  if (stashCount > 0) {
    output.push(
      `${COLORS.stashed}${SYMBOLS.stashed}${stashCount}${COLORS.reset}`,
    );
  }

  // Clean indicator if no changes
  const totalChanges = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0,
  );
  if (totalChanges === 0 && stashCount === 0 && ahead === 0 && behind === 0) {
    output.push(`${COLORS.clean}${SYMBOLS.clean}${COLORS.reset}`);
  }

  return output.join(' ');
}

// Main execution
// eslint-disable-next-line no-console
console.log(formatOutput());
