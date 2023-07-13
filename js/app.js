function iniciarApp() {
    const selectCategorias = document.querySelector('#categorias');
    selectCategorias.addEventListener('change', seleccionarCategoria)

    const resultado = document.querySelector('#resultado');
    const modal = new bootstrap.Modal('#modal',{});

    obtenerCategorias();

    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then(respuesta => {
                return respuesta.json()
            })
            .then (resultado => mostrarCategorias(resultado.categories));
            
    }

    //funcion mostrar Categorias 
    function mostrarCategorias(categorias = []){
        //recorremos las categorias 
        categorias.forEach(categoria =>{
            const option = document.createElement('OPTION');
            option.value = categoria.strCategory;
            option.textContent = categoria.strCategory;
            selectCategorias.appendChild(option);    
        })
    }

    function seleccionarCategoria(e){
        const categoria = e.target.value; //para leer el valor del select 
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then(respuesta =>  respuesta.json())
            .then(resultado => mostrarRecetas(resultado.meals))
    }

    function mostrarRecetas (recetas =[]){
        
        //limpiamos los resultados 
        limpiarHTML(resultado);

        //heading si hubo no resultado 
        const heading = document.createElement('H2');
        heading.classList.add('text-center','text-black', 'my-5');
        heading.textContent = recetas.length ? 'resultados': 'No hay resutlados';
        resultado.appendChild(heading);

        //iterar en los resultados 
        recetas.forEach(receta =>{
            const {idMeal,strMeal, strMealThumb } = receta
            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');

            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card','mb-4');

            const recetaImagen = document.createElement('IMG')
            recetaImagen.classList.add('card-img-top');
            recetaImagen.alt = `Imagen de la receta ${strMeal}`;
            recetaImagen.src = strMealThumb;

            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn','btn-danger', 'w-100');
            recetaButton.textContent = 'Ver Receta';
            recetaButton.onclick = function (){
                seleccionarReceta(idMeal);
            }

            //inyectar en el HTML 
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);

            console.log(recetaImagen);


        })
        
    }
    function seleccionarReceta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaModal(resultado.meals[0]))


    }
    function mostrarRecetaModal (receta){

        const {idMeal, strInstructions, strMeal, strMealThumb} = receta;
        //Añadir contenido al modal 
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}" />
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
        `;

        //muestra el modal 
        modal.show();


    }

    //sirve para limpiar los resultados
    function limpiarHTML(selector){
        while (selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    }

    

}

document.addEventListener('DOMContentLoaded', iniciarApp);//para cargar la funcion de iniciar la app