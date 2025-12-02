export interface User {
  id: string;
  username: string;
  role: 'Admin' | 'Cliente';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  code: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_code: string;
  count: number;
}
