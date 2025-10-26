export interface Transaction {
  _id: string | null;
  title: string;
  date: Date;
  sum: number;
  income: boolean;
  photoFilepath?: string;
  photoWebviewPath?: string;
  latitude?: number;
  longitude?: number;
}