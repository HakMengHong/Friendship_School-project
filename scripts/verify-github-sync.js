#!/usr/bin/env node

/**
 * Verify GitHub Sync Script
 * Compares local files with GitHub to ensure everything is synced
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function execGit(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return '';
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

console.log('\n🔍 GitHub Sync Verification');
console.log('═'.repeat(70));

// 1. Check branch status
console.log('\n📊 Branch Status:');
console.log('─'.repeat(70));

const currentBranch = execGit('git rev-parse --abbrev-ref HEAD');
const trackingBranch = execGit(`git rev-parse --abbrev-ref ${currentBranch}@{upstream}`);

console.log(`   Current Branch:      ${currentBranch}`);
console.log(`   Tracking Branch:     ${trackingBranch || 'None'}`);

// 2. Check commit sync
console.log('\n🔗 Commit Synchronization:');
console.log('─'.repeat(70));

const localCommit = execGit('git rev-parse HEAD');
const remoteCommit = execGit(`git rev-parse origin/${currentBranch}`);

const commitsAhead = execGit(`git rev-list --count origin/${currentBranch}..HEAD`);
const commitsBehind = execGit(`git rev-list --count HEAD..origin/${currentBranch}`);

console.log(`   Local Commit:        ${localCommit.substring(0, 12)}...`);
console.log(`   Remote Commit:      ${remoteCommit ? remoteCommit.substring(0, 12) + '...' : 'None'}`);

if (localCommit === remoteCommit) {
  console.log(`   ✅ Status:          In sync (identical commits)`);
} else if (commitsAhead > 0) {
  console.log(`   ⚠️  Status:          ${commitsAhead} commit(s) ahead of remote`);
} else if (commitsBehind > 0) {
  console.log(`   ⚠️  Status:          ${commitsBehind} commit(s) behind remote`);
} else {
  console.log(`   ✅ Status:          Synchronized`);
}

// 3. Check for uncommitted changes
console.log('\n📝 Uncommitted Changes:');
console.log('─'.repeat(70));

const uncommittedFiles = execGit('git status --short');
if (!uncommittedFiles) {
  console.log('   ✅ No uncommitted changes');
  console.log('   ✅ Working directory is clean');
} else {
  const files = uncommittedFiles.split('\n').filter(f => f);
  console.log(`   ⚠️  Found ${files.length} file(s) with changes:`);
  files.slice(0, 10).forEach(file => {
    console.log(`      ${file.trim()}`);
  });
  if (files.length > 10) {
    console.log(`      ... and ${files.length - 10} more`);
  }
}

// 4. Check for untracked files
console.log('\n📂 Untracked Files:');
console.log('─'.repeat(70));

const untrackedFiles = execGit('git ls-files --others --exclude-standard');
if (!untrackedFiles) {
  console.log('   ✅ No untracked files (all properly ignored or committed)');
} else {
  const files = untrackedFiles.split('\n').filter(f => f);
  console.log(`   ℹ️  Found ${files.length} untracked file(s) (expected if in .gitignore):`);
  files.slice(0, 10).forEach(file => {
    const filePath = path.join(process.cwd(), file);
    let info = file;
    try {
      if (fs.statSync(filePath).isFile()) {
        const size = fs.statSync(filePath).size;
        info += ` (${formatSize(size)})`;
      }
    } catch {}
    console.log(`      ${info}`);
  });
  if (files.length > 10) {
    console.log(`      ... and ${files.length - 10} more`);
  }
}

// 5. File statistics
console.log('\n📈 Repository Statistics:');
console.log('─'.repeat(70));

const totalFiles = execGit('git ls-files | Measure-Object -Line').match(/\d+/)?.[0] || '0';
const trackedFiles = execGit('git ls-files').split('\n').filter(f => f).length;

console.log(`   Tracked Files:       ${trackedFiles.toLocaleString()}`);

// Get last commit info
const lastCommit = execGit('git log -1 --pretty=format:"%h - %s (%ar)"');
console.log(`   Last Commit:         ${lastCommit}`);

// 6. Compare with remote
console.log('\n🌐 Remote Comparison:');
console.log('─'.repeat(70));

const diffFiles = execGit('git diff --name-only origin/' + currentBranch + '..HEAD');
if (!diffFiles) {
  console.log('   ✅ No differences between local and remote');
  console.log('   ✅ Local repository matches GitHub exactly');
} else {
  const files = diffFiles.split('\n').filter(f => f);
  console.log(`   ⚠️  Found ${files.length} file(s) with differences:`);
  files.forEach(file => {
    console.log(`      ${file}`);
  });
}

// 7. Remote connection
console.log('\n🔌 Remote Connection:');
console.log('─'.repeat(70));

const remotes = execGit('git remote -v');
if (remotes) {
  const remoteLines = remotes.split('\n');
  remoteLines.forEach(line => {
    if (line.includes('origin')) {
      const match = line.match(/(\S+)\s+(\S+)/);
      if (match) {
        console.log(`   ${match[1].padEnd(15)} ${match[2]}`);
      }
    }
  });
} else {
  console.log('   ⚠️  No remote configured');
}

// 8. Summary
console.log('\n' + '═'.repeat(70));

const isSynced = 
  localCommit === remoteCommit &&
  !uncommittedFiles &&
  !diffFiles;

if (isSynced) {
  console.log('✅ VERIFICATION PASSED: Local repository is identical to GitHub!');
  console.log('   All files are committed and pushed.');
  console.log('   No differences detected.');
} else {
  console.log('⚠️  VERIFICATION: Some differences found');
  if (uncommittedFiles) {
    console.log('   → You have uncommitted changes');
  }
  if (diffFiles) {
    console.log('   → Local and remote differ');
  }
  if (commitsAhead > 0) {
    console.log(`   → You have ${commitsAhead} local commit(s) not pushed`);
  }
  if (commitsBehind > 0) {
    console.log(`   → Remote has ${commitsBehind} commit(s) you don't have`);
  }
}

console.log('═'.repeat(70) + '\n');

