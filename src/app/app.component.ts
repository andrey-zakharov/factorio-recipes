import { Component, OnInit } from '@angular/core';
import { RecipesService } from './recipes.service';
import { Observable } from 'rxjs';
import { format as d3format, scaleOrdinal, schemeCategory10 } from 'd3';
import * as d3 from 'd3-selection';
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'factorio-recipes';
	recipes: Map<string, any> = new Map();
	svg;
	constructor( private data: RecipesService ) {} 

	ngOnInit(): void {
		this.data.getRecipes().subscribe(data => this.ongetrecipes(data));
		this.svg = d3.select("svg");

	}

	ongetrecipes(data) {
		this.recipes = data;
		this.drawGraphFor("atomic-bomb");
	}

	onchange(e) {
		this.drawGraphFor( e.target.value );
	}

	drawGraphFor( recipeId ) {

		let width = 800;
		let height = 600;
		let [nodesMap, links] = this.getSourcesFor( recipeId );
		let nodes : Array = Array.from(nodesMap.values());
		console.log(nodes);

	 	const scale = scaleOrdinal(schemeCategory10)
	    const color = name => scale(name.replace(/ .*/, ''));
	    const format = d3format(".2g");
		{links, nodes} = d3Sankey()
			.nodeId(d=>d.id)
			.extent([[1, 1], [width - 1, height - 5]])
		({ 
			//nodes: [ {id: "a", name: "test1"}, {id: "b", name: "another-test"}, { id:"c", name: "third test"}],
			nodes: nodes, links: links,
			// links: [ 
			// 	{source: "a", target: "b", type: "x", value: 2},
			// 	{source: "a", target: "c", type: "y", value: 3},
			// ]
		});

		console.log(nodes, "nodes");
		this.svg.selectAll("*").remove();
	  	const link = this.svg.append("g")
    		.attr("fill", "none")
    		.attr("stroke", "#000")
    		.attr("stroke-opacity", 0.2)
  		.selectAll("path")
  		.data(links)
  		.enter().append("path")
  			.attr("stroke", d => color(d.source.name))
    		.attr("d", sankeyLinkHorizontal())
    		.attr("stroke-width", function(d) { return d.width; });

		link.append("title")
			.text(d => `${d.source.name} → ${d.target.name}\n${d.value}`);

		this.svg.append("g")
      		.attr("stroke", "#000")
    	.selectAll("rect")
	    .data(nodes)
	    .enter().append("rect")
      		.attr("x", d => d.x0)
			.attr("y", d => d.y0)
			.attr("height", d => d.y1 - d.y0)
			.attr("width", d => d.x1 - d.x0)
			.attr("fill", d => color(d.name))
	    .append("title")
      		.text(d => `${d.name}\ninput ${format(d.value)} items per second`);

  		this.svg.append("g")
	      	.selectAll('rect')
	    	.data(nodes)
	        .enter()
	        	.append("text")
	        		.attr('fill', d => color(d.name))
			      	.attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
			      	.attr("y", d => (d.y1 + d.y0) / 2)
		      		.attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
		      		.attr("dy", "0.35em")
		      		.text(d => d.name);

	}

	// return nodes, links
	getSourcesFor( recipeId ) {
		let nodes = new Map<string, any>();
		let links = [];
		//console.group(recipeId);
		nodes.set(recipeId, {id: recipeId, name: this.recipes[recipeId].name});
		
		for ( const ingr of this.recipes[recipeId].recipe.ingredients ) {
			
			//nodes.set(ingr.id, {id: ingr.id, name: this.recipes[ingr.id].name});
			links.push( { 
				source: ingr.id , target: recipeId, 
				value: ingr.amount / this.recipes[recipeId].recipe.time / this.recipes[recipeId].recipe.yield 
			} );
			const [childNodes, childLinks] = this.getSourcesFor(ingr.id);

			childNodes.forEach(function (v, k, m) {
				nodes.set(k, v);
			});
			links.push.apply( links, childLinks );

			
		}
		//console.debug(nodes, recipeId);

		//console.groupEnd();

		return [nodes, links]
	}
}
