<?php
/*
    * Punto de entrada para la API
    * Autorizacion mediante sesiones de PHP
    * El estado se resetea al cerrar el navegador
*/
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:5173', 'http://localhost:8000', 'http://148.210.173.78:8000'];

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

function esAutorizado(): bool {
    return isset($_SESSION['ID_Usuario']);
}

function esAdmin(): bool {
    return isset($_SESSION['Puesto']) && $_SESSION['Puesto'] === 'admin';
}

function requerirAutorizacion(): void {
    if (!esAutorizado()) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'mensaje' => 'No autorizado']);
        exit;
    }
}

function requerirAdmin(): void {
    requerirAutorizacion();
    if (!esAdmin()) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'mensaje' => 'Acceso denegado']);
        exit;
    }
}


// Rutas
switch(true) {

    case $path === '/api/ping': // Ruta de prueba para verificar que PHP responde
        echo json_encode(['ok' => true, 'mensaje' => 'PHP respondiendo']);
        break;

    case $path === '/api/login':
        if($_SERVER['REQUEST_METHOD'] !== 'POST'){
            http_response_code(405);
            echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
            break;
        }
        require_once __DIR__ . '/models/login.php';

        $data = json_decode(file_get_contents('php://input'), true);
        $ID_Usuario = htmlspecialchars($data['ID_Usuario']);
        $Password = htmlspecialchars($data['Password']);

        if (!$ID_Usuario || !$Password) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos']);
            break;
        }

        $res = Login::validar($ID_Usuario, $Password);
        
        if($res === -1){
            http_response_code(404);
            echo json_encode(['ok' => false, 'mensaje' => 'Usuario no encontrado']);
        }elseif($res === 0){
            http_response_code(401);
            echo json_encode(['ok' => false, 'mensaje' => 'Credenciales incorrectas']);
        }else {
            session_regenerate_id(true);    

            $_SESSION['ID_Usuario'] = $ID_Usuario;
            $_SESSION['Puesto'] = $res['Puesto'];

            http_response_code(200);
            echo json_encode([
            'ok' => true,
            'mensaje' => 'Login exitoso', 
            'puesto' => $res['Puesto'], 
            'id' => $ID_Usuario,
            ]); 
        }// --Cierra switch de respuesta        
        break;// --Termina case login


    case $path === '/api/logout':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
            break;
        }

        $_SESSION =[];

        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(
                session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }

        session_destroy();

        echo json_encode(['ok' => true, 'mensaje' => 'Sesión cerrada']);
       
        break;// -- Termina case logout

    case $path === '/api/users':
        requerirAdmin();

        echo json_encode(['ok' => true, 'mensaje' => 'Admin autorizado']);

        break;
    default:
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada']);
        break;
}// --Fin switch principal