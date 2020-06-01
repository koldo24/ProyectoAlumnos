//utilizar modo estricto asi no utilizara variable no delcaradas
"use strict";


//variables 
//const endpoint = 'http://127.0.0
const endpoint = 'http://localhost:8080/apprest/api/';
let personas = [];
let cursos = [];
let personaSeleccionada = { "id":0, 
                            "nombre": "sin nombre" , 
                            "avatar" : "img/avatar7.png", 
                            "sexo": "h",
                            "cursos": []
                          };

window.addEventListener('load', init() );


function init(){
    console.debug('Doucmento cargado');    

    listener();    
    initGallery();
    cargarAlumnos();
    
   

}

 //1) elegir sexo y buscar por el nombre
 //2) filtrar curso
 //3) modal
 //4) filtro para buscar el alumno por nombre

function listener(){

    // 1
    let selectorSexo = document.getElementById('selectorSexo');
    let inputNombre = document.getElementById('inombre');

    selectorSexo.addEventListener('change', filtro );
    inputNombre.addEventListener('keyup',  filtro );

    // 2 
    let filtroCursos = document.getElementById('filtroCurso');
    filtroCursos.addEventListener('keyup',  function(event) {
        let filtroValor = filtroCursos.value.trim();        
        if ( filtroValor.length >= 3 ){
            console.debug('filtroCursos keyup ' + filtroValor );
            cargarCursos(filtroValor);
        }else{
            cargarCursos();
        }

    });
    

    //3 
    
    var modal = document.getElementById("modal");
    var btn = document.getElementById("btnModal");    
    var spanClose = document.getElementById("close");

    btn.onclick = () =>  {
        cargarCursos();
        modal.style.display = "block";
        modal.classList.add('animated','zoomIn');
    }

    spanClose.onclick = () => {
        modal.style.display = "none";        
    }    
    
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";            
        }
    }


    // 4 
    let iNombre = document.getElementById('inputNombre');
    let nombreMensaje = document.getElementById('nombreMensaje');

    iNombre.addEventListener('keyup',  () =>{

        if ( personaSeleccionada.nombre != iNombre.value ){

            const url = endpoint + 'personas/?filtro=' + iNombre.value;
            ajax('GET', url, undefined)
                .then( ( data ) => {
                    console.debug('Nombre NO disponible');
                    nombreMensaje.textContent = 'Nombre NO disponible';
                    nombreMensaje.classList.add('invalid');
                    nombreMensaje.classList.remove('valid');
                })
                .catch( ( error ) => {
                    console.debug('Nombre disponible');
                    nombreMensaje.textContent = 'Nombre disponible';
                    nombreMensaje.classList.add('valid');
                    nombreMensaje.classList.remove('invalid');
                });
        }     
    });
}

//Filtra las personas al buscar por nombre y sexo 
function filtro(){

    let selectorSexo = document.getElementById('selectorSexo');
    let inputNombre = document.getElementById('inombre');

    const sexo = selectorSexo.value;
    const nombre = inputNombre.value.trim().toLowerCase();;

    console.trace(`filtro sexo=${sexo} nombre=${nombre}`);
    console.debug('personas %o',personas);

    //creamos una copia para no modificar el original
    let personasFiltradas = personas.map( el => el);

    //filtrar por sexo, si es 'tipo' 
    if ( sexo == 'h' || sexo == 'm'){
        personasFiltradas = personasFiltradas.filter(el => el.sexo == sexo );
        console.debug('filtrado por sexo %o', personasFiltradas);
    }

    //filtrar por nombre buscado
    if ( nombre != " "){
        personasFiltradas = personasFiltradas.filter(el => el.nombre.toLowerCase().includes(nombre) );
        console.debug('filtrado por nombre %o', personasFiltradas);
    }


    maquetar(personasFiltradas);

}

// Carga todos los cursos

function cargarCursos( filtro = '' ){
    console.trace('cargar cursos');   
    const url = endpoint + 'cursos/?filtro=' + filtro;
    ajax( 'GET', url, undefined )
        .then( data => {
             cursos = data;
             // cargar cursos en lista
             let lista = document.getElementById('listaCursos');
             lista.innerHTML = '';
             cursos.forEach( el => 
                lista.innerHTML += `<li>
                                        <img src="${el.imagen}" alt="${el.nombre}">
                                        <h3>${el.nombre}</h3>
                                        <span>${el.precio} €</span>
                                        <span onClick="asignarCurso( 0, ${el.id})" >[x] Asignar</span>
                                    </li>` 
            );
            seleccionar(personaSeleccionada.id);   

        })
        .catch( error => alert('No se pueden cargar cursos' + error));
}


