import React from 'react';

export default function Login() {
  return (
    <form style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <label>
        Username:
        <input type="text" name="Username" style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }} />
      </label>
      <label>
        Password:
        <input type="password" name="Password" style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }} />
      </label>
      <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
        Login
      </button>
    </form>
  );
}
