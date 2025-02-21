import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setIsAuthenticated }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = () => {
        const payload = { email, password };

        axios.post("https://api.escuelajs.co/api/v1/auth/login", payload)
            .then((res) => {
                localStorage.setItem("token", JSON.stringify(res.data.access_token));
                setIsAuthenticated(true);
                navigate("/dashboard"); 
            })
            .catch((err) => {
                alert("Login Failed");
                console.error("Login Failed", err);
            });
    };

    return (
        <div className='bg-white space-y-4 p-5 rounded-md shadow-md m-10 w-72'>
            <h1 className='font-semibold text-lg text-center'>Log In Page</h1>
            <div>
                <p>Email</p>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className='border rounded-md shadow-md' />
            </div>
            <div>
                <p>Password</p>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className='border rounded-md shadow-md' />
            </div>
            <button onClick={handleSubmit} className='bg-blue-600 px-4 py-1 rounded-md shadow-md text-white'>LogIn</button>
        </div>
    );
}

export default Login;
