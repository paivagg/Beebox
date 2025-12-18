# TCG Store Manager - Refactoring Plan
## Elevating to World-Class Software Engineering Standards

> **Prepared by**: Architecture & Engineering Team  
> **Date**: December 2025  
> **Status**: Strategic Plan - Pending Approval  
> **Estimated Timeline**: 12-16 weeks  
> **Risk Level**: Medium

---

## Executive Summary

This refactoring plan outlines a comprehensive transformation of the TCG Store Manager codebase from a functional MVP to a production-grade, enterprise-quality application that exemplifies our company's commitment to software excellence.

### Current State Assessment

**Strengths** ✅
- Clean, readable React code with TypeScript
- Consistent UI/UX patterns
- Functional state management
- Mobile-first design philosophy
- Good separation of concerns (pages, components, utils)

**Critical Gaps** ⚠️
- No automated testing (0% coverage)
- Monolithic context provider (God object anti-pattern)
- LocalStorage as sole persistence layer (data loss risk)
- No error boundaries or recovery mechanisms
- Missing accessibility features
- No performance monitoring
- Inline business logic in components
- No CI/CD pipeline
- Security vulnerabilities (XSS, data validation)
- No logging or observability

---

## Strategic Objectives

1. **Reliability**: Achieve 95%+ test coverage with comprehensive E2E, integration, and unit tests
2. **Scalability**: Support 10,000+ products, 5,000+ players, 100,000+ transactions
3. **Maintainability**: Reduce cognitive complexity, improve code organization
4. **Performance**: Sub-100ms interactions, optimistic UI updates
5. **Security**: Implement defense-in-depth, data encryption, audit trails
6. **Accessibility**: WCAG 2.1 AA compliance
7. **Developer Experience**: Hot reload, type safety, comprehensive documentation

---

## Phase 1: Foundation & Testing Infrastructure (Weeks 1-3)

### 1.1 Testing Framework Setup

**Priority**: 🔴 Critical

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event @vitest/ui @vitest/coverage-v8 \
  playwright @playwright/test msw
