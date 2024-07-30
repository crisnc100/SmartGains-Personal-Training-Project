import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext'

const AuthWrapper = ({ children }) => {
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login_page');
        }
    }, [user, navigate]);

    return user ? children : null;
};

export default AuthWrapper;
