const { spawn } = require('child_process');
const os = require('os');

console.log("==========================================");
console.log("      Social Auditor AI Framework         ");
console.log("==========================================");
console.log("Starting up the local Next.js server...");
console.log("");

// Run npm run dev in the current directory
const npmProcess = spawn('npm', ['run', 'dev'], {
    shell: true,
    stdio: 'inherit'
});

// Wait 4 seconds for the server to spin up, then open browser
setTimeout(() => {
    console.log("Opening dashboard in your default browser...");
    const url = 'http://localhost:3000';
    const startCmd = os.platform() === 'win32' ? `start ${url}` : `open ${url}`;
    spawn(startCmd, { shell: true });
}, 4000);