```

**Deliverables**:
- [ ] Vitest configuration with coverage reporting
- [ ] Playwright E2E test setup
- [ ] Mock Service Worker (MSW) for API mocking
- [ ] CI pipeline with GitHub Actions
- [ ] Pre-commit hooks with Husky + lint-staged

**Success Metrics**:
- All tests passing in CI
- Coverage report generated
- E2E tests running in headless mode

---

### 1.2 Error Boundaries & Resilience

**Priority**: 🔴 Critical

Create robust error handling infrastructure:

```tsx
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../utils/monitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, { errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>Algo deu errado</h2>
          <button onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Deliverables**:
- [ ] Global error boundary in App.tsx
- [ ] Feature-specific error boundaries
- [ ] Error logging service integration
- [ ] User-friendly error messages
- [ ] Automatic error recovery strategies

---

### 1.3 Logging & Observability

**Priority**: 🟡 High

```typescript
// utils/monitoring.ts
import * as Sentry from '@sentry/react';

export const initMonitoring = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 1.0,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
    });
  }
};

export const logError = (error: Error, context?: Record<string, any>) => {
  console.error(error, context);
  Sentry.captureException(error, { extra: context });
};

export const logEvent = (event: string, data?: Record<string, any>) => {
  console.log(`[Event] ${event}`, data);
  // Analytics integration (e.g., Mixpanel, Amplitude)
};
```

**Deliverables**:
- [ ] Sentry integration for error tracking
- [ ] Performance monitoring
- [ ] User session replay
- [ ] Custom event tracking
- [ ] Dashboard for monitoring metrics

---

## Phase 2: Architecture Refactoring (Weeks 4-7)

### 2.1 Domain-Driven Design Restructure

**Priority**: 🔴 Critical

**Current Problem**: Monolithic `StoreContext` with 378 lines mixing all business logic.

**Solution**: Split into domain-specific modules with clear boundaries.

```
src/
├── domains/
│   ├── players/
│   │   ├── context/
│   │   │   └── PlayersContext.tsx
│   │   ├── hooks/
│   │   │   ├── usePlayerQueries.ts
│   │   │   └── usePlayerMutations.ts
│   │   ├── services/
│   │   │   └── playerService.ts
│   │   ├── types/
│   │   │   └── player.types.ts
│   │   ├── validators/
│   │   │   └── playerValidators.ts
│   │   └── components/
│   │       ├── PlayerCard.tsx
│   │       └── PlayerList.tsx
│   ├── products/
│   │   ├── context/
│   │   │   └── ProductsContext.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── components/
│   ├── events/
│   ├── transactions/
│   └── pos/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── infrastructure/
    ├── storage/
    ├── api/
    └── monitoring/
```

**Example Domain Service**:

```typescript
// domains/players/services/playerService.ts
import { Player } from '../types/player.types';
import { validatePlayer } from '../validators/playerValidators';
import { StorageService } from '@/infrastructure/storage';

export class PlayerService {
  private storage: StorageService<Player[]>;

  constructor() {
    this.storage = new StorageService('tcg-store-players');
  }

  async getAll(): Promise<Player[]> {
    return this.storage.get() || [];
  }

  async getById(id: string): Promise<Player | undefined> {
    const players = await this.getAll();
    return players.find(p => p.id === id);
  }

  async create(playerData: Omit<Player, 'id'>): Promise<Player> {
    const validation = validatePlayer(playerData);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }

    const newPlayer: Player = {
      ...playerData,
      id: crypto.randomUUID(),
      balance: 0,
      lastActivity: new Date().toISOString(),
    };

    const players = await this.getAll();
    await this.storage.set([newPlayer, ...players]);
    
    return newPlayer;
  }

  async update(id: string, updates: Partial<Player>): Promise<Player> {
    const players = await this.getAll();
    const index = players.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new NotFoundError(`Player ${id} not found`);
    }

    const updated = { ...players[index], ...updates };
    players[index] = updated;
    
    await this.storage.set(players);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const players = await this.getAll();
    await this.storage.set(players.filter(p => p.id !== id));
  }

  async search(query: string): Promise<Player[]> {
    const players = await this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return players.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.nickname.toLowerCase().includes(lowerQuery) ||
      p.id.includes(query)
    );
  }
}
```

**Deliverables**:
- [ ] Migrate StoreContext to domain services
- [ ] Implement service layer pattern
- [ ] Create domain-specific hooks
- [ ] Update all components to use new architecture
- [ ] Write migration guide

---

### 2.2 State Management Modernization

**Priority**: 🟡 High

**Current Problem**: useLocalStorage hook is synchronous and doesn't handle errors.

**Solution**: Implement React Query for async state management with caching.

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

```typescript
// domains/players/hooks/usePlayerQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlayerService } from '../services/playerService';

const playerService = new PlayerService();

export const usePlayersQuery = () => {
  return useQuery({
    queryKey: ['players'],
    queryFn: () => playerService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePlayerQuery = (id: string) => {
  return useQuery({
    queryKey: ['players', id],
    queryFn: () => playerService.getById(id),
    enabled: !!id,
  });
};

export const useCreatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Player, 'id'>) => playerService.create(data),
    onSuccess: (newPlayer) => {
      // Optimistic update
      queryClient.setQueryData(['players'], (old: Player[] = []) => [
        newPlayer,
        ...old,
      ]);
      
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
    onError: (error) => {
      console.error('Failed to create player:', error);
      // Show toast notification
    },
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Player> }) =>
      playerService.update(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['players', id] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['players', id]);

      // Optimistically update
      queryClient.setQueryData(['players', id], (old: Player) => ({
        ...old,
        ...updates,
      }));

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['players', variables.id], context.previous);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['players', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
};
```

**Benefits**:
- ✅ Automatic caching and background refetching
- ✅ Optimistic updates for instant UI feedback
- ✅ Error handling and retry logic
- ✅ DevTools for debugging
- ✅ Request deduplication

**Deliverables**:
- [ ] React Query setup and configuration
- [ ] Migrate all data fetching to React Query
- [ ] Implement optimistic updates
- [ ] Add loading and error states
- [ ] DevTools integration

---

### 2.3 Component Extraction & Composition

**Priority**: 🟡 High

**Current Problem**: Large page components (300+ lines) with mixed concerns.

**Solution**: Extract reusable components following atomic design principles.

```
components/
├── atoms/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Avatar/
│   └── Badge/
├── molecules/
│   ├── SearchBar/
│   ├── PlayerCard/
│   ├── ProductCard/
│   └── TransactionItem/
├── organisms/
│   ├── PlayerList/
│   ├── ProductGrid/
│   ├── Cart/
│   └── TransactionHistory/
└── templates/
    ├── PageLayout/
    ├── ModalLayout/
    └── ListLayout/
```

**Example Atomic Component**:

```tsx
// components/atoms/Button/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white shadow-lg shadow-primary/30',
        secondary: 'bg-white/5 text-white hover:bg-white/10',
        success: 'bg-positive text-white shadow-lg shadow-green-900/20',
        danger: 'bg-negative text-white shadow-lg shadow-red-900/20',
        ghost: 'bg-transparent text-white hover:bg-white/5',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, fullWidth, className })}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="material-symbols-outlined animate-spin mr-2">
            progress_activity
          </span>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**Deliverables**:
- [ ] Extract 20+ reusable components
- [ ] Create Storybook for component documentation
- [ ] Write unit tests for all components
- [ ] Implement component composition patterns
- [ ] Create design system documentation

---

## Phase 3: Data Layer & Persistence (Weeks 8-10)

### 3.1 IndexedDB Migration

**Priority**: 🔴 Critical

**Current Problem**: LocalStorage 5-10MB limit, synchronous API, no indexing.

**Solution**: Migrate to IndexedDB with Dexie.js wrapper.

```bash
npm install dexie dexie-react-hooks
```

```typescript
// infrastructure/storage/db.ts
import Dexie, { Table } from 'dexie';
import { Player, Product, Event, Transaction } from '@/types';

export class TCGDatabase extends Dexie {
  players!: Table<Player, string>;
  products!: Table<Product, string>;
  events!: Table<Event, string>;
  transactions!: Table<Transaction, string>;

  constructor() {
    super('TCGStoreDB');
    
    this.version(1).stores({
      players: 'id, name, nickname, balance, lastActivity',
      products: 'id, name, category, stock, price',
      events: 'id, date, title, price',
      transactions: 'id, playerId, type, date, amount',
    });

    // Add hooks for data validation
    this.players.hook('creating', (primKey, obj) => {
      const validation = validatePlayer(obj);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
    });
  }
}

export const db = new TCGDatabase();
```

**Usage in Services**:

```typescript
// domains/players/services/playerService.ts
import { db } from '@/infrastructure/storage/db';

export class PlayerService {
  async getAll(): Promise<Player[]> {
    return db.players.toArray();
  }

  async getById(id: string): Promise<Player | undefined> {
    return db.players.get(id);
  }

  async create(playerData: Omit<Player, 'id'>): Promise<Player> {
    const id = crypto.randomUUID();
    const newPlayer: Player = {
      ...playerData,
      id,
      balance: 0,
      lastActivity: new Date().toISOString(),
    };

    await db.players.add(newPlayer);
    return newPlayer;
  }

  async search(query: string): Promise<Player[]> {
    return db.players
      .filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.nickname.toLowerCase().includes(query.toLowerCase())
      )
      .toArray();
  }

  async getByBalance(min: number, max: number): Promise<Player[]> {
    return db.players
      .where('balance')
      .between(min, max)
      .toArray();
  }
}
```

**Benefits**:
- ✅ Unlimited storage (browser dependent, typically 50%+ of disk)
- ✅ Async API (non-blocking)
- ✅ Indexing for fast queries
- ✅ Transactions for data integrity
- ✅ Versioning and migrations

**Deliverables**:
- [ ] IndexedDB schema design
- [ ] Migration script from LocalStorage
- [ ] Update all services to use IndexedDB
- [ ] Add data export/import functionality
- [ ] Implement backup strategy

---

### 3.2 Backend API Integration (Optional)

**Priority**: 🟢 Medium (Future-proofing)

**Rationale**: Prepare for multi-device sync, cloud backup, analytics.

```typescript
// infrastructure/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

