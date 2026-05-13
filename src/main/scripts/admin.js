document.addEventListener('DOMContentLoaded', () => {

    // ====================================================================
    // 0. SEGURIDAD Y SESIÓN (RUTEO PROTEGIDO)
    // ====================================================================
    const usuarioEnSesion = JSON.parse(localStorage.getItem('usuarioSesion'));
    const esPaginaLogin = document.getElementById('formulario-login') !== null;

    if (!usuarioEnSesion && !esPaginaLogin) {
        window.location.href = 'index.html';
        return;
    }

    if (usuarioEnSesion && esPaginaLogin) {
        window.location.href = 'dashboard.html';
        return;
    }

    if (usuarioEnSesion && !esPaginaLogin) {
        const avatarEtiq = document.getElementById('perfil-avatar');
        const nombreEtiq = document.getElementById('perfil-nombre');
        const rolEtiq = document.getElementById('perfil-rol');

        if (nombreEtiq && rolEtiq && avatarEtiq) {
            nombreEtiq.textContent = usuarioEnSesion.nombre;
            rolEtiq.textContent = usuarioEnSesion.rol;

            const partes = usuarioEnSesion.nombre.trim().split(' ');
            let iniciales = partes[0][0].toUpperCase();
            if (partes.length > 1) {
                iniciales += partes[1][0].toUpperCase();
            }

            avatarEtiq.textContent = iniciales;
        }
    }

    // ====================================================================
    // CONFIGURACIÓN GLOBAL DE LA API
    // ====================================================================
    const API_URL = 'http://localhost:3000/api';

    async function fetchAPI(endpoint, opciones = {}) {
        const url = `${API_URL}${endpoint}`;
        const headers = { 'Content-Type': 'application/json' };
        const config = { method: opciones.method || 'GET', headers, ...opciones };

        if (opciones.body) config.body = JSON.stringify(opciones.body);

        try {
            const respuesta = await fetch(url, config);

            const contentType = respuesta.headers.get("content-type");
            let datos = {};

            if (contentType && contentType.includes("application/json")) {
                datos = await respuesta.json();
            } else {
                throw new Error(`Ruta no encontrada en el servidor. Asegúrate de reiniciar el backend.`);
            }

            if (!respuesta.ok) throw new Error(datos.error || 'Error en la petición');
            return datos;

        } catch (error) {
            console.error(`Error en API (${endpoint}):`, error);
            // 👇 Solo abrimos el modal si no nos pidieron ocultarlo 👇
            if (opciones.mostrarModalError !== false) {
                window.abrirModal({
                    titulo: 'Error de Conexión',
                    contenido: `<div style="padding: 1rem; border-left: 4px solid #ef4444; background-color: #fee2e2; border-radius: 4px; color: #b91c1c;">
                                    <strong>Detalle del error:</strong><br>${error.message}
                                </div>`,
                    ocultarCancelar: true,
                    textoAccion: 'Entendido'
                });
            }
            throw error;
        }
    }

    // ====================================================================
    // 1. SISTEMA DE MODALES GLOBALES DINÁMICOS
    // ====================================================================
    window.abrirModal = function (opciones) {
        let modalGlobal = document.getElementById('modal-global');
        const btnCerrar = document.getElementById('boton-cerrar-modal');

        if (btnCerrar) {
            btnCerrar.onclick = window.cerrarModal;
        }

        const btnCancelar = document.getElementById('boton-cancelar-modal');
        if (btnCancelar) {
            btnCancelar.onclick = window.cerrarModal;
        }

        modalGlobal.onclick = (e) => {
            if (e.target === modalGlobal) window.cerrarModal();
        };

        if (!modalGlobal) {
            const modalHTML = `
            <div id="modal-global" class="modal-backdrop">
                <div class="modal-ventana">
                    <div class="modal-cabecera">
                        <h3 id="modal-titulo" class="modal-titulo">Notificación</h3>
                        <button id="boton-cerrar-modal" class="boton-cerrar-modal">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div id="modal-cuerpo" class="modal-cuerpo"></div>
                    <div class="modal-pie">
                        <button id="boton-cancelar-modal" class="boton-base boton-secundario">Cancelar</button>
                        <button id="boton-accion-modal" class="boton-base boton-primario" style="width: auto;">Aceptar</button>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modalGlobal = document.getElementById('modal-global');

            document.getElementById('boton-cerrar-modal').addEventListener('click', window.cerrarModal);
            document.getElementById('boton-cancelar-modal').addEventListener('click', window.cerrarModal);
            modalGlobal.addEventListener('click', (e) => {
                if (e.target === modalGlobal) window.cerrarModal();
            });
        }

        const modalTitulo = document.getElementById('modal-titulo');
        const modalCuerpo = document.getElementById('modal-cuerpo');
        const botonCancelarModal = document.getElementById('boton-cancelar-modal');
        let botonAccionModal = document.getElementById('boton-accion-modal');

        modalTitulo.textContent = opciones.titulo || 'Notificación';
        modalCuerpo.innerHTML = opciones.contenido || '';
        botonAccionModal.textContent = opciones.textoAccion || 'Aceptar';

        botonCancelarModal.style.display = opciones.ocultarCancelar ? 'none' : 'inline-flex';

        const nuevoBotonAccion = botonAccionModal.cloneNode(true);
        nuevoBotonAccion.disabled = false;
        nuevoBotonAccion.style.opacity = '1';
        botonAccionModal.parentNode.replaceChild(nuevoBotonAccion, botonAccionModal);

        if (opciones.accion) {
            nuevoBotonAccion.addEventListener('click', opciones.accion);
        } else {
            nuevoBotonAccion.addEventListener('click', window.cerrarModal);
        }

        setTimeout(() => modalGlobal.classList.add('visible'), 10);
    };

    window.cerrarModal = function () {
        const modalGlobal = document.getElementById('modal-global');
        if (modalGlobal) modalGlobal.classList.remove('visible');
    };

    // ====================================================================
    // 2. LÓGICA DE INICIO DE SESIÓN (LOGIN)
    // ====================================================================
    const formularioLogin = document.getElementById('formulario-login');
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', async (evento) => {
            evento.preventDefault();

            const inputs = formularioLogin.querySelectorAll('input');
            const inputCorreo = inputs[0];
            const inputPassword = inputs[1];

            if (!inputCorreo || !inputPassword || !inputCorreo.value || !inputPassword.value) {
                window.abrirModal({
                    titulo: 'Campos requeridos',
                    contenido: '<p>Por favor ingresa tu correo y contraseña para continuar.</p>',
                    ocultarCancelar: true
                });
                return;
            }

            const credenciales = { correo: inputCorreo.value, contrasena: inputPassword.value };

            try {
                const respuesta = await fetchAPI('/auth/login', { method: 'POST', body: credenciales });
                localStorage.setItem('usuarioSesion', JSON.stringify(respuesta.usuario));
                window.location.href = 'dashboard.html';
            } catch (error) {
            }
        });
    }

    // ====================================================================
    // 3. ENRUTADOR SPA (SINGLE PAGE APPLICATION)
    // ====================================================================
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

        botonesMenu.forEach(boton => {
            if (boton.id !== 'nav-cerrar-sesion') {
                boton.addEventListener('click', (evento) => {
                    evento.preventDefault();
                    cargarVista(boton.id);
                });
            }
        });

        cargarVista('nav-dashboard');

        const botonCerrarSesion = document.getElementById('nav-cerrar-sesion');
        if (botonCerrarSesion) {
            botonCerrarSesion.addEventListener('click', (evento) => {
                evento.preventDefault();
                localStorage.removeItem('usuarioSesion');
                window.location.href = 'index.html';
            });
        }

        // ====================================================================
        // 4. CONTROLADOR DE VISTAS (LÓGICA ESPECÍFICA POR PANTALLA)
        // ====================================================================
        function inicializarEventosVista(idRuta) {
            if (idRuta === 'nav-dashboard') cargarDatosDashboard();
            else if (idRuta === 'nav-docentes') { cargarListaDocentes(); configurarBotonNuevoDocente(); }
            else if (idRuta === 'nav-asignaturas') { cargarListaAsignaturas(); configurarBotonNuevaAsignatura(); }
            else if (idRuta === 'nav-grupos') { cargarListaGrupos(); configurarBotonNuevoGrupo(); }
            else if (idRuta === 'nav-periodos') { cargarListaPeriodos(); configurarFormularioNuevoPeriodo(); }
            else if (idRuta === 'nav-disponibilidad') { inicializarModuloDisponibilidad(); }
            else if (idRuta === 'nav-generacion') { inicializarModuloGenerador(); }
        }

        // ---------------------------------------------------------
        // MÓDULO: DASHBOARD PRINCIPAL
        // ---------------------------------------------------------
        function cargarDatosDashboard() {
            fetchAPI('/docentes').then(data => document.getElementById('dash-total-docentes').textContent = data.length).catch(() => document.getElementById('dash-total-docentes').textContent = 'X');
            fetchAPI('/grupos').then(data => document.getElementById('dash-total-grupos').textContent = data.length).catch(() => document.getElementById('dash-total-grupos').textContent = 'X');
            fetchAPI('/asignaturas').then(data => document.getElementById('dash-total-asignaturas').textContent = data.length).catch(() => document.getElementById('dash-total-asignaturas').textContent = 'X');

            fetchAPI('/periodos').then(periodos => {
                const periodoActivo = periodos.find(p => p.es_activo === true);
                document.getElementById('dash-periodo-activo').textContent = periodoActivo ? periodoActivo.nombre : 'Sin periodo activo';
                document.getElementById('dash-periodo-estado').textContent = periodoActivo ? 'En curso' : 'Falta configurar';
            }).catch(() => {
                document.getElementById('dash-periodo-activo').textContent = 'Error';
                document.getElementById('dash-periodo-estado').textContent = 'Error';
            });

            const contenedorClases = document.getElementById('dash-lista-clases');
            if (!contenedorClases) return;

            const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const diaHoy = diasSemana[new Date().getDay()];
            document.getElementById('dash-titulo-hoy').textContent = `Clases de Hoy (${diaHoy})`;

            fetchAPI('/horarios').then(horarios => {
                contenedorClases.innerHTML = '';
                const clasesHoy = horarios.filter(h => h.dia_semana === diaHoy);

                if (clasesHoy.length === 0) {
                    contenedorClases.innerHTML = `
                        <div style="text-align:center; padding: 2rem; color: var(--color-texto-secundario);">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:1rem; opacity:0.5;">
                                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <br>No hay clases programadas para hoy.
                        </div>`;
                    return;
                }

                clasesHoy.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

                clasesHoy.forEach(clase => {
                    const colorHex = (clase.asignatura && clase.asignatura.color_hex) ? clase.asignatura.color_hex : '#2563eb';
                    const horaCorta = clase.hora_inicio.substring(0, 5);
                    const nombreAsignatura = clase.asignatura ? clase.asignatura.nombre : 'Materia Borrada';
                    const nombreGrupo = clase.grupo ? clase.grupo.identificador : '?';
                    const nombreDocente = clase.docente ? `${clase.docente.prefijo || ''} ${clase.docente.nombre_completo}` : 'Sin asignar';

                    contenedorClases.innerHTML += `
                        <div class="item-clase">
                            <span class="hora-clase">${horaCorta}</span>
                            <div class="punto-indicador" style="background-color: ${colorHex};"></div>
                            <div class="tarjeta-clase" style="background-color: ${colorHex}15; border-color: transparent;">
                                <h4 class="titulo-clase" style="color: ${colorHex};">${nombreAsignatura}</h4>
                                <div class="info-clase-meta">
                                    <div class="grupo-clase">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
                                        </svg>
                                        <span>Grupo ${nombreGrupo}</span>
                                    </div>
                                    <span>${nombreDocente}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }).catch(() => {
                contenedorClases.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--color-error-texto);">Hubo un problema al cargar los horarios.</div>`;
            });
        }

        // ---------------------------------------------------------
        // MÓDULO: DOCENTES
        // ---------------------------------------------------------
        let estadoDocentes = {
            paginaActual: 1,
            busqueda: '',
            limite: 6
        };

        let timerBusquedaDocentes;

        // ¡AQUÍ ESTÁ LA MAGIA VISUAL PARA EL BUSCADOR Y LA TABLA!
        if (!document.getElementById('estilos-acciones')) {
            const style = document.createElement('style');
            style.id = 'estilos-acciones';
            style.innerHTML = `
                /* Animaciones Botones */
                .btn-accion-tabla { background: none; border: none; cursor: pointer; color: #9ca3af; transition: color 0.2s ease, transform 0.1s ease; padding: 0.25rem; }
                .btn-accion-tabla:active { transform: scale(0.90); }
                .btn-editar:hover { color: #2563eb !important; }
                .btn-eliminar:hover { color: #ef4444 !important; }
                .contenedor-acciones { display: flex; gap: 0.75rem; align-items: center; }

                /* 1. Hacer el buscador más largo y responsivo */
                .vista-docentes .acciones-herramientas { flex: 1; justify-content: flex-end; display: flex; gap: 1rem; }
                .vista-docentes .contenedor-buscador { width: 100%; max-width: 380px; transition: all 0.3s ease; }
                .vista-docentes .contenedor-buscador:focus-within { max-width: 450px; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); border-color: #2563eb; }
                
                /* 2. Empujar el pie de página siempre hasta abajo */
                .vista-docentes .contenedor-tabla { display: flex; flex-direction: column; min-height: calc(100vh - 220px); }
                .vista-docentes .tabla-datos { margin-bottom: auto; /* Empuja todo lo demás al fondo */ }
                .vista-docentes .pie-tabla { margin-top: auto; padding-top: 1.5rem; border-top: 1px solid #f3f4f6; }
            `;
            document.head.appendChild(style);
        }

        async function cargarListaDocentes() {
            try {
                const url = `/docentes?page=${estadoDocentes.paginaActual}&search=${estadoDocentes.busqueda}&limit=${estadoDocentes.limite}`;
                const data = await fetchAPI(url);

                const tbody = document.querySelector('.vista-docentes .tabla-datos tbody');
                if (!tbody) return;
                tbody.innerHTML = '';

                if (data.docentes.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">No se encontraron docentes.</td></tr>`;
                    actualizarPaginacion(0, 0);
                    return;
                }

                data.docentes.forEach(doc => {
                    const iniciales = doc.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    const estadoClase = doc.es_activo ? 'estado-activo' : 'estado-inactivo';

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>
                            <div class="perfil-celda">
                                <div class="avatar-iniciales">${iniciales}</div>
                                <div class="info-texto">
                                    <span class="texto-principal">${doc.prefijo || ''} ${doc.nombre_completo}</span>
                                    <span class="texto-menor">ID: ${doc.identificador}</span>
                                </div>
                            </div>
                        </td>
                        <td><div class="item-icono-texto"><span>${doc.especialidad || 'Sin especialidad'}</span></div></td>
                        <td>
                            <div class="celda-icono-texto">
                                <div class="item-icono-texto"><span>${doc.correo}</span></div>
                                <div class="item-icono-texto"><span>${doc.telefono || 'Sin teléfono'}</span></div>
                            </div>
                        </td>
                        <td><div class="etiqueta-estado ${estadoClase}"><span class="punto-estado"></span> ${doc.es_activo ? 'Activo' : 'Inactivo'}</div></td>
                        <td>
                            <div class="contenedor-acciones">
                                <button class="btn-accion-tabla btn-editar" title="Editar" data-id="${doc.id}">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button class="btn-accion-tabla btn-eliminar" title="Eliminar" data-id="${doc.id}">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    `;

                    tr.querySelector('.btn-editar').addEventListener('click', () => prepararEdicionDocente(doc));
                    tr.querySelector('.btn-eliminar').addEventListener('click', () => prepararEliminacionDocente(doc));

                    tbody.appendChild(tr);
                });

                actualizarPaginacion(data.total, data.paginas);
            } catch (error) {
                console.error("Error al cargar docentes:", error);
            }

            function configurarBusquedaDocentes() {
                const inputBuscar = document.querySelector('.vista-docentes .input-buscar');
                if (!inputBuscar) return;

                inputBuscar.value = estadoDocentes.busqueda;

                inputBuscar.addEventListener('input', (e) => {
                    clearTimeout(timerBusquedaDocentes);

                    timerBusquedaDocentes = setTimeout(() => {
                        estadoDocentes.busqueda = e.target.value.trim();
                        estadoDocentes.paginaActual = 1;
                        cargarListaDocentes();
                    }, 500);
                });
            }

            const inputBuscar = document.querySelector('.vista-docentes .input-buscar');
            let timerBusqueda;
            let ultimaPeticionId = 0;

            if (!inputBuscar) return;

            const nuevoInputBuscar = inputBuscar.cloneNode(true);
            inputBuscar.parentNode.replaceChild(nuevoInputBuscar, inputBuscar);

            nuevoInputBuscar.addEventListener('input', (e) => {
                clearTimeout(timerBusqueda);
                const peticionActualId = ++ultimaPeticionId;

                timerBusqueda = setTimeout(() => {
                    estadoDocentes.busqueda = e.target.value;
                    estadoDocentes.paginaActual = 1;
                    cargarListaDocentes();
                }, 600);
            });
        }

        function prepararEliminacionDocente(doc) {
            window.abrirModal({
                titulo: 'Eliminar Docente',
                textoAccion: 'Sí, Eliminar',
                contenido: `
                    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1.5rem 1rem 0.5rem 1rem;">
                        <div style="background-color: #fee2e2; border-radius: 50%; width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <p style="font-size: 1.15rem; color: #374151; margin-bottom: 0.75rem;">
                            ¿Estás seguro de que deseas eliminar al docente <strong>${doc.prefijo || ''} ${doc.nombre_completo}</strong>?
                        </p>
                        <p style="color: #ef4444; font-size: 0.95rem; font-weight: 500; margin: 0;">
                            Esta acción no se puede deshacer y borrará sus horarios asignados.
                        </p>
                    </div>
                `,
                accion: async () => {
                    const btnAccion = document.getElementById('boton-accion-modal');
                    if (btnAccion) {
                        btnAccion.disabled = true;
                        btnAccion.textContent = 'Eliminando...';
                        btnAccion.style.opacity = '0.7';
                    }

                    try {
                        await fetchAPI(`/docentes/${doc.id}`, { method: 'DELETE' });

                        window.cerrarModal();
                        cargarListaDocentes();
                        setTimeout(() => {
                            window.abrirModal({
                                titulo: 'Éxito',
                                contenido: `
                                    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1.5rem 1rem 0.5rem 1rem;">
                                        <div style="background-color: #d1fae5; border-radius: 50%; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                                            </svg>
                                        </div>
                                        <p style="font-size: 1.1rem; color: #374151; margin: 0;">Docente eliminado correctamente.</p>
                                    </div>
                                `,
                                ocultarCancelar: true,
                                textoAccion: 'Entendido'
                            });
                        }, 400);
                    } catch (error) {
                        console.error('Error al borrar:', error);
                        if (btnAccion) {
                            btnAccion.disabled = false;
                            btnAccion.textContent = 'Sí, Eliminar';
                            btnAccion.style.opacity = '1';
                        }
                    }
                }
            });
        }

        function actualizarPaginacion(total, paginas) {
            const info = document.querySelector('.texto-paginacion');
            const contenedor = document.querySelector('.controles-paginacion');
            if (!info || !contenedor) return;

            const inicio = (estadoDocentes.paginaActual - 1) * estadoDocentes.limite + 1;
            const fin = Math.min(estadoDocentes.paginaActual * estadoDocentes.limite, total);

            info.textContent = `Mostrando ${total > 0 ? inicio : 0} a ${fin} de ${total} docentes`;

            contenedor.innerHTML = '';

            const btnAnt = document.createElement('button');
            btnAnt.className = `boton-pag ${estadoDocentes.paginaActual === 1 ? 'desactivado' : ''}`;
            btnAnt.textContent = 'Anterior';
            btnAnt.onclick = () => { if (estadoDocentes.paginaActual > 1) { estadoDocentes.paginaActual--; cargarListaDocentes(); } };
            contenedor.appendChild(btnAnt);

            for (let i = 1; i <= paginas; i++) {
                const btn = document.createElement('button');
                btn.className = `boton-pag ${i === estadoDocentes.paginaActual ? 'activo' : ''}`;
                btn.textContent = i;
                btn.onclick = () => { estadoDocentes.paginaActual = i; cargarListaDocentes(); };
                contenedor.appendChild(btn);
            }

            const btnSig = document.createElement('button');
            btnSig.className = `boton-pag ${estadoDocentes.paginaActual === paginas ? 'desactivado' : ''}`;
            btnSig.textContent = 'Siguiente';
            btnSig.onclick = () => { if (estadoDocentes.paginaActual < paginas) { estadoDocentes.paginaActual++; cargarListaDocentes(); } };
            contenedor.appendChild(btnSig);
        }

        function configurarBotonNuevoDocente() {
            const btn = document.querySelector('.vista-docentes .boton-primario');
            if (!btn) return;
            btn.onclick = () => {
                abrirModal({
                    titulo: 'Agregar Nuevo Docente',
                    textoAccion: 'Guardar Docente',
                    contenido: generarFormularioDocente(),
                    accion: async () => {
                        const nuevoDocente = capturarDatosFormulario();
                        if (!validarDatos(nuevoDocente)) return;

                        await fetchAPI('/docentes', { method: 'POST', body: nuevoDocente });
                        cerrarModal();
                        cargarListaDocentes();
                    }
                });
            };
        }

        function prepararEdicionDocente(doc) {
            abrirModal({
                titulo: 'Editar Docente',
                textoAccion: 'Actualizar Cambios',
                contenido: generarFormularioDocente(doc),
                accion: async () => {
                    const datosActualizados = capturarDatosFormulario();
                    if (!validarDatos(datosActualizados)) return;

                    await fetchAPI(`/docentes/${doc.id}`, { method: 'PUT', body: datosActualizados });
                    cerrarModal();
                    cargarListaDocentes();
                }
            });
        }

        // Helpers para evitar repetición de código
        function generarFormularioDocente(doc = {}) {
            return `
        <div class="grid-2-columnas">
            <div class="grupo-formulario"><label>Prefijo</label><input type="text" id="doc-prefijo" class="input-estandar" value="${doc.prefijo || ''}"></div>
            <div class="grupo-formulario"><label>ID *</label><input type="text" id="doc-id" class="input-estandar" value="${doc.identificador || ''}"></div>
        </div>
        <div class="grupo-formulario"><label>Nombre Completo *</label><input type="text" id="doc-nombre" class="input-estandar" value="${doc.nombre_completo || ''}"></div>
        <div class="grupo-formulario"><label>Especialidad</label><input type="text" id="doc-especialidad" class="input-estandar" value="${doc.especialidad || ''}"></div>
        <div class="grid-2-columnas">
            <div class="grupo-formulario"><label>Teléfono</label><input type="text" id="doc-telefono" class="input-estandar" value="${doc.telefono || ''}"></div>
            <div class="grupo-formulario"><label>Correo *</label><input type="email" id="doc-correo" class="input-estandar" value="${doc.correo || ''}"></div>
        </div>
        <div class="grupo-formulario">
            <label><input type="checkbox" id="doc-activo" ${doc.es_activo !== false ? 'checked' : ''}> Cuenta Activa</label>
        </div>
    `;
        }

        function capturarDatosFormulario() {
            return {
                identificador: document.getElementById('doc-id').value,
                prefijo: document.getElementById('doc-prefijo').value,
                nombre_completo: document.getElementById('doc-nombre').value,
                especialidad: document.getElementById('doc-especialidad').value,
                telefono: document.getElementById('doc-telefono').value,
                correo: document.getElementById('doc-correo').value,
                es_activo: document.getElementById('doc-activo').checked
            };
        }

        function validarDatos(d) {
            if (!d.nombre_completo || !d.correo || !d.identificador) {
                const errorMsg = document.createElement('p');
                errorMsg.style.color = 'red';
                errorMsg.textContent = ' Por favor, rellena los campos obligatorios (*)';

                const modalCuerpo = document.querySelector('.modal-body');
                if (modalCuerpo) modalCuerpo.prepend(errorMsg);

                return false;
            }
            return true;
        }

        // ---------------------------------------------------------
        // MÓDULO: ASIGNATURAS
        // ---------------------------------------------------------
        let busquedaAsignaturaStr = '';
        let timerBusquedaAsignatura;

        if (!document.getElementById('estilos-acciones-tarjetas')) {
            const style = document.createElement('style');
            style.id = 'estilos-acciones-tarjetas';
            style.innerHTML = `
                .vista-asignaturas .acciones-herramientas { display: flex; gap: 1rem; align-items: center; justify-content: flex-end; flex: 1;}
                .vista-asignaturas .contenedor-buscador { width: 300px; transition: width 0.3s ease; }
                .vista-asignaturas .contenedor-buscador:focus-within { width: 350px; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); border-color: #2563eb; }
                
                .acciones-tarjeta { display: flex; gap: 0.5rem; }
                .btn-accion-tarjeta { background: none; border: none; cursor: pointer; color: #9ca3af; transition: all 0.2s ease; padding: 0.25rem; opacity: 0; }
                .tarjeta-asignatura:hover .btn-accion-tarjeta { opacity: 1; }
                .btn-accion-tarjeta:hover { transform: scale(1.1); }
                .btn-editar-tarjeta:hover { color: #2563eb; }
                .btn-eliminar-tarjeta:hover { color: #ef4444; }
            `;
            document.head.appendChild(style);
        }

        async function cargarListaAsignaturas() {
            try {
                const url = busquedaAsignaturaStr ? `/asignaturas?search=${encodeURIComponent(busquedaAsignaturaStr)}` : '/asignaturas';
                const asignaturas = await fetchAPI(url);

                const contenedor = document.querySelector('.vista-asignaturas .grid-tarjetas');
                if (!contenedor) return;
                contenedor.innerHTML = '';

                if (asignaturas.length === 0) {
                    contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #6b7280; background: white; border-radius: 1rem; border: 1px dashed #e5e7eb;">No se encontraron asignaturas con ese criterio.</div>`;
                    return;
                }

                asignaturas.forEach(asig => {
                    const colorFondo = `${asig.color_hex}20`;

                    const div = document.createElement('div');
                    div.className = 'tarjeta-asignatura';
                    div.innerHTML = `
                        <div class="cabecera-tarjeta-asignatura" style="align-items: flex-start;">
                            <div class="icono-asignatura" style="color: ${asig.color_hex}; background-color: ${colorFondo};">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                            </div>
                            <div class="info-asignatura" style="flex: 1;">
                                <h3 class="titulo-asignatura">${asig.nombre}</h3>
                                <div class="meta-asignatura">
                                    <span class="etiqueta-codigo">${asig.codigo}</span>
                                    <span class="separador-meta">•</span>
                                    <span>${asig.area || 'Sin área'}</span>
                                </div>
                            </div>
                            <div class="acciones-tarjeta">
                                <button class="btn-accion-tarjeta btn-editar-tarjeta" title="Editar">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button class="btn-accion-tarjeta btn-eliminar-tarjeta" title="Eliminar">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                        <div class="pie-tarjeta-asignatura">
                            <span class="texto-horas">Horas semanales</span>
                            <span class="etiqueta-horas" style="color: ${asig.color_hex}; background-color: ${colorFondo};">${asig.horas_semanales} hrs</span>
                        </div>
                    `;

                    div.querySelector('.btn-editar-tarjeta').addEventListener('click', () => prepararEdicionAsignatura(asig));
                    div.querySelector('.btn-eliminar-tarjeta').addEventListener('click', () => prepararEliminacionAsignatura(asig));

                    contenedor.appendChild(div);
                });
            } catch (error) { console.error(error); }

            configurarBusquedaAsignaturas();
        }

        function configurarBusquedaAsignaturas() {
            const inputBuscar = document.querySelector('.vista-asignaturas .input-buscar');
            if (!inputBuscar) return;

            inputBuscar.value = busquedaAsignaturaStr;

            const nuevoInputBuscar = inputBuscar.cloneNode(true);
            inputBuscar.parentNode.replaceChild(nuevoInputBuscar, inputBuscar);

            nuevoInputBuscar.addEventListener('input', (e) => {
                clearTimeout(timerBusquedaAsignatura);
                timerBusquedaAsignatura = setTimeout(() => {
                    busquedaAsignaturaStr = e.target.value.trim();
                    cargarListaAsignaturas();
                }, 500);
            });
        }

        function generarFormularioAsignatura(asig = {}) {
            return `
                <div class="grid-2-columnas">
                    <div class="grupo-formulario"><label class="etiqueta-formulario">Código *</label><input type="text" id="asig-codigo" class="input-estandar" placeholder="Ej. MAT-101" value="${asig.codigo || ''}"></div>
                    <div class="grupo-formulario"><label class="etiqueta-formulario">Horas Semanales *</label><input type="number" id="asig-horas" class="input-estandar" placeholder="Ej. 4" value="${asig.horas_semanales || ''}"></div>
                </div>
                <div class="grupo-formulario"><label class="etiqueta-formulario">Nombre *</label><input type="text" id="asig-nombre" class="input-estandar" placeholder="Ej. Matemáticas Avanzadas" value="${asig.nombre || ''}"></div>
                <div class="grid-2-columnas">
                    <div class="grupo-formulario"><label class="etiqueta-formulario">Área</label><input type="text" id="asig-area" class="input-estandar" placeholder="Ej. Ciencias Exactas" value="${asig.area || ''}"></div>
                    <div class="grupo-formulario" style="margin-bottom: 0;"><label class="etiqueta-formulario">Color</label><input type="color" id="asig-color" class="input-estandar" value="${asig.color_hex || '#2563eb'}" style="padding: 0.25rem; height: 42px;"></div>
                </div>
            `;
        }

        function capturarDatosAsignatura() {
            return {
                codigo: document.getElementById('asig-codigo').value,
                horas_semanales: document.getElementById('asig-horas').value,
                nombre: document.getElementById('asig-nombre').value,
                area: document.getElementById('asig-area').value,
                color_hex: document.getElementById('asig-color').value
            };
        }

        function configurarBotonNuevaAsignatura() {
            const btnNuevaAsig = document.querySelector('.vista-asignaturas .boton-primario');
            if (!btnNuevaAsig) return;

            btnNuevaAsig.addEventListener('click', () => {
                abrirModal({
                    titulo: 'Agregar Nueva Asignatura',
                    textoAccion: 'Guardar Asignatura',
                    contenido: generarFormularioAsignatura(),
                    accion: async () => {
                        const nuevaAsig = capturarDatosAsignatura();
                        if (!nuevaAsig.codigo || !nuevaAsig.nombre || !nuevaAsig.horas_semanales) {
                            return window.abrirModal({ titulo: 'Faltan Datos', contenido: 'Llena los campos obligatorios.', ocultarCancelar: true });
                        }
                        await fetchAPI('/asignaturas', { method: 'POST', body: nuevaAsig });
                        cerrarModal();
                        cargarListaAsignaturas();
                    }
                });
            });
        }

        function prepararEdicionAsignatura(asig) {
            abrirModal({
                titulo: 'Editar Asignatura',
                textoAccion: 'Actualizar Cambios',
                contenido: generarFormularioAsignatura(asig),
                accion: async () => {
                    const datos = capturarDatosAsignatura();
                    if (!datos.codigo || !datos.nombre || !datos.horas_semanales) {
                        return window.abrirModal({ titulo: 'Faltan Datos', contenido: 'Llena los campos obligatorios.', ocultarCancelar: true });
                    }
                    await fetchAPI(`/asignaturas/${asig.id}`, { method: 'PUT', body: datos });
                    cerrarModal();
                    cargarListaAsignaturas();
                }
            });
        }

        function prepararEliminacionAsignatura(asig) {
            window.abrirModal({
                titulo: 'Eliminar Asignatura',
                textoAccion: 'Sí, Eliminar',
                contenido: `
                    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1.5rem 1rem 0.5rem 1rem;">
                        <div style="background-color: #fee2e2; border-radius: 50%; width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><line x1="8" y1="2" x2="8" y2="22"></line>
                            </svg>
                        </div>
                        <p style="font-size: 1.15rem; color: #374151; margin-bottom: 0.75rem;">
                            ¿Deseas eliminar la asignatura <strong>${asig.nombre}</strong>?
                        </p>
                        <p style="color: #ef4444; font-size: 0.95rem; font-weight: 500; margin: 0;">
                            Esto borrará la materia del plan de estudios y sus horarios.
                        </p>
                    </div>
                `,
                accion: async () => {
                    const btnAccion = document.getElementById('boton-accion-modal');
                    if (btnAccion) { btnAccion.disabled = true; btnAccion.textContent = 'Eliminando...'; btnAccion.style.opacity = '0.7'; }
                    try {
                        await fetchAPI(`/asignaturas/${asig.id}`, { method: 'DELETE' });
                        window.cerrarModal();
                        cargarListaAsignaturas();
                    } catch (error) {
                        if (btnAccion) { btnAccion.disabled = false; btnAccion.textContent = 'Sí, Eliminar'; btnAccion.style.opacity = '1'; }
                    }
                }
            });
        }

        // ---------------------------------------------------------
        // MÓDULO: GRUPOS
        // ---------------------------------------------------------
        let busquedaGrupoStr = '';
        let timerBusquedaGrupo;

        // Inyectamos el CSS para que los botones solo aparezcan al pasar el mouse por la fila (Hover)
        if (!document.getElementById('estilos-acciones-grupos')) {
            const style = document.createElement('style');
            style.id = 'estilos-acciones-grupos';
            style.innerHTML = `
                .acciones-fila { display: flex; gap: 0.5rem; opacity: 0; transition: opacity 0.2s ease; justify-content: flex-start; }
                .tabla-datos tbody tr:hover .acciones-fila { opacity: 1; }
                
                /* Estilos para el buscador de grupos */
                .vista-grupos .acciones-herramientas { display: flex; gap: 1rem; align-items: center; justify-content: flex-end; flex: 1;}
                .vista-grupos .contenedor-buscador { width: 300px; transition: width 0.3s ease; }
                .vista-grupos .contenedor-buscador:focus-within { width: 350px; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); border-color: #2563eb; }
            `;
            document.head.appendChild(style);
        }

        async function cargarListaGrupos() {
            try {
                const url = busquedaGrupoStr ? `/grupos?search=${encodeURIComponent(busquedaGrupoStr)}` : '/grupos';
                const grupos = await fetchAPI(url);

                const tbody = document.querySelector('.vista-grupos .tabla-datos tbody');
                if (!tbody) return;
                tbody.innerHTML = '';

                if (grupos.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 3rem; color: #6b7280;">No se encontraron grupos con ese criterio.</td></tr>`;
                    return;
                }

                grupos.forEach(grp => {
                    const iconoTurno = grp.turno === 'Matutino'
                        ? `<svg class="icono-turno-matutino" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
                        : `<svg class="icono-turno-vespertino" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>
                            <div class="perfil-celda">
                                <div class="badge-grupo">${grp.identificador}</div>
                                <div class="info-texto">
                                    <span class="texto-principal">${grp.nombre}</span>
                                    <span class="texto-menor">ID: GRP-${grp.id}</span>
                                </div>
                            </div>
                        </td>
                        <td><span class="celda-texto-simple">${grp.grado}</span></td>
                        <td><div class="item-icono-texto">${iconoTurno}<span>${grp.turno}</span></div></td>
                        <td>
                            <div class="item-icono-texto">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                <span>${grp.capacidad} alumnos</span>
                            </div>
                        </td>
                        <td>
                            <div class="acciones-fila">
                                <button class="btn-accion-tabla btn-editar" title="Editar">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button class="btn-accion-tabla btn-eliminar" title="Eliminar">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </td>
                    `;

                    tr.querySelector('.btn-editar').addEventListener('click', () => prepararEdicionGrupo(grp));
                    tr.querySelector('.btn-eliminar').addEventListener('click', () => prepararEliminacionGrupo(grp));

                    tbody.appendChild(tr);
                });
            } catch (error) { console.error(error); }

            configurarBusquedaGrupos();
        }

        function configurarBusquedaGrupos() {
            const inputBuscar = document.querySelector('.vista-grupos .input-buscar');
            if (!inputBuscar) return;

            inputBuscar.value = busquedaGrupoStr;

            const nuevoInputBuscar = inputBuscar.cloneNode(true);
            inputBuscar.parentNode.replaceChild(nuevoInputBuscar, inputBuscar);

            nuevoInputBuscar.addEventListener('input', (e) => {
                clearTimeout(timerBusquedaGrupo);
                timerBusquedaGrupo = setTimeout(() => {
                    busquedaGrupoStr = e.target.value.trim();
                    cargarListaGrupos();
                }, 500);
            });
        }

        // Helpers de Formularios
        function generarFormularioGrupo(grp = {}) {
            return `
                <div class="grid-2-columnas">
                    <div class="grupo-formulario"><label class="etiqueta-formulario">Identificador (Ej. 1A) *</label><input type="text" id="grp-id" class="input-estandar" placeholder="1A" value="${grp.identificador || ''}"></div>
                    <div class="grupo-formulario"><label class="etiqueta-formulario">Nombre Oficial *</label><input type="text" id="grp-nombre" class="input-estandar" placeholder="Grupo 1A" value="${grp.nombre || ''}"></div>
                </div>
                <div class="grid-2-columnas">
                    <div class="grupo-formulario"><label class="etiqueta-formulario">Grado *</label><input type="text" id="grp-grado" class="input-estandar" placeholder="1er Semestre" value="${grp.grado || ''}"></div>
                    <div class="grupo-formulario"><label class="etiqueta-formulario">Capacidad *</label><input type="number" id="grp-capacidad" class="input-estandar" placeholder="35" value="${grp.capacidad || ''}"></div>
                </div>
                <div class="grupo-formulario" style="margin-bottom: 0;">
                    <label class="etiqueta-formulario">Turno *</label>
                    <select id="grp-turno" class="input-estandar">
                        <option value="Matutino" ${grp.turno === 'Matutino' ? 'selected' : ''}>Matutino</option>
                        <option value="Vespertino" ${grp.turno === 'Vespertino' ? 'selected' : ''}>Vespertino</option>
                    </select>
                </div>
            `;
        }

        function capturarDatosGrupo() {
            return {
                identificador: document.getElementById('grp-id').value,
                nombre: document.getElementById('grp-nombre').value,
                grado: document.getElementById('grp-grado').value,
                capacidad: document.getElementById('grp-capacidad').value,
                turno: document.getElementById('grp-turno').value
            };
        }

        function configurarBotonNuevoGrupo() {
            const btnNuevoGrp = document.querySelector('.vista-grupos .boton-primario');
            if (!btnNuevoGrp) return;

            btnNuevoGrp.addEventListener('click', () => {
                abrirModal({
                    titulo: 'Agregar Nuevo Grupo',
                    textoAccion: 'Guardar Grupo',
                    contenido: generarFormularioGrupo(),
                    accion: async () => {
                        const nuevoGrp = capturarDatosGrupo();
                        if (!nuevoGrp.identificador || !nuevoGrp.nombre || !nuevoGrp.grado || !nuevoGrp.capacidad) {
                            return window.abrirModal({ titulo: 'Faltan Datos', contenido: 'Llena los campos obligatorios.', ocultarCancelar: true });
                        }
                        await fetchAPI('/grupos', { method: 'POST', body: nuevoGrp });
                        cerrarModal();
                        cargarListaGrupos();
                    }
                });
            });
        }

        function prepararEdicionGrupo(grp) {
            abrirModal({
                titulo: 'Editar Grupo',
                textoAccion: 'Actualizar Cambios',
                contenido: generarFormularioGrupo(grp),
                accion: async () => {
                    const datos = capturarDatosGrupo();
                    if (!datos.identificador || !datos.nombre || !datos.grado || !datos.capacidad) {
                        return window.abrirModal({ titulo: 'Faltan Datos', contenido: 'Llena los campos obligatorios.', ocultarCancelar: true });
                    }
                    await fetchAPI(`/grupos/${grp.id}`, { method: 'PUT', body: datos });
                    cerrarModal();
                    cargarListaGrupos();
                }
            });
        }

        function prepararEliminacionGrupo(grp) {
            window.abrirModal({
                titulo: 'Eliminar Grupo',
                textoAccion: 'Sí, Eliminar',
                contenido: `
                    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1.5rem 1rem 0.5rem 1rem;">
                        <div style="background-color: #fee2e2; border-radius: 50%; width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <p style="font-size: 1.15rem; color: #374151; margin-bottom: 0.75rem;">
                            ¿Estás seguro de que deseas eliminar el grupo <strong>${grp.nombre}</strong>?
                        </p>
                        <p style="color: #ef4444; font-size: 0.95rem; font-weight: 500; margin: 0;">
                            Esta acción borrará todas sus materias y horarios asociados.
                        </p>
                    </div>
                `,
                accion: async () => {
                    const btnAccion = document.getElementById('boton-accion-modal');
                    if (btnAccion) { btnAccion.disabled = true; btnAccion.textContent = 'Eliminando...'; btnAccion.style.opacity = '0.7'; }
                    try {
                        await fetchAPI(`/grupos/${grp.id}`, { method: 'DELETE' });
                        window.cerrarModal();
                        cargarListaGrupos();
                    } catch (error) {
                        if (btnAccion) { btnAccion.disabled = false; btnAccion.textContent = 'Sí, Eliminar'; btnAccion.style.opacity = '1'; }
                    }
                }
            });
        }

        // ---------------------------------------------------------
        // MÓDULO: PERIODOS
        // ---------------------------------------------------------
        async function cargarListaPeriodos() {
            try {
                const periodos = await fetchAPI('/periodos');
                const contenedor = document.querySelector('.vista-periodos .lista-periodos');
                if (!contenedor) return;
                contenedor.innerHTML = '';

                if (periodos.length === 0) {
                    contenedor.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--color-texto-secundario);">No hay periodos registrados.</div>`;
                    return;
                }

                periodos.forEach(per => {
                    const claseActivo = per.es_activo ? 'activo' : '';
                    const tagActivo = per.es_activo
                        ? `<span class="etiqueta-periodo-activo"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>ACTIVO</span>`
                        : '';
                    const btnActivar = !per.es_activo
                        ? `<button class="boton-base boton-primario btn-activar-periodo" data-id="${per.id}" style="width: auto;">Establecer Activo</button>`
                        : '';

                    contenedor.innerHTML += `
                        <div class="tarjeta-periodo ${claseActivo}">
                            <div class="contenido-izquierdo-periodo">
                                <div class="icono-periodo">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                </div>
                                <div class="info-periodo">
                                    <div class="cabecera-info-periodo">
                                        <span class="titulo-periodo">${per.nombre}</span>
                                        ${tagActivo}
                                    </div>
                                    <div class="meta-periodo">
                                        <div class="item-meta-periodo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>Inicio: ${per.fecha_inicio}</span></div>
                                        <div class="item-meta-periodo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>Fin: ${per.fecha_fin}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div class="acciones-periodo">
                                <button class="boton-base boton-secundario btn-editar-periodo" data-id="${per.id}">Editar</button>
                                ${btnActivar}
                            </div>
                        </div>
                    `;
                });

                // Eventos para Activar
                document.querySelectorAll('.btn-activar-periodo').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const id = e.target.getAttribute('data-id');
                        await fetchAPI(`/periodos/${id}/activar`, { method: 'PUT' });
                        cargarListaPeriodos();
                    });
                });

                // Eventos para Editar
                document.querySelectorAll('.btn-editar-periodo').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        const periodoEncontrado = periodos.find(p => p.id == id);
                        prepararEdicionPeriodo(periodoEncontrado);
                    });
                });

            } catch (error) { console.error(error); }
        }

        // Función para abrir el Modal de Edición de Periodo
        function prepararEdicionPeriodo(per) {
            window.abrirModal({
                titulo: 'Editar Periodo',
                textoAccion: 'Guardar Cambios',
                contenido: `
                    <div class="grupo-formulario">
                        <label class="etiqueta-formulario">Nombre del Periodo *</label>
                        <input type="text" id="edit-per-nombre" class="input-estandar" value="${per.nombre}">
                    </div>
                    <div class="grid-2-columnas">
                        <div class="grupo-formulario">
                            <label class="etiqueta-formulario">Fecha de Inicio *</label>
                            <input type="date" id="edit-per-inicio" class="input-estandar" value="${per.fecha_inicio}">
                        </div>
                        <div class="grupo-formulario" style="margin-bottom: 0;">
                            <label class="etiqueta-formulario">Fecha de Fin *</label>
                            <input type="date" id="edit-per-fin" class="input-estandar" value="${per.fecha_fin}">
                        </div>
                    </div>
                `,
                accion: async () => {
                    const datos = {
                        nombre: document.getElementById('edit-per-nombre').value,
                        fecha_inicio: document.getElementById('edit-per-inicio').value,
                        fecha_fin: document.getElementById('edit-per-fin').value
                    };

                    if (!datos.nombre || !datos.fecha_inicio || !datos.fecha_fin) {
                        return window.abrirModal({ titulo: 'Faltan Datos', contenido: 'Llena los campos obligatorios.', ocultarCancelar: true });
                    }

                    await fetchAPI(`/periodos/${per.id}`, { method: 'PUT', body: datos });
                    window.cerrarModal();
                    cargarListaPeriodos();
                }
            });
        }

        function configurarFormularioNuevoPeriodo() {
            const formularioOriginal = document.getElementById('formulario-periodo');
            if (!formularioOriginal) return;

            // Truco UX: Cambiamos los inputs de texto a inputs tipo calendario
            const inputInicio = document.getElementById('fecha-inicio');
            const inputFin = document.getElementById('fecha-fin');
            if (inputInicio) inputInicio.type = 'date';
            if (inputFin) inputFin.type = 'date';

            // Clonamos para evitar que se dupliquen eventos al cambiar de pestañas
            const formulario = formularioOriginal.cloneNode(true);
            formularioOriginal.parentNode.replaceChild(formulario, formularioOriginal);

            formulario.addEventListener('submit', async (evento) => {
                evento.preventDefault();

                const nuevoPeriodo = {
                    nombre: document.getElementById('nombre-periodo').value,
                    fecha_inicio: document.getElementById('fecha-inicio').value,
                    fecha_fin: document.getElementById('fecha-fin').value
                };

                try {
                    await fetchAPI('/periodos', { method: 'POST', body: nuevoPeriodo });
                    formulario.reset();
                    cargarListaPeriodos();

                    window.abrirModal({
                        titulo: 'Éxito',
                        contenido: `
                            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1rem;">
                                <div style="background-color: #d1fae5; border-radius: 50%; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                </div>
                                <p style="font-size: 1.1rem; color: #374151; margin: 0;">Periodo guardado correctamente.</p>
                            </div>
                        `,
                        ocultarCancelar: true,
                        textoAccion: 'Entendido'
                    });
                } catch (error) { console.error(error); }
            });
        }

        function configurarFormularioNuevoPeriodo() {
            const formulario = document.getElementById('formulario-periodo');
            if (!formulario) return;

            formulario.addEventListener('submit', async (evento) => {
                evento.preventDefault();

                const nuevoPeriodo = {
                    nombre: document.getElementById('nombre-periodo').value,
                    fecha_inicio: document.getElementById('fecha-inicio').value,
                    fecha_fin: document.getElementById('fecha-fin').value
                };

                try {
                    await fetchAPI('/periodos', { method: 'POST', body: nuevoPeriodo });
                    formulario.reset();
                    cargarListaPeriodos();
                } catch (error) { console.error(error); }
            });
        }

        // ---------------------------------------------------------
        // MÓDULO: DISPONIBILIDAD DE DOCENTES
        // ---------------------------------------------------------
        const configuracionHorarios = [
            { inicio: '07:00:00', fin: '08:30:00', etiqueta: '07:00 - 08:30', tipo: 'clase' },
            { inicio: '08:30:00', fin: '10:00:00', etiqueta: '08:30 - 10:00', tipo: 'clase' },
            { inicio: '10:00:00', fin: '10:30:00', etiqueta: '10:00 - 10:30', tipo: 'receso' },
            { inicio: '10:30:00', fin: '12:00:00', etiqueta: '10:30 - 12:00', tipo: 'clase' },
            { inicio: '12:00:00', fin: '13:30:00', etiqueta: '12:00 - 13:30', tipo: 'clase' },
            { inicio: '13:30:00', fin: '15:00:00', etiqueta: '13:30 - 15:00', tipo: 'clase' }
        ];
        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

        async function inicializarModuloDisponibilidad() {
            dibujarCuadriculaVacia();

            const selector = document.getElementById('selector-docente-disponibilidad');
            const btnGuardar = document.getElementById('btn-guardar-disponibilidad');
            if (!selector || !btnGuardar) return;

            // 1. Cargar la lista de docentes en el select
            try {
                const data = await fetchAPI('/docentes?limit=100'); // Traemos todos para el selector
                selector.innerHTML = '<option value="">-- Selecciona un docente --</option>';

                data.docentes.forEach(doc => {
                    if (doc.es_activo) { // Solo mostrar docentes activos
                        const opcion = document.createElement('option');
                        opcion.value = doc.id;
                        opcion.textContent = `${doc.prefijo || ''} ${doc.nombre_completo} (${doc.identificador})`;
                        selector.appendChild(opcion);
                    }
                });
            } catch (error) {
                console.error("Error al cargar docentes para disponibilidad", error);
            }

            // 2. Al cambiar de maestro, cargar sus horarios
            selector.addEventListener('change', async (e) => {
                const docenteId = e.target.value;
                if (!docenteId) {
                    dibujarCuadriculaVacia(); // Limpiar si selecciona la opción vacía
                    btnGuardar.disabled = true;
                    return;
                }

                btnGuardar.disabled = false;
                await cargarDisponibilidadDeBaseDeDatos(docenteId);
            });

            // 3. Botón de guardar
            btnGuardar.onclick = guardarDisponibilidadActual;
        }

        function dibujarCuadriculaVacia() {
            const tbody = document.getElementById('cuerpo-tabla-disponibilidad');
            if (!tbody) return;
            tbody.innerHTML = '';

            configuracionHorarios.forEach(hora => {
                const tr = document.createElement('tr');

                // Columna de la hora
                let htmlFila = `
                    <td>
                        <div class="celda-tiempo">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${hora.etiqueta}
                        </div>
                    </td>
                `;

                // Si es receso, pintar la fila completa gris
                if (hora.tipo === 'receso') {
                    for (let i = 0; i < 5; i++) {
                        htmlFila += `<td><div class="celda-interactiva estado-celda-receso">RECESO</div></td>`;
                    }
                    tr.innerHTML = htmlFila;
                } else {
                    // Celdas normales clickeables
                    diasSemana.forEach(dia => {
                        htmlFila += `
                            <td>
                                <div class="celda-interactiva" 
                                     data-dia="${dia}" 
                                     data-inicio="${hora.inicio}" 
                                     data-fin="${hora.fin}" 
                                     data-estado="vacio">
                                </div>
                            </td>
                        `;
                    });
                    tr.innerHTML = htmlFila;

                    // Asignar el evento de clic a las nuevas celdas
                    tr.querySelectorAll('.celda-interactiva').forEach(celda => {
                        celda.addEventListener('click', manejarClicCelda);
                    });
                }
                tbody.appendChild(tr);
            });
        }

        function manejarClicCelda(evento) {
            // Ciclo de estados: vacio -> disponible -> preferencia -> vacio
            const celda = evento.currentTarget;
            const estadoActual = celda.getAttribute('data-estado');

            if (estadoActual === 'vacio') {
                celda.setAttribute('data-estado', 'disponible');
                celda.className = 'celda-interactiva estado-celda-disponible';
                celda.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            }
            else if (estadoActual === 'disponible') {
                celda.setAttribute('data-estado', 'preferencia');
                celda.className = 'celda-interactiva estado-celda-preferencia';
                celda.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
            }
            else {
                celda.setAttribute('data-estado', 'vacio');
                celda.className = 'celda-interactiva';
                celda.innerHTML = '';
            }
        }

        async function cargarDisponibilidadDeBaseDeDatos(docenteId) {
            dibujarCuadriculaVacia(); // Reiniciamos el lienzo
            try {
                const disponibilidades = await fetchAPI(`/disponibilidad/${docenteId}`);

                // Buscar las celdas correspondientes y pintarlas
                disponibilidades.forEach(disp => {
                    const celda = document.querySelector(`.celda-interactiva[data-dia="${disp.dia_semana}"][data-inicio="${disp.hora_inicio}"]`);
                    if (celda) {
                        celda.setAttribute('data-estado', disp.tipo_estado);
                        if (disp.tipo_estado === 'disponible') {
                            celda.className = 'celda-interactiva estado-celda-disponible';
                            celda.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                        } else if (disp.tipo_estado === 'preferencia') {
                            celda.className = 'celda-interactiva estado-celda-preferencia';
                            celda.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
                        }
                    }
                });
            } catch (error) {
                console.error("Error al cargar la disponibilidad:", error);
            }
        }

        async function guardarDisponibilidadActual() {
            const docenteId = document.getElementById('selector-docente-disponibilidad').value;
            if (!docenteId) return;

            const celdas = document.querySelectorAll('.celda-interactiva[data-estado="disponible"], .celda-interactiva[data-estado="preferencia"]');

            const horarios = Array.from(celdas).map(celda => ({
                docente_id: docenteId,
                dia_semana: celda.getAttribute('data-dia'),
                hora_inicio: celda.getAttribute('data-inicio'),
                hora_fin: celda.getAttribute('data-fin'),
                tipo_estado: celda.getAttribute('data-estado')
            }));

            try {
                const btnGuardar = document.getElementById('btn-guardar-disponibilidad');
                btnGuardar.disabled = true;
                btnGuardar.textContent = 'Guardando...';

                await fetchAPI('/disponibilidad', {
                    method: 'POST',
                    body: { docente_id: docenteId, horarios }
                });

                window.abrirModal({
                    titulo: 'Éxito',
                    contenido: `
                        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1.5rem 1rem 0.5rem 1rem;">
                            <div style="background-color: #d1fae5; border-radius: 50%; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <p style="font-size: 1.1rem; color: #374151; margin: 0;">Disponibilidad guardada correctamente.</p>
                        </div>
                    `,
                    ocultarCancelar: true,
                    textoAccion: 'Entendido'
                });

                btnGuardar.disabled = false;
                btnGuardar.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>Guardar Cambios`;

            } catch (error) {
                console.error("Error al guardar disponibilidad:", error);
            }
        }

    }

    // ---------------------------------------------------------
    // MÓDULO: GENERACIÓN DE HORARIOS (TABLERO)
    // ---------------------------------------------------------
    // ---------------------------------------------------------
    // MÓDULO: GENERACIÓN DE HORARIOS (TABLERO)
    // ---------------------------------------------------------
    if (!document.getElementById('estilos-tablero')) {
        const style = document.createElement('style');
        style.id = 'estilos-tablero';
        style.innerHTML = `
                /* 1. Recuperar el diseño de las Pestañas y Filtros Superiores */
                .controles-generador { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; }
                .filtros-generador { display: flex; align-items: center; gap: 0.75rem; }
                .pestana { padding: 0.5rem 1rem; border: none; background: transparent; font-weight: 600; color: #6b7280; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; }
                .pestana.activa { color: #2563eb; border-bottom-color: #2563eb; }
                
                /* 2. Ajustes de la tabla para que ocupe todo el ancho uniformemente */
                .tabla-generador { width: 100%; border-collapse: collapse; table-layout: fixed; }
                .tabla-generador th { padding: 0.75rem; background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 0.85rem; border: 1px solid #f3f4f6; text-align: center; }
                .tabla-generador td { padding: 0.4rem !important; height: 110px; vertical-align: middle; border: 1px solid #f3f4f6; }
                
                /* 3. El Diseño Premium de las Tarjetas */
                .tarjeta-clase-grid { 
                    padding: 0.75rem; 
                    border-radius: 0.5rem; 
                    border: 1px solid transparent; 
                    height: 100%; 
                    min-height: 90px; 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: center; 
                    position: relative; 
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    width: 100%;
                }
                .tarjeta-clase-grid.estado-vacio { 
                    border: 2px dashed #cbd5e1; 
                    align-items: center; 
                    color: #94a3b8; 
                    cursor: pointer; 
                    background-color: #f8fafc;
                }
                .tarjeta-clase-grid.estado-vacio:hover { 
                    background-color: #f1f5f9; 
                    border-color: #64748b; 
                    color: #475569; 
                    transform: scale(0.98);
                }
                .texto-vacio { font-weight: 700; font-size: 0.8rem; letter-spacing: 0.5px; }
                
                .tarjeta-clase-grid.estado-asignado {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    align-items: flex-start;
                    text-align: left;
                }
                .tarjeta-clase-grid.estado-asignado:hover {
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }
                .titulo-clase-grid { font-weight: 700; font-size: 0.9rem; margin-bottom: 0.4rem; display: block; line-height: 1.1; width: 90%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .texto-clase-grid { font-size: 0.75rem; color: #4b5563; display: flex; align-items: center; gap: 5px; line-height: 1.3; font-weight: 500; }
                
                /* 4. Botón flotante para eliminar */
                .btn-eliminar-clase { position: absolute; top: 6px; right: 6px; background: white; border: 1px solid #fee2e2; border-radius: 4px; color: #ef4444; cursor: pointer; opacity: 0; transition: all 0.2s; padding: 4px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .tarjeta-clase-grid.estado-asignado:hover .btn-eliminar-clase { opacity: 1; }
                .btn-eliminar-clase:hover { background: #fee2e2; transform: scale(1.1); }
                
                /* 5. Otros */
                .celda-tiempo { font-size: 0.9rem; }
                .estado-celda-receso { background-color: #f3f4f6; color: #9ca3af; font-weight: bold; letter-spacing: 2px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; min-height: 40px; }
            `;
        document.head.appendChild(style);
    }

    async function inicializarModuloGenerador() {
        const selectorGrupo = document.getElementById('selector-grupo-generador');
        if (!selectorGrupo) return;

        // 1. Cargar Grupos al Selector
        try {
            const grupos = await fetchAPI('/grupos');
            selectorGrupo.innerHTML = '<option value="">-- Selecciona un Grupo --</option>';
            grupos.forEach(g => {
                selectorGrupo.innerHTML += `<option value="${g.id}">${g.nombre} (${g.identificador})</option>`;
            });
        } catch (e) { console.error(e); }

        // 2. Al seleccionar un grupo, cargar el tablero
        selectorGrupo.addEventListener('change', (e) => {
            const grupoId = e.target.value;
            document.getElementById('alerta-conflictos-generador').style.display = 'none';
            if (grupoId) {
                cargarTableroGrupo(grupoId);
            } else {
                document.getElementById('cuerpo-tabla-generador').innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 4rem; color: #6b7280;"><p style="font-size: 1.1rem;">Selecciona un Grupo para comenzar</p></td></tr>`;
            }
        });

        document.getElementById('btn-ocultar-alerta').addEventListener('click', () => {
            document.getElementById('alerta-conflictos-generador').style.display = 'none';
        });
    }

    async function cargarTableroGrupo(grupoId) {
        try {
            const horariosGlobales = await fetchAPI('/horarios');
            const horariosDelGrupo = horariosGlobales.filter(h => h.grupo_id == grupoId);
            dibujarTableroGenerador(grupoId, horariosDelGrupo);
        } catch (e) { console.error("Error al cargar horarios:", e); }
    }

    function dibujarTableroGenerador(grupoId, horariosDelGrupo) {
        const tbody = document.getElementById('cuerpo-tabla-generador');
        if (!tbody) return;
        tbody.innerHTML = '';

        const configuracionHoras = [
            { inicio: '07:00:00', fin: '08:30:00', etiqueta: '07:00 - 08:30', tipo: 'clase' },
            { inicio: '08:30:00', fin: '10:00:00', etiqueta: '08:30 - 10:00', tipo: 'clase' },
            { inicio: '10:00:00', fin: '10:30:00', etiqueta: '10:00 - 10:30', tipo: 'receso' },
            { inicio: '10:30:00', fin: '12:00:00', etiqueta: '10:30 - 12:00', tipo: 'clase' },
            { inicio: '12:00:00', fin: '13:30:00', etiqueta: '12:00 - 13:30', tipo: 'clase' },
            { inicio: '13:30:00', fin: '15:00:00', etiqueta: '13:30 - 15:00', tipo: 'clase' }
        ];
        const diasSemanaGenerador = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

        configuracionHoras.forEach(hora => {
            const tr = document.createElement('tr');
            let htmlFila = `<td><div class="celda-tiempo"><div style="display:flex; flex-direction:column; align-items:center; font-weight:600; color:#4b5563;"><span>${hora.inicio.substring(0, 5)}</span><span style="font-size: 0.75rem; color:#9ca3af; font-weight:400;">${hora.fin.substring(0, 5)}</span></div></div></td>`;

            if (hora.tipo === 'receso') {
                htmlFila += `<td colspan="5"><div class="celda-interactiva estado-celda-receso">RECESO</div></td>`;
                tr.innerHTML = htmlFila;
            } else {
                diasSemanaGenerador.forEach(dia => {
                    const clase = horariosDelGrupo.find(h => h.dia_semana === dia && h.hora_inicio.startsWith(hora.inicio.substring(0, 5)));

                    if (clase) {
                        const colorHex = (clase.asignatura && clase.asignatura.color_hex) ? clase.asignatura.color_hex : '#2563eb';
                        const nombreAsig = clase.asignatura ? clase.asignatura.nombre : 'Asignatura Borrada';
                        const nombreDocente = clase.docente ? `${clase.docente.prefijo || ''} ${clase.docente.nombre_completo}` : 'Sin Asignar';
                        const nombreAula = clase.aula ? clase.aula.nombre : 'Sin Aula';

                        // ¡Aquí inyectamos tu diseño premium con los iconos SVG!
                        htmlFila += `
                            <td>
                                <div class="tarjeta-clase-grid estado-asignado" style="background-color: ${colorHex}15; border-left: 4px solid ${colorHex};">
                                    <span class="titulo-clase-grid" style="color: ${colorHex};" title="${nombreAsig}">${nombreAsig}</span>
                                    
                                    <span class="texto-clase-grid">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="min-width: 12px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        ${nombreDocente}
                                    </span>
                                    
                                    <span class="texto-clase-grid" style="color: #6b7280; margin-top: 0.2rem;">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="min-width: 12px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                        ${nombreAula}
                                    </span>
                                    
                                    <button class="btn-eliminar-clase" data-id="${clase.id}" title="Eliminar clase">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            </td>`;
                    } else {
                        htmlFila += `
                            <td>
                                <div class="tarjeta-clase-grid estado-vacio btn-abrir-asignacion" data-dia="${dia}" data-inicio="${hora.inicio}" data-fin="${hora.fin}">
                                    <span class="texto-vacio">+ ASIGNAR</span>
                                </div>
                            </td>`;
                    }
                });
                tr.innerHTML = htmlFila;

                tr.querySelectorAll('.btn-abrir-asignacion').forEach(celda => {
                    celda.addEventListener('click', () => abrirModalAsignacion(celda.dataset.dia, celda.dataset.inicio, celda.dataset.fin, grupoId));
                });
                tr.querySelectorAll('.btn-eliminar-clase').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        await fetchAPI(`/horarios/${btn.dataset.id}`, { method: 'DELETE' });
                        cargarTableroGrupo(grupoId);
                    });
                });
            }
            tbody.appendChild(tr);
        });
    }

    async function abrirModalAsignacion(dia, horaInicio, horaFin, grupoId) {
        try {
            // Obtenemos los catálogos para llenar los selects
            const [periodos, asignaturas, docentes, aulas] = await Promise.all([
                fetchAPI('/periodos'), fetchAPI('/asignaturas'), fetchAPI('/docentes?limit=100'), fetchAPI('/aulas')
            ]);

            const periodoActivo = periodos.find(p => p.es_activo);
            if (!periodoActivo) {
                return window.abrirModal({ titulo: 'Atención', contenido: 'Debes establecer un Periodo como "Activo" en el menú Periodos antes de generar horarios.', ocultarCancelar: true });
            }

            let opcionesAsignaturas = asignaturas.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('');
            let opcionesDocentes = docentes.docentes.filter(d => d.es_activo).map(d => `<option value="${d.id}">${d.prefijo || ''} ${d.nombre_completo}</option>`).join('');
            let opcionesAulas = aulas.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('');

            window.abrirModal({
                titulo: `Asignar Clase - ${dia} (${horaInicio.substring(0, 5)})`,
                textoAccion: 'Guardar Asignación',
                contenido: `
                        <div class="grupo-formulario"><label class="etiqueta-formulario">Asignatura</label>
                            <select id="modal-asignatura-id" class="input-estandar">${opcionesAsignaturas}</select>
                        </div>
                        <div class="grupo-formulario"><label class="etiqueta-formulario">Docente</label>
                            <select id="modal-docente-id" class="input-estandar">${opcionesDocentes}</select>
                        </div>
                        <div class="grupo-formulario" style="margin-bottom:0;"><label class="etiqueta-formulario">Aula / Salón</label>
                            <select id="modal-aula-id" class="input-estandar">${opcionesAulas}</select>
                        </div>
                    `,
                accion: async () => {
                    const payload = {
                        periodo_id: periodoActivo.id,
                        grupo_id: grupoId,
                        dia_semana: dia,
                        hora_inicio: horaInicio,
                        hora_fin: horaFin,
                        asignatura_id: document.getElementById('modal-asignatura-id').value,
                        docente_id: document.getElementById('modal-docente-id').value,
                        aula_id: document.getElementById('modal-aula-id').value
                    };

                    try {
                        // Intentamos guardar, pero desactivamos el modal de error global para usar nuestra alerta roja
                        await fetchAPI('/horarios', { method: 'POST', body: payload, mostrarModalError: false });
                        window.cerrarModal();
                        document.getElementById('alerta-conflictos-generador').style.display = 'none';
                        cargarTableroGrupo(grupoId);
                    } catch (err) {
                        window.cerrarModal();
                        const alerta = document.getElementById('alerta-conflictos-generador');
                        document.getElementById('alerta-generador-texto').textContent = err.message;
                        alerta.style.display = 'flex';
                        // Animación de sacudida (opcional visual)
                        alerta.style.transform = 'scale(1.02)'; setTimeout(() => alerta.style.transform = 'scale(1)', 150);
                    }
                }
            });

        } catch (error) { console.error("Error abriendo modal:", error); }
    }
}); 