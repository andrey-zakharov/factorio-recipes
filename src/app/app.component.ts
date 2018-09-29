import { Component, OnInit } from '@angular/core';
import { RecipesService } from './recipes.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'factorio-recipes';
	recipes: Map<string, any> = new Map();
	constructor( private data: RecipesService ) {} 

	ngOnInit(): void {
		this.data.getRecipes().subscribe(data => this.ongetrecipes(data));
	}

	ongetrecipes(data) {
		this.recipes = data;
		this.drawGraphFor("atomic-bomb");
	}

	onchange(e) {
		this.drawGraphFor( e.target.value );
	}

	drawGraphFor( recipeId ) {
		this.getSourcesFor( recipeId );
	}

	getSourcesFor( recipeId ) {
		for( const ingr of this.recipes[recipeId].recipe.ingredients ) {
			console.log( ingr );
		}
	}
}
