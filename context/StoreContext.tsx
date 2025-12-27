
import React, { createContext, useContext, useMemo, useCallback, ReactNode, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Player, Product, Event, Transaction, EventParticipant, StoreProfile, StoreSettings } from '../types';
import { validateProduct, validateEvent, validatePlayer } from '../utils/validators';
import { ERROR_MESSAGES, STORAGE_KEYS } from '../utils/constants';
import { RxDBStorageService } from '../src/infrastructure/RxDBStorageService';
import { IStorageService } from '../src/core/interfaces/IStorageService';
import { ApiService } from '../src/infrastructure/ApiService';

// Initialize Services
const storageService: IStorageService = new RxDBStorageService();
const apiService = new ApiService();

// Mock Data for Migration
const INITIAL_PLAYERS: Player[] = [
  {
    id: '12345678',
    name: "Alexandre 'Asmoran' Silva",
    nickname: 'Asmoran',
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6WkR7vBeX2Qpp_UhAtk7NMbVK-3kcvXtmrVRXfMy-wiIXEjO1ZQe_HQ3NBzgqHOwiV85adcxUp8Og0vtSdOxZjACz_sU_TKFCcOe8ivUTTCMMQD-g9zUk1tFtegE5MxMkBV5rJ83xPKnC-s0-zDjT7qD82HTXBhQ6L9lelyfR322QqiapHMJsM3TdeRIqj45W-XnaBbM-OdVxOakvpVj6TsgM-PN3YHMJMXxA2aAka-E5lkZD_h-fOma3bwMEXLBjCwX8ZLQDVPk",
    balance: 250.00,
    dci: '219873645',
    last_activity: new Date().toISOString()
  },
  {
    id: '87654321',
    name: "Bruna 'QueenB' Oliveira",
    nickname: 'QueenB',
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDillqv2byES44FlhRbug2RbacVjjIWR-UvarDtrwGxyVy0gyNUJBfexnbsYn7LUhMf_sjzNESoYwAUWaP-yLIMnu3Yy_4J1QaCgdQWrdX1nbGSbR8yGlpfHPEnLEuPBBQ9SGL0OHIllCfRJ7kyKj_VVV5jB-o5yBYexbU6TeISg0TyNAkj6lR8XCnTUt76Kzw6KmRc3WB8Q3eGZcUicrZ_or7Dd3b304c9qKnFxIC5oM0r_bLmaKCU9_gzxJtXmFhugl73NcEiTsw",
    balance: 120.50,
    dci: '876543210',
    last_activity: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '11223344',
    name: "Carlos 'TheStrategist' Pereira",
    nickname: 'TheStrategist',
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSzNt-g8CfRC9emCaNYverAa2GD-wyqSZsNy5Fq63HxMrLVFaQsQrTFfcWlwJDVufvq8s8mWgVD941e-Ji0ogEdrTu2mzlu6PEOF1_RdshWwc1ez7PW-iUKLXtVxArXUhlhxKy4pH157gBN0gNjP02QFnRxFgBkRFfYOctECr-jZo6kpzTDG4UMCeM0RVZSQNCOsJGg8dzk9pOhMcLg3HXIG9rk4SpRsB2UEHwKT2oIbn9ppXNlXk8p8v_9B9Vvm9O6KkTUbGYwco",
    balance: 45.00,
    dci: '112233445',
    last_activity: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '55667788',
    name: "Daniela 'Dani' Costa",
    nickname: 'Dani',
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM8wXoHHguWbvH1GHv-eG64_x6lbsWN-zDcAkckmqze9Px5KWsmvw4UU2zNnT1zQCpQp9KyVYfYpHHY2OD9-YFYPMtUuTHXpgP9yiWsmP4ybb42thSA6jI5FhgxlvM9x80XjtAFcRWzNYiPDeSuEys0Jd2PfVgOWFzUV-19vaqcgnVXDIIfcVqP4t8Dqgmr96B2aL0xvTMQqBUKLmvPNtWWupDun23wxvqGvDniZdtEZDam4WZ0-ra0BYoWPIIXirtWdgVqHlQVlY",
    balance: 0.00,
    dci: '556677889',
    last_activity: new Date(Date.now() - 400000000).toISOString()
  },
  {
    id: '99887766',
    name: "Eduardo 'EagleEye' Mendes",
    nickname: 'EagleEye',
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRn8iogdYJCm_hNSIGNrINfFLqfa_YnGR9NGdra665KKiZj9olbsGhGvTYdyoGTZvOfLH-TQXNWTd9ra8R13vg4FvO2kMzeHorQOjynxubguSqkJraJ-onM6dnLBVOtPm2f0mR3CgXfj00EK9mYjfj_drGaql_AeSrMGyelCZq4DMwuMYK6kb2ufodNwR2Ro5-efIu_HBDKLxevgVBLR8r_En0EN5N1N_yKzdLAKhy4NNgZRGzcYcyoENe2vgfbbXrR5dKi1UAlEA",
    balance: -15.00,
    dci: '998877667',
    last_activity: new Date(Date.now() - 200000).toISOString()
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Booster Coleção Escarlate e Violeta',
    category: 'TCG',
    stock: 15,
    price: 39.90,
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrlE7lioiwz9HuxAdcgf1p2tqfPFwYRRtPt0IQ38z7fj4iTE7Iw-rUc_phkEXhA3lxcvr_EUqBI0pUpX-1COoQVnrnTY-EnqgolWs_S0q0twhfqRWpvPgb7rmuRYfAo05sI3h09hIh78jvJjNchD4uLgM-IFyY8bZWd5_QUi5qLJeXV9lNVrUbpvEaMV7aWnCGRiOuXG9bHf_Fgk3FASxPWV2ZjIKeiBG58C4sHvNSAMxcd7k8vS1NmoOlS-5bw-NXBHdychiFjQw"
  },
  {
    id: '2',
    name: 'Magic: The Gathering Commander Deck',
    category: 'TCG',
    stock: 3,
    price: 249.90,
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD78GxStdVPa9jNfkngm1tyX_NGK_g9e3SkZ93yHgS2a2qfYsloBaN0cyQnQmfEEOZfpaNJtzjqXG1upWJ3mrbmGikO9jzYtJXb-Q4lrAQ8LLJS9qkdMqHKc49r6s6eoQ602gUBA9E8R1aDmXy_cCRZ7PHg4xkEUtug9S6nyIyggbfNdJsVqQdq_dASYdPXvXoIr-J6XN0L6zCVB1GEtfxKuWn_VqnCjXhEzm9-KeaiwFysZaFRgT42jbGczD7axw0bwKCWUl4baxw"
  },
  {
    id: '3',
    name: 'Pacote de Sleeves Pro-Matte Eclipse',
    category: 'Acessórios',
    stock: 28,
    price: 59.90,
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZzzEmP9jexLL_vHE2D9SWXPgeOIPbiiNSRiHFu_RmK5ts9-5WE2RPrVI2dDAar5f4aigk7PEurYJTwNTUJ50uO9kBauRWZx2NNqrzGAThw8JIRM6Hu7OPypOLjT38gLL_qv2xl_fHI2gRj7GJw5V-StZkMGa6Aen5a5XH5PxAVThAXIz4IzWgQGzd9TplHKG1o_x4ySZKJZ0D0aCn38OnF8e14cmtr0W-JkTbvlkRNfpoIQVyu5pYMIwGXYrbOB8XPKXyKDMgH34"
  },
  {
    id: '4',
    name: 'Yu-Gi-Oh! Deck Estrutural Lenda das Feras',
    category: 'TCG',
    stock: 12,
    price: 64.90,
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4yiGs87fYVyeK2f8mAp07UvVgDYFJDXiALXEkB_R4Rbh9-4eV0-NGmBkl10QrOrxvFN1lRnctw71WM9ByypcoZJ24xFzt24RH5Leljz_o7IkPvNzCqiQ00Y61WbytIeLPbClP08UNxsDeYdNg5XoTS_6VCpwawUslHHf0OzxNPBCkU29aHcAwA24stgSdAq3QQIZPL7gims3b0VOH4zg-TO8TK0xjcOG5gXubhjX_SLeo-AQ8A6s1g69DzWwXWNHkS777yr0seqA"
  },
];

