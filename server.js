const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/scrape', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const entries = [];
    $('.athing').each((index, element) => {
      if (index < 30) {
        const titleElement = $(element).find('.titleline');
        const numberElement = $(element).find('.rank');
        const subtext = $(element).next().find('.subtext');
        const pointsElement = subtext.find('.score');
        const commentsElement = subtext.find('a').last();

        const title = titleElement.text();
        const number = numberElement.text().replace('.', '');
        const points = pointsElement.length ? parseInt(pointsElement.text().replace(' points', '')) : 0;
        const comments = commentsElement.length && commentsElement.text().includes('comment')
          ? parseInt(commentsElement.text().replace(' comments', '').replace(' comment', '')) : 0;

        entries.push({ number, title, points, comments });
      }
    });

    res.json(entries);
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
