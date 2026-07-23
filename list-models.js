const key = process.argv[2] || process.env.GEMINI_API_KEY;

if (!key) {
    console.error("Usage: node list-models.js <GEMINI_API_KEY>");
    process.exit(1);
}

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
