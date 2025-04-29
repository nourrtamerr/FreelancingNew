import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Shared/Services/Auth/auth.service';
import { ForgotPasswordDTO, ResetPasswordDTO, UserRole } from '../../../Shared/Interfaces/Account';
import { CommonModule } from '@angular/common';
import { UsernavComponent } from '../usernav/usernav.component';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../../Shared/Services/Account/account.service';
import { HttpErrorResponse } from '@angular/common/http';

interface PasswordMatchErrors extends ValidationErrors {
  mismatch: boolean;
}

@Component({
  selector: 'app-home-navbar',
  templateUrl: './home-navbar.component.html',
  styleUrls: ['./home-navbar.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule, UsernavComponent, RouterModule],
  standalone: true,
})
export class HomeNavbarComponent implements OnInit {
  loginForm: FormGroup;
  forgetPassword: FormGroup;
  resetPassword: FormGroup;
  errorMessage: string | null = null;
  isLoging = false;
  isLoading = false;
  selectedRole: UserRole | null = null;
  roleOptions = Object.values(UserRole);
  showForgotPasswordForm = false;
  emailFromQuery: string | null = null;
  tokenFromQuery: string | null = null;
  frontendBase = 'http://localhost:4200';
  isLoginFormVisible = true; // Controls login form visibility
  isForgotPasswordFormVisible = false; // Controls forgot password form visibility
  isResetPasswordFormVisible = false; // Controls reset password form visibility

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private _AccountService: AccountService,
    private _ToastrService: ToastrService,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      Usernameoremail: ['', [Validators.required]],
      loginPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.forgetPassword = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetPassword = this.fb.group({
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ]
      ],
      confirmNewPassword: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      token: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoging = isLoggedIn;
    });

    console.log('Role:', this.authService.getRole());

    this.route.queryParams.subscribe(params => {
      this.emailFromQuery = params['email'] ? decodeURIComponent(params['email']) : null;
      this.tokenFromQuery = params['token'] ? decodeURIComponent(params['token']) : null;
      if (this.emailFromQuery && this.tokenFromQuery) {
        this.showForgotPasswordForm = false;
        this.isLoginFormVisible = false;
        this.isForgotPasswordFormVisible = false;
        this.isResetPasswordFormVisible = true;
        this.resetPassword.patchValue({
          email: this.emailFromQuery,
          token: this.tokenFromQuery
        });
        console.log('Patched resetPassword form:', {
          email: this.emailFromQuery,
          token: this.tokenFromQuery.substring(0, 50) + '...' 
        });
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = decodeURIComponent(params['error']);
        this._ToastrService.error(this.errorMessage, 'External Login Failed');
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['pleaseLogin'] !== undefined) {
        this.tryClickLoginButton();
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response: { token: string }) => {
        document.cookie = `user_Token=${response.token}; path=/; secure; samesite=Lax`;
        this.authService.deCodeUserData(response.token);
        this.router.navigate(['/home2/profile']);
        this._ToastrService.success('Login successful!');
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        this._ToastrService.error(this.errorMessage || 'An error occurred. Please try again later.', 'Error', { timeOut: 7000 });
        this.loginForm.reset();
        this.isLoading = false;
      }
    });
  }

  ExternalLogin(provider: 'Google' | 'Facebook'): void {
    const returnUrl = `${this.frontendBase}/home2/profile`;
    const errorUrl = `${this.frontendBase}/home`;
  
    console.log(`Attempting external login with ${provider}`);
  
    this.authService.logout();
  
    this._AccountService.ExternalLogin(provider, undefined, returnUrl, errorUrl).subscribe({
      error: (err) => {
        this._ToastrService.error('External login failed. Please try again.');
      }
    });
  }

  passwordMatchValidator(form: FormGroup): PasswordMatchErrors | null {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmNewPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  getPassword(): void {
    if (this.forgetPassword.invalid) {
      this.forgetPassword.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.forgetPassword.value.email;
    const reseturl = `${this.frontendBase}/home`;
    const successurl = `${this.frontendBase}/home2/profile`;
    const errorUrl = `${this.frontendBase}/home`;

    const dto: ForgotPasswordDTO = {
      email,
      successurl,
      errorUrl
    };

    console.log('ForgotPassword Request:', { dto, reseturl });

    this._AccountService.ForgotPassword(dto, reseturl).subscribe({
      next: (response) => {
        console.log('ForgotPassword Response:', response);
        this._ToastrService.success('Check your email for reset password link!');
        this.forgetPassword.reset();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('ForgotPassword Error:', err);
        this.errorMessage = err.error?.message || err.error?.errors?.reseturl?.[0] || 'Failed to send reset password link.';
        this._ToastrService.error(this.errorMessage || 'An error occurred. Please try again later.', 'Error', { timeOut: 7000 });
        this.router.navigateByUrl('/home');
        this.isLoading = false;
      }
    });
  }

  resetPasswordSubmit(): void {
    if (this.resetPassword.invalid) {
      this.resetPassword.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const dto: ResetPasswordDTO = {
      newPassword: this.resetPassword.value.newPassword,
      confirmNewPassword: this.resetPassword.value.confirmNewPassword,
      email: this.resetPassword.value.email,
      token: this.resetPassword.value.token
    };

    console.log('ResetPassword Request:', {
      email: dto.email,
      newPassword: dto.newPassword,
      confirmNewPassword: dto.confirmNewPassword,
      token: dto.token
    });

    this._AccountService.ResetPassword(dto).subscribe({
      next: (response) => {
        console.log('ResetPassword Response:', response);
        this._ToastrService.success('Password reset successfully! Please log in.');
        this.resetPassword.reset();
        this.router.navigateByUrl('/home2/profile');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('ResetPassword Error:', err);
        this.errorMessage = err.error?.message || 'Failed to reset password.';
        this._ToastrService.error(this.errorMessage || 'An error occurred. Please try again later.', 'Error', { timeOut: 7000 });
        this.isLoading = false;
      }
    });
  }

  showLogin(): void {
    this.showForgotPasswordForm = false;
    this.emailFromQuery = null;
    this.tokenFromQuery = null;
    this.isLoginFormVisible = true;
    this.isForgotPasswordFormVisible = false;
    this.isResetPasswordFormVisible = false;
    this.loginForm.reset();
    this.errorMessage = null;
    // this.closeLoginDropdown();
  }

  toggleForgotPassword(): void {
    this.showForgotPasswordForm = true;
    this.isLoginFormVisible = false;
    this.isForgotPasswordFormVisible = true;
    this.isResetPasswordFormVisible = false;
    this.forgetPassword.reset();
    this.errorMessage = null;
    // this.closeLoginDropdown();
  }

  showForgotPassword(): void {
    this.showForgotPasswordForm = true;
    this.emailFromQuery = null;
    this.tokenFromQuery = null;
    this.isLoginFormVisible = false;
    this.isForgotPasswordFormVisible = true;
    this.isResetPasswordFormVisible = false;
    this.forgetPassword.reset();
    this.errorMessage = null;
    // this.closeLoginDropdown();
  }

 
  closeLoginDropdown(): void {
    const loginBtn = document.getElementById('wt-loginbtn');
    if (loginBtn) {
      loginBtn.click();
    }
  }

  private tryClickLoginButton(): void {
    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(() => {
      const loginBtn = document.getElementById('wt-loginbtn');
      if (loginBtn) {
        loginBtn.click();
        clearInterval(interval);
      } else if (++attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn('Login button not found after multiple attempts');
      }
    }, 100); // Retry every 100ms
  }
}
  