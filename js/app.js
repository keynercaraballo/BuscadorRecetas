function iniciarApp() {
    const resultado = document.querySelector('#resultado');
    const selectCategorias = document.querySelector('#categorias');
    if(selectCategorias){
        selectCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias();
    }
    const favoritosDiv = document.querySelector('.favoritos');
    if(favoritosDiv) {
        obtenerfavoritos();
    }

    
    
    const modal = new bootstrap.Modal('#modal',{});

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
            recetaImagen.src = strMealThumb ?? receta.img;

            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.titulo;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn','btn-danger', 'w-100');
            recetaButton.textContent = 'Ver Receta';
            recetaButton.onclick = function (){
                seleccionarReceta(idMeal ?? receta.id);
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
            <h3 class="my-3">Ingrediente y Cantidades</h3>

        `;
        const listGroup = document.createElement('UL')
        listGroup.classList.add('list-group')
        //mostrar cantidades e ingredientes 
        for(let i=1; i<=20; i++){
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLI = document.createElement('LI');
                ingredienteLI.classList.add('list-group-item');
                ingredienteLI.textContent= `${ingrediente} - ${cantidad}`

                listGroup.appendChild(ingredienteLI);
                

            }

        }

        modalBody.appendChild(listGroup);

        //Agregando botones agregar y cerrar 
        const modalFooter = document.querySelector('.modal-footer');
        //limpiamos el footer 
        limpiarHTML(modalFooter);

        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-danger', 'col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';

        //localstorage 
        btnFavorito.onclick = function(){
            //evitando que se dupliquen los registro en el localstorage 
            if(existeStorage(idMeal)){
                eliminiarFavorito(idMeal);
                btnFavorito.textContent = 'Guaradar Favorito';
                mostrarToast('Eliminado Correctamente!');
                 return //si existe el registro evita que se agregue el registro 
            }

            agregarFavorito({
                id:idMeal,
                titulo: strMeal,
                img: strMealThumb
            });
            btnFavorito.textContent = 'Eliminar Favorito';
            mostrarToast('Guardado Correctamente!');
        }


        const btnCerrarModal = document.createElement('BUTTON');
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
        btnCerrarModal.textContent = 'Cerrar';
        btnCerrarModal.onclick = function (){
            modal.hide();
        }

        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrarModal);

        //muestra el modal 
        modal.show();


    }
    //funcion de agregar favorito
    function agregarFavorito(receta){
        const favoritos =JSON.parse( localStorage.getItem('favoritos')) ??[];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
    }
    function eliminiarFavorito(id){
        const favoritos =JSON.parse( localStorage.getItem('favoritos')) ??[];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id != id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    }
    


    //existe storage 
    function existeStorage(id){
        const favoritos =JSON.parse( localStorage.getItem('favoritos')) ??[];
        return favoritos.some(favorito => favorito.id === id);
    }

    //mostrarToast
    function mostrarToast(mensaje){
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show()

    }

    //funcion obtener Favoritos 
    function obtenerfavoritos() {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if(favoritos.length){
            mostrarRecetas(favoritos)
            return
        }

        const noFavoritos = document.createElement('P');
        noFavoritos.textContent = 'No Hay favoritos aun';
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold','mt-5');
        favoritosDiv.appendChild(noFavoritos);

        
    }

    //sirve para limpiar los resultados
    function limpiarHTML(selector){
        while (selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    }

    

}

document.addEventListener('DOMContentLoaded', iniciarApp);//para cargar la funcion de iniciar la app