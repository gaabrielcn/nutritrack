// src/app/pages/home/home.page.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DietService } from '../../services/diet.service';
import { Diet } from '../../models/diet.model';

@Component({
  selector: 'app-home',
  standalone:false,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  dietas: Diet[] = [];
  selectedDieta: Diet | null = null;

  // Valores para o gráfico de calorias
  caloriasEstimadas = 0;   // meta informada pelo usuário
  caloriasIngeridas = 0;   // soma real das calorias (totalKcal)
  caloriasRestantes = 0;   // cálculo (Estimadas - Ingeridas)
  porcentagemCal = 0;      // 0–100

  private readonly CIRCUNFERENCIA = 2 * Math.PI * 44; // 2π·r, onde r = 44

  constructor(
    private dietService: DietService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.dietas = await this.dietService.getUserDiets();
    if (this.dietas.length > 0) {
      // seleciona a primeira dieta por padrão
      this.selecionarDieta(this.dietas[0]);
    }
  }

  selecionarDieta(dieta: Diet) {
    this.selectedDieta = dieta;

    // Busca a meta de calorias (campo que gravamos como estimativaCal)
    // Se não existir, cai para totalKcal (mas idealmente sempre definimos estimativaCal ao criar)
    this.caloriasEstimadas = (dieta as any).estimativaCal ?? dieta.totalKcal;

    // Calorias efetivamente consumidas (soma real que está em totalKcal)
    this.caloriasIngeridas = dieta.totalKcal;

    // Restantes = estimadas - ingeridas
    this.caloriasRestantes = Math.max(0, this.caloriasEstimadas - this.caloriasIngeridas);

    // Cálculo de porcentagem (ingeridas ÷ estimadas × 100), limitado a 100%
    this.porcentagemCal =
      this.caloriasEstimadas > 0
        ? Math.min(100, Math.round((this.caloriasIngeridas / this.caloriasEstimadas) * 100))
        : 0;
  }

  /**
   * Para que o donut só preencha a parte “consumida” e deixe o resto vazio:
   * definimos stroke-dasharray = "tamanhoConsumido tamanhoRestante".
   */
  get dashArray(): string {
    const consumido = (this.porcentagemCal / 100) * this.CIRCUNFERENCIA;
    const restante = this.CIRCUNFERENCIA - consumido;
    // ex.: "100.23 176.23"
    return `${consumido.toFixed(2)} ${restante.toFixed(2)}`;
  }

  /**
   * Escolhe a cor do segmento consumido:
   *  - Verde, se % ≤ 50
   *  - Amarelo, se 50 < % ≤ 80
   *  - Vermelho, se % > 80
   */
  get strokeColor(): string {
    if (this.porcentagemCal <= 50) {
      return '#2ecc71'; // verde
    } else if (this.porcentagemCal <= 80) {
      return '#f5b301'; // amarelo
    } else {
      return '#d32f2f'; // vermelho
    }
  }

  cadastrarDieta() {
    this.router.navigate(['/cadastrar-dietas']);
  }
}
