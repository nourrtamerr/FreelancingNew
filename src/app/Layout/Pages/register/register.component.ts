import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { differenceInYears } from 'date-fns';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AccountService } from '../../../Shared/Services/Account/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CountriesService } from '../../../Shared/Services/Countries/countries.service';
import { HomeNavbarComponent } from '../../Additions/home-navbar/home-navbar.component';


@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule,HomeNavbarComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  selectedFile: File | null = null;
  cities: any[] = [];
  constructor(
    private fb: FormBuilder,
    private _AccountService: AccountService,
    private _Router: Router,
    private _toaste: ToastrService,
    private _CountriesService: CountriesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
        UserName: ['', Validators.required],
        Email: ['', [Validators.required, Validators.email]],
        PhoneNumber: [
          '',
          [
            Validators.required,
            Validators.minLength(11),
            Validators.maxLength(11),
            Validators.pattern(/^\d{11}$/)
          ]
        ],
        DateOfBirth: ['', [Validators.required, this.dateFormatValidator]],
        CityId: ['', Validators.required],
        Role: ['Freelancer', Validators.required],
        Password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
          ]
        ],
        ConfirmPassword: ['', [Validators.required]]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
    this._CountriesService.getCountries().subscribe(cities => {
      this.cities = cities;
      console.log(this.cities);
    });


    
  this.route.queryParams.subscribe(params => {
    if (params['externalLoginFailed'] === 'true') {
      this._toaste.warning(
        'Your account was not found. Please register to continue.',
        'External Login Failed'
      );
    }
  });
  }

  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('Password')?.value;
    const confirmPassword = form.get('ConfirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  dateFormatValidator(control: AbstractControl): { [key: string]: any } | null {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const value = control.value;
    if (value && !dateRegex.test(value)) {
      return { invalidDateFormat: true };
    }
    return null;
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const validExtensions = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validExtensions.includes(file.type)) {
        this._toaste.error('Only JPG, PNG, or GIF files are allowed.');
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const values = this.registerForm.value;
    const userDob = new Date(values.DateOfBirth);
    const userAge = differenceInYears(new Date(), userDob);

    if (userAge < 18) {
      this._toaste.error('You must be at least 18 years old to register.');
      return;
    }

    const formData = new FormData();
    formData.append('firstname', values.firstname);
    formData.append('lastname', values.lastname);
    formData.append('CityId', values.CityId?.toString() ?? '');
    formData.append('UserName', values.UserName);
    formData.append('Email', values.Email);
    formData.append('PhoneNumber', values.PhoneNumber);
    const dob = new Date(values.DateOfBirth);
    const formattedDob = `${dob.getFullYear()}-${(dob.getMonth()+1).toString().padStart(2, '0')}-${dob.getDate().toString().padStart(2, '0')}`;
    formData.append('DateOfBirth', formattedDob);
    formData.append('Role', values.Role);
    formData.append('Password', values.Password);
    formData.append('ConfirmPassword', values.ConfirmPassword);
    if (this.selectedFile) {
      formData.append('ProfilePicture', this.selectedFile);
    }
    this._AccountService.Register(formData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this._toaste.success('Registration successful! A confirmation email has been sent.');
    
        this._AccountService.ResendEmailConfirmation(values.Email).subscribe({
          next: () => {
            this._toaste.info('A new email confirmation has been sent to your inbox.');
            setTimeout(() => {
              window.close(); 
            }, 500);
          },
          error: (error) => {
            console.error('Resend failed:', error);
            this._toaste.warning('Failed to resend confirmation email.');
          }
        });
    
        // Optionally redirect somewhere like /check-email
        // this._Router.navigate(['/check-email']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        if (error.error?.errors) {
          Object.entries(error.error.errors).forEach(([field, errors]) => {
            const errorMessages = (errors as any[]).join(', ');
            this._toaste.error(`${field}: ${errorMessages}`);
          });
        } else {
          this._toaste.error(
            error.error?.message || 'Registration failed. Please try again.'
          );
        }
      }
    });
    
  }
}