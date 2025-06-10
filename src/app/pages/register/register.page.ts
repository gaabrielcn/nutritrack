import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone:false,
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  formatPhone(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      value = value.substring(0, 11);
    }
    
    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }
    
    if (value.length > 10) {
      value = `${value.substring(0, 10)}-${value.substring(10)}`;
    }
    
    this.registerForm.get('phone')?.setValue(value, { emitEvent: false });
  }

  async register() {
    if (this.registerForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create();
    await loading.present();

    try {
      const { email, password } = this.registerForm.value;
      const user = await this.authService.register({ email, password });
      
      await loading.dismiss();

      if (user) {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      } else {
        this.showAlert('Erro ao cadastrar', 'Tente novamente.');
      }
    } catch (error: any) {
      await loading.dismiss();
      this.showAlert('Erro', this.getFirebaseErrorMessage(error.code));
    }
  }

  private markAllAsTouched() {
    Object.keys(this.registerForm.controls).forEach(field => {
      const control = this.registerForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  private getFirebaseErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este email já está cadastrado.';
      case 'auth/invalid-email':
        return 'O email informado é inválido.';
      case 'auth/weak-password':
        return 'A senha deve ter no mínimo 6 caracteres.';
      default:
        return 'Ocorreu um erro ao cadastrar. Tente novamente.';
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}