import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CadastrarDietasPage } from './cadastrar-dietas.page';

const routes: Routes = [
  {
    path: '',
    component: CadastrarDietasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadastrarDietasPageRoutingModule {}
