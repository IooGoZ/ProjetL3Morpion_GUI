// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import * as parser from "./parser.js";

const WIDTH_RATIO = 0.8;
const HEIGHT_RATIO = 1.0;

const fov = 1;
const aspect = window.innerWidth*WIDTH_RATIO / window.innerHeight*HEIGHT_RATIO; // i.e : 1920/1080
const near = 1.0;
const far = 5000;
const rotationSpeed = 0.00002;
var MAX_X, MAX_Y, MAX_Z;
var MAX_VECTOR, MIN_VECTOR;
const coeffCamera = 100;

var camera, scene, renderer, controls, raycaster, mousePosition, intersects, highlightCube;
var icosahedronsAndLines = [];
var playerIds = [0x0000ff, 0xff0000, 0x00ff00, 0xffff00, 0x00ffff, 0xff00ff];
var nextObjectPos;
const default_human_id = 1;

function initBoardLength(width, height, depth){

    camera = new THREE.PerspectiveCamera( fov, aspect, near, far );

    scene = new THREE.Scene();

    initHighlightCube();
    initMap( width, height, depth);


    mousePosition = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth*WIDTH_RATIO, window.innerHeight*HEIGHT_RATIO );
    document.body.appendChild( renderer.domElement );

    controls = new OrbitControls(camera, renderer.domElement);

    renderer.domElement.id = "three_dimensions_viewport";
    renderer.domElement.addEventListener( 'click', onMouseDown );
    window.addEventListener( 'mousemove', onMouseMove );
    window.addEventListener( 'resize', onWindowResize );

    animate();
}

function getColor(playerId){
    return playerIds[playerId-1];
}

function playerPos(playerId, position){
    placeObject(position.x, position.y, position.z, getColor(playerId));
}

function initHighlightCube() {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( {
         side : THREE.DoubleSide,
         transparent : true,
         opacity : 0.3
         } );
    highlightCube = new THREE.Mesh( geometry, material );
    scene.add( highlightCube );

    highlightCube.position.addScalar( 0.5 , 0.5, 0.5 );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onMouseMove( event ) {
    let rect = renderer.domElement.getBoundingClientRect();

    mousePosition.x = ( (event.clientX-rect.x) / (window.innerWidth*WIDTH_RATIO)) * 2 - 1;
    mousePosition.y = - ( (event.clientY-rect.y) / (window.innerHeight*HEIGHT_RATIO)) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObjects(scene.children);
    
    intersects.forEach( function(intersect) {
        if(intersect.object.geometry.type === 'BoxGeometry')
        {
            const highlightPos = new THREE.Vector3().copy(intersect.point).max(MIN_VECTOR).min(MAX_VECTOR).floor();
            highlightCube.position.set( highlightPos.x, highlightPos.y, highlightPos.z ).addScalar( 0.5, 0.5, 0.5 );

            const objectExist = icosahedronsAndLines.find( function(object){
                if(object.geometry.type === "IcosahedronGeometry")
                {
                   return ((object.position.x === highlightCube.position.x) && 
                       (object.position.y === highlightCube.position.y) &&
                       (object.position.z === highlightCube.position.z))
                }
           } )
       
           if(!objectExist)
           {
                highlightCube.material.opacity = 0.3;
           }
           else
           {
                highlightCube.material.opacity = 0;
           }
        }
     })


}

function onMouseDown() {
    
    const objectExist = icosahedronsAndLines.find( function(object){
         if(object.geometry.type === "IcosahedronGeometry")
         {
            return ((object.position.x === highlightCube.position.x) && 
                (object.position.y === highlightCube.position.y) &&
                (object.position.z === highlightCube.position.z))
         }
    } )

    if(!objectExist)
    {
        intersects.forEach( function(intersect) {
            if(intersect.object.geometry.type === 'BoxGeometry')
            {
                nextObjectPos = {x : highlightCube.position.x - 0.5, y : highlightCube.position.y - 0.5, z : highlightCube.position.z - 0.5};
                parser.unparserDisplayAction(default_human_id, nextObjectPos);
            }
         })
    }
}

function animate() {

	controls.update();
	requestAnimationFrame( animate );
	
	render();

}

function render() {
    
    scene.traverse( function () {

        icosahedronsAndLines.forEach( function(element) {
            element.rotation.z += rotationSpeed;
	        element.rotation.y += rotationSpeed;
        })

     } );

    renderer.render( scene, camera );

}

function placeInvisibleCube( x, y, z ){

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( {
         visible : false,
         side : THREE.DoubleSide
         } );
    const boxgeometry = new THREE.Mesh( geometry, material );
    scene.add( boxgeometry );

    const edges = new THREE.EdgesGeometry( geometry );
    const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial());
    scene.add( line );  

    boxgeometry.position.set( x, y, z).addScalar( 0.5, 0.5, 0.5 );;
    line.position.set( x, y, z).addScalar( 0.5, 0.5, 0.5 );

}

function placeObject( x, y, z, color ){

    const geometry = new THREE.IcosahedronGeometry( 1, 1 );
    geometry.scale( 0.35, 0.35, 0.35 );
    const material = new THREE.MeshBasicMaterial( { 
        color: color,
//        wireframe : true
     } );
    const icosahedron = new THREE.Mesh( geometry, material );
    
    scene.add( icosahedron );
    icosahedron.position.set( x, y, z ).addScalar( 0.5, 0.5, 0.5 );

    const edges = new THREE.EdgesGeometry( geometry );
    const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
    scene.add( line );
    line.position.set( x, y, z ).addScalar( 0.5, 0.5, 0.5 );;

    icosahedronsAndLines.push(icosahedron);
    icosahedronsAndLines.push(line);

}

function initMap( length, width, depth ){
    for( var x = 0; x < width; x++){
        for( var y = 0; y < length; y++ ){
            for( var z = 0; z < depth; z++ ){
                placeInvisibleCube( x, y, z );
            }
        }
    }

    MAX_X = width-1;
    MAX_Y = length-1;
    MAX_Z = depth-1;

    MAX_VECTOR = new THREE.Vector3( MAX_X, MAX_Y, MAX_Z );
    MIN_VECTOR = new THREE.Vector3( 0, 0, 0 );

    camera.position.set( width*coeffCamera, length*coeffCamera, depth*coeffCamera );
    camera.rotation.set( 0, 0, 0 );
}



