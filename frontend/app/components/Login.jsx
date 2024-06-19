import React, {useState} from 'react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) =>{
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/login',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username,password}),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Login successfull');
            } else {
                setMessage(`Login Failed: ${data.message}`)
            }
            
        } catch (error) {
            console.error('Error during login', error);
            setMessage('An error occured during login');
        }
    }


  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <label>
        Username:
        <input 
        type="text" 
        name="Username" 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }} />
      </label>
      <label>
        Password:
        <input
        type="password" 
        name="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)} 
        style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }} />
      </label>
      <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
        Login
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}

