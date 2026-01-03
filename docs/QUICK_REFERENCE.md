# 🚀 Guia Rápido - Componentes Responsivos

## Imports

```tsx
import {
  PageLayout,
  ResponsiveModal,
  LazyImage,
  TouchableCard,
  LoadingState,
  SkeletonCard
} from '../components';

import { useResponsive } from '../hooks/useResponsive';
```

---

## PageLayout

### Uso Básico
```tsx
<PageLayout title="Minha Página">
  {/* conteúdo */}
</PageLayout>
```

### Com Botão Voltar
```tsx
<PageLayout 
  title="Detalhes" 
  showBackButton={true}
>
  {/* conteúdo */}
</PageLayout>
```

### Com Ações no Header
```tsx
<PageLayout 
  title="Produtos"
  headerActions={
    <button className="glass h-10 w-10 rounded-full">
      <span className="material-symbols-outlined">add</span>
    </button>
  }
>
  {/* conteúdo */}
</PageLayout>
```

---

## ResponsiveModal

### Básico
```tsx
const [isOpen, setIsOpen] = useState(false);

<ResponsiveModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Novo Item"
>
  <form>...</form>
</ResponsiveModal>
```

### Tamanhos
```tsx
size="sm"  // 384px
size="md"  // 448px (padrão)
size="lg"  // 672px
```

### Comportamento
- Mobile: Bottom sheet (fullscreen)
- Desktop: Centered modal
- ESC fecha o modal
- Click fora fecha o modal
- Body scroll bloqueado quando aberto

---

## LazyImage

### Básico
```tsx
<LazyImage
  src={product.image_url}
  alt={product.name}
  className="h-24 w-24 rounded-xl"
/>
```

### Com Fallback
```tsx
<LazyImage
  src={product.image_url}
  alt={product.name}
  fallback="https://placehold.co/400x400/222/white?text=No+Image"
  className="w-full h-full object-cover"
/>
```

### Comportamento
- Lazy loading (Intersection Observer)
- Skeleton enquanto carrega
- Fallback em caso de erro
- Otimizado para performance

---

## TouchableCard

### Básico
```tsx
<TouchableCard onClick={() => navigate('/details')}>
  <p>Conteúdo do card</p>
</TouchableCard>
```

### Com Acessibilidade
```tsx
<TouchableCard
  onClick={() => navigate(`/player/${id}`)}
  ariaLabel={`Ver perfil de ${player.name}`}
  className="p-4"
>
  {/* conteúdo */}
</TouchableCard>
```

### Disabled
```tsx
<TouchableCard
  onClick={handleClick}
  disabled={isLoading}
>
  {/* conteúdo */}
</TouchableCard>
```

### Comportamento
- Active state (scale 0.98)
- Hover state (bg-white/5)
- Keyboard navigation (Enter/Space)
- Focus visible
- Screen reader friendly

---

## LoadingState

### Spinner
```tsx
<LoadingState type="spinner" text="Carregando jogadores..." />
```

### Pulse Dots
```tsx
<LoadingState type="pulse" />
```

### Skeleton
```tsx
<LoadingState type="skeleton" />
```

---

## SkeletonCard

### Básico
```tsx
<SkeletonCard />
```

### Múltiplos
```tsx
<SkeletonCard count={5} />
```

### Com Classes
```tsx
<SkeletonCard count={3} className="mb-4" />
```

---

## useResponsive

### Básico
```tsx
const { isMobile, isTablet, isDesktop } = useResponsive();

if (isMobile) return <MobileView />;
if (isDesktop) return <DesktopView />;
```

### Breakpoint
```tsx
const { breakpoint } = useResponsive();
// 'mobile' | 'tablet' | 'desktop'
```

### Dimensões
```tsx
const { width, height } = useResponsive();
```

---

## Safe Area Classes

```tsx
// Padding top
<div className="safe-area-pt">...</div>

// Padding bottom
<div className="safe-area-pb">...</div>

// Padding left
<div className="safe-area-pl">...</div>

// Padding right
<div className="safe-area-pr">...</div>

// Todos os lados
<div className="safe-area-p">...</div>
```

---

## Exemplo Completo

```tsx
import { 
  PageLayout, 
  ResponsiveModal, 
  LazyImage, 
  TouchableCard,
  LoadingState 
} from '../components';
import { useResponsive } from '../hooks/useResponsive';

const MyPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useResponsive();
  const { items } = useStore();

  if (isLoading) {
    return (
      <PageLayout title="Carregando">
        <LoadingState type="skeleton" />
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Meus Itens"
      headerActions={
        <button 
          onClick={() => setIsModalOpen(true)}
          className="glass h-10 w-10 rounded-full"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <TouchableCard
            key={item.id}
            onClick={() => navigate(`/item/${item.id}`)}
            ariaLabel={`Ver ${item.name}`}
            className="p-4"
          >
            <LazyImage 
              src={item.image} 
              alt={item.name}
              className="h-24 w-24 rounded-xl mb-3"
            />
            <h3 className="text-white font-bold">{item.name}</h3>
            <p className="text-gray-400 text-sm">{item.description}</p>
          </TouchableCard>
        ))}
      </div>

      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Item"
        size="md"
      >
        <form>
          <input 
            className="glass-input w-full rounded-2xl p-4"
            placeholder="Nome do item"
          />
          <button className="w-full bg-primary text-white py-4 rounded-2xl mt-4">
            Salvar
          </button>
        </form>
      </ResponsiveModal>
    </PageLayout>
  );
};
```

---

## Breakpoints

```tsx
// Mobile
< 768px

// Tablet
768px - 1024px

// Desktop
> 1024px
```

---

## Touch Targets

Mínimo: **44x44px** (automático em mobile)

---

## Animações

- **Modal**: slide-up (mobile) / zoom-in (desktop)
- **Cards**: scale(0.98) on active
- **Loading**: pulse, spin, bounce

---

## Acessibilidade

- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus visible
- ✅ Screen reader friendly
- ✅ Color contrast

---

## Performance

- ✅ Lazy loading de imagens
- ✅ Intersection Observer
- ✅ Skeleton screens
- ✅ Code splitting ready

---

## Próximos Passos

1. Migrar suas páginas para `PageLayout`
2. Substituir modais por `ResponsiveModal`
3. Usar `LazyImage` para todas as imagens
4. Adicionar `LoadingState` durante carregamentos
5. Testar em mobile real

---

**Dúvidas?** Consulte `docs/IMPLEMENTATION_GUIDE.md`
