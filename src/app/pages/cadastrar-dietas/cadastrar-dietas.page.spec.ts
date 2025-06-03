import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastrarDietasPage } from './cadastrar-dietas.page';

describe('CadastrarDietasPage', () => {
  let component: CadastrarDietasPage;
  let fixture: ComponentFixture<CadastrarDietasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastrarDietasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
