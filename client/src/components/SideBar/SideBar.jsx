import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUserPlus, FaUsers, FaClock, FaBan, FaCalendar, FaBolt, FaDumbbell, FaAppleAlt, FaClipboardList, FaBookOpen, FaClipboardCheck, FaUtensils, FaBook } from 'react-icons/fa';
const Sidebar = ({ sidebarToggle }) => {
  const [activeTab, setActiveTab] = useState(null);

  const handleToggle = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  return (
    <div className={`${sidebarToggle ? 'hidden' : 'block'} w-72 bg-gray-900 fixed h-full p-4`} style={{ top: '0px' }}>
      <div className='my-2 mb-4'>
        <h1 className='text-2xl text-white font-bold' style={{ fontSize: '26px' }}>Dashboard</h1>
      </div>
      <hr />
      <ul className='mt-4 space-y-2' style={{ fontSize: '17px', color: 'white' }}>
        <li className='rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-3'>
          <NavLink to="/trainer_dashboard" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
            <FaHome className="inline-block w-6 h-6 mr-3 -mt-1" />
            Home
          </NavLink>
        </li>

        <li className='rounded transition duration-300 ease-in-out'>
          <div className='cursor-pointer rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-3 px-4' onClick={() => handleToggle('clients')}>
            <FaUsers className="inline-block w-6 h-6 mr-3 -mt-1" />
            <span>Clients</span>
          </div>
          {activeTab === 'clients' && (
            <ul className='ml-8 mt-2 space-y-1'>
              <li className='hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2 rounded'>
                <NavLink to="add_client" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
                  <FaUserPlus className="inline-block w-5 h-5 mr-2 -mt-1" />
                  Add Client
                </NavLink>
              </li>
              <li className='hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2 rounded'>
                <NavLink to="all_clients" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
                  <FaUsers className="inline-block w-5 h-5 mr-2 -mt-1" />
                  View All Clients
                </NavLink>
              </li>
              <li className='hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2 rounded'>
                <NavLink to="pending_approvals" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
                  <FaClock className="inline-block w-5 h-5 mr-2 -mt-1" />
                  Pending Approvals
                </NavLink>
              </li>
              <li className='hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2 rounded'>
                <NavLink to="inactive_rejected" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
                  <FaBan className="inline-block w-5 h-5 mr-2 -mt-1" />
                  Inactive/Rejected
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        <li className='rounded transition duration-300 ease-in-out'>
          <div className='cursor-pointer rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-3 px-4' onClick={() => handleToggle('workouts')}>
            <FaDumbbell className="inline-block w-6 h-6 mr-3 -mt-1" />
            <span>Workouts</span>
          </div>
          {activeTab === 'workouts' && (
            <ul className='ml-8 mt-2 space-y-1'>
              <li className='hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2 rounded'>
                <NavLink to="workout_plans" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
                  <FaDumbbell className="inline-block w-5 h-5 mr-2 -mt-1" />
                  Workout Plans
                </NavLink>
              </li>
              <li className='hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2 rounded'>
                <NavLink to="exercise-library" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
                  <FaBook className="inline-block w-5 h-5 mr-2 -mt-1" />
                  Exercise Library
                </NavLink>
              </li>
              <li className='hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2 rounded'>
                <NavLink to="workout-logs" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
                  <FaClipboardList className="inline-block w-5 h-5 mr-2 -mt-1" />
                  Workout Logs
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        <li className='rounded transition duration-300 ease-in-out'>
          <div className='cursor-pointer rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-3 px-4' onClick={() => handleToggle('nutrition')}>
            <FaAppleAlt className="inline-block w-6 h-6 mr-3 -mt-1" />
            <span>Nutrition</span>
          </div>
          {activeTab === 'nutrition' && (
            <ul className='ml-8 mt-2 space-y-1'>
              <li className='hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2 rounded'>
                <NavLink to="nutrition-profile" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
                  <FaAppleAlt className="inline-block w-5 h-5 mr-2 -mt-1" />
                  Nutrition Profile
                </NavLink>
              </li>
              <li className='hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2 rounded'>
                <NavLink to="meal_plans" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
                  <FaUtensils className="inline-block w-5 h-5 mr-2 -mt-1" />
                  Meal Plans
                </NavLink>
              </li>
              <li className='hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2 rounded'>
                <NavLink to="nutrition_logs" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
                  <FaClipboardCheck className="inline-block w-5 h-5 mr-2 -mt-1" />
                  Nutrition Logs
                </NavLink>
              </li>
              <li className='hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-2 rounded'>
                <NavLink to="recipe_library" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
                  <FaBook className="inline-block w-5 h-5 mr-2 -mt-1" />
                  Recipe Library
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        <li className='rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-3'>
          <NavLink to="calendar" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
            <FaCalendar className="inline-block w-6 h-6 mr-3 -mt-1" />
            Calendar
          </NavLink>
        </li>

        <li className='rounded hover:shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out py-3'>
          <NavLink to="test_generator" className={({ isActive }) => isActive ? 'active link px-4' : 'link px-4'}>
            <FaBolt className="inline-block w-6 h-6 mr-3 -mt-1" />
            Test The Generator
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
