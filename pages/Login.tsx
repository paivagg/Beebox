import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const { user, login, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Enviando link mágico...');
        const { error } = await login(email);
        if (error) {
            setMessage('Erro ao enviar login: ' + error.message);
        } else {
            setMessage('Verifique seu email para o link de login!');
        }
    };

    const handleGuestLogin = () => {
        loginAsGuest();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">TCG Store Manager</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                    >
                        Entrar com Magic Link
                    </button>
                </form>
                {message && (
                    <p className="mt-4 text-center text-sm text-gray-300">{message}</p>
                )}
                <div className="mt-6 text-center">
                    <button onClick={handleGuestLogin} className="text-xs text-gray-500 hover:text-gray-300">
                        Continuar como Convidado (Dev)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
