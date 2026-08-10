export interface ProductItem {
  id: string;
  name: string;
  type: "coffee"
    | "non_coffee"
    | "snacks"
    | "topping"
    | "service"
    | "retail"
    | "grocery"
    | "fresh_produce"
    | "other";
  size?: "regular" | "large" | "small";
  price: number;
}

export interface CartItem extends ProductItem {
  name: string;
  type: "coffee"
    | "non_coffee"
    | "snacks"
    | "topping"
    | "service"
    | "retail"
    | "grocery"
    | "fresh_produce"
    | "other";
  size?: "regular" | "large" | "small";
  qty: number;
  subtotal: number;
}