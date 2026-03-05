/**
 * Kills any process using the specified port before server startup.
 * Usage: node scripts/kill-port.js [port]
 */
const { execSync } = require('child_process');

const port = process.argv[2] || process.env.PORT || 6001;

try {
    if (process.platform === 'win32') {
        // Find PIDs listening on the port
        const result = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        const pids = [...new Set(
            result.split('\n')
                .map(line => line.trim().split(/\s+/).pop())
                .filter(pid => pid && pid !== '0')
        )];
        for (const pid of pids) {
            try {
                execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
                console.log(`✅ Killed process ${pid} on port ${port}`);
            } catch (e) {
                // Process may have already exited
            }
        }
    } else {
        // macOS/Linux
        try {
            execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
            console.log(`✅ Killed process on port ${port}`);
        } catch (e) {
            // No process on port
        }
    }
} catch (e) {
    // No process found on port — all good
    console.log(`✅ Port ${port} is free`);
}
