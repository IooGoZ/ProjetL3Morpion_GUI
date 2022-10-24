// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';

const fov = 80;
const aspect = window.innerWidth / window.innerHeight; // i.e : 1920/1080
const near = 1.0;
const far = 1000;
const rotationSpeed = 0.00002;
var MAX_X, MAX_Y, MAX_Z;
var MAX_VECTOR;

var camera, scene, renderer, controls, raycaster, mousePosition, intersects, highlightCube;
var icosahedronsAndLines = [];

init();
animate();

function init(){

    camera = new THREE.PerspectiveCamera( fov, aspect, near, far );

    scene = new THREE.Scene();

    initHighlightCube();
    initMap( 5, 5, 5 );

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
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( {
         side : THREE.DoubleSide
         } );
    highlightCube = new THREE.Mesh( geometry, material );
    scene.add( highlightCube );

    highlightCube.position.set( 0.5 , 0.5, 0.5 );

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
        console.log(intersects);
        if(intersect.object.isLineSegments){
            
            //console.log(intersect);
            const highlightPos = new THREE.Vector3().copy(intersect.point).min(MAX_VECTOR).floor();
            //console.log(highlightPos);
            highlightCube.position.set( highlightPos.x + 0.5, highlightPos.y + 0.5, highlightPos.z + 0.5 );

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

    boxgeometry.position.set( x + 0.5 , y + 0.5, z + 0.5 );
    line.position.set( x + 0.5, y + 0.5, z + 0.5 );

}

function placeObject( x, y, z, color){

    const geometry = new THREE.IcosahedronGeometry( 1, 1 );
    geometry.scale( 0.35, 0.35, 0.35 );
    const material = new THREE.MeshBasicMaterial( { 
        color: color,
//        wireframe : true
     } );
    const icosahedron = new THREE.Mesh( geometry, material );
    
    scene.add( icosahedron );
    icosahedron.position.set( x - 0.5 , y - 0.5 , z - 0.5 );

    const edges = new THREE.EdgesGeometry( geometry );
    const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
    scene.add( line );
    line.position.set( x - 0.5 , y - 0.5 , z - 0.5 );

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

    camera.position.set( -width/2, length/2, -depth/2 );
    camera.rotation.set( 0, 0, 1 );
}



