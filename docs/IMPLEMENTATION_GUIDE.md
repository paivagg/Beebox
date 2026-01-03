# Guia de Implementação - Componentes Responsivos

## 📦 Novos Componentes Criados

### 1. PageLayout
Wrapper de layout padronizado para todas as páginas.

**Uso:**
```tsx
import { PageLayout } from '../components';

const MyPage = () => {
  return (
    <PageLayout 
      title="Minha Página"
      showBackButton={true}
      headerActions={
        <button className="glass h-10 w-10 rounded-full">
          <span className="material-symbols-outlined">settings</span>
        </button>
      }
    >
      {/* Conteúdo da página */}
    </PageLayout>
  );
};
```

### 2. ResponsiveModal
Modal otimizado para mobile (bottom sheet) e desktop (centered).

**Uso:**
```tsx
import { ResponsiveModal } from '../components';

const [isOpen, setIsOpen] = useState(false);

<ResponsiveModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Novo Item"
  size="md"
>
  {/* Conteúdo do modal */}
</ResponsiveModal>
```

### 3. LazyImage
Imagem com lazy loading e skeleton.

**Uso:**
```tsx
import { LazyImage } from '../components';

<LazyImage
  src={product.image_url}
  alt={product.name}
  className="h-24 w-24 rounded-xl"
  fallback="https://placehold.co/400x400/222/white?text=No+Image"
/>
```

### 4. TouchableCard
Card com feedback tátil otimizado.

**Uso:**
```tsx
import { TouchableCard } from '../components';

<TouchableCard
  onClick={() => navigate('/details')}
  ariaLabel="Ver detalhes do produto"
  className="p-4"
>
  {/* Conteúdo do card */}
</TouchableCard>
```

### 5. LoadingState
Estados de carregamento (spinner, pulse, skeleton).

**Uso:**
```tsx
import { LoadingState, SkeletonCard } from '../components';

// Spinner
<LoadingState type="spinner" text="Carregando..." />

// Pulse dots
<LoadingState type="pulse" />

// Skeleton cards
<SkeletonCard count={3} />
```

## 🎨 Classes CSS Adicionadas

### Safe Area
```tsx
// Padding top com safe area
<div className="safe-area-pt">...</div>

// Padding bottom com safe area
<div className="safe-area-pb">...</div>

// Todos os lados
<div className="safe-area-p">...</div>
```

## 🔧 Hooks Customizados

### useResponsive
Detecta o tamanho da tela e breakpoint atual.

**Uso:**
```tsx
import { useResponsive } from '../hooks/useResponsive';

const MyComponent = () => {
  const { isMobile, isTablet, isDesktop, breakpoint, width } = useResponsive();

  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
};
```

## 📝 Checklist de Migração

### Para cada página:

- [ ] Substituir header manual por `<PageLayout>`
- [ ] Substituir modais por `<ResponsiveModal>`
- [ ] Substituir `<img>` por `<LazyImage>`
- [ ] Substituir cards clicáveis por `<TouchableCard>`
- [ ] Adicionar `<LoadingState>` durante carregamentos
- [ ] Adicionar `safe-area-pb` em elementos fixos no bottom
- [ ] Testar em mobile (< 768px)
- [ ] Testar em tablet (768px - 1024px)
- [ ] Testar em desktop (> 1024px)
- [ ] Verificar acessibilidade (navegação por teclado)

## 🎯 Exemplo de Migração Completa

### Antes:
```tsx
const Players = () => {
  const { players } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative flex flex-col min-h-screen">
      <header className="sticky top-0 z-20 p-4 pt-8">
        <h1 className="text-white text-lg font-bold">Jogadores</h1>
      </header>
      
      <main className="flex-1 px-4 pb-28">
        {players.map(player => (
          <div 
            key={player.id}
            onClick={() => navigate(`/player/${player.id}`)}
            className="glass-card p-4 rounded-2xl cursor-pointer"
          >
            <img src={player.avatar_url} alt={player.name} />
            <p>{player.name}</p>
          </div>
        ))}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="glass-card p-6 rounded-3xl">
            <h3>Novo Jogador</h3>
            {/* Form */}
          </div>
        </div>
      )}
    </div>
  );
};
```

### Depois:
```tsx
import { 
  PageLayout, 
  ResponsiveModal, 
  LazyImage, 
  TouchableCard,
  LoadingState 
} from '../components';
import { useResponsive } from '../hooks/useResponsive';

const Players = () => {
  const { players } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useResponsive();

  if (isLoading) {
    return (
      <PageLayout title="Jogadores">
        <LoadingState type="skeleton" />
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Jogadores"
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
        {players.map(player => (
          <TouchableCard
            key={player.id}
            onClick={() => navigate(`/player/${player.id}`)}
            ariaLabel={`Ver perfil de ${player.name}`}
            className="p-4"
          >
            <LazyImage 
              src={player.avatar_url} 
              alt={player.name}
              className="h-12 w-12 rounded-full"
            />
            <p className="text-white font-bold">{player.name}</p>
          </TouchableCard>
        ))}
      </div>

      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Jogador"
        size="md"
      >
        {/* Form */}
      </ResponsiveModal>
    </PageLayout>
  );
};
```

## 🚀 Próximos Passos

1. Migrar páginas principais (Dashboard, Players, Products)
2. Testar em dispositivos reais
3. Ajustar animações e transições
4. Otimizar performance com React.memo
5. Adicionar testes de responsividade

## 📱 Testes Recomendados

### Dispositivos
- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- iPhone 14 Pro Max (430px)
- iPad (768px)
- iPad Pro (1024px)
- Desktop (1920px)

### Navegadores
- Safari iOS
- Chrome Android
- Chrome Desktop
- Firefox Desktop
- Edge Desktop

---

**Última Atualização**: 2026-01-03
