<?php

if($_ENV['APP_ENV'] === 'development') {
    error_reporting(-1);
    ini_set("display_errors", 1);
}

require_once __DIR__ . '/../models/login.php';

if($_SERVER['REQUEST_METHOD'] == "POST"){
    $data = json_decode(file_get_contents('php://input'), true);
    $ID_Usuario = htmlspecialchars($data['ID_Usuario']);
    $Password = htmlspecialchars($data['Password']);

    $res = Login::validar($ID_Usuario, $Password);
    
    header('Content-Type: application/json');
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
    }
}else{
    // Error de metodo, si el metodo no es POST mandamos un error
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}


?>