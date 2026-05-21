import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import FundingModal from '../FundingModal';
import SettleModal from '../SettleModal';
import './Layout.css';

const Layout = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="layout-container">
            <Sidebar isOpen={isSidebarOpen} />
            <FundingModal />
            <SettleModal />
            <div className={`main-content-wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
                <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
