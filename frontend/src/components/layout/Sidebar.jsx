import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useMarket } from "../../context/MarketContext";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import "./Sidebar.css";

const Sidebar = ({ isOpen }) => {
  const {
    balance,
    fetchData,
    setShowFundingModal,
    setShowSettleModal,
    currentMode,
    isRealMode,
    toggleMode,
  } = useMarket();
  const { isDarkMode, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleResetDemo = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset your demo account? This will clear all holdings, orders, and reset balance to ₹10,000."
      )
    )
      return;

    try {
      const res = await api.post("/trade/reset-demo");
      if (res.success) {
        showToast("Demo account reset successfully!", "success");
        fetchData();
      }
    } catch (err) {
      showToast("Failed to reset demo account: " + err.message, "error");
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">TS</div>
        {isOpen && <span className="logo-text">Investra </span>}
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="icon">📊</span>
          {isOpen && <span className="label">Dashboard</span>}
        </NavLink>
        <NavLink
          to="/markets"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="icon">📈</span>
          {isOpen && <span className="label">Markets</span>}
        </NavLink>
        <NavLink
          to="/portfolio"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="icon">💼</span>
          {isOpen && <span className="label">Portfolio</span>}
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="icon">📝</span>
          {isOpen && <span className="label">Orders</span>}
        </NavLink>
        <NavLink
          to="/watchlist"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="icon">⭐</span>
          {isOpen && <span className="label">Watchlist</span>}
        </NavLink>
        <div className="sidebar-divider"></div>
        {currentMode === "DEMO" && (
          <NavLink
            to="/mentor"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="icon">🧠</span>
            {isOpen && <span className="label">VEGA AI</span>}
          </NavLink>
        )}
      </nav>

      {isOpen && (
        <div className="sidebar-footer">
          <div className="demo-balance-card-small">
            <div className="db-header">
              <span>{currentMode === "REAL" ? "LIVE MODE" : "DEMO MODE"}</span>
              <span className="info-icon">i</span>
            </div>
            <div className="db-amount">
              ₹{balance?.toLocaleString() || "0.00"}
            </div>
            {currentMode === "REAL" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                <button
                  className="add-funds-btn"
                  onClick={() => setShowFundingModal(true)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Add Funds
                </button>
                <button
                  onClick={toggleMode}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text-modest)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Switch to DEMO Mode
                </button>
                <button
                  className="settle-funds-btn"
                  onClick={() => setShowSettleModal(true)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "rgba(59, 130, 246, 0.2)",
                    color: "#3b82f6",
                    border: "1px solid #3b82f6",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Settle Funds
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                <button className="reset-funds-btn" onClick={handleResetDemo}>
                  Reset Demo Funds
                </button>
                <button
                  onClick={toggleMode}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text-modest)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                    marginTop: "4px"
                  }}
                >
                  Switch to REAL Mode
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
