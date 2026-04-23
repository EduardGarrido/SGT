<?php


if ($path === '/api/getUsers') {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
        return;
    }

    require_once __DIR__ . '/../models/usuario.php';

    $res = Usuario::readAllUsuario();

    http_response_code(200);
    echo json_encode(['ok' => true, 'usuarios' => $res]);

} elseif ($path === '/api/getUserInfo') {

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
        return;
    }

    requerirAutorizacion();

    if (isset($_GET['id'])) {
        $ID_Usuario = (int) $_GET['id'];
    } else {
        $ID_Usuario = (int) $_SESSION['ID_Usuario'];
    }

    require_once __DIR__ . '/../models/usuario.php';

    $res = Usuario::readInfoUsuario($ID_Usuario);

    if (!$res) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario no encontrado']);
        return;
    }

    http_response_code(200);
    echo json_encode(['ok' => true, 'usuarioinfo' => $res]);

} elseif ($path === '/api/createUser') {
   // if($_SERVER['REQUEST_METHOD'] !== 'POST')
}
