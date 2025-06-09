// src/app/pages/cadastrar-dietas/cadastrar-dietas.page.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router }   from '@angular/router';
import {
  ToastController,
  LoadingController,
  AlertController
} from '@ionic/angular';

import {
  NutritionService,
  SugestaoOFF,
  AlimentoInfoOFF
} from '../../services/nutrition.service';
import { DietService }       from '../../services/diet.service';
import { Diet }              from '../../models/diet.model';

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
  nomeDieta      = '';
  estimativaCal  = 0;
  totalKcalDieta = 0;
  refeicoes: Refeicao[] = [];
  isSearching: boolean[] = [];
  isSaving      = false;
  dietId: string | null = null;    // agora público, não private

  constructor(
    private route        : ActivatedRoute,
    private router       : Router,
    private nutritionSvc : NutritionService,
    private dietService  : DietService,
    private toastCtrl    : ToastController,
    private loadingCtrl  : LoadingController,
    private alertCtrl    : AlertController
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(async params => {
      const id = params.get('id');
      if (id) {
        this.dietId = id;
        const diet = await this.dietService.getDietById(id);
        this.nomeDieta      = diet.nomeDieta;
        this.estimativaCal  = diet.estimativaCal;
        this.totalKcalDieta = diet.totalKcal;
        this.refeicoes = diet.refeicoes.map(r => ({
          tipo       : r.tipo,
          totalCal   : r.totalCal,
          itens      : r.itens,
          sugestoes  : [],
          busca      : '',
          qtd        : 0,
          selecionado: undefined
        }));
        this.isSearching = this.refeicoes.map(_ => false);
      } else {
        this.adicionarRefeicao();
      }
    });
  }

  adicionarRefeicao() {
    this.refeicoes.push({
      tipo       : '',
      itens      : [],
      totalCal   : 0,
      sugestoes  : [],
      busca      : '',
      qtd        : 0,
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
      this.refeicoes[idx].sugestoes =
        await this.nutritionSvc.searchAlimentosOFF(texto);
    } finally {
      this.isSearching[idx] = false;
    }
  }

  selecionarSugestao(item: SugestaoOFF, idx: number) {
    const r = this.refeicoes[idx];
    r.selecionado = item;
    r.sugestoes   = [];
    r.busca       = item.nome;
    r.qtd         = 0;
  }

  async adicionarAlimento(idx: number) {
    const r = this.refeicoes[idx];
    if (!r.selecionado || r.qtd <= 0) return;

    let info: AlimentoInfoOFF;
    try {
      info = await this.nutritionSvc.getAlimentoInfoOFF(
        r.selecionado.code,
        r.qtd
      );
    } catch {
      (await this.toastCtrl.create({
        message : 'Erro ao obter dados do alimento.',
        duration: 2000,
        color   : 'danger',
        position: 'top'
      })).present();
      return;
    }

    const cal = Math.round(info.calorias);
    r.itens.push({
      code      : r.selecionado.code,
      nome      : r.selecionado.nome,
      calorias  : cal,
      quantidade: r.qtd
    });
    r.totalCal += cal;

    r.selecionado = undefined;
    r.qtd         = 0;
    r.busca       = '';
  }

  removerItem(idxRefeicao: number, idxItem: number) {
    const r = this.refeicoes[idxRefeicao];
    const calRemover = r.itens[idxItem].calorias;
    r.totalCal -= calRemover;
    r.itens.splice(idxItem, 1);
  }

  removerRefeicao(idx: number) {
    this.refeicoes.splice(idx, 1);
    this.isSearching.splice(idx, 1);
  }

  async salvarDieta() {
    if (this.isSaving) return;

    // validações
    if (!this.nomeDieta.trim() || this.nomeDieta.trim().length < 3) {
      (await this.toastCtrl.create({
        message : 'Nome inválido (mínimo 3 caracteres).',
        duration: 2000,
        color   : 'danger',
        position: 'top'
      })).present();
      return;
    }
    if (!this.estimativaCal || this.estimativaCal <= 0) {
      (await this.toastCtrl.create({
        message : 'Informe calorias estimadas (>0).',
        duration: 2000,
        color   : 'danger',
        position: 'top'
      })).present();
      return;
    }
    if (this.refeicoes.length === 0) {
      (await this.toastCtrl.create({
        message : 'Adicione ao menos uma refeição.',
        duration: 2000,
        color   : 'danger',
        position: 'top'
      })).present();
      return;
    }

    this.totalKcalDieta = this.refeicoes.reduce((s, r) => s + r.totalCal, 0);

    const dietData: Omit<Diet, 'id' | 'dataCriacao' | 'userId'> = {
      nomeDieta    : this.nomeDieta.trim(),
      estimativaCal: this.estimativaCal,
      totalKcal    : this.totalKcalDieta,
      refeicoes    : this.refeicoes.map(r => ({
        tipo    : r.tipo,
        totalCal: r.totalCal,
        itens   : r.itens
      }))
    };

    this.isSaving = true;
    const load = await this.loadingCtrl.create({
      message: this.dietId ? 'Atualizando dieta...' : 'Salvando dieta...',
      spinner: 'crescent'
    });
    await load.present();

    try {
      if (this.dietId) {
        await this.dietService.deleteDiet(this.dietId);
        await this.dietService.addDiet(dietData);
      } else {
        await this.dietService.addDiet(dietData);
      }
      await load.dismiss();
      this.router.navigate(['/dietas']);
    } catch {
      await load.dismiss();
    } finally {
      this.isSaving = false;
    }
  }

  /** confirma e deleta a dieta */
  async confirmarDelete() {
    if (!this.dietId) return;
    const alert = await this.alertCtrl.create({
      header : 'Excluir dieta?',
      message: 'Deseja realmente remover toda esta dieta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text   : 'Excluir',
          handler: async () => {
            await this.dietService.deleteDiet(this.dietId!);
            this.router.navigate(['/dietas']);
          }
        }
      ]
    });
    await alert.present();
  }
}
