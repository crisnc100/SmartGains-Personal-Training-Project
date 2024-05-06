import React from 'react';
import styles from './SideBar.module.css'; 
import { NavLink } from 'react-router-dom';
import {FaHome, FaUserPlus, FaUsers, FaClock, FaBan, FaCalendar, FaBolt} from 'react-icons/fa';

const Sidebar = ( {sidebarToggle }) => {
    return (
        <div className={`${sidebarToggle ? 'hidden' : 'block'} w-64 bg-gray-900 fixed h-full p-4`}
        style={{ top: '0px' }}> {/* Adjust this value to move the sidebar up */}
       <div className='my-2 mb-4'>
                <h1 className='text-2xl text-white font-bold'>Dashboard</h1>
            </div>
            <hr />
            <ul className='mt-4 space-y-2'>
                <li className='rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2'>
                <NavLink to="/trainer_dashboard" className={({ isActive }) => isActive ? 'active link px-3' : 'link px-3'}>
                        <FaHome className="inline-block w-6 h-6 mr-2 -mt-2"></FaHome>
                        Home
                    </NavLink>
                </li>
                <li className='rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2'>
                    <NavLink to='add_client' className='px-3'>
                        <FaUserPlus className="inline-block w-6 h-6 mr-2 -mt-2"></FaUserPlus>
                        Add Client
                    </NavLink>
                </li>
                <li className='rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2'>
                    <NavLink to='all_clients' className='px-3'>
                        <FaUsers className="inline-block w-6 h-6 mr-2 -mt-2"></FaUsers>
                        View All Clients
                    </NavLink>
                </li>
                <li className='rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2'>
                    <NavLink to='' className='px-3'>
                        <FaClock className="inline-block w-6 h-6 mr-2 -mt-2"></FaClock>
                        Pending Approvals
                    </NavLink>
                </li>
                <li className='rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2'>
                    <NavLink to='' className='px-3'>
                        <FaBan className="inline-block w-6 h-6 mr-2 -mt-2"></FaBan>
                        Inactive/Rejected
                    </NavLink>
                </li>
                <li className='rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2'>
                    <NavLink to='' className='px-3'>
                        <FaCalendar className="inline-block w-6 h-6 mr-2 -mt-2"></FaCalendar>
                        Calendar
                    </NavLink>
                </li>
                <li className='rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2'>
                    <NavLink to='' className='px-3'>
                        <FaBolt className="inline-block w-6 h-6 mr-2 -mt-2"></FaBolt>
                        Test The Generator
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;