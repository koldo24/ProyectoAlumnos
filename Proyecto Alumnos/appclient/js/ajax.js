//prueba promesa

function ajax( metodo, url, datos ){
    
    return new Promise( (resolve, reject ) => {

        console.debug(`promesa ajax metodo ${metodo} - ${url}` );
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            
            if (this.readyState == 4 ) {

                if ( this.status == 200 || this.status == 201 ){
                    
                   
                    if( this.responseText ){
                        const jsonData = JSON.parse(this.responseText);    
                        console.debug( jsonData );
                        resolve(jsonData);
                    }else{
                        resolve();
                    }                        
                    
                }else{
                
                    if( this.responseText ){
                        reject( JSON.parse(this.responseText) );
                    }else{
                        reject( this.status );
                    }
                }               
            }

        };

        xhttp.open( metodo , url , true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send( JSON.stringify(datos) );
    });
}