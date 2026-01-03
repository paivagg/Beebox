import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const StoreData: React.FC = () => {
    const navigate = useNavigate();
    const { storeProfile, updateStoreProfile } = useStore();

    const [name, setName] = useState(storeProfile.name);
    const [avatar_url, setAvatarUrl] = useState(storeProfile.avatar_url);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setName(storeProfile.name);
        setAvatarUrl(storeProfile.avatar_url);
    }, [storeProfile]);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            updateStoreProfile({ name, avatar_url });
            setIsSaving(false);
            navigate(-1);
        }, 800);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background">
            <header className="sticky top-0 z-20 flex items-center p-4 pb-2 pt-8 justify-between bg-background/80 backdrop-blur-md md:static md:bg-transparent">
                <button onClick={() => navigate(-1)} className="glass flex size-10 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors md:hidden">
                    <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
                </button>
                <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center drop-shadow-md md:text-left md:text-3xl md:flex-none">Dados da Loja</h1>
                <div className="flex-1 md:hidden"></div>
            </header>

            <main className="flex-1 px-4 pb-12 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profile Picture Editor */}
                    <section className="flex flex-col items-center gap-4 glass-card rounded-3xl p-8 h-fit">
                        <div className="relative group">
                            <div className="h-40 w-40 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 backdrop-blur-md shadow-2xl overflow-hidden">
                                {avatar_url ? (
                                    <img src={avatar_url} alt="Store Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-6xl text-gray-400">storefront</span>
                                )}
                            </div>
                            <label className="absolute bottom-2 right-2 h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors cursor-pointer border-4 border-[#121212]">
                                <span className="material-symbols-outlined text-white">photo_camera</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        <p className="text-sm text-gray-400">Toque para alterar a foto da loja</p>
                    </section>

                    {/* Form Fields */}
                    <section className="space-y-6 glass-card rounded-3xl p-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-1">Nome da Loja</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                                placeholder="Ex: TCG Store"
                            />
                        </div>



                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                        >
                            {isSaving ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">save</span>
                                    Salvar Alterações
                                </>
                            )}
                        </button>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default StoreData;
