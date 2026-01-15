$(document).ready(function() {

    // 1. CONFIGURACIÓN INICIAL
    if (localStorage.getItem('walletSaldo') === null) {
        localStorage.setItem('walletSaldo', 50000);
    }
    
    // Si no existe el historial, creamos uno vacío o con datos de prueba
    if (localStorage.getItem('walletHistorial') === null) {
        let movimientosIniciales = [
            { fecha: '10 Ene 2026', descripcion: 'Bono de Bienvenida', monto: 50000, tipo: 'ingreso' }
        ];
        localStorage.setItem('walletHistorial', JSON.stringify(movimientosIniciales));
    }

    let saldo = parseInt(localStorage.getItem('walletSaldo'));

    // Actualizar saldos en pantalla
    if ($('#saldo-actual').length) $('#saldo-actual').text(saldo.toLocaleString('es-CL'));
    if ($('#saldo-para-envio').length) $('#saldo-para-envio').text(saldo.toLocaleString('es-CL'));
    if ($('#saldo-en-historial').length) $('#saldo-en-historial').text(saldo.toLocaleString('es-CL'));

    // Función auxiliar para registrar movimiento
    function registrarMovimiento(descripcion, monto, tipo) {
        let historial = JSON.parse(localStorage.getItem('walletHistorial')) || [];
        
        let fecha = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
        
        // Agregamos el nuevo movimiento al principio del array (unshift)
        historial.unshift({
            fecha: fecha,
            descripcion: descripcion,
            monto: monto,
            tipo: tipo // 'ingreso' o 'gasto'
        });

        localStorage.setItem('walletHistorial', JSON.stringify(historial));
    }

    // 2. LOGIN
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        let email = $('#email').val();
        let password = $('#password').val();

        if(email === 'user@alke.com' && password === '123456') {
            window.location.href = 'menu.html';
        } else {
            alert("Error: Usuario o contraseña incorrectos.");
        }
    });

    // 3. DEPOSITAR
    $('#btn-realizar-deposito').on('click', function() {
        let monto = parseInt($('#monto-deposito').val());

        if (monto > 0) {
            let nuevoSaldo = saldo + monto;
            localStorage.setItem('walletSaldo', nuevoSaldo);
            
            // REGISTRAMOS EL MOVIMIENTO REAL
            registrarMovimiento('Depósito en efectivo', monto, 'ingreso');

            alert(`¡Depósito exitoso!`);
            window.location.href = 'menu.html';
        } else {
            alert("Monto inválido.");
        }
    });

    // 4. ENVIAR DINERO
    $('#btn-realizar-envio').on('click', function() {
        let monto = parseInt($('#monto-envio').val());
        let contactoSelect = document.getElementById("contacto-destino"); // Usamos JS nativo para obtener el texto
        let nombreContacto = contactoSelect.options[contactoSelect.selectedIndex].text;
        let contactoVal = $('#contacto-destino').val();

        if (contactoVal === "" || contactoVal === null) {
            alert("Selecciona un contacto.");
            return;
        }

        if (monto > 0 && monto <= saldo) {
            let nuevoSaldo = saldo - monto;
            localStorage.setItem('walletSaldo', nuevoSaldo);

            // REGISTRAMOS EL MOVIMIENTO REAL
            registrarMovimiento(`Transferencia a ${nombreContacto}`, monto, 'gasto');

            alert(`Transferencia exitosa.`);
            window.location.href = 'menu.html';
        } else {
            alert("Fondos insuficientes o monto inválido.");
        }
    });

    // 5. CARGAR HISTORIAL (Solo para transactions.html)
    if (window.location.pathname.includes('transactions.html')) {
        let historial = JSON.parse(localStorage.getItem('walletHistorial')) || [];
        let tablaCuerpo = $('#cuerpo-tabla'); // Necesitamos agregar este ID en el HTML

        tablaCuerpo.empty(); // Limpiamos lo que haya

        historial.forEach(function(mov) {
            let colorClase = mov.tipo === 'ingreso' ? 'text-success' : 'text-danger';
            let signo = mov.tipo === 'ingreso' ? '+' : '-';

            let fila = `
                <tr>
                    <td class="ps-4 text-muted">${mov.fecha}</td>
                    <td><div class="fw-bold">${mov.descripcion}</div></td>
                    <td class="pe-4 text-end ${colorClase} fw-bold">${signo}$${mov.monto.toLocaleString('es-CL')}</td>
                </tr>
            `;
            tablaCuerpo.append(fila);
        });
    }

    // 6. LOGOUT
    window.logout = function() { window.location.href = 'login.html'; }
});