const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    title: 'Torneio de Commander',
    price: 25.00,
    time: '14:00',
    max_enrolled: 32,
    participants: [
      { player_id: '12345678', name: "Alexandre 'Asmoran' Silva", avatar_url: INITIAL_PLAYERS[0].avatar_url, paid: true },
      { player_id: '87654321', name: "Bruna 'QueenB' Oliveira", avatar_url: INITIAL_PLAYERS[1].avatar_url, paid: false },
    ]
  },
  {
    id: '2',
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    title: 'Campeonato Modern Horizons 3',
    price: 30.00,
    time: '11:00',
    max_enrolled: 16,
    participants: []
  },
  {
    id: '3',
    date: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString(),
    title: 'Lançamento de Bloomburrow',
    price: 180.00,
    time: '19:00',
    max_enrolled: 24,
    participants: []
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', player_id: '12345678', type: 'credit', title: 'Crédito Adicionado', date: new Date(Date.now() - 100000000).toISOString(), amount: 100.00, icon: 'arrow_upward' },
  { id: '2', player_id: '12345678', type: 'debit', title: 'Inscrição Torneio MTG', date: new Date(Date.now() - 200000000).toISOString(), amount: 35.00, icon: 'arrow_downward' },
  { id: '3', player_id: '12345678', type: 'debit', title: 'Compra de Boosters', date: new Date(Date.now() - 300000000).toISOString(), amount: 50.00, icon: 'arrow_downward' },
  { id: '4', player_id: '12345678', type: 'credit', title: 'Crédito Adicionado', date: new Date(Date.now() - 400000000).toISOString(), amount: 235.00, icon: 'arrow_upward' },
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
  finalizeEvent: (eventId: string) => Promise<{ processed: number; total: number }>;
  deletePlayer: (playerId: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  storeProfile: StoreProfile;
  updateStoreProfile: (profile: Partial<StoreProfile>) => void;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  resetStore: () => void;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [storeProfile, setStoreProfile] = useState<StoreProfile>({
    id: 'current',
    name: 'TCG Store',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6WkR7vBeX2Qpp_UhAtk7NMbVK-3kcvXtmrVRXfMy-wiIXEjO1ZQe_HQ3NBzgqHOwiV85adcxUp8Og0vtSdOxZjACz_sU_TKFCcOe8ivUTTCMMQD-g9zUk1tFtegE5MxMkBV5rJ83xPKnC-s0-zDjT7qD82HTXBhQ6L9lelyfR322QqiapHMJsM3TdeRIqj45W-XnaBbM-OdVxOakvpVj6TsgM-PN3YHMJMXxA2aAka-E5lkZD_h-fOma3bwMEXLBjCwX8ZLQDVPk',
    role: 'Administrador'
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    id: 'current',
    notifications: true,
    darkMode: true,
    soundEffects: true
  });

  // Migration and Initialization
  useEffect(() => {
    const init = async () => {
      try {
        // Check if DB is empty
        const isEmpty = await (storageService as any).isEmpty();

        if (isEmpty) {
          console.log('Database empty. Starting migration...');

          // Try to get from localStorage first
          const localPlayers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYERS) || 'null');
          const localProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || 'null');
          const localEvents = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || 'null');
          const localTransactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || 'null');

          const playersToMigrate = localPlayers || INITIAL_PLAYERS;
          const productsToMigrate = localProducts || INITIAL_PRODUCTS;
          const eventsToMigrate = localEvents || INITIAL_EVENTS;
          const transactionsToMigrate = localTransactions || INITIAL_TRANSACTIONS;

          await Promise.all([
            ...playersToMigrate.map((p: Player) => storageService.savePlayer(p)),
            ...productsToMigrate.map((p: Product) => storageService.saveProduct(p)),
            ...eventsToMigrate.map((e: Event) => storageService.saveEvent(e)),
            ...transactionsToMigrate.map((t: Transaction) => storageService.saveTransaction(t))
          ]);

          // Migrate Profile and Settings if they exist in localStorage
          const localProfile = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORE_PROFILE) || 'null');
          if (localProfile) {
            await storageService.saveStoreProfile(localProfile);
          }

          const localSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORE_SETTINGS) || 'null');
          if (localSettings) {
            await storageService.saveStoreSettings(localSettings);
          }

          console.log('Migration completed.');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize/migrate data:', error);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Setup reactive subscriptions
  useEffect(() => {
    const subscriptions = [
      (storageService as any).getPlayers$().subscribe((data: Player[]) => {
        setPlayers(data);
        // Check for expired credits
        checkExpiredCredits(data);
      }),
      (storageService as any).getProducts$().subscribe(setProducts),
      (storageService as any).getEvents$().subscribe(setEvents),
      (storageService as any).getTransactions$().subscribe(setTransactions),
      (storageService as any).getStoreProfile$().subscribe((profile: any) => {
        if (profile) setStoreProfile(profile);
      }),
      (storageService as any).getStoreSettings$().subscribe((settings: any) => {
        if (settings) setStoreSettings(settings);
      })
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, []);

  const checkExpiredCredits = useCallback(async (playersData: Player[]) => {
    // Check for expired credits (60 days)
    const now = new Date();
    const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
    const playersToUpdate = playersData.filter(player => {
      if (player.balance > 0 && player.credit_updated_at) {
        const creditDate = new Date(player.credit_updated_at);
        return (now.getTime() - creditDate.getTime()) > sixtyDaysInMs;
      }
      return false;
    });

    if (playersToUpdate.length > 0) {
      console.log(`Expiring credits for ${playersToUpdate.length} players`);
      for (const player of playersToUpdate) {
        const expiredAmount = player.balance;
        // Create adjustment transaction
        await storageService.saveTransaction({
          id: uuidv4(),
          player_id: player.id,
          type: 'debit',
          category: 'adjustment',
          title: 'Créditos Expirados (60 dias)',
          date: now.toISOString(),
          amount: expiredAmount,
          icon: 'timer_off',
          isExpired: true
        });
        // Update player balance
        await storageService.updatePlayer({
          ...player,
          balance: 0,
          credit_updated_at: undefined,
          last_activity: now.toISOString()
        });
      }
    }
  }, []);

  // CRUD Operations
  const addProduct = useCallback(async (product: Product) => {
    const validation = validateProduct(product);
    if (!validation.isValid) throw new Error(validation.errors.join(', '));
    const productWithTime = { ...product, updated_at: new Date().toISOString() };
    await storageService.saveProduct(productWithTime);

    apiService.post('/products', productWithTime).catch(e => console.error('Cloud sync failed:', e));
  }, []);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    const validation = validateProduct(updatedProduct);
    if (!validation.isValid) throw new Error(validation.errors.join(', '));
    const productWithTime = { ...updatedProduct, updated_at: new Date().toISOString() };
    await storageService.updateProduct(productWithTime);

    apiService.put(`/products/${updatedProduct.id}`, productWithTime).catch(e => console.error('Cloud sync failed:', e));
  }, []);

  const addEvent = useCallback(async (event: Event) => {
    const validation = validateEvent(event);
    if (!validation.isValid) throw new Error(validation.errors.join(', '));
    const eventWithTime = { ...event, updated_at: new Date().toISOString() };
    await storageService.saveEvent(eventWithTime);

    apiService.post('/events', eventWithTime).catch(e => console.error('Cloud sync failed:', e));
  }, []);

  const addPlayer = useCallback(async (name: string, email?: string) => {
    const validation = validatePlayer({ name });
    if (!validation.isValid) throw new Error(validation.errors.join(', '));

    const newPlayer: Player = {
      id: uuidv4(),
      name,
      nickname: name.split(' ')[0],
      email,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      balance: 0,
      last_activity: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await storageService.savePlayer(newPlayer);

    apiService.post('/players', newPlayer).catch(e => console.error('Cloud sync failed:', e));
  }, []);

  const updatePlayer = useCallback(async (updatedPlayer: Player) => {
    const playerWithTime = { ...updatedPlayer, updated_at: new Date().toISOString() };
    await storageService.updatePlayer(playerWithTime);

    apiService.put(`/players/${updatedPlayer.id}`, playerWithTime).catch(e => console.error('Cloud sync failed:', e));
  }, []);

  const addTransaction = useCallback(async (transaction: Transaction) => {
    console.log('StoreContext: addTransaction called', transaction);
    try {
      await storageService.saveTransaction(transaction);

      // Fetch latest players to avoid stale state
      const currentPlayers = await storageService.getPlayers();
      const player = currentPlayers.find(p => p.id === transaction.player_id);

      if (player) {
        const newBalance = transaction.type === 'credit'
          ? player.balance + transaction.amount
          : player.balance - transaction.amount;

        console.log('StoreContext: Updating player balance', { oldBalance: player.balance, newBalance });

        const updatedPlayerData: Player = {
          ...player,
          balance: newBalance,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Track when credits are added or updated
        if (transaction.type === 'credit' || (transaction.type === 'debit' && newBalance > 0)) {
          updatedPlayerData.credit_updated_at = new Date().toISOString();
        } else if (newBalance <= 0) {
          updatedPlayerData.credit_updated_at = undefined;
        }

        await storageService.updatePlayer(updatedPlayerData);
        apiService.put(`/players/${player.id}`, updatedPlayerData).catch(e => console.error('Cloud sync failed:', e));
      }


      apiService.post('/transactions', transaction).catch(e => console.error('Cloud sync failed:', e));
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }, []);

  const updateProductStock = useCallback(async (productId: string, quantityChange: number) => {
    // Fetch latest products to avoid stale state in loops
    const currentProducts = await storageService.getProducts();
    const product = currentProducts.find(p => p.id === productId);

    if (product) {
      const newStock = product.stock + quantityChange;
      if (newStock < 0) throw new Error(ERROR_MESSAGES.STOCK_INSUFFICIENT);

      const updatedProduct = { ...product, stock: newStock, updated_at: new Date().toISOString() };
      await storageService.updateProduct(updatedProduct);

      // Sync with API
      apiService.put(`/products/${productId}`, updatedProduct).catch(e => console.error('Cloud sync failed:', e));
    }
  }, []);

  const addParticipantToEvent = useCallback(async (eventId: string, player: Player) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      if (event.participants.some(p => p.player_id === player.id)) return;

      const newParticipant: EventParticipant = {
        player_id: player.id,
        name: player.name,
        avatar_url: player.avatar_url,
        paid: false
      };

      const updatedEvent = {
        ...event,
        participants: [...event.participants, newParticipant],
        updated_at: new Date().toISOString()
      };

      await storageService.updateEvent(updatedEvent);

      apiService.put(`/events/${event.id}`, updatedEvent).catch(e => console.error('Cloud sync failed:', e));
    }
  }, [events]);

  const removeParticipantFromEvent = useCallback(async (eventId: string, playerId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      const updatedParticipants = event.participants.filter(p => p.player_id !== playerId);
      const updatedEvent = {
        ...event,
        participants: updatedParticipants
      };
      await storageService.updateEvent(updatedEvent);

      apiService.put(`/events/${event.id}`, updatedEvent).catch(e => console.error('Cloud sync failed:', e));
    }
  }, [events]);

  const toggleEventPayment = useCallback(async (eventId: string, playerId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      const updatedParticipants = event.participants.map(p => {
        if (p.player_id === playerId) return { ...p, paid: !p.paid };
        return p;
      });
      const updatedEvent = { ...event, participants: updatedParticipants };
      await storageService.updateEvent(updatedEvent);

      apiService.put(`/events/${event.id}`, updatedEvent).catch(e => console.error('Cloud sync failed:', e));
    }
  }, [events]);

  const finalizeEvent = useCallback(async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) throw new Error('Evento não encontrado');
    if (event.status === 'finalized') throw new Error('Evento já finalizado');

    const pendingParticipants = event.participants.filter(p => !p.paid);
    let processed = 0;
    let total = 0;

    try {
      if (pendingParticipants.length === 0) {
        await storageService.updateEvent({ ...event, status: 'finalized', updated_at: new Date().toISOString() });
      } else {
        for (const participant of pendingParticipants) {
          await storageService.saveTransaction({
            id: uuidv4(),
            player_id: participant.player_id,
            type: 'debit',
            category: 'event',
            event_id: eventId,
            title: `Inscrição: ${event.title}`,
            date: new Date().toISOString(),
            amount: event.price,
            icon: 'emoji_events',
            updated_at: new Date().toISOString()
          });

          const player = players.find(p => p.id === participant.player_id);
          if (player) {
            await storageService.updatePlayer({
              ...player,
              balance: player.balance - event.price,
              last_activity: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
          processed++;
          total += event.price;
        }

        const finalizedEvent = {
          ...event,
          status: 'finalized',
          participants: event.participants.map(p =>
            pendingParticipants.some(pending => pending.player_id === p.player_id)
              ? { ...p, paid: true }
              : p
          )
        };
        await storageService.updateEvent(finalizedEvent as Event);
      }

      const eventToSync = events.find(e => e.id === eventId);
      if (eventToSync) {
        apiService.put(`/events/${eventId}`, eventToSync).catch(e => console.error('Cloud sync failed:', e));
      }

      return { processed: pendingParticipants.length, total: pendingParticipants.length * event.price };
    } catch (error) {
      console.error('Error finalizing event:', error);
      throw error;
    }
  }, [events, players]);

  const updateStoreProfile = useCallback(async (profile: Partial<StoreProfile>) => {
    setStoreProfile(prev => {
      const newProfile = { ...prev, ...profile };
      storageService.saveStoreProfile(newProfile);
      return newProfile;
    });
  }, []);

  const updateStoreSettings = useCallback(async (settings: Partial<StoreSettings>) => {
    setStoreSettings(prev => {
      const newSettings = { ...prev, ...settings };
      storageService.saveStoreSettings(newSettings);
      return newSettings;
    });
  }, []);

  const deletePlayer = useCallback(async (playerId: string) => {
    await storageService.deletePlayer(playerId);

  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    await storageService.deleteEvent(eventId);

  }, []);

  const deleteTransaction = useCallback(async (transactionId: string) => {
    console.log('StoreContext: deleteTransaction called', transactionId);
    try {
      // Fetch latest transactions to find the one to delete
      const currentTransactions = await storageService.getTransactions();
      const transaction = currentTransactions.find(t => t.id === transactionId);

      if (!transaction) {
        console.warn('StoreContext: Transaction not found for deletion', transactionId);
        return;
      }

      // Revert player balance
      const currentPlayers = await storageService.getPlayers();
      const player = currentPlayers.find(p => p.id === transaction.player_id);

      if (player) {
        const newBalance = transaction.type === 'credit'
          ? player.balance - transaction.amount
          : player.balance + transaction.amount;

        console.log('StoreContext: Reverting player balance', { oldBalance: player.balance, newBalance });

        const updatedPlayer = {
          ...player,
          balance: newBalance,
          last_activity: new Date().toISOString()
        };

        // Update credit_updated_at if needed
        if (newBalance <= 0) {
          updatedPlayer.credit_updated_at = undefined;
        }

        await storageService.updatePlayer(updatedPlayer);
        apiService.put(`/players/${player.id}`, updatedPlayer).catch(e => console.error('Cloud sync failed:', e));
      }

      await storageService.deleteTransaction(transactionId);
      apiService.delete(`/transactions/${transactionId}`).catch(e => console.error('Cloud sync failed:', e));
      console.log('StoreContext: Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }, []);



  const resetStore = useCallback(async () => {
    if (window.confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      await storageService.clearAll();

      setStoreProfile({
        id: 'current',
        name: 'TCG Store',
        avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6WkR7vBeX2Qpp_UhAtk7NMbVK-3kcvXtmrVRXfMy-wiIXEjO1ZQe_HQ3NBzgqHOwiV85adcxUp8Og0vtSdOxZjACz_sU_TKFCcOe8ivUTTCMMQD-g9zUk1tFtegE5MxMkBV5rJ83xPKnC-s0-zDjT7qD82HTXBhQ6L9lelyfR322QqiapHMJsM3TdeRIqj45W-XnaBbM-OdVxOakvpVj6TsgM-PN3YHMJMXxA2aAka-E5lkZD_h-fOma3bwMEXLBjCwX8ZLQDVPk',
        role: 'Administrador'
      });
      setStoreSettings({
        id: 'current',
        notifications: true,
        darkMode: true,
        soundEffects: true
      });


    }
  }, []);

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
    deletePlayer,
    deleteEvent,
    deleteTransaction,
    updateStoreProfile,
    updateStoreSettings,
    resetStore,
    isLoading
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
    deletePlayer,
    deleteEvent,
    deleteTransaction,
    updateStoreProfile,
    updateStoreSettings,
    resetStore,
    isLoading
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
