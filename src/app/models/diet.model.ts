// src/app/models/diet.model.ts

export interface DietItem {
  code: string;
  nome: string;
  calorias: number;
  quantidade: number;
}

export interface DietMeal {
  tipo: string;
  totalCal: number;
  itens: DietItem[];
}

export interface Diet {
  id?: string;
  nomeDieta: string;
  totalKcal: number;
  dataCriacao: any;  // Timestamp do Firestore (SDK modular)
  userId: string;
  refeicoes: DietMeal[];
}
