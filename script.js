/* ============================================================
   ÚNICO ARCHIVO DE JAVASCRIPT
   No necesitas tocar esto para agregar dibujos, fotos o audios:
   todo eso ahora se edita directamente en index.html.

   Esta lógica solo arma el juego de memoria, y lo hace tomando
   automáticamente las imágenes que ya pusiste en la sección
   #grid-dibujos, así que siempre usa tus dibujos reales.
   ============================================================ */

(function(){

  // cuántas parejas usar como máximo en el juego
  const MAX_PAREJAS = 6;

  // toma las rutas de imagen directamente del HTML (#grid-dibujos)
  function obtenerImagenesDibujos(){
    const imgs = document.querySelectorAll('#grid-dibujos .tarjeta-dibujo img');
    return Array.from(imgs).map(img => img.getAttribute('src'));
  }

  const tablero = document.getElementById('tablero');
  const estadoJuego = document.getElementById('estado-juego');
  const botonReiniciar = document.getElementById('reiniciar');

  let cartasVolteadas = [];
  let paresEncontrados = 0;
  let bloqueado = false;
  let totalParejas = 0;

  function barajar(arr){
    const a = [...arr];
    for(let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function iniciarJuego(){
    const todas = obtenerImagenesDibujos();
    if(todas.length === 0){
      tablero.innerHTML = '';
      estadoJuego.textContent = 'Agrega dibujos en #grid-dibujos para jugar.';
      botonReiniciar.style.display = 'none';
      return;
    }

    const seleccion = todas.slice(0, MAX_PAREJAS);
    totalParejas = seleccion.length;

    tablero.innerHTML = '';
    paresEncontrados = 0;
    cartasVolteadas = [];
    bloqueado = false;
    estadoJuego.textContent = '';

    const mazo = barajar([...seleccion, ...seleccion]);

    mazo.forEach(src => {
      const carta = document.createElement('div');
      carta.className = 'carta';
      carta.dataset.src = src;
      carta.tabIndex = 0;
      carta.setAttribute('role', 'button');
      carta.setAttribute('aria-label', 'Carta boca abajo');

      const interior = document.createElement('div');
      interior.className = 'carta-interior';

      const atras = document.createElement('div');
      atras.className = 'cara cara-atras';
      atras.textContent = '?';

      const frente = document.createElement('div');
      frente.className = 'cara cara-frente';
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      frente.appendChild(img);

      interior.append(atras, frente);
      carta.appendChild(interior);

      carta.addEventListener('click', () => voltearCarta(carta));
      carta.addEventListener('keydown', e => {
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          voltearCarta(carta);
        }
      });

      tablero.appendChild(carta);
    });
  }

  function voltearCarta(carta){
    if(bloqueado) return;
    if(carta.classList.contains('volteada') || carta.classList.contains('encontrada')) return;

    carta.classList.add('volteada');
    cartasVolteadas.push(carta);

    if(cartasVolteadas.length < 2) return;

    bloqueado = true;
    const [c1, c2] = cartasVolteadas;

    if(c1.dataset.src === c2.dataset.src){
      setTimeout(() => {
        c1.classList.add('encontrada');
        c2.classList.add('encontrada');
        cartasVolteadas = [];
        bloqueado = false;
        paresEncontrados++;
        if(paresEncontrados === totalParejas){
          estadoJuego.textContent = '¡Encontraste todas las parejas! 🎉';
        }
      }, 500);
    } else {
      setTimeout(() => {
        c1.classList.remove('volteada');
        c2.classList.remove('volteada');
        cartasVolteadas = [];
        bloqueado = false;
      }, 900);
    }
  }

  botonReiniciar.addEventListener('click', iniciarJuego);
  iniciarJuego();


  /* ==========================================================
     POP-UP (lightbox): al hacer clic en un dibujo de la galería
     se abre en grande, con una "X" para cerrarlo.
     ========================================================== */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const botonCerrar = document.getElementById('cerrar-lightbox');
  const gridDibujos = document.getElementById('grid-dibujos');

  function abrirLightbox(src, alt){
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.remove('oculto');
  }

  function cerrarLightbox(){
    lightbox.classList.add('oculto');
    lightboxImg.src = '';
  }

  // un solo listener en el contenedor: funciona sin importar
  // cuántos dibujos agregues después
  gridDibujos.addEventListener('click', e => {
    const img = e.target.closest('.tarjeta-dibujo img');
    if(img) abrirLightbox(img.getAttribute('src'), img.getAttribute('alt'));
  });

  botonCerrar.addEventListener('click', cerrarLightbox);

  // cerrar al hacer clic fuera de la imagen (en el fondo oscuro)
  lightbox.addEventListener('click', e => {
    if(e.target === lightbox) cerrarLightbox();
  });

  // cerrar con la tecla Escape
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && !lightbox.classList.contains('oculto')){
      cerrarLightbox();
    }
  });


  /* ==========================================================
     MODO HALLOWEEN: botón que activa/desactiva el tema
     ========================================================== */
  const botonHalloween = document.getElementById('boton-halloween');

  function aplicarHalloween(activo){
    document.body.classList.toggle('halloween', activo);
    botonHalloween.setAttribute('aria-pressed', String(activo));
    botonHalloween.textContent = activo ? '☀️ Modo normal' : '🎃 Modo Halloween';
    try{ localStorage.setItem('modoHalloween', activo ? '1' : '0'); }catch(e){}
  }

  botonHalloween.addEventListener('click', () => {
    aplicarHalloween(!document.body.classList.contains('halloween'));
  });

  try{
    if(localStorage.getItem('modoHalloween') === '1') aplicarHalloween(true);
  }catch(e){}


  /* ==========================================================
     FICHA DE PERSONAJE: las barras se llenan según el número
     que escribas en el HTML (0 a 100) cuando aparecen en pantalla
     ========================================================== */
  document.querySelectorAll('.ficha .stat').forEach(stat => {
    const texto = stat.querySelector('.stat-valor').textContent.trim();
    const n = parseFloat(texto);
    const porcentaje = isNaN(n) ? 100 : Math.max(0, Math.min(100, n));
    stat.style.setProperty('--v', porcentaje + '%');
  });

  const ficha = document.querySelector('.ficha');
  if(ficha){
    if('IntersectionObserver' in window){
      const observador = new IntersectionObserver(entradas => {
        entradas.forEach(en => {
          if(en.isIntersecting){
            ficha.classList.add('visible');
            observador.disconnect();
          }
        });
      }, { threshold: 0.25 });
      observador.observe(ficha);
    } else {
      ficha.classList.add('visible');
    }
  }

})();
