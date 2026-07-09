export interface ProductItem {
  id: string;
  name: string;
  type: "coffee" | "non_coffee" | "snacks";
  size?: "regular" | "large";
  price: number;
}

export interface CartItem extends ProductItem {
  name: string;
  type: "coffee" | "non_coffee" | "snacks";
  size?: "regular" | "large";
  qty: number;
  subtotal: number;
}