**Hybrid Sync Strategy**:

```typescript
// infrastructure/sync/syncService.ts
export class SyncService {
  private lastSync: Date | null = null;

  async syncPlayers(): Promise<void> {
    try {
      // 1. Get local changes since last sync
      const localChanges = await this.getLocalChanges('players');

      // 2. Push local changes to server
      if (localChanges.length > 0) {
        await apiClient.post('/sync/players', { changes: localChanges });
      }

      // 3. Pull server changes
      const serverChanges = await apiClient.get('/sync/players', {
        params: { since: this.lastSync?.toISOString() },
      });

      // 4. Merge changes (conflict resolution)
      await this.mergeChanges('players', serverChanges.data);

      this.lastSync = new Date();
    } catch (error) {
      console.error('Sync failed:', error);
      // Continue offline, retry later
    }
  }

  private async mergeChanges(entity: string, serverData: any[]): Promise<void> {
    // Last-write-wins strategy (can be improved)
    for (const item of serverData) {
      const local = await db[entity].get(item.id);
      
      if (!local || new Date(item.updatedAt) > new Date(local.updatedAt)) {
        await db[entity].put(item);
      }
    }
  }
}
```

**Deliverables**:
- [ ] API client setup
- [ ] Authentication flow
- [ ] Sync service implementation
- [ ] Conflict resolution strategy
- [ ] Offline-first architecture

