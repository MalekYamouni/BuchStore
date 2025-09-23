export interface Book { 
  id: number;
  author: string;  
  name: string;
  price: number;
  quantityCart?:number
  genre: string;
  description: string;
  descriptionLong: string;
  quantity: number
  isBorrowed: boolean
  borrowPrice: number
}
