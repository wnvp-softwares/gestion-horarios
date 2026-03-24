document.addEventListener('DOMContentLoaded', () => {

    const formularioLogin = document.getElementById('formulario-login');
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', (evento) => {
            evento.preventDefault();
            window.location.href = 'dashboard.html';
        });
    }

    const modalGlobal = document.getElementById('modal-global');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalCuerpo = document.getElementById('modal-cuerpo');
    const botonCerrarModal = document.getElementById('boton-cerrar-modal');
    const botonCancelarModal = document.getElementById('boton-cancelar-modal');
    let botonAccionModal = document.getElementById('boton-accion-modal');

    window.abrirModal = function (opciones) {
        modalTitulo.textContent = opciones.titulo || 'Notificación';
        modalCuerpo.innerHTML = opciones.contenido || '';
        botonAccionModal.textContent = opciones.textoAccion || 'Aceptar';

        if (opciones.ocultarCancelar) {
            botonCancelarModal.style.display = 'none';
        } else {
            botonCancelarModal.style.display = 'inline-flex';
        }

        const nuevoBotonAccion = botonAccionModal.cloneNode(true);
        botonAccionModal.parentNode.replaceChild(nuevoBotonAccion, botonAccionModal);
        botonAccionModal = nuevoBotonAccion;

        if (opciones.accion) {
            botonAccionModal.addEventListener('click', opciones.accion);
        } else {
            botonAccionModal.addEventListener('click', window.cerrarModal);
        }

        modalGlobal.classList.add('visible');
    };

    window.cerrarModal = function () {
        modalGlobal.classList.remove('visible');
    };

    if (botonCerrarModal) botonCerrarModal.addEventListener('click', window.cerrarModal);
    if (botonCancelarModal) botonCancelarModal.addEventListener('click', window.cerrarModal);
    if (modalGlobal) {
        modalGlobal.addEventListener('click', (e) => {
            if (e.target === modalGlobal) window.cerrarModal();
        });
    }

    const areaTrabajo = document.getElementById('contenido-central');

    if (areaTrabajo) {
        const rutas = {
            'nav-dashboard': { archivo: 'principal_dashboard.html', titulo: 'Dashboard Principal' },
            'nav-docentes': { archivo: 'docentes_dashboard.html', titulo: 'Docentes' },
            'nav-asignaturas': { archivo: 'asignaturas_dashboard.html', titulo: 'Asignaturas' },
            'nav-grupos': { archivo: 'grupos_dashboard.html', titulo: 'Grupos' },
            'nav-disponibilidad': { archivo: 'disponibilidad_dashboard.html', titulo: 'Disponibilidad' },
            'nav-periodos': { archivo: 'periodos_dashboard.html', titulo: 'Periodos' },
            'nav-generacion': { archivo: 'generacion-horario_dashboard.html', titulo: 'Generación de Horarios' }
        };

        const tituloVista = document.getElementById('titulo-vista-actual');
        const botonesMenu = document.querySelectorAll('.navegacion-lateral .item-menu');

        async function cargarVista(idRuta) {
            const ruta = rutas[idRuta];
            if (!ruta) return;

            try {
                const respuesta = await fetch(ruta.archivo);
                if (!respuesta.ok) throw new Error('Archivo no encontrado');

                const html = await respuesta.text();
                areaTrabajo.innerHTML = html;
                tituloVista.textContent = ruta.titulo;

                botonesMenu.forEach(boton => boton.classList.remove('activo'));
                document.getElementById(idRuta).classList.add('activo');

                inicializarEventosVista(idRuta);

            } catch (error) {
                console.error('Error al cargar la vista:', error);
            }
        }

        function inicializarEventosVista(idRuta) {
            if (idRuta === 'nav-docentes') {
                const btnNuevoDocente = document.querySelector('.vista-docentes .boton-primario');
                if (btnNuevoDocente) {
                    btnNuevoDocente.addEventListener('click', () => {
                        window.abrirModal({
                            titulo: 'Agregar Nuevo Docente',
                            textoAccion: 'Guardar Docente',
                            contenido: `
                                <div class="grupo-formulario">
                                    <label class="etiqueta-formulario">Nombre Completo</label>
                                    <input type="text" class="input-estandar" placeholder="Ej. Juan Pérez García">
                                </div>
                                <div class="grupo-formulario">
                                    <label class="etiqueta-formulario">Especialidad</label>
                                    <input type="text" class="input-estandar" placeholder="Ej. Matemáticas">
                                </div>
                                <div class="grid-2-columnas">
                                    <div class="grupo-formulario">
                                        <label class="etiqueta-formulario">Teléfono</label>
                                        <input type="text" class="input-estandar" placeholder="10 dígitos">
                                    </div>
                                    <div class="grupo-formulario" style="margin-bottom: 0;">
                                        <label class="etiqueta-formulario">Correo Electrónico</label>
                                        <input type="email" class="input-estandar" placeholder="correo@ejemplo.com">
                                    </div>
                                </div>
                            `,
                            accion: () => {
                                console.log('Llamando al Backend para guardar docente...');
                                window.cerrarModal();
                            }
                        });
                    });
                }
            }
        }

        botonesMenu.forEach(boton => {
            boton.addEventListener('click', (evento) => {
                evento.preventDefault();
                cargarVista(boton.id);
            });
        });

        cargarVista('nav-dashboard');

        const botonCerrarSesion = document.getElementById('nav-cerrar-sesion');
        if (botonCerrarSesion) {
            botonCerrarSesion.addEventListener('click', (evento) => {
                evento.preventDefault();
                window.location.href = 'index.html';
            });
        }
    }
});