/**
 * Mock Stock Data — Investra Platform
 * All Nifty 50 stocks with fallback prices.
 * Used as fallback when Finnhub API is unreachable.
 */

export const MOCK_STOCKS = [
    { symbol: 'RELIANCE', ticker: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy', basePrice: 1272.00, change: 1.42, volume: '14.2M', mktCap: '17.2T' },
    { symbol: 'TCS', ticker: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', basePrice: 3320.00, change: -0.38, volume: '8.9M', mktCap: '12.0T' },
    { symbol: 'HDFCBANK', ticker: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Banking', basePrice: 1860.00, change: 0.91, volume: '22.1M', mktCap: '14.2T' },
    { symbol: 'INFY', ticker: 'INFY', name: 'Infosys Ltd.', sector: 'IT', basePrice: 1430.00, change: -1.12, volume: '11.3M', mktCap: '5.9T' },
    { symbol: 'ICICIBANK', ticker: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Banking', basePrice: 1250.00, change: 2.03, volume: '19.5M', mktCap: '8.8T' },
    { symbol: 'BHARTIARTL', ticker: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Telecom', basePrice: 1680.00, change: 0.55, volume: '7.4M', mktCap: '10.0T' },
    { symbol: 'SBIN', ticker: 'SBIN', name: 'State Bank of India', sector: 'Banking', basePrice: 780.00, change: 1.88, volume: '35.8M', mktCap: '7.0T' },
    { symbol: 'ITC', ticker: 'ITC', name: 'ITC Ltd.', sector: 'FMCG', basePrice: 410.00, change: 1.23, volume: '28.3M', mktCap: '5.1T' },
    { symbol: 'HINDUNILVR', ticker: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'FMCG', basePrice: 2300.00, change: -0.21, volume: '3.8M', mktCap: '5.4T' },
    { symbol: 'LT', ticker: 'LT', name: 'Larsen & Toubro Ltd.', sector: 'Infra', basePrice: 3380.00, change: 0.67, volume: '5.1M', mktCap: '4.6T' },
    { symbol: 'KOTAKBANK', ticker: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', basePrice: 2040.00, change: 0.34, volume: '8.1M', mktCap: '4.1T' },
    { symbol: 'HCLTECH', ticker: 'HCLTECH', name: 'HCL Technologies Ltd.', sector: 'IT', basePrice: 1500.00, change: -0.88, volume: '5.7M', mktCap: '4.1T' },
    { symbol: 'AXISBANK', ticker: 'AXISBANK', name: 'Axis Bank Ltd.', sector: 'Banking', basePrice: 1120.00, change: 1.64, volume: '16.7M', mktCap: '3.5T' },
    { symbol: 'BAJFINANCE', ticker: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Finance', basePrice: 8900.00, change: -2.15, volume: '4.3M', mktCap: '5.5T' },
    { symbol: 'MARUTI', ticker: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Auto', basePrice: 12200.00, change: -0.56, volume: '1.9M', mktCap: '3.8T' },
    { symbol: 'SUNPHARMA', ticker: 'SUNPHARMA', name: 'Sun Pharmaceutical Ltd.', sector: 'Pharma', basePrice: 1730.00, change: -1.45, volume: '6.2M', mktCap: '4.2T' },
    { symbol: 'TITAN', ticker: 'TITAN', name: 'Titan Company Ltd.', sector: 'Consumer', basePrice: 3200.00, change: 0.72, volume: '3.5M', mktCap: '2.8T' },
    { symbol: 'ASIANPAINT', ticker: 'ASIANPAINT', name: 'Asian Paints Ltd.', sector: 'Paints', basePrice: 2260.00, change: 0.98, volume: '2.4M', mktCap: '2.2T' },
    { symbol: 'ULTRACEMCO', ticker: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', sector: 'Infra', basePrice: 10800.00, change: 0.82, volume: '1.2M', mktCap: '3.1T' },
    { symbol: 'WIPRO', ticker: 'WIPRO', name: 'Wipro Ltd.', sector: 'IT', basePrice: 240.00, change: -0.74, volume: '6.6M', mktCap: '2.5T' },
    { symbol: 'ONGC', ticker: 'ONGC', name: 'Oil & Natural Gas Corp.', sector: 'Energy', basePrice: 250.00, change: 3.12, volume: '44.1M', mktCap: '3.1T' },
    { symbol: 'NTPC', ticker: 'NTPC', name: 'NTPC Ltd.', sector: 'Energy', basePrice: 350.00, change: 1.05, volume: '30.2M', mktCap: '3.4T' },
    { symbol: 'POWERGRID', ticker: 'POWERGRID', name: 'Power Grid Corp. of India', sector: 'Energy', basePrice: 290.00, change: 0.48, volume: '18.5M', mktCap: '2.7T' },
    { symbol: 'M&M', ticker: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Auto', basePrice: 2680.00, change: 1.35, volume: '7.8M', mktCap: '3.3T' },
    { symbol: 'TATAMOTORS', ticker: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Auto', basePrice: 680.00, change: -1.20, volume: '25.4M', mktCap: '2.5T' },
    { symbol: 'BAJAJFINSV', ticker: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', sector: 'Finance', basePrice: 1650.00, change: 0.65, volume: '3.2M', mktCap: '2.6T' },
    { symbol: 'TATASTEEL', ticker: 'TATASTEEL', name: 'Tata Steel Ltd.', sector: 'Metals', basePrice: 140.00, change: -0.95, volume: '40.5M', mktCap: '1.7T' },
    { symbol: 'ADANIENT', ticker: 'ADANIENT', name: 'Adani Enterprises Ltd.', sector: 'Conglomerate', basePrice: 2300.00, change: 2.10, volume: '5.6M', mktCap: '2.6T' },
    { symbol: 'ADANIPORTS', ticker: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd.', sector: 'Infra', basePrice: 1180.00, change: 0.88, volume: '8.9M', mktCap: '2.6T' },
    { symbol: 'JSWSTEEL', ticker: 'JSWSTEEL', name: 'JSW Steel Ltd.', sector: 'Metals', basePrice: 920.00, change: -0.42, volume: '9.1M', mktCap: '2.2T' },
    { symbol: 'NESTLEIND', ticker: 'NESTLEIND', name: 'Nestle India Ltd.', sector: 'FMCG', basePrice: 2280.00, change: 0.15, volume: '1.1M', mktCap: '2.2T' },
    { symbol: 'TECHM', ticker: 'TECHM', name: 'Tech Mahindra Ltd.', sector: 'IT', basePrice: 1350.00, change: -1.30, volume: '5.4M', mktCap: '1.3T' },
    { symbol: 'DRREDDY', ticker: 'DRREDDY', name: "Dr. Reddy's Laboratories", sector: 'Pharma', basePrice: 1150.00, change: 0.55, volume: '2.3M', mktCap: '960B' },
    { symbol: 'INDUSINDBK', ticker: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', sector: 'Banking', basePrice: 960.00, change: -1.80, volume: '12.3M', mktCap: '740B' },
    { symbol: 'CIPLA', ticker: 'CIPLA', name: 'Cipla Ltd.', sector: 'Pharma', basePrice: 1420.00, change: 0.30, volume: '4.5M', mktCap: '1.1T' },
    { symbol: 'GRASIM', ticker: 'GRASIM', name: 'Grasim Industries Ltd.', sector: 'Infra', basePrice: 2500.00, change: 0.44, volume: '3.1M', mktCap: '1.6T' },
    { symbol: 'APOLLOHOSP', ticker: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise', sector: 'Healthcare', basePrice: 6800.00, change: 1.10, volume: '1.4M', mktCap: '980B' },
    { symbol: 'EICHERMOT', ticker: 'EICHERMOT', name: 'Eicher Motors Ltd.', sector: 'Auto', basePrice: 4800.00, change: -0.65, volume: '1.5M', mktCap: '1.3T' },
    { symbol: 'DIVISLAB', ticker: 'DIVISLAB', name: "Divi's Laboratories Ltd.", sector: 'Pharma', basePrice: 5700.00, change: 0.28, volume: '1.0M', mktCap: '1.5T' },
    { symbol: 'BPCL', ticker: 'BPCL', name: 'Bharat Petroleum Corp.', sector: 'Energy', basePrice: 290.00, change: 1.75, volume: '15.3M', mktCap: '1.3T' },
    { symbol: 'HEROMOTOCO', ticker: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.', sector: 'Auto', basePrice: 4400.00, change: -0.35, volume: '2.1M', mktCap: '880B' },
    { symbol: 'COALINDIA', ticker: 'COALINDIA', name: 'Coal India Ltd.', sector: 'Energy', basePrice: 390.00, change: 2.40, volume: '18.7M', mktCap: '2.4T' },
    { symbol: 'BRITANNIA', ticker: 'BRITANNIA', name: 'Britannia Industries Ltd.', sector: 'FMCG', basePrice: 5100.00, change: 0.18, volume: '1.3M', mktCap: '1.2T' },
    { symbol: 'TATACONSUM', ticker: 'TATACONSUM', name: 'Tata Consumer Products', sector: 'FMCG', basePrice: 1050.00, change: -0.60, volume: '5.6M', mktCap: '1.0T' },
    { symbol: 'BAJAJ-AUTO', ticker: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', sector: 'Auto', basePrice: 8800.00, change: 0.92, volume: '1.2M', mktCap: '2.5T' },
    { symbol: 'HDFCLIFE', ticker: 'HDFCLIFE', name: 'HDFC Life Insurance Co.', sector: 'Insurance', basePrice: 640.00, change: -0.45, volume: '8.4M', mktCap: '1.4T' },
    { symbol: 'SBILIFE', ticker: 'SBILIFE', name: 'SBI Life Insurance Co.', sector: 'Insurance', basePrice: 1500.00, change: 0.33, volume: '3.2M', mktCap: '1.5T' },
    { symbol: 'HINDALCO', ticker: 'HINDALCO', name: 'Hindalco Industries Ltd.', sector: 'Metals', basePrice: 610.00, change: -1.15, volume: '12.8M', mktCap: '1.4T' },
    { symbol: 'SHRIRAMFIN', ticker: 'SHRIRAMFIN', name: 'Shriram Finance Ltd.', sector: 'Finance', basePrice: 620.00, change: 0.78, volume: '4.5M', mktCap: '780B' },
    { symbol: 'TRENT', ticker: 'TRENT', name: 'Trent Ltd.', sector: 'Consumer', basePrice: 5400.00, change: 1.50, volume: '2.8M', mktCap: '1.9T' },
];

/**
 * Returns a stock by symbol.
 */
export const getStockBySymbol = (symbol) =>
    MOCK_STOCKS.find(s => s.symbol === symbol.toUpperCase());

/**
 * Stable price ticker — fluctuates ±0.3% from basePrice.
 */
export const getDemoPrice = (stock) => {
    const fluctuation = (Math.random() - 0.5) * 0.006;
    return parseFloat((stock.basePrice * (1 + fluctuation)).toFixed(2));
};

/**
 * Generate a list of simulated stock objects ready for display.
 */
export const getMockStockData = (symbols = null) => {
    const source = symbols
        ? MOCK_STOCKS.filter(s => symbols.map(sy => sy.toUpperCase()).includes(s.symbol))
        : MOCK_STOCKS;

    return source.map(stock => {
        const currentPrice = getDemoPrice(stock);
        const changePercent = ((currentPrice - stock.basePrice) / stock.basePrice) * 100;
        return {
            ...stock,
            price: currentPrice,
            change: parseFloat(changePercent.toFixed(2))
        };
    });
};

/**
 * Returns a mock portfolio history for a given timeframe.
 */
export const getMockPortfolioHistory = (days = 30, startValue = 10000) => {
    const points = [];
    let value = startValue;
    const now = Date.now();
    const interval = (days * 24 * 60 * 60 * 1000) / 100;
    for (let i = 0; i <= 100; i++) {
        const tick = (Math.random() - 0.45) * (value * 0.02);
        value = Math.max(value + tick, startValue * 0.6);
        points.push({
            time: new Date(now - (100 - i) * interval).toLocaleDateString(),
            value: parseFloat(value.toFixed(2)),
        });
    }
    return points;
};
