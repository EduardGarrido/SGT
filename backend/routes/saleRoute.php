<?php

// Rutas para venta
date_default_timezone_set('America/Mazatlan');

if ($path === '/api/openSale') { // Ruta para abrir venta

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        return;
    }

    $Fecha = date("Y-m-d");
    $ID_Caja = (int) $_SESSION['ID_Caja'];

    if (!$ID_Caja) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'No hay caja abierta']);
        return;
    }

    require_once __DIR__ . '/../models/venta.php';

    $res = Venta::openVenta($Fecha, $ID_Caja);

    if ($res) {
        $_SESSION['ID_Venta'] = $res;
        http_response_code(201);
        echo json_encode(['ok' => true, 'mensaje' => 'Venta iniciada', 'ID_Venta' => $res]);
    } else {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'No se pudo iniciar la venta']);
    }

    //-- Fin case openSale

} elseif ($path === '/api/completeSale') { // Ruta para completar venta

    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $Monto = $data['Monto'];
    $Forma_Pago = htmlspecialchars($data['Forma_Pago']);
    $ID_Venta = (int) $_SESSION['ID_Venta'];
    $Hora = date("H:i:s");

    foreach ($data['productos'] as $item) {
        $producto = Producto::readProducto($item['ID_Producto']);
        Venta::addProductoVenta($connection, $ID_Venta, $item['ID_Producto'], $item['Cantidad'], $producto['Precio']);
        Producto::descontarInventario($connection, $item['ID_Producto'], $item['Cantidad']);
    }


    if (!$Monto || !$Forma_Pago || !$ID_Venta) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/venta.php';
    require_once __DIR__ . '/../models/producto.php';
    require_once __DIR__ . '/../config/database.php';

    $connection = new Conexion();

    try {
        $connection->beginTransaction();

        // Completar venta
        Venta::completeVenta($ID_Venta, $Hora, $Monto, $Forma_Pago);

        // Descontar inventario
        $detalles = Venta::getDetalleVenta($ID_Venta);
        foreach ($detalles as $detalle) {
            Producto::descontarInventario($connection, $detalle['ID_Producto'], $detalle['Cantidad']);
        }

        $connection->commit();
        unset($_SESSION['ID_Venta']);

        http_response_code(200);
        echo json_encode(['ok' => true, 'mensaje' => 'Venta completada correctamente']);

    } catch (Exception $e) {
        $connection->rollBack();
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
    }

    //-- Fin case completeSale

} elseif ($path === '/api/cancelSale') { // Ruta para cancelar venta

    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        return;
    }

    $ID_Venta = (int) $_SESSION['ID_Venta'];

    if (!$ID_Venta) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'No hay venta en proceso']);
        return;
    }

    require_once __DIR__ . '/../models/venta.php';

    $res = Venta::cancelVenta($ID_Venta);

    if ($res === 1) {
        unset($_SESSION['ID_Venta']);
        http_response_code(200);
        echo json_encode(['ok' => true, 'mensaje' => 'Venta cancelada']);
    } else {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'No se pudo cancelar la venta']);
    }


}//-- Fin case cancelSale