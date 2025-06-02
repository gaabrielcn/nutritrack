import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone:false,
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async signOut(): Promise<void> {
    try {
      await this.auth.logout();
      // Após logout, redireciona para a rota de login
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  }
}
