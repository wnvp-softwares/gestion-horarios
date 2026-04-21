document.addEventListener('DOMContentLoaded', () => {

    // ====================================================================
    // 0. SEGURIDAD Y SESIÓN (RUTEO PROTEGIDO)
    // ====================================================================
    const usuarioEnSesion = JSON.parse(localStorage.getItem('usuarioSesion'));
    const esPaginaLogin = document.getElementById('formulario-login') !== null;

    // A. Si NO hay sesión y NO estamos en el login, lo pateamos al index (Seguridad)
    if (!usuarioEnSesion && !esPaginaLogin) {
        window.location.href = 'index.html';
        return;
    }

    // B. Si SÍ hay sesión y está en el login, lo mandamos directo al dashboard
    if (usuarioEnSesion && esPaginaLogin) {
        window.location.href = 'dashboard.html';
        return;
    }

    // C. Si estamos en el dashboard, pintamos sus datos en la cabecera
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
            const datos = await respuesta.json();
            if (!respuesta.ok) throw new Error(datos.error || 'Error en la petición');
            return datos;
        } catch (error) {
            console.error(`Error en API (${endpoint}):`, error);
            window.abrirModal({
                titulo: 'Error de Conexión',
                contenido: `<div class="alerta-error" style="padding: 1rem; border-radius: 8px;">${error.message}</div>`,
                ocultarCancelar: true,
                textoAccion: 'Entendido'
            });
            throw error;
        }
    }

    // ====================================================================
    // 1. SISTEMA DE MODALES GLOBALES DINÁMICOS
    // ====================================================================
    window.abrirModal = function (opciones) {
        let modalGlobal = document.getElementById('modal-global');

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
                // El error de "contraseña incorrecta" ya lo muestra fetchAPI automáticamente con el Modal
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
        // Estado global del módulo de docentes
        let estadoDocentes = {
            paginaActual: 1,
            busqueda: '',
            limite: 6
        };

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
                    <button class="boton-accion edit-btn" data-id="${doc.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                </td>
            `;

                    tr.querySelector('.edit-btn').addEventListener('click', () => prepararEdicionDocente(doc));
                    tbody.appendChild(tr);
                });

                actualizarPaginacion(data.total, data.paginas);
            } catch (error) {
                console.error("Error al cargar docentes:", error);
            }
        }

        function actualizarPaginacion(total, paginas) {
            const info = document.querySelector('.texto-paginacion');
            const contenedor = document.querySelector('.controles-paginacion');
            if (!info || !contenedor) return;

            const inicio = (estadoDocentes.paginaActual - 1) * estadoDocentes.limite + 1;
            const fin = Math.min(estadoDocentes.paginaActual * estadoDocentes.limite, total);

            info.textContent = `Mostrando ${total > 0 ? inicio : 0} a ${fin} de ${total} docentes`;

            contenedor.innerHTML = '';

            // Botón Anterior
            const btnAnt = document.createElement('button');
            btnAnt.className = `boton-pag ${estadoDocentes.paginaActual === 1 ? 'desactivado' : ''}`;
            btnAnt.textContent = 'Anterior';
            btnAnt.onclick = () => { if (estadoDocentes.paginaActual > 1) { estadoDocentes.paginaActual--; cargarListaDocentes(); } };
            contenedor.appendChild(btnAnt);

            // Páginas numéricas
            for (let i = 1; i <= paginas; i++) {
                const btn = document.createElement('button');
                btn.className = `boton-pag ${i === estadoDocentes.paginaActual ? 'activo' : ''}`;
                btn.textContent = i;
                btn.onclick = () => { estadoDocentes.paginaActual = i; cargarListaDocentes(); };
                contenedor.appendChild(btn);
            }

            // Botón Siguiente
            const btnSig = document.createElement('button');
            btnSig.className = `boton-pag ${estadoDocentes.paginaActual === paginas ? 'desactivado' : ''}`;
            btnSig.textContent = 'Siguiente';
            btnSig.onclick = () => { if (estadoDocentes.paginaActual < paginas) { estadoDocentes.paginaActual++; cargarListaDocentes(); } };
            contenedor.appendChild(btnSig);
        }

        function configurarBusquedaDocentes() {
            const inputBuscar = document.querySelector('.vista-docentes .input-buscar');
            if (!inputBuscar) return;

            inputBuscar.addEventListener('input', (e) => {
                estadoDocentes.busqueda = e.target.value;
                estadoDocentes.paginaActual = 1; // Reiniciar a la primera página al buscar
                cargarListaDocentes();
            });
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
                // En lugar de alert, podrías insertar un mensaje en el modal actual
                const errorMsg = document.createElement('p');
                errorMsg.style.color = 'red';
                errorMsg.textContent = ' Por favor, rellena los campos obligatorios (*)';

                const modalCuerpo = document.querySelector('.modal-body'); // Ajusta al selector de tu modal
                if (modalCuerpo) modalCuerpo.prepend(errorMsg);

                return false;
            }
            return true;
        }

        // Inicialización
        document.addEventListener('DOMContentLoaded', () => {
            cargarListaDocentes();
            configurarBusquedaDocentes();
            configurarBotonNuevoDocente();
        });
        // ---------------------------------------------------------
        // MÓDULO: ASIGNATURAS
        // ---------------------------------------------------------
        async function cargarListaAsignaturas() {
            try {
                const asignaturas = await fetchAPI('/asignaturas');
                const contenedor = document.querySelector('.vista-asignaturas .grid-tarjetas');
                if (!contenedor) return;
                contenedor.innerHTML = '';

                if (asignaturas.length === 0) {
                    contenedor.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-texto-secundario);">No hay asignaturas registradas.</div>`;
                    return;
                }

                asignaturas.forEach(asig => {
                    const colorFondo = `${asig.color_hex}20`;
                    contenedor.innerHTML += `
                        <div class="tarjeta-asignatura">
                            <div class="cabecera-tarjeta-asignatura">
                                <div class="icono-asignatura" style="color: ${asig.color_hex}; background-color: ${colorFondo};">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                    </svg>
                                </div>
                                <div class="info-asignatura">
                                    <h3 class="titulo-asignatura">${asig.nombre}</h3>
                                    <div class="meta-asignatura">
                                        <span class="etiqueta-codigo">${asig.codigo}</span>
                                        <span class="separador-meta">•</span>
                                        <span>${asig.area || 'Sin área'}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="pie-tarjeta-asignatura">
                                <span class="texto-horas">Horas semanales</span>
                                <span class="etiqueta-horas" style="color: ${asig.color_hex}; background-color: ${colorFondo};">${asig.horas_semanales} hrs</span>
                            </div>
                        </div>
                    `;
                });
            } catch (error) { console.error(error); }
        }

        function configurarBotonNuevaAsignatura() {
            const btnNuevaAsig = document.querySelector('.vista-asignaturas .boton-primario');
            if (!btnNuevaAsig) return;

            btnNuevaAsig.addEventListener('click', () => {
                abrirModal({
                    titulo: 'Agregar Nueva Asignatura',
                    textoAccion: 'Guardar Asignatura',
                    contenido: `
                        <div class="grid-2-columnas">
                            <div class="grupo-formulario"><label class="etiqueta-formulario">Código *</label><input type="text" id="asig-codigo" class="input-estandar" placeholder="Ej. MAT-101"></div>
                            <div class="grupo-formulario"><label class="etiqueta-formulario">Horas Semanales *</label><input type="number" id="asig-horas" class="input-estandar" placeholder="Ej. 4"></div>
                        </div>
                        <div class="grupo-formulario"><label class="etiqueta-formulario">Nombre *</label><input type="text" id="asig-nombre" class="input-estandar" placeholder="Ej. Matemáticas Avanzadas"></div>
                        <div class="grid-2-columnas">
                            <div class="grupo-formulario"><label class="etiqueta-formulario">Área</label><input type="text" id="asig-area" class="input-estandar" placeholder="Ej. Ciencias Exactas"></div>
                            <div class="grupo-formulario" style="margin-bottom: 0;"><label class="etiqueta-formulario">Color</label><input type="color" id="asig-color" class="input-estandar" value="#8b5cf6" style="padding: 0.25rem; height: 42px;"></div>
                        </div>
                    `,
                    accion: async () => {
                        const nuevaAsig = {
                            codigo: document.getElementById('asig-codigo').value,
                            horas_semanales: document.getElementById('asig-horas').value,
                            nombre: document.getElementById('asig-nombre').value,
                            area: document.getElementById('asig-area').value,
                            color_hex: document.getElementById('asig-color').value
                        };

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

        // ---------------------------------------------------------
        // MÓDULO: GRUPOS
        // ---------------------------------------------------------
        async function cargarListaGrupos() {
            try {
                const grupos = await fetchAPI('/grupos');
                const tbody = document.querySelector('.vista-grupos .tabla-datos tbody');
                if (!tbody) return;
                tbody.innerHTML = '';

                if (grupos.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">No hay grupos registrados.</td></tr>`;
                    return;
                }

                grupos.forEach(grp => {
                    const iconoTurno = grp.turno === 'Matutino'
                        ? `<svg class="icono-turno-matutino" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
                        : `<svg class="icono-turno-vespertino" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

                    tbody.innerHTML += `
                        <tr>
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
                            <td></td>
                        </tr>
                    `;
                });
            } catch (error) { console.error(error); }
        }

        function configurarBotonNuevoGrupo() {
            const btnNuevoGrp = document.querySelector('.vista-grupos .boton-primario');
            if (!btnNuevoGrp) return;

            btnNuevoGrp.addEventListener('click', () => {
                abrirModal({
                    titulo: 'Agregar Nuevo Grupo',
                    textoAccion: 'Guardar Grupo',
                    contenido: `
                        <div class="grid-2-columnas">
                            <div class="grupo-formulario"><label class="etiqueta-formulario">Identificador (Ej. 1A) *</label><input type="text" id="grp-id" class="input-estandar" placeholder="1A"></div>
                            <div class="grupo-formulario"><label class="etiqueta-formulario">Nombre Oficial *</label><input type="text" id="grp-nombre" class="input-estandar" placeholder="Grupo 1A"></div>
                        </div>
                        <div class="grid-2-columnas">
                            <div class="grupo-formulario"><label class="etiqueta-formulario">Grado *</label><input type="text" id="grp-grado" class="input-estandar" placeholder="1er Semestre"></div>
                            <div class="grupo-formulario"><label class="etiqueta-formulario">Capacidad *</label><input type="number" id="grp-capacidad" class="input-estandar" placeholder="35"></div>
                        </div>
                        <div class="grupo-formulario" style="margin-bottom: 0;">
                            <label class="etiqueta-formulario">Turno *</label>
                            <select id="grp-turno" class="input-estandar">
                                <option value="Matutino">Matutino</option>
                                <option value="Vespertino">Vespertino</option>
                            </select>
                        </div>
                    `,
                    accion: async () => {
                        const nuevoGrp = {
                            identificador: document.getElementById('grp-id').value,
                            nombre: document.getElementById('grp-nombre').value,
                            grado: document.getElementById('grp-grado').value,
                            capacidad: document.getElementById('grp-capacidad').value,
                            turno: document.getElementById('grp-turno').value
                        };

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
                                <button class="boton-base boton-secundario">Editar</button>
                                ${btnActivar}
                            </div>
                        </div>
                    `;
                });

                document.querySelectorAll('.btn-activar-periodo').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const id = e.target.getAttribute('data-id');
                        await fetchAPI(`/periodos/${id}/activar`, { method: 'PUT' });
                        cargarListaPeriodos();
                    });
                });

            } catch (error) { console.error(error); }
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
    }
});