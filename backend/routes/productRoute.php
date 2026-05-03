<?php
//Rutas para producto 


if ($path === '/api/createProduct') { // Ruta que crea productos

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $Nombre_Producto = htmlspecialchars($data['Nombre_Producto']);
    $Precio = htmlspecialchars($data['Precio']);
    $Cantidad = htmlspecialchars($data['Cantidad']);
    $Unidad_Medida = htmlspecialchars($data['Unidad_Medida']);
    $Cantidad_Minima = htmlspecialchars($data['Cantidad_Minima']);
    $ID_Categoria = htmlspecialchars($data['ID_Categoria']);
    $ID_Proveedor = htmlspecialchars($data['ID_Proveedor']);

    if (!$Nombre_Producto || !$Precio || !$Cantidad || !$Unidad_Medida || !$Cantidad_Minima || !$ID_Categoria || !$ID_Proveedor) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    if ($Cantidad > $Cantidad_Minima) {
        $Estado = 'Disponible';
    } elseif ($Cantidad > 0 && $Cantidad <= $Cantidad_Minima) {
        $Estado = 'Stock bajo';
    } elseif ($Cantidad == 0) {
        $Estado = 'Sin stock';
    }

    require_once __DIR__ . '/../models/producto.php';

    $res = Producto::crearProducto(
        $Nombre_Producto,
        $Precio,
        $Cantidad,
        $Unidad_Medida,
        $Estado,
        $Cantidad_Minima,
        $ID_Categoria,
        $ID_Proveedor
    );

    if ($res) {
        http_response_code(201);
        echo json_encode(['ok' => true, 'mensaje' => 'Producto creado correctamente']);
    } else {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'El producto no se pudo crear']);
    }

    // Termina case createProduct

} elseif ($path === '/api/getAllProducts') { // Ruta que lee todos los productos 

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
        return;
    }

    require_once __DIR__ . '/../models/producto.php';

    $res = Producto::readAllProductos();

    if (!$res) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'No hay productos']);
        return;
    }

    http_response_code(200);
    echo json_encode(['ok' => true, 'productos' => $res]);


    // Termina case getAllProducts

} elseif ($path === '/api/getProduct') { // Ruta que lee un producto 

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
        return;
    }

    $ID_Producto = (int) $_GET['id'];

    if (!$ID_Producto) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/producto.php';


    $res = Producto::readProducto($ID_Producto);

    if (!$res) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'No se encontró el producto']);
        return;
    }

    http_response_code(200);
    echo json_encode(['ok' => true, 'producto' => $res]);


    // Termina case getProduct

} elseif ($path === '/api/modifyProduct') {
    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
        return;
    }


    $data = json_decode(file_get_contents('php://input'), true);
    $ID_Producto = (int) $data['ID_Producto'];
    $Nombre_Producto = isset($data['Nombre_Producto']) ? htmlspecialchars($data['Nombre_Producto']) : null;
    $Precio = isset($data['Precio']) ? htmlspecialchars($data['Precio']) : null;
    $Cantidad = isset($data['Cantidad']) ? htmlspecialchars($data['Cantidad']) : null;
    $Unidad_Medida = isset($data['Unidad_Medida']) ? htmlspecialchars($data['Unidad_Medida']) : null;
    $Cantidad_Minima = isset($data['Cantidad_Minima']) ? htmlspecialchars($data['Cantidad_Minima']) : null;
    $ID_Categoria = isset($data['ID_Categoria']) ? htmlspecialchars($data['ID_Categoria']) : null;
    $ID_Proveedor = isset($data['ID_Proveedor']) ? htmlspecialchars($data['ID_Proveedor']) : null;

    if (!$ID_Producto) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/producto.php';

    $infoActual = Producto::readProducto($ID_Producto);

    $Nombre_Producto = $Nombre_Producto ?? $infoActual['Nombre_Producto'];
    $Precio = $Precio ?? $infoActual['Precio'];
    $Cantidad = $Cantidad ?? $infoActual['Cantidad'];
    $Unidad_Medida = $Unidad_Medida ?? $infoActual['Unidad_Medida'];
    $Cantidad_Minima = $Cantidad_Minima ?? $infoActual['Cantidad_Minima'];
    $ID_Categoria = $ID_Categoria ?? $infoActual['ID_Categoria'];
    $ID_Proveedor = $ID_Proveedor ?? $infoActual['ID_Proveedor'];

    if ($Cantidad > $Cantidad_Minima) {
        $Estado = 'Disponible';
    } elseif ($Cantidad > 0 && $Cantidad <= $Cantidad_Minima) {
        $Estado = 'Stock bajo';
    } elseif ($Cantidad == 0) {
        $Estado = 'Sin stock';
    }

    $res = Producto::updateProducto(
        $ID_Producto,
        $Nombre_Producto,
        $Precio,
        $Cantidad,
        $Unidad_Medida,
        $Estado,
        $Cantidad_Minima,
        $ID_Categoria,
        $ID_Proveedor
    );

    if ($res !== 1) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'No se encontró el producto']);
        return;
    } else {
        http_response_code(200);
        echo json_encode(['ok' => true, 'mensaje' => 'Producto actualizado correctamente']);
    }
}