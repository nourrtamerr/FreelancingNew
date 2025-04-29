import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Environment } from '../../../base/environment';
import { AppUser, AppUsers, ClientsFilter, ClientsView, ClientView, CreateAdminDTO, EditProfileDTO, FilteredClients, FilteredFreelancers, ForgotPasswordDTO, Freelancers, FreelancersFilter, FreelancerView, IdentityVerificationRequest, LoginDTO, RefreshTokenDTO, RegisterDTO, ResetPasswordDTO, SingularFreelancer, Tokens, UserRole, UsersRequestingVerificaiton, VerificationDecision } from '../../Interfaces/Account';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
interface CreateAdminResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
 private apiUrl = `${Environment.baseUrl}Account`;

  constructor(private _HttpClient:HttpClient) { }
  getFreeAgents():Observable<Freelancers> {
      return this._HttpClient.get<Freelancers>(`${this.apiUrl}/FreeAgents`);
    }
    getFreeAgentsFiltered(filters: FreelancersFilter): Observable<FilteredFreelancers> {
      let params = new HttpParams();

    // Loop through the filters and convert them to query parameters
    for (const key in filters) {
      const value = filters[key as keyof FreelancersFilter];

      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            value.forEach(v => {
              params = params.append(key, String(v)); // use append for repeated params
            });
          }
        } else if (typeof value === 'boolean') {
          params = params.set(key, value ? 'true' : 'false');
        } else {
          params = params.set(key, String(value));
        }
      }
    }

    return this._HttpClient.get<FilteredFreelancers>(`${this.apiUrl}/FilteredFreeAgents`, { params });
    }

    getFreelancerByUsername(username:string):Observable<SingularFreelancer>{
      return this._HttpClient.get<SingularFreelancer>(`${this.apiUrl}/FreeAgent/${username}`);

    }

    getClients():Observable<ClientsView> {
      return this._HttpClient.get<ClientsView>(`${this.apiUrl}/Clients`);
    }


    getClientsFiltered(filters: ClientsFilter): Observable<FilteredClients> {
      let params = new HttpParams();

    // Loop through the filters and convert them to query parameters
    for (const key in filters) {
      const value = filters[key as keyof ClientsFilter];

      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            value.forEach(v => {
              params = params.append(key, String(v)); // use append for repeated params
            });
          }
        } else if (typeof value === 'boolean') {
          params = params.set(key, value ? 'true' : 'false');
        } else {
          params = params.set(key, String(value));
        }
      }
    }

    return this._HttpClient.get<FilteredClients>(`${this.apiUrl}/FilteredClients`, { params });
    }

    getClientByUsername(username:string):Observable<ClientView>{
      return this._HttpClient.get<ClientView>(`${this.apiUrl}/Clients/${username}`);

    }



    getUsers():Observable<AppUsers> {
      return this._HttpClient.get<AppUsers>(`${this.apiUrl}/GetAllUsers`);
    }
    myPorfile():Observable<AppUser> {
      return this._HttpClient.get<AppUser>(`${this.apiUrl}/MyProfile`);
    }

    getUserIdentityPicture(userid:string):Observable<string> {
      return this._HttpClient.get<string>(`${this.apiUrl}/getUserIdentityPicture?userid=${userid}`);
    }

    getUsersRequestingVerifications():Observable<UsersRequestingVerificaiton>{
      return this._HttpClient.get<UsersRequestingVerificaiton>(`${this.apiUrl}/getUsersRequestingVerifications`);
    }
    ToggleAvailability():Observable<string>{
      return this._HttpClient.get<string>(`${this.apiUrl}/ToggleAvailability`);
    }
    RequestIdentityVerification(request: IdentityVerificationRequest): Observable<string> {
      const formData = new FormData();
      formData.append('fullName', request.fullName);
      formData.append('nationalId', request.nationalId);
      formData.append('idPicture', request.idPicture);

      return this._HttpClient.post<string>(`${this.apiUrl}/RequestIdentityVerification`, formData);
  }
    VerifyIdentity(decision:VerificationDecision):Observable<string>{
      return this._HttpClient.post<string>(`${this.apiUrl}/ManageVerificationRequest`,decision);

    }


    EditProfile(profileData:EditProfileDTO):Observable<string>{
      const formData = new FormData();

  // Append required fields
  formData.append('firstname', profileData.firstname?.trim() || '');
  formData.append('lastname', profileData.lastname?.trim() || '');
  formData.append('userName', profileData.UserName?.trim() || '');
  formData.append('title', profileData.title?.trim() || '');
  formData.append('phoneNumber', profileData.PhoneNumber?.trim() || '');
  formData.append('Password', profileData.Password?.trim() || '');
  formData.append('ConfirmPassword', profileData.ConfirmPassword?.trim() || profileData.Password?.trim() || '');

  // Append CityId
  formData.append('CityId', profileData.CityId?.toString() || '0');

  // Append optional Description
  formData.append('Description', profileData.Description?.trim() || '');

  // Append DateOfBirth
  if (profileData.DateOfBirth instanceof Date && !isNaN(profileData.DateOfBirth.getTime())) {
    const year = profileData.DateOfBirth.getFullYear();
    const month = String(profileData.DateOfBirth.getMonth() + 1).padStart(2, '0');
    const day = String(profileData.DateOfBirth.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    formData.append('DateOfBirth', formattedDate);
  } else {
    formData.append('DateOfBirth', '');
  }

  // Append ProfilePicture
  if (profileData.ProfilePicture instanceof File) {
    formData.append('ProfilePicture', profileData.ProfilePicture, profileData.ProfilePicture.name);
  }

  // Log FormData for debugging
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
      // const dto=formData;

      const formData2 = new FormData();
formData2.append('Test', 'hello');
return this._HttpClient.put<string>(`${this.apiUrl}/EditProfile`, formData);
return this._HttpClient.post<string>(`${this.apiUrl}/Testingformdata`, formData2);
    }
  
    MakeAdmin(userId: string): Observable<string> {
      return this._HttpClient.post<string>(`${this.apiUrl}/MakeAdmin`,{ UserId: userId });
    }
    RemoveAdmin(userId: string): Observable<any> {
      return this._HttpClient.post(`${this.apiUrl}/RemoveAdmin`, { UserId: userId });
    }


    

   

    CreateAdminAccount(AdminData: FormData): Observable<CreateAdminResponse> {
      return this._HttpClient.post<CreateAdminResponse>(`${this.apiUrl}/CreateAdminAccount`, AdminData);
  }
  


    Register(formData: FormData): Observable<any> {
      return this._HttpClient.post<any>(`${this.apiUrl}/Register`, formData);
    }



  Login(dto:LoginDTO):Observable<Tokens>{
    return this._HttpClient.post<Tokens>(`${this.apiUrl}/Login`,dto);
  }

  RefreshToken(dto:RefreshTokenDTO):Observable<Tokens>{
    return this._HttpClient.post<Tokens>(`${this.apiUrl}/Refresh-Token`,dto);
  }


  ForgotPassword(dto: ForgotPasswordDTO, reseturl: string): Observable<string> {
    return this._HttpClient.post<string>(
      `${this.apiUrl}/ForgotPassword?reseturl=${reseturl}`,
      dto
    );
  }

  ResetPassword(dto: ResetPasswordDTO): Observable<string> {
    return this._HttpClient.post<string>(`${this.apiUrl}/ResetPassword`, dto);
  }


  ResendEmailConfirmation(email: string): Observable<{ message: string }> {
    return this._HttpClient.get<{ message: string }>(`${this.apiUrl}/ResendEmailConfirmation`, {
      params: new HttpParams().set('emailToBeCONFIRMED', email)
    });
  }


ExternalLogin(provider: string, role?: UserRole, returnUrl?: string, errorUrl?: string): Observable<any> {
  let params = new HttpParams()
    .set('provider', provider)
    .set('returnUrl', returnUrl || '')
    .set('errorurl', errorUrl || '');

  if (role) {
    params = params.set('role', role);
  }

  const url = `${this.apiUrl}/External-login?${params.toString()}`;

  return new Observable(observer => {
    window.location.href = url;
    observer.next(null);
    observer.complete();
  });
}


private toastr=inject(ToastrService);
checkExternalLogin(): void {
  const url = new URL(window.location.href);
  const error = url.searchParams.get('error');

  if (error) {
    this.toastr.error(error);
    // Clean the URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}



}

    // getProfile(): Observable<EditProfileDTO> {
    //   return this.http.get<EditProfileDTO>(`${this.apiUrl}`);
    // }


