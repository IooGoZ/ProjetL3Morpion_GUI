// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import * as unparser from '/js/unparser.js';

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
const objectScale = 0.5;
const offset = 0.5;

var camera, scene, renderer, controls, raycaster, mousePosition, intersects, highlightCube, highlightSquare, theObject;
var allPlacedObjects = [];
var allObjects = [];
var playerIds = [0x0000ff, 0xff0000, 0x00ff00, 0xffff00, 0x00ffff, 0xff00ff];
var nextObjectPos;
var is2D;

let human_id;

function getRandId(){
    return playerIds[Math.floor(Math.random() * playerIds.length)];
}

export function getUnparser() {
    return unparser;
}

export function init(width, height, depth){
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    scene = new THREE.Scene();

    initBoardLength(width, height, depth);

    mousePosition = new THREE.Vector2();
    raycaster = new THREE.Raycaster();
    renderer = new THREE.WebGLRenderer();

    renderer.setSize( window.innerWidth*WIDTH_RATIO, window.innerHeight*HEIGHT_RATIO );
    document.body.appendChild( renderer.domElement );

    controls = new OrbitControls(camera, renderer.domElement);

    renderer.domElement.id = "three_dimensions_viewport";
    renderer.domElement.addEventListener( 'click', onMouseClick );
    renderer.domElement.addEventListener( 'mousemove', onMouseMove );
    renderer.domElement.addEventListener( 'resize', onWindowResize );

    if(is2D){
        controls.enableRotate = false;
    }else{
        camera.fov = 50;
        camera.updateProjectionMatrix();
        //camera.rotation.set(0, Math.PI/4, 0);
    }

    animate();
}

function initBoardLength(width, height, depth){
    is2D = depth == 1;

    if(is2D){
        initHighlightSquare();
        init2DMap( width, height);
    }else{
        initHighlightCube();
        init3DMap( width, height, depth);
    } 

    MAX_X = width-1;
    MAX_Y = height-1;
    MAX_Z = depth-1;

    MAX_VECTOR = new THREE.Vector3( MAX_X, MAX_Y, MAX_Z );
    MIN_VECTOR = new THREE.Vector3( 0, 0, 0 );

    camera.position.set(width*100, 0,  65*width);
}

function placeInvisibleSquare(x, y){
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.MeshBasicMaterial( {
         visible : false,
         side : THREE.DoubleSide
         } );
    const planegeometry = new THREE.Mesh( geometry, material );
    scene.add( planegeometry );

    planegeometry.position.set( x+offset, y+offset, 0);
    allObjects.push(planegeometry);
}

function initHighlightSquare(){
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.MeshBasicMaterial( {
         side : THREE.DoubleSide,
         transparent : true,
         opacity : 0.8
         } );
    highlightSquare = new THREE.Mesh( geometry, material );
    scene.add( highlightSquare );

    highlightSquare.position.set( offset, offset, 0 );
}

function init2DMap(width, height){
    for( var x = 0; x < width; x++){
        for( var y = 0; y < height; y++){
            placeInvisibleSquare(x, y);
        }
    }

    for( var x = 0; x <= width; x++){
        createAndPlaceLine(x, 0, 0, x, height, 0);
    }

    for( var y = 0; y <= height; y++){
        createAndPlaceLine(0, y, 0, width, y, 0);
        
    }
}


function createAndPlaceLine(x1, y1, z1, x2, y2, z2){
    const material = new THREE.LineBasicMaterial({
        color : 0xffffff,
        transparent : true,
        opacity : 0.5
    });
    const points = [];

    points.push(new THREE.Vector3(x1, y1, z1));
    points.push(new THREE.Vector3(x2, y2, z2));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);

    scene.add(line);
}

function getColor(playerId){
    return playerIds[playerId-1];
}

function getObject(position){
    for(var object of allObjects){
        if(is2D){
            if(object.position.x-offset == position.x && object.position.y-offset == position.y){
                return object;
            }
        }else{
            if(object.position.x-offset == position.x && object.position.y-offset == position.y && object.position.z-offset == position.z){
                return object;
            }
        }
    }
    return null;
}

export function playerPos(playerId, position){
    theObject = getObject(position);
    theObject.material.visible = true;
    theObject.material.color.setHex(getColor(playerId));
    allPlacedObjects.push(theObject);
}

function initHighlightCube() {
    const geometry = new THREE.BoxGeometry( objectScale, objectScale, objectScale );
    const material = new THREE.MeshBasicMaterial( {
         side : THREE.DoubleSide,
         transparent : true,
         opacity : 0.3
         } );
    highlightCube = new THREE.Mesh( geometry, material );
    scene.add( highlightCube );

    highlightCube.position.addScalar( offset , offset, offset );
}

