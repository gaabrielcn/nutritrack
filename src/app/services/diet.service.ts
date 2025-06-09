// src/app/services/diet.service.ts
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  Firestore,
  Timestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Injectable } from '@angular/core';
import { Diet } from '../models/diet.model';

@Injectable({ providedIn: 'root' })
export class DietService {
  private db: Firestore;

  constructor() {
    this.db = getFirestore();
  }

  async addDiet(diet: Omit<Diet, 'id' | 'dataCriacao' | 'userId'>): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');

    const toSave = {
      nomeDieta: diet.nomeDieta,
      estimativaCal: diet.estimativaCal,
      totalKcal: diet.totalKcal,
      dataCriacao: Timestamp.fromDate(new Date()),
      userId: user.uid,
      refeicoes: diet.refeicoes
    };

    const docRef = await addDoc(collection(this.db, 'dietas'), toSave);
    return docRef.id;
  }

  async getUserDiets(): Promise<Diet[]> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
      collection(this.db, 'dietas'),
      where('userId', '==', user.uid),
      orderBy('dataCriacao', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Diet[];
  }

  /** Novo: busca uma dieta pelo ID */
  async getDietById(id: string): Promise<Diet> {
    const docRef = doc(this.db, 'dietas', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Dieta não encontrada.');
    return { id: snap.id, ...(snap.data() as any) } as Diet;
  }

  /** Novo: deleta dieta pelo ID */
  async deleteDiet(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'dietas', id));
  }
}
