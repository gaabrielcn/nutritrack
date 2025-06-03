// src/app/pages/cadastrar-dietas/cadastrar-dietas.page.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';

import { NutritionService, SugestaoOFF, AlimentoInfoOFF } from '../../services/nutrition.service';
import { DietService } from '../../services/diet.service';

interface ItemRef {
  code: string;
  nome: string;
  calorias: number;
  quantidade: number;
}

interface Refeicao {
  tipo: string;
  itens: ItemRef[];
  totalCal: number;

  sugestoes: SugestaoOFF[];
  busca: string;
  qtd: number;
  selecionado?: SugestaoOFF;
}

@Component({
  selector: 'app-cadastrar-dietas',
  standalone:false,
  templateUrl: './cadastrar-dietas.page.html',
  styleUrls: ['./cadastrar-dietas.page.scss'],
})
export class CadastrarDietasPage implements OnInit {
  nomeDieta: string = '';
  estimativaCal: number = 0;      // campo único para calorias estimadas
  totalKcalDieta: number = 0;     // soma automática das refeições
  refeicoes: Refeicao[] = [];
  isSaving: boolean = false;
  isSearching: boolean[] = [];

  constructor(
    private nutritionService: NutritionService,
    private dietService: DietService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit(): void {
    this.adicionarRefeicao();
  }

  adicionarRefeicao() {
    this.refeicoes.push({
      tipo: '',
      itens: [],
      totalCal: 0,
      sugestoes: [],
      busca: '',
      qtd: 0,
      selecionado: undefined
    });
    this.isSearching.push(false);
  }

  async buscarSugestoes(event: any, idx: number) {
    const texto = event.target.value.trim();
    if (texto.length < 3) {
      this.refeicoes[idx].sugestoes = [];
      return;
    }
    this.isSearching[idx] = true;
    try {
      this.refeicoes[idx].sugestoes = await this.nutritionService.searchAlimentosOFF(texto);
    } finally {
      this.isSearching[idx] = false;
    }
  }

  selecionarSugestao(item: SugestaoOFF, idx: number) {
    this.refeicoes[idx].selecionado = item;
    this.refeicoes[idx].sugestoes = [];
    this.refeicoes[idx].busca = item.nome;
    this.refeicoes[idx].qtd = 0;
  }

  async adicionarAlimento(idx: number) {
    const refeicao = this.refeicoes[idx];
    if (!refeicao.selecionado || refeicao.qtd <= 0) return;

    let info: AlimentoInfoOFF;
    try {
      info = await this.nutritionService.getAlimentoInfoOFF(refeicao.selecionado.code, refeicao.qtd);
    } catch {
      const toast = await this.toastCtrl.create({
        message: 'Erro ao obter dados do alimento.',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      return;
    }

    const caloriasArredondadas = Math.round(info.calorias);
    refeicao.itens.push({
      code: refeicao.selecionado.code,
      nome: refeicao.selecionado.nome,
      calorias: caloriasArredondadas,
      quantidade: refeicao.qtd
    });
    refeicao.totalCal += caloriasArredondadas;

    refeicao.selecionado = undefined;
    refeicao.qtd = 0;
    refeicao.busca = '';
  }

  removerItem(idxRefeicao: number, idxItem: number) {
    const refeicao = this.refeicoes[idxRefeicao];
    const calRemover = refeicao.itens[idxItem].calorias;
    refeicao.totalCal -= calRemover;
    refeicao.itens.splice(idxItem, 1);
  }

  removerRefeicao(idx: number) {
    this.refeicoes.splice(idx, 1);
    this.isSearching.splice(idx, 1);
  }

  async salvarDieta() {
    if (this.isSaving) return;

    if (!this.nomeDieta.trim() || this.nomeDieta.trim().length < 3) {
      const toast = await this.toastCtrl.create({
        message: 'Dê um nome para a dieta (mínimo 3 caracteres).',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      return;
    }

    if (!this.estimativaCal || this.estimativaCal <= 0) {
      const toast = await this.toastCtrl.create({
        message: 'Informe uma estimativa de calorias válida (> 0).',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      return;
    }

    if (this.refeicoes.length === 0) {
      const toast = await this.toastCtrl.create({
        message: 'Adicione ao menos uma refeição antes de salvar.',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      return;
    }

    // calcula total real da dieta
    let soma = 0;
    for (const r of this.refeicoes) {
      soma += r.totalCal;
    }
    this.totalKcalDieta = soma;

    const dietToSave = {
      nomeDieta: this.nomeDieta.trim(),
      estimativaCal: this.estimativaCal,   // só este campo para calorias estimadas
      totalKcal: this.totalKcalDieta,
      dataCriacao: null, // será preenchido no serviço
      userId: '',
      refeicoes: this.refeicoes.map(r => ({
        tipo: r.tipo,
        totalCal: r.totalCal,
        itens: r.itens.map(i => ({
          code: i.code,
          nome: i.nome,
          calorias: i.calorias,
          quantidade: i.quantidade
        }))
      }))
    };

    this.isSaving = true;
    const loading = await this.loadingCtrl.create({
      message: 'Salvando dieta...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.dietService.addDiet(dietToSave as any);
      await loading.dismiss();
      this.isSaving = false;

      const toast = await this.toastCtrl.create({
        message: 'Dieta cadastrada com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

      this.router.navigate(['/dietas']);
    } catch (error) {
      await loading.dismiss();
      this.isSaving = false;

      const toast = await this.toastCtrl.create({
        message: 'Erro ao salvar a dieta. Tente novamente.',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      console.error('Erro addDiet:', error);
    }
  }
}
