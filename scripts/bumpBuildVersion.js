const fs = require('fs');
const path = require('path');

const versionFile = path.resolve(__dirname, '..', 'build-version.txt');

function readCurrentVersion() {
    try {
        const raw = fs.readFileSync(versionFile, 'utf8').trim();
        const parsed = Number.parseInt(raw, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return 0;
        }
        throw error;
    }
}

const nextVersion = readCurrentVersion() + 1;
fs.writeFileSync(versionFile, `${nextVersion}\n`, 'utf8');
console.log(`Build version: ${nextVersion}`);
