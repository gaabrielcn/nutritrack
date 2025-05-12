import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone:false,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  dietas = [
    { nome: 'Dieta 01', calorias: 2100 },
    { nome: 'Dieta 02', calorias: 2000 },
  ];
  selectedDieta: any = null;
  caloriasTotais = 2100;
  caloriasIngeridas = 1116;
  caloriasRestantes = 984;
  macronutrientes = {
    gordura: 55,
    proteina: 45,
    carboidratos: 250
  };
  refeicoesConsumidas = [
    { nome: 'Café', calorias: 300, img: 'https://storage.googleapis.com/a1aa/image/f0baeec4-8624-4677-8702-6be29d63431b.jpg' },
    { nome: 'Almoço', calorias: 700, img: 'https://storage.googleapis.com/a1aa/image/2df44174-fdc2-48b9-c562-df4e31969a5e.jpg' },
    { nome: 'Lanche', calorias: 200, img: 'https://storage.googleapis.com/a1aa/image/9b38f545-5ce1-40fa-8912-764d4c84d5f0.jpg' }
  ];

  selecionarDieta(dieta: any) {
    this.selectedDieta = dieta;
    this.caloriasTotais = dieta.calorias;
    this.caloriasRestantes = dieta.calorias - this.caloriasIngeridas;
  }

  cadastrarDieta() {
    // Lógica para cadastrar uma nova dieta
  }
}