---

## Phase 4: Performance Optimization (Weeks 11-12)

### 4.1 Code Splitting & Lazy Loading

**Priority**: 🟡 High

```tsx
// App.tsx - Route-based code splitting
import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Players = lazy(() => import('./pages/Players'));
const PlayerProfile = lazy(() => import('./pages/PlayerProfile'));
const Products = lazy(() => import('./pages/Products'));
const Events = lazy(() => import('./pages/Events'));
const POS = lazy(() => import('./pages/POS'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <span className="material-symbols-outlined animate-spin text-primary text-4xl">
      progress_activity
    </span>
  </div>
);

const App = () => {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/player/:id" element={<PlayerProfile />} />
          {/* ... */}
        </Routes>
      </Suspense>
    </HashRouter>
  );
};
```

**Deliverables**:
- [ ] Implement route-based code splitting
- [ ] Lazy load heavy components
- [ ] Preload critical routes
- [ ] Measure bundle size reduction
- [ ] Monitor loading performance

---

### 4.2 Virtual Scrolling for Large Lists

**Priority**: 🟡 High

```tsx
// components/organisms/PlayerList/PlayerList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export const PlayerList: React.FC<{ players: Player[] }> = ({ players }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: players.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
    overscan: 5, // Render 5 extra items above/below viewport
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const player = players[virtualRow.index];
          
          return (
            <div
              key={player.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <PlayerCard player={player} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

**Benefits**:
- ✅ Render only visible items (10-20 instead of 1000+)
- ✅ Smooth scrolling even with huge datasets
- ✅ Reduced memory footprint

**Deliverables**:
- [ ] Implement virtual scrolling for Players list
- [ ] Implement virtual scrolling for Products list
- [ ] Implement virtual scrolling for Transactions list
- [ ] Performance benchmarks

---

### 4.3 Image Optimization

**Priority**: 🟢 Medium

```tsx
// components/atoms/OptimizedImage/OptimizedImage.tsx
import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallback = '/placeholder.png',
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/5 animate-pulse rounded-lg" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallback);
          setIsLoading(false);
        }}
      />
    </div>
  );
};
```

**Deliverables**:
- [ ] Implement lazy loading for images
- [ ] Add blur-up placeholders
- [ ] Optimize image formats (WebP)
- [ ] Implement CDN for image hosting
- [ ] Add responsive images

---

## Phase 5: Security & Data Integrity (Weeks 13-14)

### 5.1 Input Sanitization & XSS Prevention

**Priority**: 🔴 Critical

```typescript
// utils/security/sanitize.ts
import DOMPurify from 'dompurify';

