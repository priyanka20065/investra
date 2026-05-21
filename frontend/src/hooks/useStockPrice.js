import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getMockStockData } from '../data/mockStocks';

const API_BASE = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5005';

/**
 * useStockPrice — Listens for live stock data via WebSockets (Socket.io).
 * Replaces the old HTTP polling method for better performance and instant updates.
 */
const useStockPrice = (symbols) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fromCache, setFromCache] = useState(false);
    const [isLive, setIsLive] = useState(false);

    // Use a ref to avoid re-creating the interval when symbols change identity but not content
    const symbolsRef = useRef(symbols);
    symbolsRef.current = symbols;

    useEffect(() => {
        if (!symbols || symbols.length === 0) {
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        // Initialize Socket.io connection with auth token
        const socket = io(API_BASE, {
            auth: { token }
        });

        socket.on('connect', () => {
            console.log('[useStockPrice] Connected to WebSocket');
        });

        socket.on('stocksUpdate', (payload) => {
            const { stocks, fromCache: cacheStatus } = payload;

            if (stocks && stocks.length > 0) {
                const currentSymbols = symbolsRef.current;
                let filtered = stocks;

                if (currentSymbols && currentSymbols.length > 0) {
                    const symbolSet = new Set(currentSymbols.map(s => s.toUpperCase()));
                    filtered = stocks.filter(s => symbolSet.has(s.symbol));
                }

                setData(filtered);
                setFromCache(cacheStatus);
                setIsLive(!stocks[0]?.isFallback);
                setError(null);
                setLoading(false);
            }
        });

        socket.on('connect_error', (err) => {
            console.warn('[useStockPrice] WebSocket error, using mock data:', err.message);
            // Fallback to mock data on connection failure
            setData(getMockStockData(symbolsRef.current));
            setIsLive(false);
            setLoading(false);
        });

        return () => {
            console.log('[useStockPrice] Disconnecting WebSocket');
            socket.disconnect();
        };
    }, [symbols]);

    return { data, loading, error, fromCache, isLive };
};

export default useStockPrice;