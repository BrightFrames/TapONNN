const http = require('http');

const check = (path) => {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:5000${path}`, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                console.log(`[${res.statusCode}] ${path}`);
                if (res.statusCode !== 200) {
                    console.log('Body:', data.substring(0, 300));
                }
                resolve();
            });
        });
        req.on('error', (e) => {
            console.log(`[Error] ${path}: ${e.message}`);
            resolve();
        });
    });
};

(async () => {
    console.log('Testing Backend API...');
    await check('/api/profile/store/vivek');
    await check('/api/profile/vivek');
    await check('/api/profile/store/johndoe'); // Seed user
})();
