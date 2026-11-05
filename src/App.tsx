import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Search, ScanBarcode, Plus, Minus, Trash2, ShoppingCart, Package,
  ClipboardList, BarChart3, Settings, CreditCard, Banknote, Smartphone,
  X, Pencil, Save, AlertTriangle, Store, ChevronDown, Boxes,
  Receipt, CircleHelp, LogOut
} from 'lucide-react'

type Product = {
  id: string
  name: string
  barcode: string
  category: string
  price: number
  stock: number
  unit: string
}
type CartLine = { productId: string; qty: number }
type Sale = {
  id: string
  date: string
  items: { name: string; qty: number; price: number }[]
  total: number
  payment: 'Gotówka' | 'Karta' | 'BLIK'
}
type Page = 'Kasa' | 'Towary i ceny' | 'Sprzedaż' | 'Raporty' | 'Ustawienia'

const seedProducts: Product[] = [
  { id: 'p1', name: 'Woda niegazowana 1,5 l', barcode: '5901001000011', category: 'Napoje', price: 2.49, stock: 48, unit: 'szt.' },
  { id: 'p2', name: 'Woda gazowana 1,5 l', barcode: '5901001000028', category: 'Napoje', price: 2.59, stock: 36, unit: 'szt.' },
  { id: 'p3', name: 'Cola 500 ml', barcode: '5901001000035', category: 'Napoje', price: 4.99, stock: 24, unit: 'szt.' },
  { id: 'p4', name: 'Sok pomarańczowy 1 l', barcode: '5901001000042', category: 'Napoje', price: 5.49, stock: 18, unit: 'szt.' },
  { id: 'p5', name: 'Chipsy solone 140 g', barcode: '5901001000059', category: 'Przekąski', price: 6.99, stock: 20, unit: 'szt.' },
  { id: 'p6', name: 'Paluszki 200 g', barcode: '5901001000066', category: 'Przekąski', price: 3.49, stock: 30, unit: 'szt.' },
  { id: 'p7', name: 'Baton czekoladowy', barcode: '5901001000073', category: 'Słodycze', price: 3.29, stock: 42, unit: 'szt.' },
  { id: 'p8', name: 'Guma do żucia', barcode: '5901001000080', category: 'Słodycze', price: 2.99, stock: 26, unit: 'szt.' },
  { id: 'p9', name: 'Hot dog', barcode: '5901001000097', category: 'Na ciepło', price: 7.99, stock: 15, unit: 'szt.' },
  { id: 'p10', name: 'Kawa czarna', barcode: '5901001000103', category: 'Na ciepło', price: 6.49, stock: 12, unit: 'szt.' },
  { id: 'p11', name: 'Mleko 2% 1 l', barcode: '5901001000110', category: 'Spożywcze', price: 3.79, stock: 16, unit: 'szt.' },
  { id: 'p12', name: 'Chleb pszenny', barcode: '5901001000127', category: 'Spożywcze', price: 4.59, stock: 10, unit: 'szt.' },
  { id: 'p13', name: 'Masło 200 g', barcode: '5901001000134', category: 'Spożywcze', price: 6.49, stock: 9, unit: 'szt.' },
  { id: 'p14', name: 'Jabłka', barcode: '5901001000141', category: 'Warzywa i owoce', price: 4.99, stock: 25, unit: 'kg' },
  { id: 'p15', name: 'Banan', barcode: '5901001000158', category: 'Warzywa i owoce', price: 6.99, stock: 18, unit: 'kg' },
  { id: 'p16', name: 'Bateria AA 4 szt.', barcode: '5901001000165', category: 'Pozostałe', price: 9.99, stock: 8, unit: 'op.' },
]

const money = (value: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value)
const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

