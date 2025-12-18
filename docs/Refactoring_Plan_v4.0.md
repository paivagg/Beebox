# TCG Store Manager - Refactoring Plan v4.0
## The "Local-First" & AI-Native Evolution

> **Prepared by**: Future-Proof Architecture Guild  
> **Version**: 4.0 (The "Linear-Style" Architecture)  
> **Date**: December 2025  
> **Status**: Strategic Plan - Cutting Edge  
> **Estimated Timeline**: 16-20 weeks  
> **Philosophy**: "Instant, Offline, Intelligent"

---

## 🧠 Expert Critique of v3.0

While v3.0 proposed a robust "Cloud-Native" architecture (Kubernetes, GitOps, Service Mesh), it fell into the trap of **"Resume Driven Development"**. For a TCG Store Manager (a POS system), the v3.0 architecture introduced unnecessary operational complexity.

### What v3.0 Got Wrong ❌

1.  **Ops Heavy**: Kubernetes, ArgoCD, and Service Meshes require a dedicated platform team. This is overkill for a store manager.
2.  **Latency**: Cloud-native architectures still depend on network round-trips. A POS needs **zero-latency** interactions.
3.  **Offline Support**: v3.0 treated offline as an edge case. For a physical store, **offline is the default state**; the cloud is for backup.
4.  **Missing Intelligence**: v3.0 ignored the AI revolution. A modern store manager should use Vision AI for card scanning and LLMs for pricing.

### The v4.0 Paradigm Shift 🚀

We are pivoting to a **Local-First, Edge-Native, AI-Integrated** architecture.

**References**:
-   **Linear / Tuist**: "The application lives on the device. The server is just for sync."
-   **Rifke / Ink & Switch**: Local-First Software principles.
-   **Shopify Hydrogen**: Edge-first commerce.
-   **Cloudflare**: The "Supercloud" (Compute at Edge).

---

## 🏗️ Architecture: The "Sync Engine" Model

Instead of `Frontend -> API -> DB`, we move to `Frontend <-> Local DB <-> Sync Engine <-> Cloud DB`.

```mermaid
graph LR
    subgraph "Client (Browser/App)"
        UI[React 19 UI]
        LDB[(Local DB - SQLite/RxDB)]
        SE[Sync Engine Client]
        AI[On-Device AI (TensorFlow.js)]
    end

    subgraph "The Edge (Cloudflare/Vercel)"
        W[Edge Workers]
        SEC[Sync Engine Server]
        Cache[Smart Cache]
    end

    subgraph "The Core (Serverless)"
        PDB[(PostgreSQL)]
        LLM[LLM Service]
    end

    UI <--> LDB
    LDB <--> SE
    SE <--> SEC
    SEC <--> PDB
    AI --> UI
    W <--> LLM
```

### Key Decisions (ADRs)

1.  **Local Database**: **RxDB** or **ElectricSQL**. The UI reads/writes locally. Instant interactions (0ms latency).
2.  **Sync Protocol**: **CRDTs** (Conflict-free Replicated Data Types) to handle multi-device edits without conflicts.
3.  **Infrastructure**: **Serverless/Edge** (Vercel + Neon/Turso). No Kubernetes. No EC2. Zero maintenance.
4.  **API**: **tRPC** over Edge Functions. End-to-end type safety without code generation.

---

## 📅 Phased Implementation Plan

### Phase 1: The Local-First Foundation (Weeks 1-4)

**Goal**: Make the app work 100% offline with multi-device sync.

-   **Technology**: RxDB (with IndexedDB adapter) + CouchDB (or ElectricSQL + Postgres).
-   **Pattern**: Optimistic UI is default. All writes go to Local DB.
-   **Migration**: Move `localStorage` data to `RxDB`.

```typescript
// src/db/schema.ts
import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

export const db = await createRxDatabase({
  name: 'tcg_store',
  storage: getRxStorageDexie(),
});

// The UI never awaits the network
const addTransaction = async (tx) => {
  await db.transactions.insert(tx); // Instant!
  // Sync happens in background
};
```

### Phase 2: Edge-Native API & Auth (Weeks 5-7)

