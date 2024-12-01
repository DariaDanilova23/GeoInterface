import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LogoutComponent } from './logout/logout.component'
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { MousePositionComponent } from './mouse-position/mouse-position.component';
import { RulerComponent } from './ruler/ruler.component';
import { GeolocationComponent } from './geolocation/geolocation.component';
import { provideAuth0 } from '@auth0/auth0-angular';
import { LayerListComponent } from './layer-list/layer-list.component';
import { HttpClientModule } from '@angular/common/http';
import { AttributeTableComponent } from './attribute-table/attribute-table.component';
import { SearchDataComponent } from './search-data/search-data.component';
import { ExportMapComponent } from './export-map/export-map.component';
import { FormsModule } from '@angular/forms';
import { UploadComponent } from './upload/upload.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MousePositionComponent,
    RulerComponent,
    GeolocationComponent,
    LogoutComponent,
    LayerListComponent,
    AttributeTableComponent,
    SearchDataComponent,
    ExportMapComponent,
    UploadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule 

   // ReactiveFormsModule,
    //HttpClientModule,
    //RouterModule
   // RulerComponent,
  ],
  providers: [
    provideAuth0({
      domain: 'dev-qkvu2gwk1shvhz5e.us.auth0.com',
      clientId: 'GObS7L0cPc5Msotmr7a7sFnVfiLLkZmk',
      authorizationParams: {
        redirect_uri: 'http://localhost:4200/map',
        ui_locales: 'ru'
      }
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
