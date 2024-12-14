import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-auth-button',
  template: `
    <ng-container *ngIf="auth.isAuthenticated$ | async; else loggedOut">
      <button class="btn border-0 text-white p-0 m-0" (click)="auth.logout({ logoutParams: { returnTo: document.location.origin } })">
        <i class="w-100 h-100" style="font-size: 1.5rem;" class="bi bi-box-arrow-left"></i>
      </button>
    </ng-container>

    <ng-template #loggedOut>
      <button class="btn border-0 text-white p-0 m-0" (click)="auth.loginWithRedirect({ authorizationParams: { ui_locales: 'ru' } })">
        <i class="w-100 h-100" style="font-size: 1.5rem;" class="bi bi-box-arrow-in-right"></i>
      </button>
    </ng-template>
  `
})
export class AuthComponent {
  accessToken: string | null = null;
  constructor(@Inject(DOCUMENT) public document: Document, public auth: AuthService) { }

}
