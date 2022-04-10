const cards = document.getElementById('cards')
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const tempalteCard = document.getElementById('template-card').content
const templateFooter = document.getElementById('template-footer').content //obtengo lo de adentro del template footer
const templateCarrito = document.getElementById('template-carrito').content
const fragment = document.createDocumentFragment() // es volatil lo utilizo para evitar el reflow, no necsito recargar la web
cards.addEventListener('click', e =>{
    addCarrito(e)
})
let carrito = {}

document.addEventListener('DOMContentLoaded',()=>{
    fetchData()
})
items.addEventListener('click',e=>{
    btnAccion(e)
})

const fetchData = async()=>{
    try{
        const res = await fetch('api.json')
        const data = await res.json()
        pintarCard(data)

    }
    catch(error){
        console.log(error) // consola
    }
}

const pintarCard = data =>{
    data.forEach( producto => {
        tempalteCard.querySelector('h5').textContent = producto.title // coloco el nombre del producto de la api en el template
        tempalteCard.querySelector('p').textContent = producto.precio
        tempalteCard.querySelector('img').setAttribute('src',producto.thumbnailUrl) 
        tempalteCard.querySelector('.btn-dark').dataset.id = producto.id   // agrego un id dinamico a cada boton
        const clone = tempalteCard.cloneNode(true)   //clono en template
        fragment.appendChild(clone)                    //le agrego un nodo hijo que es el clon y el viejo es reemplazado por este
        
    })
    cards.appendChild(fragment)  // agrego toda la iteracion en el div que quiero que se vea :D
}

const addCarrito = e =>{
    
    if(e.target.classList.contains('btn-dark')){  //pregunto si el boton contiene esa clase
        setCarrito(e.target.parentElement)        //ejecuto la funcion pasando el div padre :D
    }
    e.stopPropagation()  // para evitar heredar los eventos del contenedor padre :D
}
const setCarrito = objeto=>{   // con esta funcion creo un objeto que contiene todo lo del div, luego lo copio con Spread operaor
    const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1   
    }
    if(carrito.hasOwnProperty(producto.id)){ //si existe una compra ya hecha debo aumentar la cantidad
        producto.cantidad= carrito[producto.id].cantidad + 1
    }
    carrito[producto.id]= {...producto}
    pintartCarrito()
}
const pintartCarrito = ()=>{
    items.innerHTML = ''  // sin esto se pisa y se prepite el objeto todo el tiempo
    Object.values(carrito).forEach(producto =>{
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('span').textContent = producto.precio * producto.cantidad
        
        //botones
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)
    
    pintarFooter()
}
const pintarFooter =()=>{
    footer.innerHTML=''  // reemplazo el valor del footer por un string vacio :D
    if(Object.keys(carrito).length=== 0){       // si el carrito esta vacio
        footer.innerHTML=` <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>` //reemplazo el valor vacio con esto
        return
    }
    const nCantidad = Object.values(carrito).reduce((acc,{cantidad})=>  acc+cantidad,0)
    const nPrecio = Object.values(carrito).reduce((acc,{cantidad,precio})=>  acc+cantidad *precio,0)

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio
    
    const clon = templateFooter.cloneNode(true)
    fragment.appendChild(clon)
    footer.appendChild(fragment)

    const btnVaciar = document.getElementById('vaciar-carrito')
    btnVaciar.addEventListener('click', ()=>{
        carrito= {}
        pintartCarrito()
    })
} 
const btnAccion = e=>{
    //console.log(e.target)
    if(e.target.classList.contains('btn-info')){
        
        const producto = carrito[e.target.dataset.id]
        producto.cantidad = carrito[e.target.dataset.id].cantidad + 1
        carrito[e.target.dataset.id] = {...producto}
        pintartCarrito()
    }
    if(e.target.classList.contains('btn-danger')){
        
        const producto = carrito[e.target.dataset.id]
        producto.cantidad = carrito[e.target.dataset.id].cantidad - 1
        if(producto.cantidad === 0){
            delete carrito[e.target.dataset.id]
        }
        pintartCarrito()
    }
    e.stopPropagation()
}