//Obtiene los datos del servicio rest y visualiza la lista de alumnos

function cargarAlumnos(){

    console.trace('cargarAlumnos');
    const url = endpoint + 'personas/';
    const promesa = ajax("GET", url , undefined);
    promesa
    .then( data => {
            console.trace('promesa resolve'); 
            personas = data;
            maquetar(personas);            
            
    }).catch( error => {
            console.warn('promesa rejectada');            
            alert("no funciona la conexión.");
    });

    
}



function maquetar(elementos){
    console.trace('maquetarlistado');
    
    let lista = document.getElementById('alumnos');
    lista.innerHTML = ''; // vaciar el html 

    elementos.forEach( (p,i) => 
        lista.innerHTML += 
            `<li>
                <img src="${p.avatar}" alt="avatar">
                ${p.nombre}
                <span class="fright" >${p.cursos.length} cursos</span>
                <i class="fas fa-trash" onclick="eliminar(${p.id})"></i>
                <i class="fas fa-pencil-ruler" onclick="seleccionar(${p.id})"></i>            
            </li>` 
    );
}


// Se ejecuta al pulsar el boton de la papeleray llama al servicio rest para borrar

function eliminar( id = 0){
    personaSeleccionada = personas.find( el => el.id == id);
    console.debug('click eliminar persona', personaSeleccionada);
    const mensaje = `¿Estas seguro de eliminar  a ${personaSeleccionada.nombre} ?`;
    if ( confirm(mensaje) ){

        const url = endpoint + 'personas/' + personaSeleccionada.id;
        ajax('DELETE', url, undefined)
            .then( data =>  cargarAlumnos() )
            .catch( error => {
                console.warn('promesa rejectada ', error );
                alert(error.informacion);
            });

    }
} // eliminar



 
 // Se ejecuta al pulsar el boton de editar(al lado de la papelera) o boton 'Nueva Persona' 
  //Rellena el formulario con los datos de la persona sino utiliza datos preseleccionados

function seleccionar( id = 0 ){


    let cntFormulario = document.getElementById('content-formulario');
    cntFormulario.style.display = 'block';
    cntFormulario.classList.add('animated','fadeInRight');

    // para buscar por indice utilizar find
    personaSeleccionada = personas.find( el=> el.id == id);
    if ( !personaSeleccionada ){
        personaSeleccionada = { "id":0, 
                                "nombre": "sin nombre" , 
                                "avatar" : "img/avatar7.png", 
                                "sexo": "h",
                                "cursos": []
                             };
    }
    
   
   
    //rellernar formulario
    document.getElementById('inputId').value = personaSeleccionada.id;
    document.getElementById('inputNombre').value = personaSeleccionada.nombre;    
    document.getElementById('inputAvatar').value = personaSeleccionada.avatar;

    //seleccionar Avatar
    const avatares = document.querySelectorAll('#gallery img');
    avatares.forEach( el => {
        el.classList.remove('selected');
        if ( "img/"+personaSeleccionada.avatar == el.dataset.path ){
            el.classList.add('selected');
        }
    });

   
    const sexo = personaSeleccionada.sexo;
    let checkHombre = document.getElementById('sexoh');
    let checkMujer = document.getElementById('sexom');

    if ( sexo == "h"){
        checkHombre.checked = 'checked';
        checkMujer.checked = '';

    }else{
        checkHombre.checked = '';
        checkMujer.checked = 'checked';
    }

    // pintar cursos del alumno
    let listaCursosAlumno = document.getElementById('cursosAlumno');
    listaCursosAlumno.innerHTML = '';
    personaSeleccionada.cursos.forEach( el => {

        listaCursosAlumno.innerHTML += `<li>
                                            <img src="${el.imagen}" class="imagen-50" alt="imagen curso">
                                            ${el.nombre}
                                            <i class="fas fa-trash" onclick="eliminarCurso(event, ${personaSeleccionada.id},${el.id})"></i>
                                        </li>`;

    });



} 


