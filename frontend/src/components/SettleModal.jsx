import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';

const SettleModal = () => {
    const { showSettleModal, setShowSettleModal, settleFunds, balance } = useMarket();
    const [settleAmount, setSettleAmount] = useState('1000');

    if (!showSettleModal) return null;

    const handleSettleSubmit = () => {
        const amount = Number(settleAmount);
        if (amount > balance) {
            // Toast handled in settleFunds but good to have local check
            return;
        }
        settleFunds(amount);
    };

    return (
        <div className="modal-overlay" onClick={() => setShowSettleModal(false)} style={{ zIndex: 9999 }}>
            <div className="buy-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Settle Funds</h2>
                        <p className="modal-subtitle">Transfer funds to your account</p>
                    </div>
                    <button className="modal-close" onClick={() => setShowSettleModal(false)}>✕</button>
                </div>
                <div className="modal-qty-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span className="modal-label">Available for Settlement</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>₹{balance.toLocaleString()}</span>
                    </div>
                    <label className="modal-label">Amount to Withdraw (INR)</label>
                    <input
                        type="number"
                        value={settleAmount}
                        onChange={e => setSettleAmount(e.target.value)}
                        max={balance}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginTop: '5px',
                            borderRadius: '5px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>Net to Account</span>
                            <span style={{ color: '#22c55e' }}>₹{Number(settleAmount).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <button
                    className="modal-buy-btn"
                    style={{ background: '#3b82f6' }}
                    onClick={handleSettleSubmit}
                >
                    Confirm Settlement
                </button>
            </div>
        </div>
    );
};

export default SettleModal;