const productColors = ['mint', 'blue', 'orange', 'pink', 'yellow', 'violet']

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => readStorage('novapos-products-v2', seedProducts))
  const [sales, setSales] = useState<Sale[]>(() => readStorage('novapos-sales-v2', []))
  const [page, setPage] = useState<Page>('Kasa')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Wszystkie')
  const [cart, setCart] = useState<CartLine[]>([])
  const [payment, setPayment] = useState<Sale['payment']>('Karta')
  const [discount, setDiscount] = useState('')
  const [notice, setNotice] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', barcode: '', category: 'Napoje', price: '', stock: '', unit: 'szt.' })
  const [stockFilter, setStockFilter] = useState('')
  const scannerRef = useRef<HTMLInputElement>(null)

  useEffect(() => { localStorage.setItem('novapos-products-v2', JSON.stringify(products)) }, [products])
  useEffect(() => { localStorage.setItem('novapos-sales-v2', JSON.stringify(sales)) }, [sales])

  const categories = useMemo(() => ['Wszystkie', ...Array.from(new Set(products.map(p => p.category)))], [products])
  const filteredProducts = useMemo(() => products.filter(p =>
    (category === 'Wszystkie' || p.category === category) &&
    (p.name.toLocaleLowerCase('pl').includes(query.toLocaleLowerCase('pl')) || p.barcode.includes(query))
  ), [products, category, query])
  const cartLines = cart.map(line => ({ ...line, product: products.find(p => p.id === line.productId) })).filter(line => line.product) as (CartLine & { product: Product })[]
  const subtotal = cartLines.reduce((sum, line) => sum + line.product.price * line.qty, 0)
  const discountValue = Math.min(subtotal, Math.max(0, Number(discount.replace(',', '.')) || 0))
  const total = Math.max(0, subtotal - discountValue)
  const itemCount = cartLines.reduce((sum, line) => sum + line.qty, 0)
  const today = new Date().toLocaleDateString('pl-PL')
  const todaySales = sales.filter(s => new Date(s.date).toLocaleDateString('pl-PL') === today)
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0)

  function addProduct(product: Product) {
    if (product.stock <= 0) { setNotice('Brak produktu na stanie'); return }
    setCart(current => {
      const existing = current.find(line => line.productId === product.id)
      if (existing && existing.qty >= product.stock) { setNotice('Osiągnięto stan magazynowy'); return current }
      return existing
        ? current.map(line => line.productId === product.id ? { ...line, qty: line.qty + 1 } : line)
        : [...current, { productId: product.id, qty: 1 }]
    })
    setNotice('')
    setQuery('')
    scannerRef.current?.focus()
  }
  function addByBarcode(value: string) {
    const code = value.trim()
    if (!code) return
    const found = products.find(p => p.barcode === code)
    if (found) addProduct(found)
    else setNotice('Nie znaleziono kodu: ' + code)
    setQuery('')
  }
  function changeQty(id: string, delta: number) {
    setCart(current => current.map(line => {
      if (line.productId !== id) return line
      const product = products.find(p => p.id === id)
      return { ...line, qty: Math.min(product?.stock ?? line.qty, line.qty + delta) }
    }).filter(line => line.qty > 0))
  }
  function startNewProduct() {
    setEditingId(null)
    setForm({ name: '', barcode: '', category: 'Napoje', price: '', stock: '', unit: 'szt.' })
    setEditorOpen(true)
  }
  function editProduct(product: Product) {
    setEditingId(product.id)
    setForm({ name: product.name, barcode: product.barcode, category: product.category, price: String(product.price), stock: String(product.stock), unit: product.unit })
    setEditorOpen(true)
  }
  function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const price = Number(form.price.replace(',', '.'))
    const stock = Number(form.stock)
    if (!form.name.trim() || !form.barcode.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      setNotice('Sprawdź nazwę, kod, cenę i stan magazynowy')
      return
    }
    if (products.some(p => p.barcode === form.barcode.trim() && p.id !== editingId)) {
      setNotice('Produkt z takim kodem kreskowym już istnieje')
      return
    }
    const item: Product = {
      id: editingId ?? 'p' + Date.now(),
      name: form.name.trim(),
      barcode: form.barcode.trim(),
      category: form.category.trim() || 'Pozostałe',
      price,
      stock,
      unit: form.unit,
    }
    setProducts(current => editingId ? current.map(p => p.id === editingId ? item : p) : [item, ...current])
    setEditorOpen(false)
    setNotice(editingId ? 'Zapisano zmiany produktu' : 'Dodano nowy produkt')
  }
  function deleteProduct(product: Product) {
    if (!window.confirm('Usunąć produkt „' + product.name + '”?')) return
    setProducts(current => current.filter(p => p.id !== product.id))
    setCart(current => current.filter(line => line.productId !== product.id))
    setNotice('Usunięto produkt')
  }
  function checkout() {
    if (!cartLines.length) return
    const sale: Sale = {
      id: 'POS-' + Date.now().toString().slice(-7),
      date: new Date().toISOString(),
      items: cartLines.map(line => ({ name: line.product.name, qty: line.qty, price: line.product.price })),
      total,
      payment,
    }
    setSales(current => [sale, ...current])
    setProducts(current => current.map(product => {
      const line = cartLines.find(item => item.productId === product.id)
      return line ? { ...product, stock: Math.max(0, product.stock - line.qty) } : product
    }))
    setCart([])
    setDiscount('')
    setNotice('Sprzedaż ' + sale.id + ' zakończona — tryb demonstracyjny')
  }

  const nav: { label: Page; icon: typeof ShoppingCart }[] = [
    { label: 'Kasa', icon: ShoppingCart },
    { label: 'Towary i ceny', icon: Package },
    { label: 'Sprzedaż', icon: ClipboardList },
    { label: 'Raporty', icon: BarChart3 },
    { label: 'Ustawienia', icon: Settings },
  ]

  return <div className="pos-app">
    <aside className="pos-sidebar">
      <div className="pos-brand"><div className="brand-symbol">N</div><div><b>NovaPOS</b><small>SYSTEM SPRZEDAŻY</small></div></div>
      <div className="shop-chip"><Store size={18}/><div><b>Sklep osiedlowy</b><small>Kasa 01 · Stanowisko 1</small></div><ChevronDown size={15}/></div>
      <div className="side-caption">SPRZEDAŻ</div>
      <nav className="side-nav">{nav.map(({ label, icon: Icon }) => <button key={label} className={page === label ? 'side-link selected' : 'side-link'} onClick={() => { setPage(label); setNotice('') }}><Icon size={19}/><span>{label}</span>{label === 'Towary i ceny' && <span className="side-count">{products.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="cashier-card"><div className="cashier-avatar">K</div><div><b>Kasjer</b><small>Zmiana otwarta</small></div><span className="online-dot"/></div><div className="sidebar-version">NovaPOS · wersja demonstracyjna</div></div>
    </aside>

    <main className="pos-main">
      <header className="pos-topbar"><div className="mobile-brand">NovaPOS</div><div className="top-left"><span className="status-dot"/> Kasa aktywna <span className="top-divider">|</span> {today}</div><div className="top-right"><span>Sklep osiedlowy</span><div className="top-user">K</div></div></header>
      <div className="pos-content">
        {page === 'Kasa' && <section className="cash-register">
          <div className="section-title"><div><span className="kicker">OBSŁUGA KLIENTA</span><h1>Kasa</h1><p>Skanuj produkty lub wybierz je z listy.</p></div><div className="transaction-tag"><Receipt size={16}/> Nowa transakcja</div></div>
          <div className="register-layout">
            <section className="sell-area">
              <div className="scanner-bar"><ScanBarcode size={22}/><input ref={scannerRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addByBarcode(query) }} placeholder="Zeskanuj kod kreskowy lub wyszukaj produkt..." autoComplete="off"/>{query && <button onClick={() => setQuery('')} aria-label="Wyczyść"><X size={17}/></button>}<kbd>ENTER</kbd></div>
              <div className="category-row">{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={category === c ? 'category-pill active' : 'category-pill'}>{c}</button>)}</div>
              <div className="products-heading"><b>Produkty</b><span>{filteredProducts.length} pozycji</span></div>
              <div className="sell-product-grid">{filteredProducts.map((product, index) => <button className="sell-product" key={product.id} onClick={() => addProduct(product)} disabled={product.stock <= 0}><div className={'product-icon ' + productColors[index % productColors.length]}><Package size={23}/></div><div className="sell-product-info"><b>{product.name}</b><small>{product.barcode}</small><div><strong>{money(product.price)}</strong><em>{product.stock} {product.unit}</em></div></div><span className="add-product"><Plus size={17}/></span></button>)}</div>
            </section>
            <aside className="sale-panel">
              <div className="sale-title"><div><h2>Bieżący paragon</h2><small>{itemCount} szt. · {cartLines.length} pozycji</small></div><button className="clear-cart" onClick={() => { setCart([]); setDiscount('') }} disabled={!cart.length}>Wyczyść</button></div>
              <div className="sale-lines">{cartLines.length ? cartLines.map(line => <div className="sale-line" key={line.productId}><div className="sale-line-main"><b>{line.product.name}</b><small>{money(line.product.price)} / {line.product.unit}</small><div className="quantity"><button onClick={() => changeQty(line.productId, -1)}><Minus size={13}/></button><span>{line.qty}</span><button onClick={() => changeQty(line.productId, 1)}><Plus size={13}/></button></div></div><div className="sale-line-end"><b>{money(line.product.price * line.qty)}</b><button onClick={() => setCart(current => current.filter(x => x.productId !== line.productId))} aria-label="Usuń"><Trash2 size={15}/></button></div></div>) : <div className="empty-sale"><ShoppingCart size={32}/><b>Paragon jest pusty</b><span>Zeskanuj produkt lub wybierz go z katalogu.</span></div>}</div>
              <label className="discount-input"><span>Rabat kwotowy (zł)</span><input value={discount} onChange={e => setDiscount(e.target.value)} inputMode="decimal" placeholder="0,00"/></label>
              <div className="sale-summary"><div><span>Suma</span><b>{money(subtotal)}</b></div><div><span>Rabat</span><b>−{money(discountValue)}</b></div><div className="grand-total"><span>DO ZAPŁATY</span><strong>{money(total)}</strong></div></div>
              <div className="payment-label">FORMA PŁATNOŚCI</div><div className="payment-select">
                <button className={payment === 'Gotówka' ? 'chosen' : ''} onClick={() => setPayment('Gotówka')}><Banknote size={18}/> Gotówka</button>
                <button className={payment === 'Karta' ? 'chosen' : ''} onClick={() => setPayment('Karta')}><CreditCard size={18}/> Karta</button>
                <button className={payment === 'BLIK' ? 'chosen' : ''} onClick={() => setPayment('BLIK')}><Smartphone size={18}/> BLIK</button>
              </div>
              <button className="finish-sale" onClick={checkout} disabled={!cartLines.length}><span>Zakończ sprzedaż</span><b>{money(total)}</b></button>
              <div className="demo-note"><AlertTriangle size={13}/> Płatność jest symulowana — brak terminala.</div>
            </aside>
          </div>
        </section>}

        {page === 'Towary i ceny' && <section className="management-page">
          <div className="section-title"><div><span className="kicker">BAZA TOWAROWA</span><h1>Towary i ceny</h1><p>Dodawaj produkty, zmieniaj ceny i kontroluj stany magazynowe.</p></div><button className="primary-action" onClick={startNewProduct}><Plus size={18}/> Dodaj produkt</button></div>
          <div className="inventory-stats"><div><Package/><span>Produkty w bazie</span><b>{products.length}</b></div><div><Boxes/><span>Suma sztuk / jednostek</span><b>{products.reduce((s,p) => s+p.stock,0)}</b></div><div><AlertTriangle/><span>Niski stan (≤ 5)</span><b>{products.filter(p => p.stock <= 5).length}</b></div></div>
          <div className="inventory-toolbar"><div className="table-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Szukaj po nazwie lub kodzie kreskowym..."/></div><select value={stockFilter} onChange={e => setStockFilter(e.target.value)}><option value="">Wszystkie stany</option><option value="low">Niski stan (≤ 5)</option><option value="out">Brak na stanie</option></select></div>
          <div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>NAZWA TOWARU</th><th>KOD KRESKOWY</th><th>KATEGORIA</th><th>CENA BRUTTO</th><th>STAN</th><th>AKCJE</th></tr></thead><tbody>
            {products.filter(p => (p.name.toLocaleLowerCase('pl').includes(query.toLocaleLowerCase('pl')) || p.barcode.includes(query)) && (!stockFilter || (stockFilter === 'low' ? p.stock <= 5 : p.stock === 0))).map(p => <tr key={p.id}><td><b>{p.name}</b><small>{p.unit}</small></td><td className="barcode-cell">{p.barcode}</td><td><span className="table-category">{p.category}</span></td><td className="price-cell">{money(p.price)}</td><td><span className={p.stock <= 5 ? 'stock low' : 'stock'}>{p.stock} {p.unit}</span></td><td><div className="row-actions"><button onClick={() => editProduct(p)} title="Edytuj produkt"><Pencil size={16}/></button><button onClick={() => deleteProduct(p)} title="Usuń produkt"><Trash2 size={16}/></button></div></td></tr>)}
          </tbody></table>{products.length === 0 && <div className="table-empty">Brak produktów. Dodaj pierwszy towar.</div>}</div>
          <div className="table-foot">Zmiany zapisują się automatycznie w tej przeglądarce.</div>
        </section>}

        {page === 'Sprzedaż' && <section className="management-page"><div className="section-title"><div><span className="kicker">HISTORIA KASY</span><h1>Sprzedaż</h1><p>Lista transakcji zapisanych na tym urządzeniu.</p></div></div><div className="inventory-stats"><div><Receipt/><span>Transakcje dzisiaj</span><b>{todaySales.length}</b></div><div><Banknote/><span>Utarg dzisiaj</span><b>{money(todayTotal)}</b></div><div><ShoppingCart/><span>Wszystkie transakcje</span><b>{sales.length}</b></div></div><div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>NUMER</th><th>DATA</th><th>PRODUKTY</th><th>PŁATNOŚĆ</th><th>SUMA</th></tr></thead><tbody>{sales.map(s => <tr key={s.id}><td><b>{s.id}</b></td><td>{new Date(s.date).toLocaleString('pl-PL')}</td><td>{s.items.map(i => i.name + ' ×' + i.qty).join(', ')}</td><td>{s.payment}</td><td className="price-cell">{money(s.total)}</td></tr>)}</tbody></table>{sales.length === 0 && <div className="table-empty">Nie ma jeszcze żadnych transakcji.</div>}</div></section>}

        {page === 'Raporty' && <section className="management-page"><div className="section-title"><div><span className="kicker">PODSUMOWANIE</span><h1>Raporty</h1><p>Podstawowe podsumowanie sprzedaży demonstracyjnej.</p></div></div><div className="inventory-stats"><div><Banknote/><span>Utarg dzisiaj</span><b>{money(todayTotal)}</b></div><div><Receipt/><span>Liczba paragonów</span><b>{todaySales.length}</b></div><div><Package/><span>Asortyment</span><b>{products.length} produktów</b></div></div><div className="report-card"><h3>Sprzedaż według płatności</h3>{(['Gotówka','Karta','BLIK'] as const).map(method => <div className="report-row" key={method}><span>{method}</span><b>{money(todaySales.filter(s => s.payment === method).reduce((sum,s) => sum+s.total,0))}</b></div>)}</div></section>}

        {page === 'Ustawienia' && <section className="management-page"><div className="section-title"><div><span className="kicker">KONFIGURACJA</span><h1>Ustawienia</h1><p>Informacje o obecnej wersji programu.</p></div></div><div className="settings-card"><div><Store/><span><b>Sklep osiedlowy</b><small>Nazwa przykładowa — konfiguracja sklepu będzie dostępna później.</small></span></div><div><CircleHelp/><span><b>Tryb demonstracyjny</b><small>Produkty, stany i sprzedaż są przechowywane w pamięci lokalnej przeglądarki.</small></span></div><div><LogOut/><span><b>Brak integracji z urządzeniami</b><small>Skaner klawiaturowy może wpisywać kod kreskowy. Terminal i drukarka fiskalna nie są podłączone.</small></span></div></div></section>}
      </div>
    </main>

    {editorOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setEditorOpen(false) }}><form className="product-modal" onSubmit={saveProduct}><div className="modal-heading"><div><span className="kicker">KARTOTEKA TOWARU</span><h2>{editingId ? 'Edytuj produkt' : 'Dodaj produkt'}</h2></div><button type="button" onClick={() => setEditorOpen(false)} aria-label="Zamknij"><X/></button></div><label>Nazwa produktu<input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="np. Woda mineralna 1,5 l"/></label><label>Kod kreskowy / EAN<input required value={form.barcode} onChange={e => setForm({...form, barcode:e.target.value})} placeholder="Zeskanuj lub wpisz kod"/></label><div className="form-grid"><label>Kategoria<input required list="product-categories" value={form.category} onChange={e => setForm({...form, category:e.target.value})}/><datalist id="product-categories">{categories.filter(c => c !== 'Wszystkie').map(c => <option key={c} value={c}/>)}</datalist></label><label>Jednostka<select value={form.unit} onChange={e => setForm({...form, unit:e.target.value})}><option>szt.</option><option>kg</option><option>l</option><option>op.</option></select></label><label>Cena brutto (zł)<input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price:e.target.value})} placeholder="0,00"/></label><label>Stan magazynowy<input required type="number" min="0" step="1" value={form.stock} onChange={e => setForm({...form, stock:e.target.value})} placeholder="0"/></label></div><div className="modal-actions"><button type="button" className="cancel-action" onClick={() => setEditorOpen(false)}>Anuluj</button><button type="submit" className="primary-action"><Save size={17}/> Zapisz produkt</button></div></form></div>}
    {notice && <div className="notice"><Check size={17}/>{notice}<button onClick={() => setNotice('')} aria-label="Zamknij"><X size={15}/></button></div>}
  </div>
}
