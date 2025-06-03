// src/app/services/diet.service.ts

import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, Firestore, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { Diet } from '../models/diet.model';

@Injectable({
  providedIn: 'root'
})
export class DietService {
  private db: Firestore;

  constructor() {
    // Usa o Firestore modular (já inicializado no AppModule)
    this.db = getFirestore();
  }

  /**
   * Cria uma nova dieta no Firestore.
   */
  async addDiet(diet: Omit<Diet, 'id' | 'dataCriacao' | 'userId'>): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');

    // Monta o objeto com os campos obrigatórios
    const toSave = {
      nomeDieta: diet.nomeDieta,
      totalKcal: diet.totalKcal,
      dataCriacao: Timestamp.fromDate(new Date()),
      userId: user.uid,
      refeicoes: diet.refeicoes
    };

    const docRef = await addDoc(
      collection(this.db, 'dietas'),
      toSave
    );
    return docRef.id;
  }

  /**
   * Retorna todas as dietas do usuário, ordenadas por data (mais recente primeiro).
   */
  async getUserDiets(): Promise<Diet[]> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return [];

    // Prepara consulta: WHERE userId == uid ORDER BY dataCriacao desc
    const q = query(
      collection(this.db, 'dietas'),
      where('userId', '==', user.uid),
      orderBy('dataCriacao', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const diets: Diet[] = [];
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data() as Omit<Diet, 'id'>;
      diets.push({
        id: docSnap.id,
        nomeDieta: data.nomeDieta,
        totalKcal: data.totalKcal,
        dataCriacao: data.dataCriacao,
        userId: data.userId,
        refeicoes: data.refeicoes
      });
    });

    return diets;
  }
}
