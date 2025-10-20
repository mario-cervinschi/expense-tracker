export interface Transaction{
    _id: number | null;
    title: string;
    date: Date;
    sum: number;
    income: boolean;
    // syncStatus: 'synced' | 'pending' | 'error';
    // localId?: string;
}