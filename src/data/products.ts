export type Product = {
  id: string
  name: string
  sku: string
  barcode: string
  category: string
  price: number
  tone: string
  symbol: string
}

export const categories = ['Wszystkie', 'Napoje', 'Przekąski', 'Na ciepło', 'Spożywcze', 'Pozostałe']

export const products: Product[] = [
  { id: 'p1', name: 'Woda niegazowana 0,5 l', sku: 'NAP-001', barcode: '5900010000011', category: 'Napoje', price: 2.99, tone: 'blue', symbol: '💧' },
  { id: 'p2', name: 'Woda gazowana 0,5 l', sku: 'NAP-002', barcode: '5900010000012', category: 'Napoje', price: 3.19, tone: 'cyan', symbol: '🫧' },
  { id: 'p3', name: 'Napój energetyczny 250 ml', sku: 'NAP-003', barcode: '5900010000013', category: 'Napoje', price: 5.99, tone: 'green', symbol: '⚡' },
  { id: 'p4', name: 'Cola 500 ml', sku: 'NAP-004', barcode: '5900010000014', category: 'Napoje', price: 5.49, tone: 'orange', symbol: '🥤' },
  { id: 'p5', name: 'Chipsy solone 140 g', sku: 'PRZ-001', barcode: '5900010000021', category: 'Przekąski', price: 7.49, tone: 'amber', symbol: '🥔' },
  { id: 'p6', name: 'Baton czekoladowy', sku: 'PRZ-002', barcode: '5900010000022', category: 'Przekąski', price: 3.49, tone: 'pink', symbol: '🍫' },
  { id: 'p7', name: 'Guma do żucia', sku: 'PRZ-003', barcode: '5900010000023', category: 'Przekąski', price: 4.29, tone: 'violet', symbol: '🍬' },
  { id: 'p8', name: 'Hot dog klasyczny', sku: 'HOT-001', barcode: '5900010000031', category: 'Na ciepło', price: 8.99, tone: 'orange', symbol: '🌭' },
  { id: 'p9', name: 'Kawa czarna 250 ml', sku: 'HOT-002', barcode: '5900010000032', category: 'Na ciepło', price: 6.99, tone: 'amber', symbol: '☕' },
  { id: 'p10', name: 'Zapiekanka', sku: 'HOT-003', barcode: '5900010000033', category: 'Na ciepło', price: 10.99, tone: 'pink', symbol: '🥖' },
  { id: 'p11', name: 'Mleko 1 l', sku: 'SPO-001', barcode: '5900010000041', category: 'Spożywcze', price: 4.49, tone: 'blue', symbol: '🥛' },
  { id: 'p12', name: 'Chleb tostowy', sku: 'SPO-002', barcode: '5900010000042', category: 'Spożywcze', price: 5.29, tone: 'amber', symbol: '🍞' },
  { id: 'p13', name: 'Jogurt naturalny', sku: 'SPO-003', barcode: '5900010000043', category: 'Spożywcze', price: 2.79, tone: 'green', symbol: '🥣' },
  { id: 'p14', name: 'Bateria AA 4 szt.', sku: 'POZ-001', barcode: '5900010000051', category: 'Pozostałe', price: 12.99, tone: 'violet', symbol: '🔋' },
  { id: 'p15', name: 'Chusteczki higieniczne', sku: 'POZ-002', barcode: '5900010000052', category: 'Pozostałe', price: 3.99, tone: 'cyan', symbol: '🧻' },
  { id: 'p16', name: 'Pączek', sku: 'HOT-004', barcode: '5900010000034', category: 'Na ciepło', price: 3.99, tone: 'pink', symbol: '🍩' }
]
