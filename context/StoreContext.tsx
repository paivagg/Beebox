
import React, { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Player, Product, Event, Transaction, EventParticipant, StoreProfile, StoreSettings } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { validateProduct, validateEvent, validatePlayer, validateStock } from '../utils/validators';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants';

// Mock Data
const INITIAL_PLAYERS: Player[] = [
  {
    id: '12345678',
    name: "Alexandre 'Asmoran' Silva",
    nickname: 'Asmoran',
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6WkR7vBeX2Qpp_UhAtk7NMbVK-3kcvXtmrVRXfMy-wiIXEjO1ZQe_HQ3NBzgqHOwiV85adcxUp8Og0vtSdOxZjACz_sU_TKFCcOe8ivUTTCMMQD-g9zUk1tFtegE5MxMkBV5rJ83xPKnC-s0-zDjT7qD82HTXBhQ6L9lelyfR322QqiapHMJsM3TdeRIqj45W-XnaBbM-OdVxOakvpVj6TsgM-PN3YHMJMXxA2aAka-E5lkZD_h-fOma3bwMEXLBjCwX8ZLQDVPk",
    balance: 250.00,
    dci: '219873645',
    lastActivity: new Date().toISOString()
  },
  {
    id: '87654321',
    name: "Bruna 'QueenB' Oliveira",
    nickname: 'QueenB',
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDillqv2byES44FlhRbug2RbacVjjIWR-UvarDtrwGxyVy0gyNUJBfexnbsYn7LUhMf_sjzNESoYwAUWaP-yLIMnu3Yy_4J1QaCgdQWrdX1nbGSbR8yGlpfHPEnLEuPBBQ9SGL0OHIllCfRJ7kyKj_VVV5jB-o5yBYexbU6TeISg0TyNAkj6lR8XCnTUt76Kzw6KmRc3WB8Q3eGZcUicrZ_or7Dd3b304c9qKnFxIC5oM0r_bLmaKCU9_gzxJtXmFhugl73NcEiTsw",
    balance: 120.50,
    dci: '876543210',
    lastActivity: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '11223344',
    name: "Carlos 'TheStrategist' Pereira",
    nickname: 'TheStrategist',
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSzNt-g8CfRC9emCaNYverAa2GD-wyqSZsNy5Fq63HxMrLVFaQsQrTFfcWlwJDVufvq8s8mWgVD941e-Ji0ogEdrTu2mzlu6PEOF1_RdshWwc1ez7PW-iUKLXtVxArXUhlhxKy4pH157gBN0gNjP02QFnRxFgBkRFfYOctECr-jZo6kpzTDG4UMCeM0RVZSQNCOsJGg8dzk9pOhMcLg3HXIG9rk4SpRsB2UEHwKT2oIbn9ppXNlXk8p8v_9B9Vvm9O6KkTUbGYwco",
    balance: 45.00,
    dci: '112233445',
    lastActivity: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '55667788',
    name: "Daniela 'Dani' Costa",
    nickname: 'Dani',
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM8wXoHHguWbvH1GHv-eG64_x6lbsWN-zDcAkckmqze9Px5KWsmvw4UU2zNnT1zQCpQp9KyVYfYpHHY2OD9-YFYPMtUuTHXpgP9yiWsmP4ybb42thSA6jI5FhgxlvM9x80XjtAFcRWzNYiPDeSuEys0Jd2PfVgOWFzUV-19vaqcgnVXDIIfcVqP4t8Dqgmr96B2aL0xvTMQqBUKLmvPNtWWupDun23wxvqGvDniZdtEZDam4WZ0-ra0BYoWPIIXirtWdgVqHlQVlY",
    balance: 0.00,
    dci: '556677889',
    lastActivity: new Date(Date.now() - 400000000).toISOString()
  },
  {
    id: '99887766',
    name: "Eduardo 'EagleEye' Mendes",
    nickname: 'EagleEye',
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRn8iogdYJCm_hNSIGNrINfFLqfa_YnGR9NGdra665KKiZj9olbsGhGvTYdyoGTZvOfLH-TQXNWTd9ra8R13vg4FvO2kMzeHorQOjynxubguSqkJraJ-onM6dnLBVOtPm2f0mR3CgXfj00EK9mYjfj_drGaql_AeSrMGyelCZq4DMwuMYK6kb2ufodNwR2Ro5-efIu_HBDKLxevgVBLR8r_En0EN5N1N_yKzdLAKhy4NNgZRGzcYcyoENe2vgfbbXrR5dKi1UAlEA",
    balance: -15.00,
    dci: '998877667',
    lastActivity: new Date(Date.now() - 200000).toISOString()
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Booster Coleção Escarlate e Violeta',
    category: 'TCG',
    stock: 15,
    price: 39.90,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrlE7lioiwz9HuxAdcgf1p2tqfPFwYRRtPt0IQ38z7fj4iTE7Iw-rUc_phkEXhA3lxcvr_EUqBI0pUpX-1COoQVnrnTY-EnqgolWs_S0q0twhfqRWpvPgb7rmuRYfAo05sI3h09hIh78jvJjNchD4uLgM-IFyY8bZWd5_QUi5qLJeXV9lNVrUbpvEaMV7aWnCGRiOuXG9bHf_Fgk3FASxPWV2ZjIKeiBG58C4sHvNSAMxcd7k8vS1NmoOlS-5bw-NXBHdychiFjQw"
  },
  {
    id: '2',
    name: 'Magic: The Gathering Commander Deck',
    category: 'TCG',
    stock: 3,
    price: 249.90,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD78GxStdVPa9jNfkngm1tyX_NGK_g9e3SkZ93yHgS2a2qfYsloBaN0cyQnQmfEEOZfpaNJtzjqXG1upWJ3mrbmGikO9jzYtJXb-Q4lrAQ8LLJS9qkdMqHKc49r6s6eoQ602gUBA9E8R1aDmXy_cCRZ7PHg4xkEUtug9S6nyIyggbfNdJsVqQdq_dASYdPXvXoIr-J6XN0L6zCVB1GEtfxKuWn_VqnCjXhEzm9-KeaiwFysZaFRgT42jbGczD7axw0bwKCWUl4baxw"
  },
  {
    id: '3',
    name: 'Pacote de Sleeves Pro-Matte Eclipse',
    category: 'Acessórios',
    stock: 28,
    price: 59.90,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZzzEmP9jexLL_vHE2D9SWXPgeOIPbiiNSRiHFu_RmK5ts9-5WE2RPrVI2dDAar5f4aigk7PEurYJTwNTUJ50uO9kBauRWZx2NNqrzGAThw8JIRM6Hu7OPypOLjT38gLL_qv2xl_fHI2gRj7GJw5V-StZkMGa6Aen5a5XH5PxAVThAXIz4IzWgQGzd9TplHKG1o_x4ySZKJZ0D0aCn38OnF8e14cmtr0W-JkTbvlkRNfpoIQVyu5pYMIwGXYrbOB8XPKXyKDMgH34"
  },
  {
    id: '4',
    name: 'Yu-Gi-Oh! Deck Estrutural Lenda das Feras',
    category: 'TCG',
    stock: 12,
    price: 64.90,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4yiGs87fYVyeK2f8mAp07UvVgDYFJDXiALXEkB_R4Rbh9-4eV0-NGmBkl10QrOrxvFN1lRnctw71WM9ByypcoZJ24xFzt24RH5Leljz_o7IkPvNzCqiQ00Y61WbytIeLPbClP08UNxsDeYdNg5XoTS_6VCpwawUslHHf0OzxNPBCkU29aHcAwA24stgSdAq3QQIZPL7gims3b0VOH4zg-TO8TK0xjcOG5gXubhjX_SLeo-AQ8A6s1g69DzWwXWNHkS777yr0seqA"
  },
];

