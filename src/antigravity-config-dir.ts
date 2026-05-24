import * as path from 'node:path';
import * as fs from 'node:fs';

function expandHomeDirPrefix(inputPath: string, homeDir: string): string {
  if (inputPath === '~') {
    return homeDir;
  }
  if (inputPath.startsWith('~/') || inputPath.startsWith('~\\')) {
    return path.join(homeDir, inputPath.slice(2));
  }
  return inputPath;
}

export function getClaudeConfigDir(homeDir: string): string {
  const envConfigDir = (process.env.ANTIGRAVITY_CONFIG_DIR || process.env.CLAUDE_CONFIG_DIR)?.trim();
  if (envConfigDir) {
    return path.resolve(expandHomeDirPrefix(envConfigDir, homeDir));
  }

  // If ~/.gemini/antigravity-cli exists, we use it!
  const antigravityPath = path.join(homeDir, '.gemini', 'antigravity-cli');
  if (fs.existsSync(antigravityPath)) {
    return antigravityPath;
  }

  // Otherwise, default/fallback to ~/.claude for backward compatibility with Claude Code & legacy test suites
  return path.join(homeDir, '.claude');
}

export function getClaudeConfigJsonPath(homeDir: string): string {
  return `${getClaudeConfigDir(homeDir)}.json`;
}

export function getHudPluginDir(homeDir: string): string {
  const configDir = getClaudeConfigDir(homeDir);
  
  // Decide whether to use 'agy-hud' or 'claude-hud'
  let pluginName = 'agy-hud';
  
  if (process.env.ANTIGRAVITY_CONFIG_DIR) {
    pluginName = 'agy-hud';
  } else if (process.env.CLAUDE_CONFIG_DIR) {
    pluginName = 'claude-hud';
  } else {
    // Neither env var is set. Check if ~/.gemini/antigravity-cli exists
    const antigravityPath = path.join(homeDir, '.gemini', 'antigravity-cli');
    if (fs.existsSync(antigravityPath)) {
      pluginName = 'agy-hud';
    } else {
      pluginName = 'claude-hud';
    }
  }
  
  return path.join(configDir, 'plugins', pluginName);
}
