import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IconsProviderModule } from './icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import {HomepageModule} from "./homepage/homepage.module";
import {SharedModule} from "./shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UserModule} from "./user/user.module";
import {AppService} from "./app.service";
import {BasicAuthInterceptorService} from "./shared/services/basic-auth-interceptor.service";
import {AssistanceModule} from "./assistance/assistance.module";
import {AppointmentModule} from "./appointment/appointment.module";
import {SettingsModule} from "./settings/settings.module";
import {ProfileModule} from "./profile/profile.module";

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    HttpClientModule,
    BrowserAnimationsModule,
    HomepageModule,
    SettingsModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    UserModule,
    ProfileModule,
    AssistanceModule,
    AppointmentModule
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }, AppService, {provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptorService, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