const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    title: 'Torneio de Commander',
    price: 25.00,
    time: '14:00',
    maxEnrolled: 32,
    participants: [
      { playerId: '12345678', name: "Alexandre 'Asmoran' Silva", avatarUrl: INITIAL_PLAYERS[0].avatarUrl, paid: true },
      { playerId: '87654321', name: "Bruna 'QueenB' Oliveira", avatarUrl: INITIAL_PLAYERS[1].avatarUrl, paid: false },
    ]
  },
  {
    id: '2',
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    title: 'Campeonato Modern Horizons 3',
    price: 30.00,
    time: '11:00',
    maxEnrolled: 16,
    participants: []
  },
  {
    id: '3',
    date: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString(),
    title: 'Lançamento de Bloomburrow',
    price: 180.00,
    time: '19:00',
    maxEnrolled: 24,
    participants: []
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', playerId: '12345678', type: 'credit', title: 'Crédito Adicionado', date: new Date(Date.now() - 100000000).toISOString(), amount: 100.00, icon: 'arrow_upward' },
  { id: '2', playerId: '12345678', type: 'debit', title: 'Inscrição Torneio MTG', date: new Date(Date.now() - 200000000).toISOString(), amount: 35.00, icon: 'arrow_downward' },
  { id: '3', playerId: '12345678', type: 'debit', title: 'Compra de Boosters', date: new Date(Date.now() - 300000000).toISOString(), amount: 50.00, icon: 'arrow_downward' },
  { id: '4', playerId: '12345678', type: 'credit', title: 'Crédito Adicionado', date: new Date(Date.now() - 400000000).toISOString(), amount: 235.00, icon: 'arrow_upward' },
];

