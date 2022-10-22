// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';


const fov = 90;
const aspect = window.innerWidth / window.innerHeight; // i.e : 1920/1080
const near = 1.0;
const far = 1000;
const rotationSpeed = 0.005;
const size = 3;

var camera, scene, renderer, controls;
// var icosahedrons = [];

init();
animate();

function init(){

    camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set( -size, size, -size );

    scene = new THREE.Scene();

    initMap( 2, 2, 2 );

    var object;

    object = placeObject( 1, 1, 1, 0xff0000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    controls = new OrbitControls(camera, renderer.domElement);
}

function animate() {

	controls.update();
	requestAnimationFrame( animate );
	
	render();

}

function render() {
    
    scene.traverse( function ( object ) {

        if ( object.isMesh === true ) {

            object.rotation.z += rotationSpeed;
	        object.rotation.y += rotationSpeed;

        }

    } );

    renderer.render( scene, camera );

}

function placeInvisibleCube( x, y, z ){

    const geometry = new THREE.BoxGeometry( size, size, size );
    const material = new THREE.MeshBasicMaterial( {
         visible : false
         } );
    const boxgeometry = new THREE.Mesh( geometry, material );
    scene.add( boxgeometry );

    const edges = new THREE.EdgesGeometry( geometry );
    const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial());
    scene.add( line );  

    boxgeometry.position.set( x, y, z );
    line.position.set( x, y, z );

}

function placeObject( x, y, z, color){

    const geometry = new THREE.IcosahedronGeometry( 1, 1 );
    const material = new THREE.MeshBasicMaterial( { 
        color: color,
        wireframe : true
     } );
    const icosahedron = new THREE.Mesh( geometry, material );

    scene.add( icosahedron );
    icosahedron.position.set( x*size/2 , y*size/2 , z*size/2 );

    // icosahedrons.push(icosahedron);

    // const edges = new THREE.EdgesGeometry( geometry );
    // const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
    // scene.add( line );
    // line.position.set( x*size/2 , y*size/2 , z*size/2 );

}

function initMap( length, width, depth ){
    for( var x = 0; x < width; x++){
        for( var y = 0; y < length; y++ ){
            for( var z = 0; z < depth; z++ ){
                placeInvisibleCube( size*x + size/2, size*y + size/2, size*z + size/2);
            }
        }
    }
}



