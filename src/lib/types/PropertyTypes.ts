export type Property = {
  imageUrls: Blob;
  title: string;
  description: string;
  price: number;
  numberOfBeds: number;
  numberOfBaths: number;
  sqft: number;
  propertyType: string;
  isFeatured: boolean;
  isActive: boolean;
  isSold: boolean;
};

export type PropertyData = {
  imageUrls: Blob;
  title: string;
  description: string;
  price: number;
  numberOfBeds: number;
  numberOfBaths: number;
  sqft: number;
  propertyType: string;
};
