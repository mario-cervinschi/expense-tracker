export interface Transaction{
    _id: number | null | string;
    title: string;
    date: Date;
    sum: number;
    income: boolean;
}