// src/app/pages/dietas/dietas.page.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

import { Diet } from '../../models/diet.model';
import { DietService } from '../../services/diet.service';
import { Share } from '@capacitor/share';


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

  editarDieta(dietId: string) {
  // aqui usamos queryParams para reutilizar /cadastrar-dietas
  this.router.navigate(['/cadastrar-dietas'], {
    queryParams: { id: dietId }
  });
}
async shareDieta(dieta: Diet) {
  try {
    await Share.share({
      title: `Minha dieta: ${dieta.nomeDieta}`,
      text: `Estou planejando uma dieta de ${dieta.estimativaCal} kcal e já ingeri ${dieta.totalKcal} kcal hoje.`,
      // opcional: montamos um pequeno resumo das refeições
      dialogTitle: 'Compartilhar minha dieta',
      url: ''  // se tiver uma URL pública ou deeplink do app
    });
  } catch (err) {
    console.error('Erro ao compartilhar:', err);
    const toast = await this.toastCtrl.create({
      message: 'Não foi possível compartilhar.',
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }
}

}
