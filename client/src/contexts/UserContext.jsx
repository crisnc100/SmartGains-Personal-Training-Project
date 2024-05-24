import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        // Fetch user data only if user is authenticated
        const fetchUserData = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/get_trainer_id', { withCredentials: true });
                if (data && data.trainer) {
                    setUser(data.trainer);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                // Set loading state to false once data fetching is complete
                setLoading(false);
            }
        };

        const isAuthenticated = checkAuthentication(); // Implemented authentication check logic
        if (isAuthenticated) {
            fetchUserData(); // Fetch user data only if authenticated
        } else {
            setLoading(false); // Set loading state to false if not authenticated
        }
    }, []);

    const checkAuthentication = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        return !!token;
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <UserContext.Provider value={{ user, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};
