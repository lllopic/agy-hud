import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Support ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const pluginJsonPath = path.join(rootDir, '.antigravity-plugin', 'plugin.json');
const marketplaceJsonPath = path.join(rootDir, '.antigravity-plugin', 'marketplace.json');

// Helper to read and parse JSON
function readJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading/parsing ${filePath}:`, error);
    process.exit(1);
  }
}

// Helper to write JSON formatted with 2 spaces and trailing newline
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    process.exit(1);
  }
}

// 1. Read package.json version
const packageJson = readJson(packageJsonPath);
const targetVersion = packageJson.version;

if (!targetVersion) {
  console.error('No version found in package.json');
  process.exit(1);
}

console.log(`Syncing project versions to: ${targetVersion}`);

let updatedAny = false;

// 2. Sync plugin.json
if (fs.existsSync(pluginJsonPath)) {
  const pluginJson = readJson(pluginJsonPath);
  if (pluginJson.version !== targetVersion) {
    console.log(`Updating ${pluginJsonPath} version from ${pluginJson.version} to ${targetVersion}`);
    pluginJson.version = targetVersion;
    writeJson(pluginJsonPath, pluginJson);
    updatedAny = true;
  } else {
    console.log(`${pluginJsonPath} is already up to date.`);
  }
} else {
  console.warn(`Warning: ${pluginJsonPath} does not exist.`);
}

// 3. Sync marketplace.json
if (fs.existsSync(marketplaceJsonPath)) {
  const marketplaceJson = readJson(marketplaceJsonPath);
  if (!marketplaceJson.metadata) {
    marketplaceJson.metadata = {};
  }
  if (marketplaceJson.metadata.version !== targetVersion) {
    console.log(`Updating ${marketplaceJsonPath} version from ${marketplaceJson.metadata.version} to ${targetVersion}`);
    marketplaceJson.metadata.version = targetVersion;
    writeJson(marketplaceJsonPath, marketplaceJson);
    updatedAny = true;
  } else {
    console.log(`${marketplaceJsonPath} is already up to date.`);
  }
} else {
  console.warn(`Warning: ${marketplaceJsonPath} does not exist.`);
}

if (updatedAny) {
  console.log('Successfully synchronized all version numbers!');
} else {
  console.log('All files are already synchronized.');
}
