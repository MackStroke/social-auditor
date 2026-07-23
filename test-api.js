const fs = require('fs');

async function testApi() {
    try {
        const res = await fetch("http://localhost:3000/api/audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
                copy: "Test ad copy",
                platform: "Meta"
            })
        });

        const text = await res.text();
        console.log("STATUS:", res.status);
        console.log("RESPONSE:", text);
    } catch (err) {
        console.error("FETCH ERROR:", err);
    }
}

testApi();
