import { useMemo, useState } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingBag, LayoutDashboard, Package, ClipboardList, Users, BarChart3, Settings, Bell, ChevronDown, ScanLine, CreditCard, Banknote, Percent, X, Check, ArrowUpRight } from 'lucide-react'
import { categories, products, type Product } from './data/products'

type CartLine = { product: Product; qty: number }
const money = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value)

export default function App() {
  const [category, setCategory] = useState('Wszystkie')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [discount, setDiscount] = useState(false)
  const [paid, setPaid] = useState(false)
  const [payment, setPayment] = useState<'card' | 'cash'>('card')
  const [activeNav, setActiveNav] = useState('Punkt sprzedaży')
  const filtered = useMemo(() => products.filter(p => (category === 'Wszystkie' || p.category === category) && (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))), [category, search])
  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.qty, 0)
  const total = subtotal * (discount ? .9 : 1)
  const count = cart.reduce((sum, line) => sum + line.qty, 0)

  function add(product: Product) {
    setPaid(false)
    setCart(current => current.some(line => line.product.id === product.id)
      ? current.map(line => line.product.id === product.id ? { ...line, qty: line.qty + 1 } : line)
      : [...current, { product, qty: 1 }])
  }
  function change(id: string, delta: number) {
    setCart(current => current.map(line => line.product.id === id ? { ...line, qty: line.qty + delta } : line).filter(line => line.qty > 0))
  }
  function checkout() {
    if (!cart.length) return
    setPaid(true)
    setCart([])
    setDiscount(false)
  }

  const nav = [
    { label: 'Przegląd', icon: LayoutDashboard },
    { label: 'Punkt sprzedaży', icon: ShoppingBag },
    { label: 'Produkty', icon: Package },
    { label: 'Zamówienia', icon: ClipboardList },
    { label: 'Klienci', icon: Users },
    { label: 'Analityka', icon: BarChart3 },
  ]
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">N</div><span>nova<span className="brand-light">pos</span></span></div>
      <div className="store-switch"><div className="store-avatar">N</div><div><strong>Nova Store</strong><small>Sklep główny</small></div><ChevronDown size={15}/></div>
      <div className="nav-caption">MENU GŁÓWNE</div>
      <nav>{nav.map(({label, icon: Icon}) => <button key={label} className={activeNav === label ? 'nav-item active' : 'nav-item'} onClick={() => setActiveNav(label)}><Icon size={18}/><span>{label}</span>{label === 'Zamówienia' && <i className="nav-count">4</i>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={() => setActiveNav('Ustawienia')}><Settings size={18}/>Ustawienia</button><div className="help-card"><div className="help-orb">✳</div><strong>Potrzebujesz pomocy?</strong><p>Sprawdź centrum pomocy NovaPOS.</p><button onClick={() => alert('Centrum pomocy — wkrótce')}>Centrum pomocy <ArrowUpRight size={13}/></button></div><div className="profile"><div className="profile-avatar">MW</div><div><strong>Mateusz Wilk</strong><small>Administrator</small></div><ChevronDown size={15}/></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Sprzedaż <span>/</span> <strong>{activeNav}</strong></div><div className="top-actions"><div className="live-pill"><i/> System aktywny</div><button className="icon-button" aria-label="Powiadomienia"><Bell size={18}/><i className="notification-dot"/></button><div className="top-divider"/><div className="top-date">Środa, 5 listopada 2026</div><div className="top-avatar">MW</div></div></header>
      <div className="page-content">
        {activeNav === 'Punkt sprzedaży' ? <>
        <div className="page-heading"><div><div className="eyebrow">STREFA SPRZEDAŻY</div><h1>Punkt sprzedaży <span className="heading-spark">✳</span></h1><p>Zarządzaj sprzedażą i obsługuj klientów w jednym miejscu.</p></div><div className="heading-actions"><button className="secondary-button"><ScanLine size={16}/> Skanuj produkt</button><button className="primary-button" onClick={() => {setCart([]);setPaid(false)}}><Plus size={16}/> Nowa transakcja</button></div></div>
        <div className="stats-row">
          <div className="stat-card"><div className="stat-top"><span>Dzisiejsza sprzedaż</span><span className="stat-icon purple"><Banknote size={17}/></span></div><div className="stat-value">8 420,00 zł</div><div className="stat-foot"><span className="positive">↗ 12,8%</span><span>vs. poprzedni dzień</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>Transakcje</span><span className="stat-icon blue"><CreditCard size={17}/></span></div><div className="stat-value">38</div><div className="stat-foot"><span className="positive">↗ 8,2%</span><span>vs. poprzedni dzień</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>Średnia wartość koszyka</span><span className="stat-icon green"><ShoppingBag size={17}/></span></div><div className="stat-value">221,58 zł</div><div className="stat-foot"><span className="positive">↗ 4,3%</span><span>vs. poprzedni dzień</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>Oczekujące zamówienia</span><span className="stat-icon orange"><ClipboardList size={17}/></span></div><div className="stat-value">12</div><div className="stat-foot"><span className="muted">Do realizacji</span><span className="pending-dot"/></div></div>
        </div>
        <div className="workspace">
          <section className="catalog-panel">
            <div className="panel-heading"><div><h2>Katalog produktów</h2><p>Wybierz produkty, aby dodać je do koszyka.</p></div><span className="product-total">{filtered.length} produktów</span></div>
            <div className="catalog-tools"><div className="search-box"><Search size={17}/><input placeholder="Szukaj produktu lub SKU..." value={search} onChange={e => setSearch(e.target.value)}/><kbd>⌘ K</kbd></div><button className="filter-button">Filtry <ChevronDown size={14}/></button></div>
            <div className="category-tabs">{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={category === c ? 'category active' : 'category'}>{c}</button>)}</div>
            <div className="product-grid">{filtered.map(product => <button className="product-card" key={product.id} onClick={() => add(product)}><div className={`product-art ${product.tone}`}><span>{product.symbol}</span><i>+</i></div><div className="product-info"><span className="product-category">{product.category}</span><strong>{product.name}</strong><small>SKU: {product.sku}</small><div className="product-price">{money(product.price)}</div></div></button>)}</div>
            {filtered.length === 0 && <div className="empty-state">Nie znaleziono produktów. Zmień wyszukiwanie lub kategorię.</div>}
            <div className="catalog-footer"><span>Wyświetlono {filtered.length} z {products.length} produktów</span><button onClick={() => {setCategory('Wszystkie');setSearch('')}}>Wyczyść filtry <X size={13}/></button></div>
          </section>
          <aside className="cart-panel">
            <div className="cart-heading"><div><h2>Aktualna transakcja</h2><p>Paragon <span>#POS-2026-0039</span></p></div><button className="more-button">•••</button></div>
            <div className="customer-select"><div className="customer-icon"><Users size={17}/></div><div><strong>Klient detaliczny</strong><small>Bez przypisanego klienta</small></div><ChevronDown size={15}/></div>
            <div className="cart-label"><span>PRODUKTY W KOSZYKU</span><span>{count} szt.</span></div>
            <div className="cart-lines">{cart.length ? cart.map(line => <div className="cart-line" key={line.product.id}><div className={`mini-art ${line.product.tone}`}>{line.product.symbol}</div><div className="line-info"><strong>{line.product.name}</strong><small>{money(line.product.price)} / szt.</small><div className="qty-control"><button onClick={() => change(line.product.id, -1)}><Minus size={12}/></button><span>{line.qty}</span><button onClick={() => change(line.product.id, 1)}><Plus size={12}/></button></div></div><div className="line-end"><strong>{money(line.product.price * line.qty)}</strong><button onClick={() => change(line.product.id, -line.qty)} aria-label="Usuń produkt"><Trash2 size={14}/></button></div></div>) : <div className="cart-empty"><div className="empty-bag"><ShoppingBag size={23}/></div><strong>Koszyk jest pusty</strong><span>Dodaj produkty z katalogu, aby rozpocząć sprzedaż.</span></div>}</div>
            <button className={discount ? 'discount-button applied' : 'discount-button'} onClick={() => setDiscount(!discount)}><Percent size={15}/>{discount ? 'Rabat 10% zastosowany' : 'Dodaj rabat'}<span>{discount ? '−10%' : '+'}</span></button>
            <div className="payment-method"><div className="cart-label">METODA PŁATNOŚCI</div><div className="payment-options"><button className={payment === 'card' ? 'payment-option selected' : 'payment-option'} onClick={() => setPayment('card')}><CreditCard size={17}/> Karta</button><button className={payment === 'cash' ? 'payment-option selected' : 'payment-option'} onClick={() => setPayment('cash')}><Banknote size={17}/> Gotówka</button></div></div>
            <div className="totals"><div><span>Wartość produktów</span><strong>{money(subtotal)}</strong></div>{discount && <div className="discount-row"><span>Rabat (10%)</span><strong>−{money(subtotal * .1)}</strong></div>}<div><span>VAT (w cenie)</span><strong>—</strong></div><div className="total-row"><span>Do zapłaty</span><strong>{money(total)}</strong></div></div>
            <button className="checkout-button" disabled={!cart.length} onClick={checkout}><span><CreditCard size={17}/> Zakończ sprzedaż</span><strong>{money(total)}</strong></button>
            <div className="secure-note"><Check size={13}/> Bezpieczna transakcja · Tryb demonstracyjny</div>
            {paid && <div className="success-toast"><Check size={16}/> Transakcja demonstracyjna zakończona!</div>}
          </aside>
        </div>
        </> : <section className="catalog-panel" style={{minHeight: '65vh', padding: 28}}>
          <div className="panel-heading">
            <div>
              <div className="eyebrow">NOVA POS · PANEL</div>
              <h2 style={{fontSize: 26, marginTop: 8}}>{activeNav}</h2>
              <p>{({
                'Przegląd': 'Podsumowanie najważniejszych informacji o sklepie.',
                'Produkty': 'Katalog produktów dostępnych w demonstracyjnej bazie.',
                'Zamówienia': 'Lista zamówień i ich bieżący status.',
                'Klienci': 'Zarządzanie bazą klientów sklepu.',
                'Analityka': 'Podstawowe wskaźniki sprzedaży.',
                'Ustawienia': 'Konfiguracja i informacje o środowisku NovaPOS.'
              } as Record<string, string>)[activeNav] || 'Panel NovaPOS'}</p>
            </div>
          </div>
          {activeNav === 'Produkty' ? <div className="product-grid" style={{marginTop: 24}}>
            {products.map(product => <div className="product-card" key={product.id}>
              <div className={`product-art ${product.tone}`}><span>{product.symbol}</span></div>
              <div className="product-info"><span className="product-category">{product.category}</span><strong>{product.name}</strong><small>SKU: {product.sku}</small><div className="product-price">{money(product.price)}</div></div>
            </div>)}
          </div> : <div className="stats-row" style={{marginTop: 24}}>
            {(activeNav === 'Przegląd' ? [['Dzisiejsza sprzedaż','8 420,00 zł'],['Transakcje','38'],['Średnia wartość koszyka','221,58 zł']] :
              activeNav === 'Zamówienia' ? [['Wszystkie zamówienia','12'],['Oczekujące','4'],['Zrealizowane dziś','8']] :
              activeNav === 'Klienci' ? [['Wszyscy klienci','128'],['Nowi w tym miesiącu','16'],['Klienci lojalnościowi','42']] :
              activeNav === 'Analityka' ? [['Przychód dziś','8 420,00 zł'],['Liczba transakcji','38'],['Średni koszyk','221,58 zł']] :
              [['Wersja aplikacji','0.1.0'],['Tryb pracy','Demonstracyjny'],['Status','Aktywny']]
            ).map(([label, value]) => <div className="stat-card" key={label}><div className="stat-top"><span>{label}</span></div><div className="stat-value">{value}</div></div>)}
          </div>}
          <p style={{marginTop: 28, color: 'var(--muted, #718096)', lineHeight: 1.6}}>
            {activeNav === 'Ustawienia'
              ? 'To wersja demonstracyjna. Ustawienia i dane są lokalnym przykładem — nie są jeszcze zapisywane na serwerze.'
              : 'Widok demonstracyjny NovaPOS. Dane są przykładowe; po podłączeniu backendu będzie można zarządzać nimi na stałe.'}
          </p>
          <button className="primary-button" style={{marginTop: 16}} onClick={() => setActiveNav('Punkt sprzedaży')}>Przejdź do punktu sprzedaży</button>
        </section>}
        <footer className="page-footer"><span>© 2026 NovaPOS. Wszystkie prawa zastrzeżone.</span><span><i/> Wersja 0.1.0 · Środowisko deweloperskie</span></footer>
      </div>
    </main>
  </div>
}
