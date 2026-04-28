<?php

if ($path === '/api/createProduct') {

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => 'false', 'mensaje' => 'Método no permitido']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $Nombre_Producto = $data['Nombre_Producto'];
    $Precio = $data['Precio'];
    $Cantidad = $data['Cantidad'];
    $Unidad_Medida = $data['Unidad_Medida'];
    $Cantidad_Minima = $data['Cantidad_Minima'];
    $ID_Categoria = $data['ID_Categoria'];
    $ID_Proveedor = $data['ID_Proveedor'];

    if ($Cantidad > $Cantidad_Minima) {
        $Estado = 'Disponible';
    } elseif ($Cantidad > 0 && $Cantidad <= $Cantidad_Minima) {
        $Estado = 'Stock bajo';
    } elseif ($Cantidad == 0) {
        $Estado = 'Sin stock';
    }

    require_once __DIR__ . '/../models/producto.php';

}