**Goal**: Move backend logic to the Edge for global performance.

-   **Framework**: **Hono** (lightweight, runs on any runtime).
-   **Auth**: **Clerk** or **Supabase Auth** (handled at edge).
-   **Database**: **Neon** (Serverless Postgres) or **Turso** (LibSQL at Edge).

```typescript
// api/index.ts (Hono on Cloudflare Workers)
import { Hono } from 'hono';
const app = new Hono();

app.post('/events/:id/finalize', async (c) => {
  // Edge-computed logic for finalizing events
  // Runs close to the user
});
```

### Phase 3: AI-Powered Features (Weeks 8-10)

**Goal**: Automate manual tasks using AI.

1.  **Card Scanner**:
    -   Use **TensorFlow.js** (Coco-SSD or custom model) in browser to detect cards via camera.
    -   Use **Tesseract.js** or Cloud Vision API to read card text.
2.  **Smart Pricing**:
    -   Integrate **TCGPlayer API** + **LLM** to suggest prices based on market trends and card condition.
3.  **Event Assistant**:
    -   LLM-based query: "Who hasn't paid for the tournament?" -> Returns list.

### Phase 4: Event Logic & Payments (Weeks 11-13)

**Refined Logic (Implemented)**:
-   **Finalize Event**:
    -   **Local-First Execution**: Manager clicks 'Finalize' -> System calculates pending fees locally -> Creates Debit Transactions immediately -> Updates Event Status.
    -   **Optimistic UI**: No network blocking. Syncs to backend in background.
-   **POS & Checkout Logic**:
    -   **Smart Item Separation**: Automatically distinguishes between "Products" (Cards, Sleeves) and "Events" (Tournaments).
    -   **Credit Restrictions**: Store Credits can *only* be used for Products. Tournament entries must be paid in Cash/Account.
    -   **Split Payments**: Checkout flow prioritizes Credits for eligible items, then prompts for remaining balance (Cash vs Account Debt).
    -   **UX**: Custom "Confirm Sale" modal with detailed breakdown of charges and payment sources.

```typescript
// src/context/StoreContext.tsx (Actual Implementation)
const finalizeEvent = useCallback((eventId: string) => {
  // 1. Calculate pending fees locally
  const event = events.find(e => e.id === eventId);
  const pending = event.participants.filter(p => !p.paid);

  // 2. Create debit transactions immediately
  pending.forEach(p => {
    addTransaction({
      type: 'debit',
      category: 'event',
      amount: event.price,
      playerId: p.playerId,
      // ...
    });
  });

  // 3. Update status (Optimistic UI)
  setEvents(prev => prev.map(e => 
    e.id === eventId ? { ...e, status: 'finalized' } : e
  ));
}, [events]);
```

### Phase 5: "NoOps" Deployment (Weeks 14-16)

**Goal**: Automated CI/CD without managing servers.

-   **Platform**: **Vercel** (Frontend + Edge Functions).
-   **Database**: **Neon** (Branching workflow).
-   **Monitoring**: **Vercel Analytics** + **Sentry**.
-   **Feature Flags**: **Vercel Edge Config** (Ultra low latency).

---

## 📊 v4.0 Success Metrics

| Metric | v3.0 Target | v4.0 Target | Why? |
| :--- | :--- | :--- | :--- |
| **TTI (Interactive)** | < 500ms | **< 50ms** | Local-first means no network wait. |
| **Offline Capability** | Partial | **100%** | Core requirement for physical stores. |
| **Ops Cost** | $$$ (K8s) | **$ (Serverless)** | Pay only for usage. Zero idle cost. |
| **Dev Velocity** | Medium (Config heavy) | **High** | Focus on product, not infra. |

---

## 🔮 Future Proofing

-   **WebAssembly (Wasm)**: Move heavy card scanning logic to Wasm modules (Rust) for native performance in browser.
-   **Passkeys**: Biometric login for staff (FaceID/TouchID).

---

**Conclusion**: v4.0 abandons the complexity of "Enterprise Java-style" microservices in favor of a modern, nimble, **Local-First** architecture that fits the actual use case (a physical store) perfectly. It is faster, cheaper, and more reliable.
