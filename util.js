const cheerio = require('cheerio')
// require('isormorphic-fetch')

async function getCheerio$(request) {
    const response = await fetch(request);
    const html = await response.text();
    return cheerio.load(html, { decodeEntities: false });
}

module.exports = { getCheerio$ }