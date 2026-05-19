<?php

//Rutas para caja

date_default_timezone_set('America/Mazatlan');


if ($path === '/api/openCashRegister') { // Ruta para abrir caja

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $Fecha = date("Y-m-d");
    $Hora = date("H:i:s");
    $Monto_Inicial = htmlspecialchars($data['Monto_Inicial']);
    $ID_Usuario = (int) htmlspecialchars($data['ID_Usuario']);

    if (!$Monto_Inicial || !$ID_Usuario) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/caja.php';

    $cajaActiva = Caja::cajaAbierta();


    if ($cajaActiva) {
        http_response_code(409);
        echo json_encode(['ok' => false, 'mensaje' => 'Ya hay una caja abierta']);
        return;
    }


    $res = Caja::openCaja($Fecha, $Hora, $Monto_Inicial, "abierta", $ID_Usuario);


    if ($res) {
        $_SESSION['ID_Caja'] = $res;
        http_response_code(201);
        echo json_encode(['ok' => true, 'mensaje' => 'Caja abierta correctamente']);
    } else {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'La caja no se pudo abrir']);
    }

    //-- Fin case openCashRegister

} else if ($path === '/api/closeCashRegister') { // Ruta para cerrar caja

    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $Monto_Final = htmlspecialchars($data['Monto_Final']);
    $Hora_Final = date("H:i:s");



    if (!$Monto_Final || !$Hora_Final) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/caja.php';

    $cajaActiva = Caja::cajaAbierta();

    if (!$cajaActiva) {
        http_response_code(409);
        echo json_encode(['ok' => false, 'mensaje' => 'No hay caja abierta para cerrar']);
        return;
    }

    $ID_Caja = $cajaActiva['ID_Caja'];


    $Monto = Caja::getMontoInicial($ID_Caja);

    if (!$Monto) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'Caja no encontrada']);
        return;
    }


    if ($Monto_Final == $Monto['Monto_Inicial']) {
        $Estado_Final = 'cuadrada';
    } else {
        $Estado_Final = 'descuadrada';
    }


    $res = Caja::closeCaja($ID_Caja, $Monto_Final, $Estado_Final, $Hora_Final);

    if ($res) {
        unset($_SESSION['ID_Caja']);
        http_response_code(200);
        echo json_encode(['ok' => true, 'mensaje' => 'Caja cerrada correctamente']);
    } else {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'La caja no se pudo cerrar']);
    }

    //-- Fin case closeCashRegister

} else if ($path === '/api/getAllVentas') { //Ruta para obtener todas las ventas de una caja 

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        return;
    }

    $ID_Caja = $_SESSION['ID_Caja'];

    if (!$ID_Caja) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'Caja no encontrada']);
        return;
    }


    require_once __DIR__ . '/../models/venta.php';

    $res = Venta::readAllVentas($ID_Caja);

    if (!$res) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'No hay ventas de esa caja']);
        return;
    }

    http_response_code(200);
    echo json_encode(['ok' => true, 'ventas' => $res]);
}//-- Fin case getAllVentas