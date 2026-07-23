const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/GEMINI_API_KEY=(.*)/)[1].trim();

async function fetchRawModels() {
    try {
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + key);
        const data = await res.json();
        console.log(data);
    } catch (e) {
        console.error(e);
    }
}

fetchRawModels();
