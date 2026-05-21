const YF = require('yahoo-finance2').default;
const yahooFinance = new YF();

/**
 * Stock Service — Yahoo Finance (No API key needed)
 * 
 * Uses Yahoo Finance v8 chart endpoint for NSE stock quotes.
 * Symbol format: SYMBOL.NS (e.g., RELIANCE.NS, TCS.NS)
 * Cache TTL: 60 seconds (1-minute refresh)
 */

// ── All Nifty 50 stocks ──
const STOCK_LIST = [
    { symbol: 'RELIANCE', yahooSymbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', sector: 'Energy', fallbackPrice: 1272.00, volume: '14.2M', mktCap: '17.2T' },
    { symbol: 'TCS', yahooSymbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT', fallbackPrice: 3320.00, volume: '8.9M', mktCap: '12.0T' },
    { symbol: 'HDFCBANK', yahooSymbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', sector: 'Banking', fallbackPrice: 1860.00, volume: '22.1M', mktCap: '14.2T' },
    { symbol: 'INFY', yahooSymbol: 'INFY.NS', name: 'Infosys Ltd.', sector: 'IT', fallbackPrice: 1430.00, volume: '11.3M', mktCap: '5.9T' },
    { symbol: 'ICICIBANK', yahooSymbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd.', sector: 'Banking', fallbackPrice: 1250.00, volume: '19.5M', mktCap: '8.8T' },
    { symbol: 'BHARTIARTL', yahooSymbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd.', sector: 'Telecom', fallbackPrice: 1680.00, volume: '7.4M', mktCap: '10.0T' },
    { symbol: 'SBIN', yahooSymbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking', fallbackPrice: 780.00, volume: '35.8M', mktCap: '7.0T' },
    { symbol: 'ITC', yahooSymbol: 'ITC.NS', name: 'ITC Ltd.', sector: 'FMCG', fallbackPrice: 410.00, volume: '28.3M', mktCap: '5.1T' },
    { symbol: 'HINDUNILVR', yahooSymbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd.', sector: 'FMCG', fallbackPrice: 2300.00, volume: '3.8M', mktCap: '5.4T' },
    { symbol: 'LT', yahooSymbol: 'LT.NS', name: 'Larsen & Toubro Ltd.', sector: 'Infra', fallbackPrice: 3380.00, volume: '5.1M', mktCap: '4.6T' },
    { symbol: 'KOTAKBANK', yahooSymbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', sector: 'Banking', fallbackPrice: 2040.00, volume: '8.1M', mktCap: '4.1T' },
    { symbol: 'HCLTECH', yahooSymbol: 'HCLTECH.NS', name: 'HCL Technologies Ltd.', sector: 'IT', fallbackPrice: 1500.00, volume: '5.7M', mktCap: '4.1T' },
    { symbol: 'AXISBANK', yahooSymbol: 'AXISBANK.NS', name: 'Axis Bank Ltd.', sector: 'Banking', fallbackPrice: 1120.00, volume: '16.7M', mktCap: '3.5T' },
    { symbol: 'BAJFINANCE', yahooSymbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd.', sector: 'Finance', fallbackPrice: 8900.00, volume: '4.3M', mktCap: '5.5T' },
    { symbol: 'MARUTI', yahooSymbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd.', sector: 'Auto', fallbackPrice: 12200.00, volume: '1.9M', mktCap: '3.8T' },
    { symbol: 'SUNPHARMA', yahooSymbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Ltd.', sector: 'Pharma', fallbackPrice: 1730.00, volume: '6.2M', mktCap: '4.2T' },
    { symbol: 'TITAN', yahooSymbol: 'TITAN.NS', name: 'Titan Company Ltd.', sector: 'Consumer', fallbackPrice: 3200.00, volume: '3.5M', mktCap: '2.8T' },
    { symbol: 'ASIANPAINT', yahooSymbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd.', sector: 'Paints', fallbackPrice: 2260.00, volume: '2.4M', mktCap: '2.2T' },
    { symbol: 'ULTRACEMCO', yahooSymbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement Ltd.', sector: 'Infra', fallbackPrice: 10800.00, volume: '1.2M', mktCap: '3.1T' },
    { symbol: 'WIPRO', yahooSymbol: 'WIPRO.NS', name: 'Wipro Ltd.', sector: 'IT', fallbackPrice: 240.00, volume: '6.6M', mktCap: '2.5T' },
    { symbol: 'ONGC', yahooSymbol: 'ONGC.NS', name: 'Oil & Natural Gas Corp.', sector: 'Energy', fallbackPrice: 250.00, volume: '44.1M', mktCap: '3.1T' },
    { symbol: 'NTPC', yahooSymbol: 'NTPC.NS', name: 'NTPC Ltd.', sector: 'Energy', fallbackPrice: 350.00, volume: '30.2M', mktCap: '3.4T' },
    { symbol: 'POWERGRID', yahooSymbol: 'POWERGRID.NS', name: 'Power Grid Corp. of India', sector: 'Energy', fallbackPrice: 290.00, volume: '18.5M', mktCap: '2.7T' },
    { symbol: 'M&M', yahooSymbol: 'M%26M.NS', name: 'Mahindra & Mahindra Ltd.', sector: 'Auto', fallbackPrice: 2680.00, volume: '7.8M', mktCap: '3.3T' },
    { symbol: 'TATAMOTORS', yahooSymbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd.', sector: 'Auto', fallbackPrice: 680.00, volume: '25.4M', mktCap: '2.5T' },
    { symbol: 'BAJAJFINSV', yahooSymbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd.', sector: 'Finance', fallbackPrice: 1650.00, volume: '3.2M', mktCap: '2.6T' },
    { symbol: 'TATASTEEL', yahooSymbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd.', sector: 'Metals', fallbackPrice: 140.00, volume: '40.5M', mktCap: '1.7T' },
    { symbol: 'ADANIENT', yahooSymbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd.', sector: 'Conglomerate', fallbackPrice: 2300.00, volume: '5.6M', mktCap: '2.6T' },
    { symbol: 'ADANIPORTS', yahooSymbol: 'ADANIPORTS.NS', name: 'Adani Ports & SEZ Ltd.', sector: 'Infra', fallbackPrice: 1180.00, volume: '8.9M', mktCap: '2.6T' },
    { symbol: 'JSWSTEEL', yahooSymbol: 'JSWSTEEL.NS', name: 'JSW Steel Ltd.', sector: 'Metals', fallbackPrice: 920.00, volume: '9.1M', mktCap: '2.2T' },
    { symbol: 'NESTLEIND', yahooSymbol: 'NESTLEIND.NS', name: 'Nestle India Ltd.', sector: 'FMCG', fallbackPrice: 2280.00, volume: '1.1M', mktCap: '2.2T' },
    { symbol: 'TECHM', yahooSymbol: 'TECHM.NS', name: 'Tech Mahindra Ltd.', sector: 'IT', fallbackPrice: 1350.00, volume: '5.4M', mktCap: '1.3T' },
    { symbol: 'DRREDDY', yahooSymbol: 'DRREDDY.NS', name: "Dr. Reddy's Laboratories", sector: 'Pharma', fallbackPrice: 1150.00, volume: '2.3M', mktCap: '960B' },
    { symbol: 'INDUSINDBK', yahooSymbol: 'INDUSINDBK.NS', name: 'IndusInd Bank Ltd.', sector: 'Banking', fallbackPrice: 960.00, volume: '12.3M', mktCap: '740B' },
    { symbol: 'CIPLA', yahooSymbol: 'CIPLA.NS', name: 'Cipla Ltd.', sector: 'Pharma', fallbackPrice: 1420.00, volume: '4.5M', mktCap: '1.1T' },
    { symbol: 'GRASIM', yahooSymbol: 'GRASIM.NS', name: 'Grasim Industries Ltd.', sector: 'Infra', fallbackPrice: 2500.00, volume: '3.1M', mktCap: '1.6T' },
    { symbol: 'APOLLOHOSP', yahooSymbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals Enterprise', sector: 'Healthcare', fallbackPrice: 6800.00, volume: '1.4M', mktCap: '980B' },
    { symbol: 'EICHERMOT', yahooSymbol: 'EICHERMOT.NS', name: 'Eicher Motors Ltd.', sector: 'Auto', fallbackPrice: 4800.00, volume: '1.5M', mktCap: '1.3T' },
    { symbol: 'DIVISLAB', yahooSymbol: 'DIVISLAB.NS', name: "Divi's Laboratories Ltd.", sector: 'Pharma', fallbackPrice: 5700.00, volume: '1.0M', mktCap: '1.5T' },
    { symbol: 'BPCL', yahooSymbol: 'BPCL.NS', name: 'Bharat Petroleum Corp.', sector: 'Energy', fallbackPrice: 290.00, volume: '15.3M', mktCap: '1.3T' },
    { symbol: 'HEROMOTOCO', yahooSymbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp Ltd.', sector: 'Auto', fallbackPrice: 4400.00, volume: '2.1M', mktCap: '880B' },
    { symbol: 'COALINDIA', yahooSymbol: 'COALINDIA.NS', name: 'Coal India Ltd.', sector: 'Energy', fallbackPrice: 390.00, volume: '18.7M', mktCap: '2.4T' },
    { symbol: 'BRITANNIA', yahooSymbol: 'BRITANNIA.NS', name: 'Britannia Industries Ltd.', sector: 'FMCG', fallbackPrice: 5100.00, volume: '1.3M', mktCap: '1.2T' },
    { symbol: 'TATACONSUM', yahooSymbol: 'TATACONSUM.NS', name: 'Tata Consumer Products', sector: 'FMCG', fallbackPrice: 1050.00, volume: '5.6M', mktCap: '1.0T' },
    { symbol: 'BAJAJ-AUTO', yahooSymbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto Ltd.', sector: 'Auto', fallbackPrice: 8800.00, volume: '1.2M', mktCap: '2.5T' },
    { symbol: 'HDFCLIFE', yahooSymbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance Co.', sector: 'Insurance', fallbackPrice: 640.00, volume: '8.4M', mktCap: '1.4T' },
    { symbol: 'SBILIFE', yahooSymbol: 'SBILIFE.NS', name: 'SBI Life Insurance Co.', sector: 'Insurance', fallbackPrice: 1500.00, volume: '3.2M', mktCap: '1.5T' },
    { symbol: 'HINDALCO', yahooSymbol: 'HINDALCO.NS', name: 'Hindalco Industries Ltd.', sector: 'Metals', fallbackPrice: 610.00, volume: '12.8M', mktCap: '1.4T' },
    { symbol: 'SHRIRAMFIN', yahooSymbol: 'SHRIRAMFIN.NS', name: 'Shriram Finance Ltd.', sector: 'Finance', fallbackPrice: 620.00, volume: '4.5M', mktCap: '780B' },
    { symbol: 'TRENT', yahooSymbol: 'TRENT.NS', name: 'Trent Ltd.', sector: 'Consumer', fallbackPrice: 5400.00, volume: '2.8M', mktCap: '1.9T' },
];

// ── Cache ──
const cache = {
    allStocks: null,
    timestamp: 0,
    singleStocks: {},
};

const CACHE_TTL = 15 * 1000; // 15 seconds (Yahoo Finance fetch interval)

// ── Yahoo Finance Quote Fetcher ──
async function fetchQuoteFromYahoo(yahooSymbol) {
    try {
        const cleanSymbol = yahooSymbol.replace('%26', '&');
        const result = await yahooFinance.quote(cleanSymbol);
        
        if (!result) {
            console.warn(`[StockService] No quote data for ${yahooSymbol}`);
            return null;
        }

        const price = result.regularMarketPrice;
        const prevClose = result.regularMarketPreviousClose || price;
        const change = result.regularMarketChange || 0;
        const changePercent = result.regularMarketChangePercent || 0;

        return {
            price,
            open: result.regularMarketOpen || price,
            high: result.regularMarketDayHigh || price,
            low: result.regularMarketDayLow || price,
            prevClose,
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: result.regularMarketVolume || 0,
            high52w: result.fiftyTwoWeekHigh || price,
            low52w: result.fiftyTwoWeekLow || price,
            rawMktCap: result.marketCap || 0,
            peRatio: result.trailingPE || null,
            divYield: result.dividendYield || null
        };
    } catch (err) {
        console.error(`[StockService] Yahoo error for ${yahooSymbol}:`, err.message);
        return null;
    }
}

// Small delay helper
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Generate fallback data ──
function generateFallbackData(stockMeta) {
    const fluctuation = (Math.random() - 0.5) * 0.006;
    const price = parseFloat((stockMeta.fallbackPrice * (1 + fluctuation)).toFixed(2));
    const changePercent = parseFloat(((price - stockMeta.fallbackPrice) / stockMeta.fallbackPrice * 100).toFixed(2));

    return {
        price,
        open: parseFloat((stockMeta.fallbackPrice * 0.998).toFixed(2)),
        high: parseFloat((stockMeta.fallbackPrice * 1.012).toFixed(2)),
        low: parseFloat((stockMeta.fallbackPrice * 0.988).toFixed(2)),
        prevClose: stockMeta.fallbackPrice,
        change: parseFloat((price - stockMeta.fallbackPrice).toFixed(2)),
        changePercent,
        volume: stockMeta.volume,
        high52w: parseFloat((stockMeta.fallbackPrice * 1.35).toFixed(2)),
        low52w: parseFloat((stockMeta.fallbackPrice * 0.72).toFixed(2)),
        rawMktCap: 0,
        peRatio: 20.0,
        divYield: 1.0,
        isFallback: true,
    };
}

// ── Build stock result object ──
function buildStockResult(stockMeta, quoteData) {
    if (quoteData) {
        return {
            symbol: stockMeta.symbol,
            ticker: stockMeta.symbol,
            name: stockMeta.name,
            sector: stockMeta.sector,
            mktCap: quoteData.rawMktCap > 0 ? formatMarketCap(quoteData.rawMktCap) : stockMeta.mktCap,
            basePrice: stockMeta.fallbackPrice,
            price: quoteData.price,
            open: quoteData.open,
            high: quoteData.high,
            low: quoteData.low,
            high52w: quoteData.high52w,
            low52w: quoteData.low52w,
            peRatio: quoteData.peRatio ? quoteData.peRatio.toFixed(2) : 'N/A',
            divYield: quoteData.divYield ? (quoteData.divYield * 100).toFixed(2) + '%' : 'N/A',
            prevClose: quoteData.prevClose,
            change: quoteData.changePercent,
            volume: quoteData.volume > 0 ? formatVolume(quoteData.volume) : stockMeta.volume,
            isFallback: false,
        };
    } else {
        const fallback = generateFallbackData(stockMeta);
        return {
            symbol: stockMeta.symbol,
            ticker: stockMeta.symbol,
            name: stockMeta.name,
            sector: stockMeta.sector,
            mktCap: stockMeta.mktCap,
            basePrice: stockMeta.fallbackPrice,
            price: fallback.price,
            open: fallback.open,
            high: fallback.high,
            low: fallback.low,
            high52w: fallback.high52w,
            low52w: fallback.low52w,
            peRatio: fallback.peRatio.toFixed(2),
            divYield: fallback.divYield.toFixed(2) + '%',
            prevClose: fallback.prevClose,
            change: fallback.changePercent,
            volume: stockMeta.volume,
            isFallback: true,
        };
    }
}

function formatMarketCap(mcap) {
    if (mcap >= 1e12) return (mcap / 1e12).toFixed(2) + 'T';
    if (mcap >= 1e9) return (mcap / 1e9).toFixed(2) + 'B';
    if (mcap >= 1e6) return (mcap / 1e6).toFixed(2) + 'M';
    return mcap.toString();
}

function formatVolume(vol) {
    if (vol >= 1e7) return (vol / 1e6).toFixed(1) + 'M';
    if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
    if (vol >= 1e3) return (vol / 1e3).toFixed(0) + 'K';
    return vol.toString();
}

/**
 * Fetch all Nifty 50 stocks. Uses cache if valid.
 * Fetches all globally in one optimized Yahoo query.
 */
async function getAllStocks(forceRefresh = false) {
    const now = Date.now();

    if (!forceRefresh && cache.allStocks && (now - cache.timestamp) < CACHE_TTL) {
        const remaining = Math.round((CACHE_TTL - (now - cache.timestamp)) / 1000);
        console.log(`[StockService] Serving from cache (${remaining}s remaining)`);
        return { stocks: cache.allStocks, fromCache: true };
    }

    console.log('[StockService] Cache miss — fetching from Yahoo Finance...');
    
    try {
        const yahooSymbols = STOCK_LIST.map(s => s.yahooSymbol.replace('%26', '&'));
        const quoteResults = await yahooFinance.quote(yahooSymbols);
        
        // Map quotes
        const quoteMap = {};
        for (const data of quoteResults) {
            quoteMap[data.symbol] = data;
        }

        let successCount = 0;
        let fallbackCount = 0;

        const results = STOCK_LIST.map(stockMeta => {
            const data = quoteMap[stockMeta.yahooSymbol.replace('%26', '&')];
            let quoteData = null;
            if (data) {
                successCount++;
                const price = data.regularMarketPrice;
                const prevClose = data.regularMarketPreviousClose || price;
                const change = data.regularMarketChange || 0;
                const changePercent = data.regularMarketChangePercent || 0;
                quoteData = {
                    price,
                    open: data.regularMarketOpen || price,
                    high: data.regularMarketDayHigh || price,
                    low: data.regularMarketDayLow || price,
                    prevClose,
                    change: parseFloat(change.toFixed(2)),
                    changePercent: parseFloat(changePercent.toFixed(2)),
                    volume: data.regularMarketVolume || 0,
                    high52w: data.fiftyTwoWeekHigh || price,
                    low52w: data.fiftyTwoWeekLow || price,
                    rawMktCap: data.marketCap || 0,
                    peRatio: data.trailingPE || null,
                    divYield: data.dividendYield || null
                };
            } else {
                fallbackCount++;
            }
            return buildStockResult(stockMeta, quoteData);
        });

        console.log(`[StockService] Fetch complete: ${successCount} live, ${fallbackCount} fallback`);
        cache.allStocks = results;
        cache.timestamp = now;
        return { stocks: results, fromCache: false };
    } catch (err) {
        console.error('[StockService] Batch Yahoo error:', err.message);
        cache.timestamp = now;
        if (!cache.allStocks) {
            cache.allStocks = STOCK_LIST.map(meta => buildStockResult(meta, null));
        }
        return { stocks: cache.allStocks, fromCache: false };
    }
}

/**
 * Fetch a single stock quote by symbol.
 */
async function getSingleStock(symbol) {
    const upperSymbol = symbol.toUpperCase();

    // Check all-stocks cache first
    if (cache.allStocks && (Date.now() - cache.timestamp) < CACHE_TTL) {
        const found = cache.allStocks.find(s => s.symbol === upperSymbol);
        if (found) return { stock: found, fromCache: true };
    }

    // Check single-stock cache
    const singleCache = cache.singleStocks[upperSymbol];
    if (singleCache && (Date.now() - singleCache.timestamp) < CACHE_TTL) {
        return { stock: singleCache.data, fromCache: true };
    }

    const stockMeta = STOCK_LIST.find(s => s.symbol === upperSymbol);
    if (!stockMeta) {
        return { stock: null, error: 'Stock not found in Nifty 50 list' };
    }

    const quoteData = await fetchQuoteFromYahoo(stockMeta.yahooSymbol);
    const stockData = buildStockResult(stockMeta, quoteData);

    cache.singleStocks[upperSymbol] = { data: stockData, timestamp: Date.now() };
    return { stock: stockData, fromCache: false };
}

/**
 * Get service stats
 */
function getStats() {
    return {
        cacheAge: cache.timestamp ? Math.round((Date.now() - cache.timestamp) / 1000) : null,
        cacheTTL: CACHE_TTL / 1000,
        isCacheValid: !!(cache.allStocks && (Date.now() - cache.timestamp) < CACHE_TTL),
        stockCount: STOCK_LIST.length,
        dataSource: 'Yahoo Finance (no API key required)',
    };
}
/**
 * Fetch financial data from Yahoo Finance quoteSummary.
 */
async function getFinancialData(symbol) {
    const upperSymbol = symbol.toUpperCase();
    const stockMeta = STOCK_LIST.find(s => s.symbol === upperSymbol);
    if (!stockMeta) {
        return { data: null, error: 'Stock not found in Nifty 50 list' };
    }

    try {
        const cleanSymbol = stockMeta.yahooSymbol.replace('%26', '&');
        const summary = await yahooFinance.quoteSummary(cleanSymbol, { modules: ['earnings'] });
        
        const yearly = summary?.earnings?.financialsChart?.yearly || [];
        
        // Transform the data into the format the frontend expects in crores
        const chartData = yearly.map(item => ({
            year: item.date.toString(),
            rev: Math.round(item.revenue / 10000000), // converting to Cr
            prof: Math.round(item.earnings / 10000000), // converting to Cr
            nw: Math.round(item.revenue * 0.4 / 10000000) // Fallback for net worth as it's not present natively
        }));

        return { data: chartData, error: null };
    } catch (err) {
        console.error(`[StockService] Error fetching financials for ${upperSymbol}:`, err.message);
        return { data: null, error: err.message };
    }
}

/**
 * Start background stock updates via Socket.io
 */
function startAutoUpdate(io) {
    console.log('[StockService] Initializing Socket.io broadcast (15s interval)');
    
    setInterval(async () => {
        try {
            const result = await getAllStocks(false); 
            io.emit('stocksUpdate', {
                stocks: result.stocks,
                timestamp: Date.now(),
                fromCache: result.fromCache
            });
        } catch (err) {
            console.error('[StockService] Socket broadcast error:', err.message);
        }
    }, 15000);

    // Also emit immediately when a new client connects
    io.on('connection', async (socket) => {
        const result = await getAllStocks(false);
        socket.emit('stocksUpdate', {
            stocks: result.stocks,
            timestamp: Date.now(),
            fromCache: result.fromCache
        });
    });
}

module.exports = {
    getAllStocks,
    getSingleStock,
    getFinancialData,
    getStats,
    startAutoUpdate,
    STOCK_LIST,
};
