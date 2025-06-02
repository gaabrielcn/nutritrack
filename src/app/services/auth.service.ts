import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential
} from 'firebase/auth';
import { auth } from '../app.module'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;

  constructor() {
    this.auth = auth;
  }

  async login({ email, password }: { email: string; password: string }): Promise<UserCredential | null> {
    try {
      const user = await signInWithEmailAndPassword(this.auth, email, password);
      return user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return null;
    }
  }

  async register({ email, password }: { email: string; password: string }): Promise<UserCredential | null> {
    try {
      const user = await createUserWithEmailAndPassword(this.auth, email, password);
      return user;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
  try {
    await signOut(this.auth);
  } catch (error) {
    console.error('Erro ao deslogar:', error);
    throw error;
  }
}
get currentUser() {
  return this.auth.currentUser;
}


}
