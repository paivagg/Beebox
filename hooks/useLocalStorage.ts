import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * Hook customizado para gerenciar estado persistente no localStorage
 * @param key - Chave do localStorage
 * @param initialValue - Valor inicial se não houver dados salvos
 * @returns [value, setValue] - Tupla com valor atual e função para atualizar
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
    // Estado para armazenar o valor
    // Passa função de inicialização para useState para que a lógica só execute uma vez
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            // Buscar do localStorage pela chave
            const item = window.localStorage.getItem(key);
            // Parse do JSON armazenado ou retorna initialValue se não existir
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // Se erro ao fazer parse, retorna initialValue
            console.error(`Error loading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Retorna uma versão wrapped da função setter do useState que
    // persiste o novo valor no localStorage
    const setValue: Dispatch<SetStateAction<T>> = (value) => {
        try {
            // Permite que value seja uma função para que tenhamos a mesma API do useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Salva o estado
            setStoredValue(valueToStore);

            // Salva no localStorage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            // Uma implementação mais robusta poderia lidar com o caso de localStorage cheio
            console.error(`Error saving localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}
