<?php
// Rutas para proveedor

if ($path === '/api/createSupplier') { // Ruta para crear proveedor
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        return;
    }


    $data = json_decode(file_get_contents('php://input'), true);
    $Nombre_Proveedor = htmlspecialchars($data['Nombre_Proveedor']);
    $Telefono = htmlspecialchars($data['Telefono']);

    if (!$Nombre_Proveedor) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . ('/../models/proveedor.php');

    $res = Proveedor::createProveedor($Nombre_Proveedor, $Telefono);

    if ($res) {
        http_response_code(201);
        echo json_encode(['ok' => true, 'mensaje' => 'Proveedor creado correctamente']);
    } else {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'El proveedor no se pudo crear']);
    }

    //-- Termina case createSupplier

} elseif ($path === '/api/getAllSuppliers') { // Ruta para leer todos los proveedores

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        return;
    }

    require_once __DIR__ . '/../models/proveedor.php';

    $res = Proveedor::readAllProveedores();

    if (!$res) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'No hay proveedores']);
        return;
    }

    http_response_code(200);
    echo json_encode(['ok' => true, 'proveedores' => $res]);

    //-- Termina case readAllSuppliers

} elseif ($path === '/api/getSupplier') {// Ruta para leer un proveedor

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido']);
        return;
    }

    $ID_Proveedor = (int) $_GET['id'];

    if (!$ID_Proveedor) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/proveedor.php';


    $res = Proveedor::readProveedor($ID_Proveedor);

    if (!$res) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'No se encontró el proveedor']);
        return;
    }

    http_response_code(200);
    echo json_encode(['ok' => true, 'proveedor' => $res]);


    //-- Termina case getSupplier

} else if ($path === '/api/modifySupplier') { // Ruta para modificar proveedor

    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
        return;
    }


    $data = json_decode(file_get_contents('php://input'), true);
    $ID_Proveedor = (int) ($data['ID_Proveedor'] ?? 0);
    $Nombre_Proveedor = isset($data['Nombre_Proveedor']) ? htmlspecialchars($data['Nombre_Proveedor']) : null;
    $Telefono = isset($data['Telefono']) ? htmlspecialchars($data['Telefono']) : null;
    $Estado = isset($data['Estado']) ? htmlspecialchars($data['Estado']) : null;


    if (!$ID_Proveedor) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/proveedor.php';

    $infoActual = Proveedor::readProveedor($ID_Proveedor);

    if (!$infoActual) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'No se encontró el proveedor']);
        return;
    }

    $Nombre_Proveedor = $Nombre_Proveedor ?? $infoActual['Nombre_Proveedor'];
    $Telefono = $Telefono ?? $infoActual['Telefono'];
    $Estado = $Estado ?? $infoActual['Estado'];

    $res = Proveedor::updateProveedor($ID_Proveedor, $Nombre_Proveedor, $Telefono, $Estado);

    if ($res !== 1) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'No se encontró el proveedor']);
        return;
    } else {
        http_response_code(200);
        echo json_encode(['ok' => true, 'mensaje' => 'Proveedor actualizado correctamente']);
    }

    //-- Termina ruta modifySupplier

} else if ($path === '/api/deleteSupplier') { // Ruta delete (cambiar estado) a proveedor

    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
        return;
    }


    $data = json_decode(file_get_contents('php://input'), true);
    $ID_Proveedor = (int) $data['ID_Proveedor'];



    if (!$ID_Proveedor) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/proveedor.php';

    $res = Proveedor::desactivarProveedor($ID_Proveedor, 'noactivo');

    if ($res !== 1) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'No se encontró el proveedor']);
        return;
    } else {
        http_response_code(200);
        echo json_encode(['ok' => true, 'mensaje' => 'Proveedor eliminado correctamente']);
    }

    //-- Termina ruta deleteSupplier
}