function onWindowResize() {

    camera.aspect = window.innerWidth*WIDTH_RATIO / window.innerHeight*HEIGHT_RATIO ;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth*WIDTH_RATIO, window.innerHeight*HEIGHT_RATIO  );

}

function onMouseMove( event ) {
    let rect = renderer.domElement.getBoundingClientRect();

    mousePosition.x = ( (event.clientX-rect.x) / (window.innerWidth*WIDTH_RATIO)) * 2 - 1;
    mousePosition.y = - ( (event.clientY-rect.y) / (window.innerHeight*HEIGHT_RATIO)) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObjects(scene.children);
    
    intersects.forEach( function(intersect) {
        if(is2D){
            if(intersect.object.geometry.type === 'PlaneGeometry'){
                const highlightPos = new THREE.Vector3().copy(intersect.point).max(MIN_VECTOR).min(MAX_VECTOR).floor();
                highlightSquare.position.set( highlightPos.x + offset, highlightPos.y + offset, 0 );

                const objectExist = allPlacedObjects.find( function(object){
                    if(object.geometry.type === "PlaneGeometry")
                    {
                    return ((object.position.x === highlightSquare.position.x) && 
                        (object.position.y === highlightSquare.position.y))
                    }
                } )
            
                if(!objectExist)
                {
                        highlightSquare.material.opacity = 0.3;
                }
                else
                {
                        highlightSquare.material.opacity = 0;
                }
            }
        }else{
            if(intersect.object.geometry.type === 'BoxGeometry')
            {
                const highlightPos = new THREE.Vector3().copy(intersect.point).max(MIN_VECTOR).min(MAX_VECTOR).floor();
                highlightCube.position.set( highlightPos.x, highlightPos.y, highlightPos.z ).addScalar( 0.5, 0.5, 0.5 );

                const objectExist = allPlacedObjects.find( function(object){
                    if(object.geometry.type === "BoxGeometry")
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
        } 
     })
}

function onMouseClick() {
    
    const objectExist = allPlacedObjects.find( function(object){
        if(is2D){
            if(object.geometry.type === "PlaneGeometry")
            {
               return ((object.position.x === highlightSquare.position.x) && 
                   (object.position.y === highlightSquare.position.y))
            }
        }else{
            if(object.geometry.type === "BoxGeometry")
         {
            return ((object.position.x === highlightCube.position.x) && 
                (object.position.y === highlightCube.position.y) &&
                (object.position.z === highlightCube.position.z))
         }
        }
    } )

    if(!objectExist)
    {
        intersects.forEach( function(intersect) {
            if(is2D){
                if(intersect.object.geometry.type === 'PlaneGeometry'){
                    nextObjectPos = {x : highlightSquare.position.x - offset, y : highlightSquare.position.y - offset, z : 0};
                    theObject = intersect.object;
                    highlightSquare.material.opacity = 0;
                    unparser.unparserDisplayAction(human_id, nextObjectPos);
                }
            }else{
                if(intersect.object.geometry.type === 'BoxGeometry'){
                    nextObjectPos = {x : highlightCube.position.x - offset, y : highlightCube.position.y - offset, z : highlightCube.position.z - offset};
                    theObject = intersect.object;
                    highlightCube.material.opacity = 0;
                    unparser.unparserDisplayAction(human_id, nextObjectPos);
                }
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
    renderer.render( scene, camera );
}

function placeInvisibleCube( x, y, z ){
    const geometry = new THREE.BoxGeometry( objectScale, objectScale, objectScale );
    const material = new THREE.MeshBasicMaterial( {
         visible : false,
         side : THREE.DoubleSide,
         } );
    const boxgeometry = new THREE.Mesh( geometry, material );
    scene.add( boxgeometry );

    boxgeometry.position.set( x, y, z).addScalar( offset, offset, offset );
    allObjects.push(boxgeometry);
}

function init3DMap( width, height, depth ){
    for( var z = 0; z <= depth; z++){
        for( var x = 0; x <= width; x++){
            createAndPlaceLine(x, 0, z, x, height, z);
        }
    
        for( var y = 0; y <= height; y++){
            createAndPlaceLine(0, y, z, width, y, z);
            
        }
    }

    for( var x = 0; x <= width; x++){
        for( var y = 0; y <= height; y++){
            createAndPlaceLine(x, y, 0, x, y, depth);
            
        }
    }

    for( var x = 0; x < width; x++){
        for( var y = 0; y < height; y++){
            for( var z = 0; z < depth; z++){
                placeInvisibleCube(x, y, z);
            }
        }
    }
}

export function setHumanId(id) {
    human_id = id;
}