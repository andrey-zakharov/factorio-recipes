import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {

  constructor( private http: HttpClient ) { }

  getRecipes() {
    return this.http.get(
        'https://kevinta893.github.io/factorio-recipes-json/recipes.dictionary.min.json'
    //  'https://raw.githubusercontent.com/andrey-zakharov/factorio-recipes-json/master/recipes.json'
    );
  }
}
