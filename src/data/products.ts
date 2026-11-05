export type Product = {
  id: string
  name: string
  barcode: string
  category: string
  price: number
  stock: number
  unit: string
}

export const categories = ['Napoje', 'Przekąski', 'Słodycze', 'Na ciepło', 'Spożywcze', 'Warzywa i owoce', 'Pozostałe']

export const products: Product[] = [
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
