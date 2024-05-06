import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../../components/SideBar/SideBar';
import styles from './Dashboard.module.css';
import TopBar from '../../../components/TopBar/TopBar';

const Dashboard = () => {
    const [sidebarToggle, setSidebarToggle] = useState(false);  // State to control the visibility of the sidebar

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: 'white' }}>
            <Sidebar sidebarToggle={sidebarToggle} />
            <div className={`flex-1 ${sidebarToggle ? 'ml-0' : 'ml-64'}`}>
                <TopBar 
                    sidebarToggle={sidebarToggle} 
                    setSidebarToggle={setSidebarToggle}
                />
                <main className="p-4">
                    <Outlet /> {/* This will render the selected component based on the route */}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;