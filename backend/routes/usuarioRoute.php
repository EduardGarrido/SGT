<?php

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    return;
}


require_once __DIR__ . '/../models/usuario.php';

$res = Usuario::readAllUsuario();

http_response_code(200);
echo json_encode(['ok' => true, 'usuarios' => $res]);


?>