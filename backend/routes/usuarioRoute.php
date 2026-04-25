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

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode((['ok' => false, 'error' => 'Método no permitido']));
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $Password = htmlspecialchars($data['Password']);
    $Nombre = htmlspecialchars($data['Nombre']);
    $Puesto = htmlspecialchars($data['Puesto']);
    $Telefono = htmlspecialchars($data['Telefono'] ?? '');
    $Correo = htmlspecialchars($data['Correo'] ?? '');
    $Calle = htmlspecialchars($data['Calle'] ?? '');
    $Colonia = htmlspecialchars($data['Colonia'] ?? '');
    $Codigo_Postal = htmlspecialchars($data['Codigo_Postal'] ?? '');

    if (!$Password || !$Nombre) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/usuario.php';
    require_once __DIR__ . '/../models/empleado.php';
    require_once __DIR__ . '/../models/contacto_empleado.php';
    require_once __DIR__ . '/../config/database.php';


    $connection = new Conexion();


    try {
        $connection->beginTransaction();

        $resUsuario = Usuario::crearUsuario($connection, $Password, 'autorizado');
        $resContacto = Contacto_Empleado::crearContacto(
            $connection,
            $Telefono,
            $Correo,
            $Calle,
            $Colonia,
            $Codigo_Postal
        );
        $resEmpleado = Empleado::crearEmpleado($connection, $Nombre, $Puesto, 'no activo', $resContacto, $resUsuario);

        $connection->commit();
        $connection = NULL;

        http_response_code(201);
        echo json_encode(['ok' => true, 'mensaje' => 'Usuario e informacion creado correctamente']);

    } catch (Exception $e) {
        $connection->rollback();
        $connection = NULL;
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
    }



}
