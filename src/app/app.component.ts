import { Component, Input,
    OnInit, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { RecipesService } from './recipes.service';
import { Observable } from 'rxjs';
import { path, format as d3format, scaleOrdinal, schemeCategory10, scaleImplicit, range as d3Range } from 'd3';
import * as d3 from 'd3-selection';
import { sankey as d3Sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey';
import { linkHorizontal } from 'd3-shape';
import {MatMenuModule} from '@angular/material/menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnChanges, OnInit {
    title = 'factorio-recipes';
    recipes: Object;
    categories: Map<string, Array<Array<string>>> = new Map();
    svg;
    liquidInBarrels: boolean = false;
    @Input() selectedRecipeId: string;

    constructor( private data: RecipesService ) {}

    ngOnInit(): void {
        this.data.getRecipes().subscribe(data => this.ongetrecipes(data));
        this.svg = d3.select('svg');

    }

    ngOnChanges(changes: SimpleChanges) {
        console.log(changes);
        // const name: SimpleChange = changes.selectedRecipeId;
    }

    onrecipeselect(rid) {
        this.selectedRecipeId = rid;
        this.drawGraphFor(rid);
    }


    ongetrecipes(data) {
        this.recipes = data;

        for ( const [k, r] of Object.entries( this.recipes ) ) {
            if ( r.recipe.ingredients.length === 0 ) { continue; }

            if ( ! this.categories.has( r.type ) ) {
                this.categories.set( r.type, [] );
            }

            this.categories.get( r.type ).push([r.id, r.name]);
        }

        this.selectedRecipeId = 'atomic-bomb';
        this.drawGraphFor('atomic-bomb');
    }

    onchange(e) {
        this.drawGraphFor(this.selectedRecipeId);
    }

    drawGraphFor( recipeId ) {

        // console.group(recipeId);

        const width: number = 5000;
        const height: number = 4000;

        const [nodesMap, rawLinks] = this.getSourcesFor( recipeId );
        const rawNodes: Array<any> = Array.from(nodesMap.values());
        // console.debug('raw nodes', nodes);
        // console.debug('raw links', links);
        // console.log(JSON.stringify({ nodes: rawNodes, links: rawLinks}, null, ' '));

        const scale = scaleOrdinal(
        //    d3Range(15).map( i => return interpolateSinebow(i/15) )
            schemeCategory10
        );
        scale.unknown( scaleImplicit );
        const color = name => scale(name.replace(/ .*/, ''));
        const format = d3format('.2s');
        const sankeyDiagram = d3Sankey()
            .nodeAlign(sankeyJustify)
            .nodePadding(45)
            .nodeId( d => d.id )
            // .iterations(100)
            .extent( [[1, 1], [width - 1, height - 5]] )
            .nodes(rawNodes)
            .links(rawLinks);

        const {links, nodes} = sankeyDiagram();

        // console.debug('result nodes', nodes);
        // console.debug('result links', links);
        // console.groupEnd();

    function curveHorizontal(context, x0, y0, x1, y1) {
      context.bezierCurveTo(x0 = (x0 + x1) / 2, y0, x0, y1, x1, y1);
    }
    // use custom shapes for links
    function myLink() {
        
        return function(d) {
            let p = path();

            if ( d.target.x0 - d.source.x1 <= d.width ) {
                //straign line
                const sy0 = d.y0 - d.width / 2, sy1 = d.y0 + d.width / 2,
                ty0 = d.y1 - d.width / 2, ty1 = d.y1 + d.width / 2;

                p.moveTo(d.source.x1, sy0);
                p.lineTo(d.target.x0, ty0);
                p._ += `V ${ty1}`;
                p.lineTo(d.source.x1, sy1);
                p.closePath();
            } else {
                // thick bezier
                p.moveTo(d.source.x1, d.y0);
                curveHorizontal(p, d.source.x1, d.y0, d.target.x0, d.y1);
            }
            return p;
        }
    }

        this.svg.selectAll('*').remove();
        this.svg.attr('viewBox', `0 0 ${width} ${height}`);
        const link = this.svg.append('g')
            .attr('fill', 'none')
            .attr('stroke', '#000')
            .attr('stroke-opacity', 0.2)
        .selectAll('path')
        .data(links)
        .enter().append('path')
            .attr('fill-opacity', 0.25)
            .attr('stroke-opacity', 0.25)
            .attr('d', myLink())

        link.append('title')
            .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

        link.datum( (d, i, nodes) => {
                
                if ( d.target.x0 - d.source.x1 <= d.width ) {
                    // for straign lines
                    nodes[i].setAttribute('fill', color(d.source.name));
                } else {
                    //bezier
                    nodes[i].setAttribute('stroke', color(d.source.name));
                    nodes[i].setAttribute('stroke-opacity', color(d.source.name));
                    nodes[i].setAttribute('stroke-width', d.width);
                }
            } );
        const node = this.svg.append('g')

        .selectAll('rect')
        .data(nodes)
        .enter()
            .append('g');

        node.append('rect')
                .attr('stroke', '#222')
                .attr('x', d => d.x0)
                .attr('y', d => d.y0)
                .attr('height', d => d.y1 - d.y0)
                .attr('width', d => d.x1 - d.x0)
                .attr('fill', d => color(d.name))
            .append('title')
                .text(d => `${d.name}\ninput ${format(d.value)} items per second`)
        ;

        node.append('a')
            .attr('xlink:href', d => this.recipes[d.id].wiki_link)
            .attr('xlink:show', 'new')
            .append('text')
                .attr('fill', d => color(d.name))
                .attr('x', d => d.x1 + (d.x0 < width / 2 ? + 90 : - 100))
                .attr('y', d => (d.y1 + d.y0) / 2)
                .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
                .attr('dy', '0.35em')
                .text( d => d.name )
        ;

        node.append('image')
            .attr('xlink:href', d => `assets/factorio-content/${d.id}.png`)
            .attr('width', 160)
            .attr('height', 160)
            .attr('x', d => (d.x1 + d.x0)  / 2 - 80)
            .attr('y', d => (d.y1 + d.y0) / 2 - 80)


    }

    // return nodes, links
    getSourcesFor( recipeId ): [Map<string, any>, any[]] {
        const nodes = new Map<string, any>();
        const links = [];
        // console.group(recipeId);
        nodes.set(recipeId, {id: recipeId, name: this.recipes[recipeId].name});

        for ( const ingr of this.recipes[recipeId].recipe.ingredients ) {

            // nodes.set(ingr.id, {id: ingr.id, name: this.recipes[ingr.id].name});
            let value = ingr.amount / (this.recipes[recipeId].recipe.yield || 1);

            if ( this.liquidInBarrels && this.recipes[ingr.id].type == "Liquid" ) {
                value /= 50.0 ; // liters in barrel
            }

            links.push( {
                source: ingr.id , target: recipeId,
                value: value
            } );
            const [childNodes, childLinks] : [Map<string, any>, any[]] = this.getSourcesFor(ingr.id);

            childNodes.forEach( (v, k): Map<string, any> => nodes.set(k, v) );

            for ( const chL of childLinks ) { // sum

                chL.value *= value;

                const found = links.find( el => el.source === chL.source && el.target === chL.target );
                if ( !!found ) {
                    found.value += chL.value;
                } else {
                    links.push( chL );
                }
            }
        }
        // console.debug(nodes, recipeId);

        // console.groupEnd();

        return [nodes, links];
    }
}
