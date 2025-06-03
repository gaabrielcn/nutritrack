// src/app/pages/dietas/dietas.page.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

import { Diet } from '../../models/diet.model';
import { DietService } from '../../services/diet.service';

@Component({
  selector: 'app-dietas',
  standalone:false,
  templateUrl: './dietas.page.html',
  styleUrls: ['./dietas.page.scss'],
})
export class DietasPage implements OnInit {
  dietas: Diet[] = [];
  isLoading = false;

  constructor(
    private dietService: DietService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.loadDietas();
  }

  async ionViewWillEnter() {
    await this.loadDietas();
  }

  private async loadDietas() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Carregando dietas...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      this.dietas = await this.dietService.getUserDiets();
      await loading.dismiss();
    } catch (error) {
      await loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: 'Erro ao carregar dietas.',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
      console.error('Erro getUserDiets():', error);
    } finally {
      this.isLoading = false;
    }
  }

  voltar() {
    this.router.navigate(['/home']);
  }

  cadastrarDieta() {
    this.router.navigate(['/cadastrar-dietas']);
  }

  verDieta(dietId: string) {
    // Se mais tarde quiser detalhar ou editar, basta ajustar essa rota
    this.router.navigate([`/dietas/${dietId}`]);
  }
}
