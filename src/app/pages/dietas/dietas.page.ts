import { Component } from '@angular/core';

@Component({
  selector: 'app-dietas',
  standalone:false,
  templateUrl: './dietas.page.html',
  styleUrls: ['./dietas.page.scss'],
})
export class DietasPage {
  dietas = [
    {
      nome: 'Dieta 01',
      kcalTotal: 1500
    },
    {
      nome: 'Dieta 02',
      kcalTotal: 1800
    },
    {
      nome: 'Dieta 03',
      kcalTotal: 1600
    }
  ];

  constructor() {}

  cadastrarDieta() {
    // Aqui você pode futuramente navegar para a tela de cadastro
    console.log('Cadastrar nova dieta');
  }
}