// Llama al servicio Rest para hacer un POST donde guardara o modificara

function guardar(){

    console.trace('click guardar');
    let id = document.getElementById('inputId').value;
    let nombre = document.getElementById('inputNombre').value;
    let avatar = document.getElementById('inputAvatar').value;
   
   //sexo, si no esta marcado el de hombre, por defecto sera mujer
   let sexo = (document.getElementById('sexoh').checked ) ? 'h' : 'm';
    
    let persona = {
        "id" : id,
        "nombre" : nombre,
        "avatar" : avatar,
        "sexo" : sexo
    };

    console.debug('persona a guardar %o', persona);

    //AÑADIR
    if ( id == 0 ){ 
        console.trace('Crear nueva persona');
        const url = endpoint + 'personas/';
        ajax('POST',url , persona)
            .then( data => {                
                alert( persona.nombre + ' ya esta con nosotros ');
                //limpiar formulario
                document.getElementById('inputId').value = 0;
                document.getElementById('inputNombre').value = '';               
                document.getElementById('inputAvatar').value = 'img/avatar1.png';
                document.getElementById('sexoh').checked = true;
                document.getElementById('sexom').checked = false;

                cargarAlumnos();
            })
            .catch( error => {
                console.warn('promesa rejectada %o', error);
                alert(error.informacion);
            });
        

    // MODIFICAR
    }else{
        console.trace('Modificar persona');

        const url = endpoint + 'personas/' + persona.id;
        ajax('PUT', url , persona)
            .then( data => {
                alert( persona.nombre + ' modificado con exito ');
                cargarAlumnos();
            })
            .catch( error => {
                console.warn('No se pudo actualizar %o', error);
                alert(error.informacion);
            });
        
    }

}





 //Carga todas las imagen de los avatares
 
function initGallery(){
    let divGallery =  document.getElementById('gallery');
    for ( let i = 1; i <= 7 ; i++){
        divGallery.innerHTML += `<img onclick="selectAvatar(event)" 
                                      class="avatar" 
                                      data-path="img/avatar${i}.png"
                                      src="img/avatar${i}.png">`;
    }
}


//Selecciona el avatar sobre el que se ha hecho click
 
function selectAvatar(evento){
    console.trace('click avatar');
    const avatares = document.querySelectorAll('#gallery img');
    //eliminamos la clases 'selected' a todas las imagenes del div#gallery
    avatares.forEach( el => el.classList.remove('selected') );
    // ponemos clase 'selected' a la imagen que hemos hecho click ( evento.target )
    evento.target.classList.add('selected');

    let iAvatar = document.getElementById('inputAvatar');
    //@see: https://developer.mozilla.org/es/docs/Learn/HTML/como/Usando_atributos_de_datos
    iAvatar.value = evento.target.dataset.path;

}


function eliminarCurso(event, idPersona, idCurso ){

    console.debug(`click eliminarCurso idPersona=${idPersona} idCurso=${idCurso}`);

    const url = endpoint + 'personas/' + idPersona + "/curso/" + idCurso;
    ajax('DELETE', url, undefined)
    .then( data => {       
   
       event.target.parentElement.classList.add('animated', 'bounceOut');        
       cargarAlumnos();        
    })
    .catch( error => alert(error));

}


/**
 * 
 * @param {*} idPersona 
 * @param {*} idCurso 
 */
function asignarCurso( idPersona = 0, idCurso ){

    idPersona = (idPersona != 0) ? idPersona : personaSeleccionada.id;

    console.debug(`click asignarCurso idPersona=${idPersona} idCurso=${idCurso}`);

    const url = endpoint + 'personas/' + idPersona + "/curso/" + idCurso;
    ajax('POST', url, undefined)
    .then( data => {

 
        document.getElementById("modal").style.display = 'none';    


        const curso = data.data;
        // mostrar curso       
        let lista = document.getElementById('cursosAlumno');        
        lista.innerHTML += `<li class="animated bounceIn">  
                                <img src="${curso.imagen}" class="imagen-50" alt="imagen curso">
                                ${curso.nombre}
                                <i class="fas fa-trash" onclick="eliminarCurso(event, ${idPersona},${curso.id})"></i>    
                            </li>`;
                             
        
        cargarAlumnos();
        
    })
    .catch( error => alert(error));

}