interface StoreContextType {
  players: Player[];
  products: Product[];
  events: Event[];
  transactions: Transaction[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  addEvent: (event: Event) => void;
  addTransaction: (transaction: Transaction) => void;
  updateProductStock: (productId: string, quantityChange: number) => void;
  addPlayer: (name: string) => void;
  updatePlayer: (player: Player) => void;
  addParticipantToEvent: (eventId: string, player: Player) => void;
  removeParticipantFromEvent: (eventId: string, playerId: string) => void;
  toggleEventPayment: (eventId: string, playerId: string) => void;
  finalizeEvent: (eventId: string) => { processed: number; total: number };
  storeProfile: { name: string; avatarUrl: string; role: string };
  updateStoreProfile: (profile: Partial<{ name: string; avatarUrl: string; role: string }>) => void;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  resetStore: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useLocalStorage<Player[]>(STORAGE_KEYS.PLAYERS, INITIAL_PLAYERS);
  const [products, setProducts] = useLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const [events, setEvents] = useLocalStorage<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);

  const addProduct = useCallback((product: Product) => {
    const validation = validateProduct(product);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    setProducts(prev => [...prev, product]);
  }, [setProducts]);

  const updateProduct = useCallback((updatedProduct: Product) => {
    const validation = validateProduct(updatedProduct);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  }, [setProducts]);

  const addEvent = useCallback((event: Event) => {
    const validation = validateEvent(event);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    setEvents(prev => [...prev, event]);
  }, [setEvents]);

  const addPlayer = useCallback((name: string) => {
    const validation = validatePlayer({ name });
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const newPlayer: Player = {
      id: uuidv4(),
      name,
      nickname: name.split(' ')[0],
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      balance: 0,
      lastActivity: new Date().toISOString()
    };
    setPlayers(prev => [newPlayer, ...prev]);
  }, [setPlayers]);

  const updatePlayer = useCallback((updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  }, [setPlayers]);

