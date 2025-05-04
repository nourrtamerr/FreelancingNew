import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Shared/Services/Auth/auth.service';
import { ForgotPasswordDTO, ResetPasswordDTO, UserRole } from '../../../Shared/Interfaces/Account';
import { CommonModule } from '@angular/common';
// import { UsernavComponent } from '../usernav/usernav.component';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../../Shared/Services/Account/account.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

interface PasswordMatchErrors extends ValidationErrors {
  mismatch: boolean;
}
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,CommonModule,FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  forgetPassword!: FormGroup;
  resetPassword!: FormGroup;
  errorMessage: string | null = null;
  isLoging = false;
  isLoading = false;
  selectedRole: UserRole | null = null;
  roleOptions = Object.values(UserRole);
  emailFromQuery: string | null = null;
  tokenFromQuery: string | null = null;
  frontendBase = 'http://localhost:4200';
  currentForm: 'login' | 'forgotPassword' | 'resetPassword' = 'login';
  passwordStrength: number = 0;
  passwordStrengthText: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private _AccountService: AccountService,
    private _ToastrService: ToastrService,
    private route: ActivatedRoute
  ) {
    this.initForms();
  }

  private initForms(): void {
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

    this.resetPassword.get('newPassword')?.valueChanges.subscribe(
      password => this.checkPasswordStrength(password || '')
    );
  }

  checkPasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      this.passwordStrengthText = '';
      return;
    }

    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    this.passwordStrength = Math.min(5, strength);

    if (strength <= 1) this.passwordStrengthText = 'Very Weak';
    else if (strength === 2) this.passwordStrengthText = 'Weak';
    else if (strength === 3) this.passwordStrengthText = 'Medium';
    else if (strength === 4) this.passwordStrengthText = 'Strong';
    else this.passwordStrengthText = 'Very Strong';
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoging = isLoggedIn;
      if (isLoggedIn) {
        this.router.navigate(['/home']);
      }
    });

    console.log('Role:', this.authService.getRole());

    this.processQueryParams();
  }

  private processQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      this.emailFromQuery = params['email'] ? decodeURIComponent(params['email']) : null;
      this.tokenFromQuery = params['token'] ? decodeURIComponent(params['token']) : null;

      if (this.emailFromQuery && this.tokenFromQuery) {
        this.currentForm = 'resetPassword';
        this.resetPassword.patchValue({
          email: this.emailFromQuery,
          token: this.tokenFromQuery
        });
        console.log('Reset password form initialized with email:', this.emailFromQuery);
      } else {
        this.currentForm = 'login';
      }

      if (params['error']) {
        this.errorMessage = decodeURIComponent(params['error']);
        this._ToastrService.error(this.errorMessage, 'External Login Failed');
        this.currentForm = 'login';
      }

      if (params['pleaseLogin'] !== undefined) {
        this.currentForm = 'login';
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const credentials = this.loginForm.value;

    this.authService.login(credentials)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError(error, 'Login failed');
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(response => {
        if (response) {
          this.handleSuccessfulLogin(response);
        }
      });
  }

  private handleSuccessfulLogin(response: { token: string }): void {
    document.cookie = `user_Token=${response.token}; path=/; secure; samesite=Lax`;
    this.authService.deCodeUserData(response.token);
    this._ToastrService.success('Login successful! Redirecting to your profile...', 'Welcome Back');
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 500);
  }

  ExternalLogin(provider: 'Google' | 'Facebook'): void {
    const returnUrl = `${this.frontendBase}/home`;
    const errorUrl = `${this.frontendBase}/home`;

    console.log(`Initiating ${provider} login...`);
    this._ToastrService.info(`Redirecting to ${provider} login...`, 'Please wait');

    this.authService.logout();

    this._AccountService.ExternalLogin(provider, undefined, returnUrl, errorUrl)
      .pipe(
        catchError((error) => {
          this.errorMessage = 'External login initiation failed. Please try again.';
          this._ToastrService.error(this.errorMessage, `${provider} Login Failed`);
          this.currentForm = 'login';
          return of(null);
        })
      )
      .subscribe();
  }

  passwordMatchValidator(form: FormGroup): PasswordMatchErrors | null {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmNewPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  getPassword(): void {
    if (this.forgetPassword.invalid) {
      this.markFormGroupTouched(this.forgetPassword);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const email = this.forgetPassword.value.email;
    const reseturl = `${this.frontendBase}/login`;
    const successurl = `${this.frontendBase}/profile`;
    const errorUrl = `${this.frontendBase}/home`;

    const dto: ForgotPasswordDTO = {
      email,
      successurl,
      errorUrl
    };

    this._AccountService.ForgotPassword(dto, reseturl)
      .pipe(
        catchError((error) => {
          this.handleError(error, 'Failed to send reset password link');
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(response => {
        if (response) {
          this._ToastrService.success(
            'Please check your email and follow the instructions to reset your password.',
            'Reset Link Sent!'
          );
          this.forgetPassword.reset();
        }
      });
  }

  resetPasswordSubmit(): void {
    if (this.resetPassword.invalid) {
      this.markFormGroupTouched(this.resetPassword);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const dto: ResetPasswordDTO = {
      newPassword: this.resetPassword.value.newPassword,
      confirmNewPassword: this.resetPassword.value.confirmNewPassword,
      email: this.resetPassword.value.email,
      token: this.resetPassword.value.token
    };

    this._AccountService.ResetPassword(dto)
      .pipe(
        catchError((error) => {
          this.handleError(error, 'Failed to reset password');
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(response => {
        if (response) {
          this._ToastrService.success(
            'Your password has been reset successfully. You can now log in with your new password.',
            'Password Reset'
          );
          this.resetPassword.reset();
          this.currentForm = 'login';
          this.loginForm.reset();
          this.errorMessage = null;
        }
      });
  }

  showLogin(): void {
    this.currentForm = 'login';
    this.loginForm.reset();
    this.errorMessage = null;
  }

  showForgotPasswordView(): void {
    this.currentForm = 'forgotPassword';
    this.forgetPassword.reset();
    this.errorMessage = null;
  }

  closeLoginDropdown(): void {
    // The dropdown may not exist in the new UI structure, so this is just a fallback
    // for backward compatibility with the old UI
    const loginBtn = document.getElementById('wt-loginbtn');
    if (!loginBtn) return;

    const dropdownContainer = loginBtn.closest('.wt-loginarea')?.querySelector('.wt-loginformhold');
    if (dropdownContainer?.classList.contains('show')) {
      loginBtn.click();
    }
  }

  /**
   * Utility method to handle HTTP errors
   */
  private handleError(error: HttpErrorResponse, defaultMessage: string): void {
    console.error('API Error:', error);

    if (error.error?.message) {
      this.errorMessage = String(error.error.message);
    } else if (error.error?.errors) {
      // Extract the first error message if available
      const firstError = Object.values(error.error.errors)[0];
      this.errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
    } else {
      this.errorMessage = defaultMessage;
    }

    this._ToastrService.error(this.errorMessage || 'An error occurred. Please try again later.', 'Error', { timeOut: 7000 });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
