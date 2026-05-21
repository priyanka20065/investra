import { useEffect, useRef, useState } from 'react';
import { createChart, HistogramSeries } from 'lightweight-charts';

const FinancialsOverviewChart = ({ data, type = 'Revenue' }) => {
    const chartContainerRef = useRef();
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
                    background: { type: 'solid', color: 'transparent' },
                    textColor: '#94a3b8',
                    fontSize: 12,
                },
                width: width,
                height: 250,
                grid: {
                    vertLines: { visible: false },
                    horzLines: { color: 'rgba(42, 46, 57, 0.3)' },
                },
                timeScale: {
                    visible: true,
                    borderVisible: false,
                },
                rightPriceScale: {
                    borderVisible: false,
                },
                handleScroll: false,
                handleScale: false,
            });

            let series;
            const options = {
                color: type === 'Revenue' ? '#3b82f6' : type === 'Profit' ? '#10b981' : '#f59e0b',
                priceFormat: {
                    type: 'volume',
                },
            };

            // Smart detection
            if (typeof chart.addSeries === 'function' && typeof HistogramSeries !== 'undefined') {
                series = chart.addSeries(HistogramSeries, options);
            } else if (typeof chart.addHistogramSeries === 'function') {
                series = chart.addHistogramSeries(options);
            }

            if (!series) throw new Error('Histogram series initialization failed');

            // Map data
            const rawData = data.map(d => ({
                time: `${d.year}-01-01`,
                value: type === 'Revenue' ? d.rev : type === 'Profit' ? d.prof : d.nw,
            })).filter(item => !isNaN(item.value));

            if (rawData.length === 0) throw new Error('No valid financial data');

            // Sort and Dedup
            const sorted = [...rawData].sort((a, b) => {
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

            series.setData(uniqueData);
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
            console.error('[FinancialsChart] Error:', err.message);
            setRenderError(true);
        }
    }, [data, type]);

    if (renderError) {
        return (
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ef444422', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', background: '#ef444405' }}>
                Financial visualization temporarily unavailable.
            </div>
        );
    }

    return (
        <div 
            ref={chartContainerRef} 
            style={{ 
                width: '100%', 
                height: '250px',
                marginTop: '1rem',
                position: 'relative'
            }} 
        />
    );
};

export default FinancialsOverviewChart;