export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  });
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 1000); // Limit length
};

export const validateURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};
```

**Usage**:

```tsx
// components/molecules/PlayerCard/PlayerCard.tsx
import { sanitizeHTML } from '@/utils/security/sanitize';

export const PlayerCard: React.FC<{ player: Player }> = ({ player }) => {
  return (
    <div>
      <h3 dangerouslySetInnerHTML={{ __html: sanitizeHTML(player.name) }} />
    </div>
  );
};
```

**Deliverables**:
- [ ] Install DOMPurify
- [ ] Sanitize all user inputs
- [ ] Validate URLs before rendering
- [ ] Add Content Security Policy headers
- [ ] Security audit

---

### 5.2 Data Encryption at Rest

**Priority**: 🟡 High

```typescript
// infrastructure/storage/encryption.ts
import CryptoJS from 'crypto-js';

export class EncryptionService {
  private key: string;

  constructor() {
    // In production, use a user-specific key derived from authentication
    this.key = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key';
  }

  encrypt(data: any): string {
    const json = JSON.stringify(data);
    return CryptoJS.AES.encrypt(json, this.key).toString();
  }

  decrypt(encrypted: string): any {
    const bytes = CryptoJS.AES.decrypt(encrypted, this.key);
    const json = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(json);
  }
}

// Usage in storage service
export class SecureStorageService<T> {
  private encryption = new EncryptionService();

  async set(key: string, value: T): Promise<void> {
    const encrypted = this.encryption.encrypt(value);
    await db.secureData.put({ key, data: encrypted });
  }

  async get(key: string): Promise<T | null> {
    const record = await db.secureData.get(key);
    if (!record) return null;
    return this.encryption.decrypt(record.data);
  }
}
```

**Deliverables**:
- [ ] Implement encryption for sensitive data
- [ ] Encrypt player balances
- [ ] Encrypt transaction history
- [ ] Key management strategy
- [ ] Security documentation

---

### 5.3 Audit Trail & Data Versioning

**Priority**: 🟢 Medium

```typescript
// infrastructure/audit/auditService.ts
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  changes: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
}

export class AuditService {
  async log(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditEntry: AuditLog = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    await db.auditLogs.add(auditEntry);
  }

  async getHistory(entityId: string): Promise<AuditLog[]> {
    return db.auditLogs
      .where('entityId')
      .equals(entityId)
      .reverse()
      .sortBy('timestamp');
  }
}

// Usage in service
export class PlayerService {
  private audit = new AuditService();

  async update(id: string, updates: Partial<Player>): Promise<Player> {
    const old = await db.players.get(id);
    if (!old) throw new NotFoundError();

    const updated = { ...old, ...updates };
    await db.players.put(updated);

    // Log the change
    await this.audit.log({
      userId: 'current-user-id', // From auth context
      action: 'UPDATE',
      entity: 'player',
      entityId: id,
      changes: this.getChanges(old, updated),
    });

    return updated;
  }

  private getChanges(old: Player, updated: Player): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};
    
    for (const key of Object.keys(updated)) {
      if (old[key] !== updated[key]) {
        changes[key] = { old: old[key], new: updated[key] };
      }
    }

    return changes;
  }
}
```

**Deliverables**:
- [ ] Implement audit logging
- [ ] Create audit log viewer UI
- [ ] Add data versioning
- [ ] Implement rollback functionality
- [ ] Compliance documentation

---

## Phase 6: Accessibility & UX (Weeks 15-16)

### 6.1 WCAG 2.1 AA Compliance

**Priority**: 🟡 High

```tsx
// components/atoms/Button/Button.tsx
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  ariaLabel,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      role="button"
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {children}
    </button>
  );
};
```

**Keyboard Navigation**:

```tsx
// components/organisms/PlayerList/PlayerList.tsx
export const PlayerList: React.FC = ({ players }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, players.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        navigate(`/player/${players[focusedIndex].id}`);
        break;
    }
  };

  return (
    <div role="list" onKeyDown={handleKeyDown}>
      {players.map((player, index) => (
        <PlayerCard
          key={player.id}
          player={player}
          isFocused={index === focusedIndex}
          tabIndex={index === focusedIndex ? 0 : -1}
        />
      ))}
    </div>
  );
};
```

**Deliverables**:
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement keyboard navigation
- [ ] Ensure color contrast ratios meet WCAG AA
- [ ] Add focus indicators
- [ ] Screen reader testing
- [ ] Accessibility audit with axe-core

---

### 6.2 Internationalization (i18n)

**Priority**: 🟢 Medium

```bash
npm install react-i18next i18next
```

```typescript
// i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    'en-US': { translation: enUS },
  },
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

