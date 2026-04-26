<?php
/*
 * Punto de entrada para la API
 * Autorizacion mediante sesiones de PHP
 * El estado se resetea al cerrar el navegador
 */
session_start();


//Headers 
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
// Never cache GET requests
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');



$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Añadir direcciones para realizar requests
$allowed = ['http://localhost:5173', 'http://localhost:8000'];

// In production the renderer has no HTTP origin (file://)
// so we allow the request through unconditionally
if (in_array($origin, $allowed) || $origin === '') {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
} else {
    http_response_code(403);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

function esAutorizado(): bool
{
    return isset($_SESSION['ID_Usuario']);
}

function esAdmin(): bool
{
    return isset($_SESSION['Puesto']) && $_SESSION['Puesto'] === 'admin';
}

function requerirAutorizacion(): void
{
    if (!esAutorizado()) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'mensaje' => 'No autorizado']);
        exit;
    }
}

function requerirAdmin(): void
{
    requerirAutorizacion();
    if (!esAdmin()) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'mensaje' => 'Acceso denegado']);
        exit;
    }
}


// Rutas
switch (true) {

    case $path === '/api/ping': // Ruta de prueba para verificar que PHP responde
        echo json_encode(['ok' => true, 'mensaje' => 'PHP respondiendo']);
        break;

    case $path === '/api/logout':
    case $path === '/api/login':
        require_once __DIR__ . '/routes/authRoute.php';
        break;


    case $path === '/api/getUserInfo':
        requerirAutorizacion();
        require_once __DIR__ . '/routes/usuarioRoute.php';
        break;

    case $path === '/api/getUsers':
        requerirAdmin();
        require_once __DIR__ . '/routes/usuarioRoute.php';
        break;

    case $path === '/api/createUser':
        requerirAdmin();
        require_once __DIR__ . '/routes/usuarioRoute.php';
        break;

    case $path === '/api/modifyInfoUser':
        requerirAdmin();
        require_once __DIR__ . '/routes/usuarioRoute.php';
        break;

    case $path === '/api/modifyPasswordUser':
        requerirAdmin();
        require_once __DIR__ . '/routes/usuarioRoute.php';
        break;

    case $path === '/api/modifyEstadoUser':
        requerirAdmin();
        require_once __DIR__ . '/routes/usuarioRoute.php';
        break;

    case $path === '/api/deleteUser':
        requerirAdmin();
        require_once __DIR__ . '/routes/usuarioRoute.php';
        break;

    case $path === '/api/checkEmail':
        requerirAdmin();
        require_once __DIR__ . '/routes/checkEmailRoute.php';
        break;

    case $path === '/api/products':
        requerirAdmin();
        echo json_encode(['ok' => true, 'mensaje' => 'Admin autorizado']);
        break;

    default:
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada']);
        break;
}// --Fin switch principal
