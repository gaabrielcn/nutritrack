// src/app/pages/cadastrar-dietas/cadastrar-dietas.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CadastrarDietasPageRoutingModule } from './cadastrar-dietas-routing.module';
import { CadastrarDietasPage } from './cadastrar-dietas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CadastrarDietasPageRoutingModule
    // Não adicione AngularFireModule nem AngularFirestoreModule aqui
  ],
  declarations: [CadastrarDietasPage]
})
export class CadastrarDietasPageModule {}
