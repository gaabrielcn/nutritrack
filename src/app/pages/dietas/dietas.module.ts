// src/app/pages/dietas/dietas.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DietasPageRoutingModule } from './dietas-routing.module';
import { DietasPage } from './dietas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DietasPageRoutingModule
    // Não adicione AngularFireModule nem AngularFirestoreModule aqui
  ],
  declarations: [DietasPage]
})
export class DietasPageModule {}
