import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DietasPage } from './dietas.page';

const routes: Routes = [
  {
    path: '',
    component: DietasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DietasPageRoutingModule {}