  const addParticipantToEvent = useCallback((eventId: string, player: Player) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        // Avoid duplicates
        if (evt.participants.some(p => p.playerId === player.id)) return evt;

        const newParticipant: EventParticipant = {
          playerId: player.id,
          name: player.name,
          avatarUrl: player.avatarUrl,
          paid: false
        };
        return { ...evt, participants: [...evt.participants, newParticipant] };
      }
      return evt;
    }));
  }, [setEvents]);

  const removeParticipantFromEvent = useCallback((eventId: string, playerId: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        return { ...evt, participants: evt.participants.filter(p => p.playerId !== playerId) };
      }
      return evt;
    }));
  }, [setEvents]);

  const toggleEventPayment = useCallback((eventId: string, playerId: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const updatedParticipants = evt.participants.map(p => {
          if (p.playerId === playerId) {
            return { ...p, paid: !p.paid };
          }
          return p;
        });
        return { ...evt, participants: updatedParticipants };
      }
      return evt;
    }));
  }, [setEvents]);

  const finalizeEvent = useCallback((eventId: string) => {
    let processedCount = 0;
    let totalAmount = 0;

    const event = events.find(e => e.id === eventId);
    if (!event) throw new Error('Evento não encontrado');
    if (event.status === 'finalized') throw new Error('Evento já finalizado');

    const pendingParticipants = event.participants.filter(p => !p.paid);

    if (pendingParticipants.length === 0) {
      // Just mark as finalized if everyone paid
      setEvents(prev => prev.map(evt =>
        evt.id === eventId ? { ...evt, status: 'finalized' } : evt
      ));
      return { processed: 0, total: 0 };
    }

    setTransactions(prev => {
      const newTransactions: Transaction[] = [];

      pendingParticipants.forEach(participant => {
        newTransactions.push({
          id: uuidv4(),
          playerId: participant.playerId,
          type: 'debit',
          category: 'event',
          eventId: eventId,
          title: `Inscrição: ${event.title}`,
          date: new Date().toISOString(),
          amount: event.price,
          icon: 'emoji_events'
        });
        processedCount++;
        totalAmount += event.price;
      });

      return [...newTransactions, ...prev];
    });

    // Update players balances
    setPlayers(prev => prev.map(player => {
      const participant = pendingParticipants.find(p => p.playerId === player.id);
      if (participant) {
        return {
          ...player,
          balance: player.balance - event.price,
          lastActivity: new Date().toISOString()
        };
      }
      return player;
    }));

    // Update event status and mark participants as paid (via debt)
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          status: 'finalized',
          participants: evt.participants.map(p =>
            pendingParticipants.some(pending => pending.playerId === p.playerId)
              ? { ...p, paid: true }
              : p
          )
        };
      }
      return evt;
    }));

    return { processed: processedCount, total: totalAmount };
  }, [events, setEvents, setTransactions, setPlayers]);

  const addTransaction = useCallback((transaction: Transaction) => {
    try {
      setTransactions(prev => [transaction, ...prev]);

      // Update player balance and last activity
      setPlayers(prev => prev.map(player => {
        if (player.id === transaction.playerId) {
          const newBalance = transaction.type === 'credit'
            ? player.balance + transaction.amount
            : player.balance - transaction.amount;
          return { ...player, balance: newBalance, lastActivity: new Date().toISOString() };
        }
        return player;
      }));
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  }, [setTransactions, setPlayers]);

  const updateProductStock = useCallback((productId: string, quantityChange: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = p.stock + quantityChange;
        if (newStock < 0) {
          throw new Error(ERROR_MESSAGES.STOCK_INSUFFICIENT);
        }
        return { ...p, stock: newStock };
      }
      return p;
    }));
  }, [setProducts]);

  const [storeProfile, setStoreProfile] = useLocalStorage<StoreProfile>(STORAGE_KEYS.STORE_PROFILE, {
    name: 'TCG Store',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6WkR7vBeX2Qpp_UhAtk7NMbVK-3kcvXtmrVRXfMy-wiIXEjO1ZQe_HQ3NBzgqHOwiV85adcxUp8Og0vtSdOxZjACz_sU_TKFCcOe8ivUTTCMMQD-g9zUk1tFtegE5MxMkBV5rJ83xPKnC-s0-zDjT7qD82HTXBhQ6L9lelyfR322QqiapHMJsM3TdeRIqj45W-XnaBbM-OdVxOakvpVj6TsgM-PN3YHMJMXxA2aAka-E5lkZD_h-fOma3bwMEXLBjCwX8ZLQDVPk', // Using one of the existing avatars as default
    role: 'Administrador'
  });

  const updateStoreProfile = useCallback((profile: Partial<StoreProfile>) => {
    setStoreProfile(prev => ({ ...prev, ...profile }));
  }, [setStoreProfile]);

  const [storeSettings, setStoreSettings] = useLocalStorage<StoreSettings>(STORAGE_KEYS.STORE_SETTINGS, {
    notifications: true,
    darkMode: true,
    soundEffects: true
  });

  const updateStoreSettings = useCallback((settings: Partial<StoreSettings>) => {
    setStoreSettings(prev => ({ ...prev, ...settings }));
  }, [setStoreSettings]);

  const resetStore = useCallback(() => {
    if (window.confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      setPlayers(INITIAL_PLAYERS);
      setProducts(INITIAL_PRODUCTS);
      setEvents(INITIAL_EVENTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setStoreProfile({
        name: 'TCG Store',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6WkR7vBeX2Qpp_UhAtk7NMbVK-3kcvXtmrVRXfMy-wiIXEjO1ZQe_HQ3NBzgqHOwiV85adcxUp8Og0vtSdOxZjACz_sU_TKFCcOe8ivUTTCMMQD-g9zUk1tFtegE5MxMkBV5rJ83xPKnC-s0-zDjT7qD82HTXBhQ6L9lelyfR322QqiapHMJsM3TdeRIqj45W-XnaBbM-OdVxOakvpVj6TsgM-PN3YHMJMXxA2aAka-E5lkZD_h-fOma3bwMEXLBjCwX8ZLQDVPk',
        role: 'Administrador'
      });
      setStoreSettings({
        notifications: true,
        darkMode: true,
        soundEffects: true
      });
    }
  }, [setPlayers, setProducts, setEvents, setTransactions, setStoreProfile, setStoreSettings]);

  const contextValue = useMemo(() => ({
    players,
    products,
    events,
    transactions,
    storeProfile,
    storeSettings,
    addProduct,
    updateProduct,
    addEvent,
    addTransaction,
    updateProductStock,
    addPlayer,
    updatePlayer,
    addParticipantToEvent,
    removeParticipantFromEvent,
    toggleEventPayment,
    finalizeEvent,
    updateStoreProfile,
    updateStoreSettings,
    resetStore
  }), [
    players,
    products,
    events,
    transactions,
    storeProfile,
    storeSettings,
    addProduct,
    updateProduct,
    addEvent,
    addTransaction,
    updateProductStock,
    addPlayer,
    updatePlayer,
    addParticipantToEvent,
    removeParticipantFromEvent,
    toggleEventPayment,
    finalizeEvent,
    updateStoreProfile,
    updateStoreSettings,
    resetStore
  ]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
