const http = require('http');
const https = require('https');

const TIME_URL = 'https://time.com';

function getTimeStories(callback) {
    https.get(TIME_URL, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            const stories = extractStories(data);
            callback(null, stories);
        });
    }).on('error', (error) => {
        callback(error, null);
    });
}

function extractStories(html) {
    const stories = [];
    const regex = /<h3 class="latest-stories__item-headline">(.*?)<\/h3>.*?href="(.*?)"/gs;

    let match;
    while ((match = regex.exec(html)) !== null && stories.length < 6) {
        stories.push({
            title: match[1].trim(),
            link: match[2]
        });
    }

    return stories;
}

http.createServer((req, res) => {
    if (req.url === '/getTimeStories') {
        getTimeStories((error, stories) => {
            if (error) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(stories));
            }
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
}).listen(3000, () => {
    console.log(`Server is running on port 3000`);
});