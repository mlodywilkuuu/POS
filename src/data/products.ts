export type Product = {
  id: string; name: string; sku: string; category: string; price: number; tone: string; symbol: string
}

export const categories = ['Wszystkie', 'Elektronika', 'Akcesoria', 'Dom', 'Odzież']

export const products: Product[] = [
  { id: 'p1', name: 'Słuchawki Studio', sku: 'EL-1001', category: 'Elektronika', price: 249, tone: 'violet', symbol: '◉' },
  { id: 'p2', name: 'Klawiatura Mechanical', sku: 'EL-1002', category: 'Elektronika', price: 389, tone: 'blue', symbol: '⌨' },
  { id: 'p3', name: 'Mysz bezprzewodowa', sku: 'EL-1003', category: 'Akcesoria', price: 129, tone: 'cyan', symbol: '⌁' },
  { id: 'p4', name: 'Lampka Ambient', sku: 'HM-2001', category: 'Dom', price: 179, tone: 'amber', symbol: '☼' },
  { id: 'p5', name: 'Plecak Urban', sku: 'AC-3001', category: 'Akcesoria', price: 219, tone: 'green', symbol: '▤' },
  { id: 'p6', name: 'Bluza Essential', sku: 'CL-4001', category: 'Odzież', price: 199, tone: 'pink', symbol: '◇' },
  { id: 'p7', name: 'Głośnik Mini', sku: 'EL-1004', category: 'Elektronika', price: 159, tone: 'orange', symbol: '◖' },
  { id: 'p8', name: 'Kubek termiczny', sku: 'HM-2002', category: 'Dom', price: 89, tone: 'teal', symbol: '▣' }
]