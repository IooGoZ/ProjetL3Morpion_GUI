// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';

const fov = 90;
const aspect = window.innerWidth / window.innerHeight; // i.e : 1920/1080
const near = 1.0;
const far = 1000;
const rotationSpeed = 0.0002;
const size = 3;
var MAX_X, MAX_Y, MAX_Z;
var MAX_VECTOR;

var camera, scene, renderer, controls, raycaster, mousePosition, intersects, highlightCube;
var icosahedronsAndLines = [];

init();
animate();

function init(){

    camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set( -size, size, -size );

    scene = new THREE.Scene();


    initHighlightCube();
    initMap( 2, 5, 4 );

    

   placeObject( 1, 2, 1, 0xff0000 );

    mousePosition = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    controls = new OrbitControls(camera, renderer.domElement);

    document.addEventListener( 'mousemove', onMouseMove );

    window.addEventListener( 'resize', onWindowResize );

}

function initHighlightCube() {
    const geometry = new THREE.BoxGeometry( size, size, size );
    const material = new THREE.MeshBasicMaterial( {
         side : THREE.DoubleSide
         } );
    highlightCube = new THREE.Mesh( geometry, material );
    scene.add( highlightCube );

    highlightCube.position.set( size/2, size/2, size/2 );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onMouseMove( event ) {

    mousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mousePosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObjects(scene.children);
    
    intersects.forEach( function(intersect) {
        if(intersect.object.isLineSegments){
            
            //console.log(intersect);
            const highlightPos = new THREE.Vector3().copy(intersect.point).min(MAX_VECTOR).floor();
            console.log(highlightPos)
            highlightCube.position.set( size/2 + highlightPos.x, size/2 + highlightPos.y, size/2 + highlightPos.z );

        }
     })

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

    const geometry = new THREE.BoxGeometry( size, size, size );
    const material = new THREE.MeshBasicMaterial( {
         visible : false,
         side : THREE.DoubleSide
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
//        wireframe : true
     } );
    const icosahedron = new THREE.Mesh( geometry, material );

    scene.add( icosahedron );
    icosahedron.position.set( size/2 + (x-1)*size , size/2 + (y-1)*size , size/2 + (z-1)*size );

    const edges = new THREE.EdgesGeometry( geometry );
    const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
    scene.add( line );
    line.position.set( size/2 + (x-1)*size , size/2 + (y-1)*size , size/2 + (z-1)*size );

    icosahedronsAndLines.push(icosahedron);
    icosahedronsAndLines.push(line);

}

function initMap( length, width, depth ){
    for( var x = 0; x < width; x++){
        for( var y = 0; y < length; y++ ){
            for( var z = 0; z < depth; z++ ){
                placeInvisibleCube( size*x + size/2, size*y + size/2, size*z + size/2);
            }
        }
    }

    MAX_X = size*(width-1);
    MAX_Y = size*(length-1);
    MAX_Z = size*(depth-1);

    MAX_VECTOR = new THREE.Vector3( MAX_X, MAX_Y, MAX_Z );
}



