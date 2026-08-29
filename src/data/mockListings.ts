export interface Listing {
  id: string;
  title: string;
  category: 'car' | 'house' | 'business';
  price: string;
  location: string;
  image: string;
}

export const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Toyota Vitz 2005 (በጣም በጥሩ ሁኔታ ላይ ያለ)',
    category: 'car',
    price: '1,450,000 ብር',
    location: 'አዲስ አበባ፣ ቦሌ',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500',
  },
  {
    id: '2',
    title: 'ጂ+1 ዘመናዊ መኖሪያ ቤት ለሽያጭ',
    category: 'house',
    price: '18,500,000 ብር',
    location: 'አዲስ አበባ፣ ሲኤምሲ',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500',
  },
  {
    id: '3',
    title: 'የእቃ መጫኛ ሱቅ በዋና መንገድ ዳር',
    category: 'business',
    price: '3,200,000 ብር',
    location: 'አዲስ አበባ፣ መካኒሳ',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
  },
];