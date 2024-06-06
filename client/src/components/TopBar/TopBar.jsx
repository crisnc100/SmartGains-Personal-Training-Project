import React, {useState, useEffect, useRef} from 'react';
import { FaSearch, FaBars, FaBell, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './TopBar.module.css'; 
import logo_horziontal from '../../assets/logo_horziontal.png';





const TopBar = ({ sidebarToggle, setSidebarToggle, sidebarWidth }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null); 

    const toggleDropdown = () => setIsOpen(!isOpen);
    const closeDropdown = () => setIsOpen(false);

    useEffect(() => {
      const handleClickOutside = (event) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
              closeDropdown();
          }
      };

      // Bind the event listener
      if (isOpen) {
          window.addEventListener('click', handleClickOutside);
      }
      return () => {
          // Unbind the event listener on clean up
          window.removeEventListener('click', handleClickOutside);
      };
  }, [isOpen]);
  const handleLogout = async () => {
    try {
        await axios.post('http://localhost:5000/api/logout_trainer', {}, {withCredentials: true});
        navigate('/')
    } catch (error) {
        console.error('Logout failed', error);
    }
  };
  

  
  return (
    <nav className='bg-gray-900 px-4 py-3 flex relative' style={{ height: '60px' }}>
    <div style={{ 
        position: 'absolute', 
        display: 'flex', 
        alignItems: 'center',
    }}>
       <FaBars onClick={() => setSidebarToggle(!sidebarToggle)}
        className='text-white mr-4 cursor-pointer' size={26} />
<span className={styles.brand}>
        <img src={logo_horziontal} alt="SmartGains Logo" />
</span>
    </div>
      <div style={{ flex: 1.0 }}></div> 
      <div style={{ flex: 1.0 }}></div>
      <div className='flex items-center gap-x-5'>
        <div className='relative md:w-65'>
          <span className='relative md:absolute inset-y-0 left-0 flex items-center pl-2'>
            <button className='p-1 focus:outline-none text-white md:text-black'><FaSearch /></button>
          </span>
          <input type='text' className='w-full px-4 py-1 pl-12 rounded shadow outline-none hidden md:block'></input>
        </div>
        
        <div ref={dropdownRef} className='relative'>
            <button className='text-white group relative' onClick={toggleDropdown} style={{ fontSize: '18px', lineHeight: '24px' }}>
                <FaUserCircle className='w-8 h-8 mt-1' />
            </button>
            {isOpen && (
                <div className='absolute right-0 w-48 bg-white rounded-lg shadow-lg mt-2 z-20' style={{color: 'white'}}>
                    <ul className='py-2 bg-gray-900'>
                        <li className='hover:bg-blue-600'>
                            <NavLink to='edit-profile' onClick={closeDropdown} className='block px-4 py-2'>Edit Profile</NavLink>
                        </li>
                        <li className='hover:bg-blue-600'>
                        <NavLink to='settings' onClick={closeDropdown} className='block px-4 py-2'>Settings</NavLink>
                        </li>
                        <li><hr /></li>
                        <li className='hover:bg-red-600'>
                              <button onClick={() => { closeDropdown(); handleLogout(); }} className='block px-4 py-2 text-white w-full text-left'>Logout</button>
                          </li>
                    </ul>
                </div>
            )}
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