```json
// i18n/locales/pt-BR.json
{
  "common": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "delete": "Excluir",
    "edit": "Editar"
  },
  "players": {
    "title": "Jogadores",
    "addNew": "Novo Jogador",
    "balance": "Saldo",
    "search": "Buscar jogador..."
  }
}
```

**Usage**:

```tsx
import { useTranslation } from 'react-i18next';

export const Players: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('players.title')}</h1>
      <input placeholder={t('players.search')} />
    </div>
  );
};
```

**Deliverables**:
- [ ] i18n setup
- [ ] Extract all strings to translation files
- [ ] Support pt-BR and en-US
- [ ] Add language switcher
- [ ] Date/currency formatting per locale

---

## Phase 7: Developer Experience & Tooling

### 7.1 Storybook for Component Development

**Priority**: 🟢 Medium

```bash
npx storybook@latest init
```

```tsx
// components/atoms/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    isLoading: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Add Player',
    leftIcon: <span className="material-symbols-outlined">add</span>,
  },
};
```

**Deliverables**:
- [ ] Storybook setup
- [ ] Stories for all components
- [ ] Interactive controls
- [ ] Accessibility addon
- [ ] Visual regression testing

---

### 7.2 Comprehensive Testing Strategy

**Priority**: 🔴 Critical

**Unit Tests** (Vitest):

```typescript
// domains/players/services/playerService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerService } from './playerService';

describe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(() => {
    service = new PlayerService();
  });

  it('should create a new player', async () => {
    const playerData = {
      name: 'John Doe',
      nickname: 'JD',
    };

    const player = await service.create(playerData);

    expect(player).toMatchObject(playerData);
    expect(player.id).toBeDefined();
    expect(player.balance).toBe(0);
  });

  it('should throw error for invalid player data', async () => {
    await expect(service.create({ name: '' })).rejects.toThrow();
  });

  it('should search players by name', async () => {
    await service.create({ name: 'Alice', nickname: 'A' });
    await service.create({ name: 'Bob', nickname: 'B' });

    const results = await service.search('alice');

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Alice');
  });
});
```

**Integration Tests**:

```typescript
// domains/players/hooks/usePlayerQueries.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlayersQuery, useCreatePlayer } from './usePlayerQueries';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('usePlayersQuery', () => {
  it('should fetch players', async () => {
    const { result } = renderHook(() => usePlayersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
  });
});

describe('useCreatePlayer', () => {
  it('should create a player and update cache', async () => {
    const { result } = renderHook(
      () => ({
        query: usePlayersQuery(),
        mutation: useCreatePlayer(),
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    const initialCount = result.current.query.data?.length || 0;

    result.current.mutation.mutate({
      name: 'New Player',
      nickname: 'NP',
    });

    await waitFor(() => expect(result.current.mutation.isSuccess).toBe(true));

    expect(result.current.query.data?.length).toBe(initialCount + 1);
  });
});
```

**E2E Tests** (Playwright):

```typescript
// e2e/players.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Players Management', () => {
  test('should create a new player', async ({ page }) => {
    await page.goto('/#/players');

    // Click add button
    await page.click('[aria-label="Add player"]');

    // Fill form
    await page.fill('input[placeholder="Nome do jogador"]', 'Test Player');

    // Submit
    await page.click('button:has-text("Criar")');

    // Verify player appears in list
    await expect(page.locator('text=Test Player')).toBeVisible();
  });

  test('should search for players', async ({ page }) => {
    await page.goto('/#/players');

    // Type in search
    await page.fill('input[placeholder="Buscar jogador..."]', 'Alexandre');

    // Verify filtered results
    await expect(page.locator('text=Alexandre')).toBeVisible();
    await expect(page.locator('[data-testid="player-card"]')).toHaveCount(1);
  });

  test('should navigate to player profile', async ({ page }) => {
    await page.goto('/#/players');

    // Click on first player
    await page.click('[data-testid="player-card"]:first-child');

    // Verify navigation
    await expect(page).toHaveURL(/\/player\/.+/);
    await expect(page.locator('h1:has-text("Perfil")')).toBeVisible();
  });
});
```

