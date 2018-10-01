import { BrowserModule } from '@angular/platform-browser';
import { NgModule, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RecipesService } from './recipes.service';

import { AppComponent } from './app.component';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSlideToggleModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {
}
