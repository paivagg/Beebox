import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user, login, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('Enviando link mágico...');
        const { error } = await login(email);
        setIsLoading(false);
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
        <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 mb-6 shadow-2xl shadow-primary/10">
                        <span className="material-symbols-outlined text-5xl text-primary">style</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
                        TCG Manager
                    </h1>
                    <p className="text-gray-400 font-medium">Gestão profissional para sua loja</p>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Seu Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">mail</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="glass-input w-full p-4 pl-12 rounded-2xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="exemplo@loja.com"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-orange-600 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            ) : (
                                <>
                                    <span>Entrar com Magic Link</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    {message && (
                        <div className={`mt-6 p-4 rounded-2xl text-sm text-center font-medium ${message.includes('Erro') ? 'bg-negative/10 text-negative border border-negative/20' : 'bg-positive/10 text-positive border border-positive/20'}`}>
                            {message}
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <button
                            onClick={handleGuestLogin}
                            className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <span className="material-symbols-outlined text-lg">person_search</span>
                            Continuar como Convidado (Dev)
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-gray-600 font-medium uppercase tracking-widest">
                    &copy; 2025 TCG Store Manager Pro
                </p>
            </div>
        </div>
    );
};

export default Login;
