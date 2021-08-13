import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export const User = () => {
    const { user, isAuthenticated } = useAuth0();
    console.log(user);
    return (
        <div className="text-white">
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </div>
    )
}
