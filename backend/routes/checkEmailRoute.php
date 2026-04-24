<?php

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    return;
}

$correo = trim($_GET['correo'] ?? '');

if (!$correo || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'mensaje' => 'Formato de correo inválido']);
    return;
}

$domain = substr(strrchr($correo, '@'), 1);

if (checkdnsrr($domain, 'MX')) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(422);
    echo json_encode(['ok' => false, 'mensaje' => "El dominio \"$domain\" no existe o no acepta correos"]);
}
