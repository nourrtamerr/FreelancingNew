export interface Wishlist {
    projectId: number;
    title: string;
    currency: string;
    createdAt: string;
    experienceLevel: string;
    price: number;
    type: string;
}


export interface WishlistResponse extends Array<Wishlist> {}