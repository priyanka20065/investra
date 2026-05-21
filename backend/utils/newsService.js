const Parser = require('rss-parser');
const parser = new Parser();
const { STOCK_LIST } = require('./stockService');

// Simple in-memory cache for news
const newsCache = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache for news

async function getStockNews(symbol) {
    const defaultQuery = symbol + ' stock market India';
    
    // Find the company name for better search results
    const upperSymbol = symbol.toUpperCase();
    const stockMeta = STOCK_LIST.find(s => s.symbol === upperSymbol);
    const query = stockMeta ? `${stockMeta.name} stock` : defaultQuery;

    // Check cache
    if (newsCache[upperSymbol] && (Date.now() - newsCache[upperSymbol].timestamp) < CACHE_TTL) {
        return newsCache[upperSymbol].data;
    }

    try {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
        const feed = await parser.parseURL(url);
        
        // Take top 5 news
        const newsItems = feed.items.slice(0, 5).map(item => {
            // Clean up source name from title (Google News appends " - Publisher" to title)
            const parts = item.title.split(' - ');
            const source = parts.length > 1 ? parts.pop() : 'Web Source';
            const cleanTitle = parts.join(' - ');

            return {
                title: cleanTitle,
                link: item.link,
                source: source,
                time: timeAgo(new Date(item.pubDate)),
                pubDate: item.pubDate
            };
        });

        newsCache[upperSymbol] = {
            data: newsItems,
            timestamp: Date.now()
        };

        return newsItems;
    } catch (err) {
        console.error(`[NewsService] Error fetching news for ${symbol}:`, err.message);
        throw new Error('Failed to fetch news');
    }
}

// Helper to format time
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

module.exports = {
    getStockNews
};
