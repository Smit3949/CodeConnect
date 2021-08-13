import React from 'react'
import { useAuth0 } from '@auth0/auth0-react';

export default function Logout() {
    const { logout } = useAuth0();
    return (
        <div className="text-white mx-1">
            <button onClick={() => { logout() }}>Logout</button>
        </div>
    )
}