**Coverage Goals**:
- Unit tests: 80%+ coverage
- Integration tests: Critical user flows
- E2E tests: Happy paths + edge cases

**Deliverables**:
- [ ] 100+ unit tests
- [ ] 20+ integration tests
- [ ] 15+ E2E tests
- [ ] CI pipeline with test automation
- [ ] Coverage reports in PR reviews

---

### 7.3 CI/CD Pipeline

**Priority**: 🟡 High

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Unit tests
        run: npm run test:unit -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

      - name: Build
        run: npm run build

      - name: E2E tests
        run: npm run test:e2e

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to production
        run: npm run deploy
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

**Deliverables**:
- [ ] GitHub Actions workflow
- [ ] Automated testing on PR
- [ ] Code coverage reporting
- [ ] Automated deployment
- [ ] Branch protection rules

---

## Success Metrics & KPIs

### Code Quality
- [ ] **Test Coverage**: 80%+ (unit), 100% (critical paths)
- [ ] **Type Safety**: 100% TypeScript strict mode
- [ ] **Linting**: 0 ESLint errors
- [ ] **Bundle Size**: <500KB initial load (currently ~3MB with Tailwind CDN)
- [ ] **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)

### Performance
- [ ] **Time to Interactive**: <2s
- [ ] **First Contentful Paint**: <1s
- [ ] **Largest Contentful Paint**: <2.5s
- [ ] **Cumulative Layout Shift**: <0.1
- [ ] **List Rendering**: 60fps with 10,000+ items

### Reliability
- [ ] **Error Rate**: <0.1% of user sessions
- [ ] **Crash-Free Sessions**: 99.9%
- [ ] **Data Loss**: 0 incidents
- [ ] **Uptime**: 99.9% (for backend services)

### Developer Experience
- [ ] **Build Time**: <30s (production)
- [ ] **Hot Reload**: <1s
- [ ] **Test Execution**: <5min (full suite)
- [ ] **Onboarding Time**: <2 days for new developers

---

## Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Breaking Changes** | High | High | Comprehensive test suite, feature flags, gradual rollout |
| **Data Migration Failures** | Medium | Critical | Backup strategy, rollback plan, migration testing |
| **Performance Regression** | Medium | Medium | Performance budgets, monitoring, benchmarks |
| **Scope Creep** | High | Medium | Strict phase boundaries, prioritization framework |
| **Team Bandwidth** | Medium | High | Phased approach, external contractors if needed |
| **User Disruption** | Low | High | Backward compatibility, migration guides, support |

---

## Resource Requirements

### Team Composition
- **1 Senior Frontend Architect** (full-time, 16 weeks)
- **2 Senior Frontend Engineers** (full-time, 16 weeks)
- **1 QA Engineer** (full-time, weeks 8-16)
- **1 DevOps Engineer** (part-time, weeks 1-4, 13-16)
- **1 UX/Accessibility Specialist** (part-time, weeks 15-16)

### Infrastructure
- **Sentry** (Error tracking): ~$29/month
- **Vercel/Netlify** (Hosting): Free tier
- **GitHub Actions** (CI/CD): Included
- **Storybook** (Component docs): Self-hosted

### Total Estimated Cost
- **Personnel**: ~$150,000 (assuming $100/hr blended rate)
- **Tools & Services**: ~$500
- **Total**: ~$150,500

---

## Migration Strategy

### Backward Compatibility

