<?php
// [!] Entry point de ejemplo para PHP
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$ruta = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch(true) {

    case $ruta === '/api/ping': // Ruta de prueba para verificar que PHP responde
        echo json_encode(['ok' => true, 'mensaje' => 'PHP respondiendo']);
        break;

    case $ruta === '/api/login':
        $body = json_decode(file_get_contents('php://input'), true);
        // Por ahora sin base de datos, solo verificamos que lleguen los datos
        echo json_encode([
            'ok'       => true,
            'recibido' => $body
        ]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Ruta no encontrada']);
        break;
}