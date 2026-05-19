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

} elseif ($path === '/api/addProductSale') { // Ruta para agregar producto a venta

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $ID_Producto = (int) $data['ID_Producto'];
    $Cantidad = (int) $data['Cantidad'];
    $ID_Venta = (int) $_SESSION['ID_Venta'];

    if (!$ID_Producto || !$Cantidad || !$ID_Venta) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/producto.php';
    require_once __DIR__ . '/../models/venta.php';
    require_once __DIR__ . '/../config/database.php';

    // Obtener precio actual del producto
    $producto = Producto::readProducto($ID_Producto);

    if (!$producto) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'Producto no encontrado']);
        return;
    }

    $Precio_Unitario = $producto['Precio'];

    $connection = new Conexion();

    try {
        $res = Venta::addProductoVenta($connection, $ID_Venta, $ID_Producto, $Cantidad, $Precio_Unitario);
        http_response_code(201);
        echo json_encode(['ok' => true, 'mensaje' => 'Producto agregado', 'ID_Detalle' => $res]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
    }

    //-- Fin ruta addProductSale

} elseif ($path === '/api/removeProductSale') { // Ruta para quitar producto de venta

    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $ID_Detalle_Venta = (int) $data['ID_Detalle_Venta'];

    if (!$ID_Detalle_Venta) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/venta.php';

    $res = Venta::removeProductoVenta($ID_Detalle_Venta);

    if ($res === 1) {
        http_response_code(200);
        echo json_encode(['ok' => true, 'mensaje' => 'Producto eliminado de la venta']);
    } else {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'No se encontró el detalle']);
    }

    //-- Fin case removeProductSale

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