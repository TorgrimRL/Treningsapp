import React, { useState } from 'react';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (event) =>{
        event.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }

        <TODO>backendimplemetation</TODO>
        
        setMessage("Registration successfull, you can now login.");
        setUsername('');
        setPassword('');
        setConfirmPassword('');


    };

    return(
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <label>
                Username:
                    <input 
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}   
                    style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                    />
            </label>    
            <label>
                Password:
                    <input
                    type='password'
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                    />
            </label>
            <label>
                ConfirmPassword:
                <input
                type='password'
                name='confirmpassword'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
                />
            </label>
            <button type='submit' style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor:'pointer'}}>
                Register
            </button>
            {message && <p>{message}</p>}
        </form>
    );
}