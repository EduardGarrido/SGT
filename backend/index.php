<?php
// Punto de entrada 
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch(true) {

    case $path === '/api/ping': // Ruta de prueba para verificar que PHP responde
        echo json_encode(['ok' => true, 'mensaje' => 'PHP respondiendo']);
        break;

    case $path === '/api/login':
        if($_SERVER['REQUEST_METHOD'] !== 'POST'){
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
            break;
        }
        require_once __DIR__ . '/models/login.php';

        $data = json_decode(file_get_contents('php://input'), true);
        $ID_Usuario = htmlspecialchars($data['ID_Usuario']);
        $Password = htmlspecialchars($data['Password']);

        $res = Login::validar($ID_Usuario, $Password);
    
        
        switch($res){
            case 1:
                http_response_code(200);
                echo json_encode(['mensaje' => 'Login exitoso']);
                break;
            case 0:
                http_response_code(401);
                echo json_encode(['mensaje' => 'Credenciales incorrectas']);
                break;
            case 2:
                http_response_code(404);
                echo json_encode(['mensaje' => 'Usuario no encontrado']);
                break;
        }// --Cierra switch de respuesta        
        break;// --Termina case login

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Ruta no encontrada']);
        break;
}// --Fin switch principal