```typescript
// utils/migration/v1ToV2.ts
export const migrateLocalStorageToIndexedDB = async () => {
  const keys = [
    'tcg-store-players',
    'tcg-store-products',
    'tcg-store-events',
    'tcg-store-transactions',
  ];

  for (const key of keys) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const tableName = key.replace('tcg-store-', '');
        
        await db[tableName].bulkAdd(parsed);
        
        // Keep backup in localStorage for 30 days
        localStorage.setItem(`${key}_backup`, data);
        localStorage.setItem(`${key}_migrated`, new Date().toISOString());
      } catch (error) {
        console.error(`Migration failed for ${key}:`, error);
        // Don't delete localStorage on error
      }
    }
  }
};

// Run on app initialization
if (!localStorage.getItem('migration_v2_complete')) {
  await migrateLocalStorageToIndexedDB();
  localStorage.setItem('migration_v2_complete', 'true');
}
```

### Feature Flags

```typescript
// utils/featureFlags.ts
export const features = {
  useIndexedDB: import.meta.env.VITE_FEATURE_INDEXEDDB === 'true',
  useReactQuery: import.meta.env.VITE_FEATURE_REACT_QUERY === 'true',
  useBackendSync: import.meta.env.VITE_FEATURE_BACKEND_SYNC === 'true',
  useVirtualScrolling: import.meta.env.VITE_FEATURE_VIRTUAL_SCROLL === 'true',
};

// Usage
const PlayerService = features.useIndexedDB
  ? IndexedDBPlayerService
  : LocalStoragePlayerService;
```

---

## Rollout Plan

### Phase 1-2 (Weeks 1-7): Internal Testing
- Deploy to staging environment
- Internal team testing
- Fix critical bugs

### Phase 3-4 (Weeks 8-12): Beta Testing
- 10% of users (feature flag)
- Collect feedback
- Monitor metrics
- Iterate

### Phase 5-6 (Weeks 13-16): Gradual Rollout
- 25% of users (week 13)
- 50% of users (week 14)
- 75% of users (week 15)
- 100% of users (week 16)

### Rollback Strategy
- Keep old codebase in separate branch
- Feature flags to disable new features
- Data migration rollback scripts
- Communication plan for users

---

## Conclusion

This refactoring plan transforms the TCG Store Manager from a functional MVP into a world-class, production-ready application that embodies our company's commitment to software excellence.

### Key Outcomes

✅ **Reliability**: Comprehensive testing, error handling, and data integrity  
✅ **Scalability**: Support for 10x current data volumes  
✅ **Performance**: Sub-100ms interactions, optimized rendering  
✅ **Security**: Defense-in-depth, encryption, audit trails  
✅ **Maintainability**: Clean architecture, domain-driven design  
✅ **Accessibility**: WCAG 2.1 AA compliance  
✅ **Developer Experience**: Modern tooling, comprehensive documentation

### Next Steps

1. **Review & Approval**: Stakeholder review of this plan
2. **Resource Allocation**: Assign team members
3. **Kickoff**: Week 1 planning session
4. **Execution**: Follow phased approach
5. **Continuous Improvement**: Post-launch optimization

---

**Prepared by**: Senior Architecture Team  
**Approved by**: _Pending_  
**Start Date**: _TBD_  
**Completion Date**: _TBD + 16 weeks_

---

## Appendix

### A. Technology Stack Comparison

| Current | Proposed | Rationale |
|---------|----------|-----------|
| LocalStorage | IndexedDB (Dexie) | Unlimited storage, async, indexing |
| Context API | React Query + Context | Caching, optimistic updates, devtools |
| No testing | Vitest + Playwright | Quality assurance, regression prevention |
| Tailwind CDN | Tailwind + PostCSS | Production optimization, tree-shaking |
| No monitoring | Sentry | Error tracking, performance monitoring |

### B. Code Examples Repository

All code examples from this plan are available in:
`docs/refactoring-examples/`

### C. Training Materials

- [ ] React Query workshop
- [ ] IndexedDB best practices
- [ ] Testing strategies guide
- [ ] Security checklist
- [ ] Performance optimization guide

### D. References

- [React Query Documentation](https://tanstack.com/query/latest)
- [Dexie.js Guide](https://dexie.org/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web.dev Performance](https://web.dev/performance/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
