const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

// Endpoint to scrape a provided URL
app.get('/scrape', async (req, res) => {
    const url = req.query.url;
  
    // Validate if the URL parameter is provided
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
  
    try {
      // Fetch the HTML of the URL
      const { data } = await axios.get(url);
  
      // Load the HTML into Cheerio for parsing
      const $ = cheerio.load(data);
  
      const entries = [];
      
      // Select all items with the class 'athing'
      $('.athing').each((index, element) => {
        if (index < 30) {
          const titleElement = $(element).find('.titleline');
          const numberElement = $(element).find('.rank');
          const subtext = $(element).next().find('.subtext');
          const pointsElement = subtext.find('.score');
          const commentsElement = subtext.find('a').last();
  
          // Extract and process the required data
          const title = titleElement.text();
          const number = numberElement.text().replace('.', '');
          const points = pointsElement.length ? parseInt(pointsElement.text().replace(' points', '')) : 0;
          const comments = commentsElement.length && commentsElement.text().includes('comment')
            ? parseInt(commentsElement.text().replace(' comments', '').replace(' comment', '')) : 0;
  
          // Push the extracted data into the entries array
          entries.push({ number, title, points, comments });
        }
      });
  
      // Respond with the extracted entries
      res.json(entries);
    } catch (error) {
      // Log and respond with an error if something goes wrong
      console.error('Error during scraping:', error);
      res.status(500).json({ error: error.message });
    }
  });

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
