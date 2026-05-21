import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';

const FundingModal = () => {
    const { showFundingModal, setShowFundingModal, handleFundingSubmit } = useMarket();
    const [fundingAmount, setFundingAmount] = useState('5000');

    if (!showFundingModal) return null;

    return (
        <div className="modal-overlay" onClick={() => setShowFundingModal(false)} style={{ zIndex: 9999 }}>
            <div className="buy-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Add Funds</h2>
                        <p className="modal-subtitle">Secure Razorpay Transfer</p>
                    </div>
                    <button className="modal-close" onClick={() => setShowFundingModal(false)}>✕</button>
                </div>
                <div className="modal-qty-section">
                    <label className="modal-label">Amount (INR)</label>
                    <input
                        type="number"
                        value={fundingAmount}
                        onChange={e => setFundingAmount(e.target.value)}
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
                </div>
                <button
                    className="modal-buy-btn"
                    style={{ background: '#16a34a' }}
                    onClick={() => handleFundingSubmit(fundingAmount)}
                >
                    Proceed to Pay
                </button>
            </div>
        </div>
    );
};

export default FundingModal;
