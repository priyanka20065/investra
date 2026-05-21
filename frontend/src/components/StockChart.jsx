import { useEffect, useRef, useState } from 'react';
import { createChart, AreaSeries, CandlestickSeries } from 'lightweight-charts';

const StockChart = ({ data, type = 'area', colors: {
    backgroundColor = '#0b0e11',
    lineColor = '#2962FF',
    textColor = '#d1d4dc',
    areaTopColor = '#2962FF',
    areaBottomColor = 'rgba(41, 98, 255, 0.28)',
    upColor = '#26a69a',
    downColor = '#ef5350',
} = {} }) => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const [renderError, setRenderError] = useState(false);

    useEffect(() => {
        if (!chartContainerRef.current || !data || data.length === 0) return;

        let chart;
        const container = chartContainerRef.current;
        
        try {
            const width = container.clientWidth;
            if (width === 0) return;

            chart = createChart(container, {
                layout: {
                    background: { type: 'solid', color: backgroundColor },
                    textColor,
                },
                width: width,
                height: 350,
                grid: {
                    vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
                    horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
                },
                timeScale: {
                    borderColor: 'rgba(197, 203, 206, 0.8)',
                    timeVisible: true,
                },
            });

            chartRef.current = chart;

            let series;
            const options = type === 'candles' ? {
                upColor, downColor,
                borderVisible: false,
                wickUpColor: upColor,
                wickDownColor: downColor,
            } : {
                lineColor,
                topColor: areaTopColor,
                bottomColor: areaBottomColor,
                lineWidth: 2,
            };

            // Smart API Detection for v4/v5
            if (type === 'candles') {
                if (typeof chart.addSeries === 'function' && typeof CandlestickSeries !== 'undefined') {
                    series = chart.addSeries(CandlestickSeries, options);
                } else if (typeof chart.addCandlestickSeries === 'function') {
                    series = chart.addCandlestickSeries(options);
                }
            } else {
                if (typeof chart.addSeries === 'function' && typeof AreaSeries !== 'undefined') {
                    series = chart.addSeries(AreaSeries, options);
                } else if (typeof chart.addAreaSeries === 'function') {
                    series = chart.addAreaSeries(options);
                }
            }

            if (!series) {
                throw new Error(`Chart API mismatch: addSeries method not found for type ${type}`);
            }

            // Sanitization
            const sanitizedData = data.filter(item => {
                const hasTime = item.time !== undefined && item.time !== null;
                if (type === 'candles') {
                    return hasTime && !isNaN(item.open) && !isNaN(item.high) && !isNaN(item.low) && !isNaN(item.close);
                }
                return hasTime && !isNaN(item.value);
            });

            if (sanitizedData.length === 0) throw new Error('No valid chart data available');

            const sorted = [...sanitizedData].sort((a, b) => {
                if (typeof a.time === 'string' && typeof b.time === 'string') {
                    return a.time.localeCompare(b.time);
                }
                const tA = typeof a.time === 'string' ? (new Date(a.time).getTime() || 0) : (Number(a.time) || 0);
                const tB = typeof b.time === 'string' ? (new Date(b.time).getTime() || 0) : (Number(b.time) || 0);
                return tA - tB;
            });

            const uniqueData = [];
            const seenTimes = new Set();
            for (const item of sorted) {
                const timeStr = typeof item.time === 'string' ? item.time : String(item.time);
                if (!seenTimes.has(timeStr)) {
                    uniqueData.push(item);
                    seenTimes.add(timeStr);
                }
            }

            try {
                series.setData(uniqueData);
            } catch (setDataErr) {
                console.error('[StockChart] series.setData failed. Data sample:', uniqueData.slice(0, 5), 'Length:', uniqueData.length);
                throw setDataErr;
            }

            chart.timeScale().fitContent();

            const handleResize = () => {
                if (container && chart) {
                    const newWidth = container.clientWidth;
                    if (newWidth > 0) {
                        chart.applyOptions({ width: newWidth });
                    }
                }
            };

            const resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(container);

            setRenderError(false);

            return () => {
                resizeObserver.disconnect();
                if (chart) chart.remove();
            };
        } catch (err) {
            console.error('[StockChart] Critical Error:', err.message);
            setRenderError(true);
        }
    }, [data, type, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor, upColor, downColor]);

    if (renderError) {
        return (
            <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ef444422', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}>
                Chart temporarily unavailable.
            </div>
        );
    }

    return (
        <div 
            ref={chartContainerRef} 
            style={{ width: '100%', height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color, #2a2e39)', background: backgroundColor, position: 'relative' }} 
        />
    );
};

export default StockChart;
