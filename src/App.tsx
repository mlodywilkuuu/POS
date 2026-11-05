import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingBag, LayoutDashboard, Package, ClipboardList, Users, BarChart3, Settings, Bell, ChevronDown, ScanLine, CreditCard, Banknote, X, Check, Printer, Coffee, Tag, RotateCcw, Smartphone, Clock3 } from 'lucide-react'
import { categories, products, type Product } from './data/products'

type CartLine = { product: Product; qty: number }
type Payment = 'card' | 'cash' | 'blik'
const money = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value)

export default function App() {
  const [category, setCategory] = useState('Wszystkie')
  const [search, setSearch] = useState('')
  const [barcode, setBarcode] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [discount, setDiscount] = useState(false)
  const [payment, setPayment] = useState<Payment>('card')
  const [activeNav, setActiveNav] = useState('Kasa')
  const [receipt, setReceipt] = useState(false)
  const [lastReceipt, setLastReceipt] = useState<{ total: number; count: number; method: Payment } | null>(null)
  const scanRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => products.filter(p =>
    (category === 'Wszystkie' || p.category === category) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search))
  ), [category, search])
  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.qty, 0)
  const discountValue = discount ? subtotal * 0.1 : 0
  const total = subtotal - discountValue
  const count = cart.reduce((sum, line) => sum + line.qty, 0)

  function add(product: Product) {
    setReceipt(false)
    setCart(current => current.some(line => line.product.id === product.id)
      ? current.map(line => line.product.id === product.id ? { ...line, qty: line.qty + 1 } : line)
      : [...current, { product, qty: 1 }])
  }
  function change(id: string, delta: number) {
    setCart(current => current.map(line => line.product.id === id ? { ...line, qty: line.qty + delta } : line).filter(line => line.qty > 0))
  }
  function scan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = barcode.trim().toLowerCase()
    if (!value) return
    const found = products.find(p => p.barcode === value || p.sku.toLowerCase() === value || p.name.toLowerCase() === value)
    if (found) {
      add(found)
      setBarcode('')
    } else {
      setSearch(barcode)
      setCategory('Wszystkie')
    }
  }
  function checkout() {
    if (!cart.length) return
    setLastReceipt({ total, count, method: payment })
    setCart([])
    setDiscount(false)
    setReceipt(true)
  }
  function newSale() {
    setCart([])
    setDiscount(false)
    setReceipt(false)
    setPayment('card')
    setActiveNav('Kasa')
  }

  const nav = [
    { label: 'Kasa', icon: ShoppingBag },
    { label: 'Podgląd sklepu', icon: LayoutDashboard },
    { label: 'Towar i ceny', icon: Package },
    { label: 'Sprzedaż', icon: ClipboardList },
    { label: 'Klienci', icon: Users },
    { label: 'Raport kasowy', icon: BarChart3 },
  ]

  return <div className="app-shell żabka-shell">
    <aside className="sidebar żabka-sidebar">
      <div className="brand żabka-brand"><div className="brand-mark">N</div><span>nova<span className="brand-light">pos</span></span></div>
      <div className="store-switch"><div className="store-avatar">24</div><div><strong>Sklep convenience</strong><small>Stanowisko kasowe 01</small></div><ChevronDown size={15}/></div>
      <div className="nav-caption">OBSŁUGA SKLEPU</div>
      <nav>{nav.map(({label, icon: Icon}) => <button key={label} className={activeNav === label ? 'nav-item active' : 'nav-item'} onClick={() => setActiveNav(label)}><Icon size={18}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={() => setActiveNav('Ustawienia')}><Settings size={18}/><span>Ustawienia</span></button>
        <div className="help-card"><div className="help-orb">✳</div><strong>Zmiana kasowa</strong><p>Kasjer: Mateusz · Zmiana otwarta</p><button onClick={() => alert('Raport zmiany — wersja demonstracyjna')}>Raport zmiany <Clock3 size={13}/></button></div>
        <div className="profile"><div className="profile-avatar">MW</div><div><strong>Mateusz Wilk</strong><small>Kasjer · Stanowisko 01</small></div><ChevronDown size={15}/></div>
      </div>
    </aside>

    <main className="main-area żabka-main">
      <header className="topbar żabka-topbar">
        <div className="breadcrumb"><span className="register-live"/> SKLEP 01 <span>/</span> <strong>{activeNav}</strong></div>
        <div className="top-actions"><div className="live-pill"><i/> Kasa online · tryb demo</div><button className="icon-button" aria-label="Powiadomienia"><Bell size={18}/></button><div className="top-divider"/><div className="top-date">Stanowisko 01</div><div className="top-avatar">MW</div></div>
      </header>

      <div className="page-content żabka-content">
        {activeNav === 'Kasa' ? <>
          <div className="register-heading">
            <div><div className="eyebrow">PUNKT SPRZEDAŻY · SKLEP 01</div><h1>Obsługa klienta</h1><p>Skanuj produkty lub wybierz je z szybkiego katalogu.</p></div>
            <div className="register-heading-actions"><span className="shift-chip"><span/> Zmiana otwarta</span><button className="secondary-button" onClick={newSale}><RotateCcw size={15}/> Nowa transakcja</button></div>
          </div>

          <div className="register-workspace">
            <section className="catalog-panel register-catalog">
              <div className="scan-strip">
                <div className="scan-symbol"><ScanLine size={22}/></div>
                <form className="scan-form" onSubmit={scan}>
                  <label htmlFor="barcode-input">SKANER KODÓW / WYSZUKIWANIE KODU</label>
                  <div><input id="barcode-input" ref={scanRef} value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Zeskanuj kod kreskowy lub wpisz kod produktu..." autoFocus/><button type="submit"><Plus size={17}/> Dodaj</button></div>
                </form>
                <span className="scanner-ready"><i/> GOTOWY</span>
              </div>
              <div className="catalog-header"><div><h2>Szybka sprzedaż</h2><p>Najczęściej wybierane produkty w sklepie.</p></div><span className="product-total">{filtered.length} pozycji</span></div>
              <div className="catalog-tools"><div className="search-box"><Search size={17}/><input placeholder="Szukaj nazwy, kodu lub SKU..." value={search} onChange={e => setSearch(e.target.value)}/><kbd>⌕</kbd></div><button className="filter-button" onClick={() => {setCategory('Wszystkie');setSearch('')}}>Wyczyść <X size={13}/></button></div>
              <div className="category-tabs">{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={category === c ? 'category active' : 'category'}>{c}</button>)}</div>
              <div className="product-grid register-products">{filtered.map(product => <button className="product-card register-product" key={product.id} onClick={() => add(product)}><div className={`product-art ${product.tone}`}><span>{product.symbol}</span><i><Plus size={15}/></i></div><div className="product-info"><span className="product-category">{product.category}</span><strong>{product.name}</strong><small>{product.sku}</small><div className="product-price">{money(product.price)}</div></div></button>)}</div>
              {filtered.length === 0 && <div className="empty-state">Nie znaleziono produktu. Sprawdź kod lub wyszukiwaną nazwę.</div>}
              <div className="catalog-footer"><span>Katalog demonstracyjny · {products.length} produktów</span><button onClick={() => scanRef.current?.focus()}><ScanLine size={13}/> Skanuj kolejny</button></div>
            </section>

            <aside className="cart-panel register-cart">
              <div className="cart-heading"><div><span className="eyebrow">BIEŻĄCA SPRZEDAŻ</span><h2>Paragon</h2><p>Nr roboczy <strong>#001-{String(count + 1).padStart(3, '0')}</strong></p></div><span className="receipt-state">OTWARTY</span></div>
              <div className="customer-select"><div className="customer-icon"><Users size={17}/></div><div><strong>Klient detaliczny</strong><small>Sprzedaż bez rejestracji klienta</small></div><ChevronDown size={15}/></div>
              <div className="cart-label"><span>POZYCJE NA PARAGONIE</span><span>{count} szt.</span></div>
              <div className="cart-lines register-cart-lines">{cart.length ? cart.map(line => <div className="cart-line" key={line.product.id}><div className={`mini-art ${line.product.tone}`}>{line.product.symbol}</div><div className="line-info"><strong>{line.product.name}</strong><small>{money(line.product.price)} / szt.</small><div className="qty-control"><button onClick={() => change(line.product.id, -1)} aria-label="Zmniejsz ilość"><Minus size={12}/></button><span>{line.qty}</span><button onClick={() => change(line.product.id, 1)} aria-label="Zwiększ ilość"><Plus size={12}/></button></div></div><div className="line-end"><strong>{money(line.product.price * line.qty)}</strong><button onClick={() => change(line.product.id, -line.qty)} aria-label="Usuń produkt"><Trash2 size={14}/></button></div></div>) : <div className="cart-empty"><div className="empty-bag"><ShoppingBag size={23}/></div><strong>Oczekiwanie na produkty</strong><span>Zeskanuj kod lub wybierz produkt z katalogu.</span></div>}</div>
              <button className={discount ? 'discount-button applied' : 'discount-button'} onClick={() => setDiscount(!discount)}><Tag size={15}/>{discount ? 'Promocja pracownicza 10%' : 'Rabat / kupon'}<span>{discount ? '−10%' : '+'}</span></button>
              <div className="payment-method"><div className="cart-label">FORMA PŁATNOŚCI</div><div className="payment-options register-payments">
                <button className={payment === 'card' ? 'payment-option selected' : 'payment-option'} onClick={() => setPayment('card')}><CreditCard size={17}/> Karta</button>
                <button className={payment === 'cash' ? 'payment-option selected' : 'payment-option'} onClick={() => setPayment('cash')}><Banknote size={17}/> Gotówka</button>
                <button className={payment === 'blik' ? 'payment-option selected' : 'payment-option'} onClick={() => setPayment('blik')}><Smartphone size={17}/> BLIK</button>
              </div></div>
              <div className="totals register-totals"><div><span>Suma częściowa</span><strong>{money(subtotal)}</strong></div>{discount && <div className="discount-row"><span>Rabat 10%</span><strong>−{money(discountValue)}</strong></div>}<div className="total-row"><span>DO ZAPŁATY</span><strong>{money(total)}</strong></div></div>
              <button className="checkout-button register-checkout" disabled={!cart.length} onClick={checkout}><span><Check size={18}/> Zatwierdź sprzedaż</span><strong>{money(total)}</strong></button>
              <div className="secure-note"><Printer size={13}/> Paragon fiskalny · wymaga integracji z drukarką</div>
              {receipt && lastReceipt && <div className="success-toast"><Check size={16}/> Sprzedaż demo: {money(lastReceipt.total)} · {lastReceipt.count} szt.</div>}
            </aside>
          </div>
          <div className="register-bottomline"><span><Coffee size={14}/> Strefa gastronomiczna i produkty impulsowe</span><span>NovaPOS · Prototyp kasowy</span></div>
        </> : <section className="catalog-panel" style={{minHeight:'65vh',padding:28}}>
          <div className="panel-heading"><div><div className="eyebrow">SKLEP 01 · PANEL</div><h2 style={{fontSize:26,marginTop:8}}>{activeNav}</h2><p>Moduł demonstracyjny systemu kasowego.</p></div></div>
          {activeNav === 'Towar i ceny' ? <div className="product-grid" style={{marginTop:24}}>{products.map(product => <div className="product-card" key={product.id}><div className={`product-art ${product.tone}`}><span>{product.symbol}</span></div><div className="product-info"><span className="product-category">{product.category}</span><strong>{product.name}</strong><small>{product.sku} · {product.barcode}</small><div className="product-price">{money(product.price)}</div></div></div>)}</div> : <div className="stats-row" style={{marginTop:24}}>{(activeNav === 'Podgląd sklepu' ? [['Dzisiejsza sprzedaż','2 486,30 zł'],['Transakcje','164'],['Średni paragon','15,16 zł']] : activeNav === 'Sprzedaż' ? [['Paragony dziś','164'],['Zwroty','2'],['Anulowane','1']] : activeNav === 'Klienci' ? [['Klienci lojalnościowi','428'],['Kupony użyte dziś','23'],['Nowi klienci','8']] : activeNav === 'Raport kasowy' ? [['Gotówka','846,30 zł'],['Karty','1 320,00 zł'],['BLIK','320,00 zł']] : [['Wersja','0.2.0'],['Tryb pracy','Demo'],['Stanowisko','01']]).map(([label,value]) => <div className="stat-card" key={label}><div className="stat-top"><span>{label}</span></div><div className="stat-value">{value}</div></div>)}</div>}
          <p style={{marginTop:28,color:'#8b96a8',lineHeight:1.6}}>Dane są przykładowe i przechowywane wyłącznie w pamięci aplikacji. Integracja z centralną bazą sklepu, kasą fiskalną i terminalem płatniczym nie jest jeszcze podłączona.</p>
          <button className="primary-button" style={{marginTop:16}} onClick={() => setActiveNav('Kasa')}>Wróć do kasy</button>
        </section>}
        <footer className="page-footer"><span>© 2026 NovaPOS · System kasowy</span><span><i/> Stanowisko demonstracyjne</span></footer>
      </div>
    </main>
  </div>
}
