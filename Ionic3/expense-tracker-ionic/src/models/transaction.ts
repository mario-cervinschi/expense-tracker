export interface Transaction {
  _id: string | null;
  title: string;
  date: Date;
  sum: number;
  income: boolean;
  photoFilepath?: string;
  latitude?: number;
  longitude?: number;
}