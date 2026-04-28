<?php
// Rutas para usuario 

if ($path === '/api/getUsers') {//Ruta que obtiene la información de todos los usuarios

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
        return;
    }

    require_once __DIR__ . '/../models/usuario.php';

    $res = Usuario::readAllUsuario();

    http_response_code(200);
    echo json_encode(['ok' => true, 'usuarios' => $res]);

    //--Termina case getUsers

} elseif ($path === '/api/getUserInfo') { //Ruta para obtener información de un usuario

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
        return;
    }


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

    //--Termina case getUserInfo

} elseif ($path === '/api/createUser') { //Ruta para crear usuario 

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

    if (!$Password || !$Nombre || !$Puesto) {
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
        $resEmpleado = Empleado::crearEmpleado($connection, $Nombre, $Puesto, 'activo', $resContacto, $resUsuario);

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

    //--Termina case createUser

} elseif ($path === '/api/modifyInfoUser') { //Ruta para modificar informacion del usuario

    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405);
        echo json_encode((['ok' => false, 'error' => 'Método no permitido']));
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $ID_Usuario = (int) $data['ID_Usuario'];
    $Nombre = isset($data['Nombre']) ? htmlspecialchars($data['Nombre']) : null;
    $Puesto = isset($data['Puesto']) ? htmlspecialchars($data['Puesto']) : null;
    $Telefono = isset($data['Telefono']) ? htmlspecialchars($data['Telefono']) : null;
    $Correo = isset($data['Correo']) ? htmlspecialchars($data['Correo']) : null;
    $Calle = isset($data['Calle']) ? htmlspecialchars($data['Calle']) : null;
    $Colonia = isset($data['Colonia']) ? htmlspecialchars($data['Colonia']) : null;
    $Codigo_Postal = isset($data['Codigo_Postal']) ? htmlspecialchars($data['Codigo_Postal']) : null;


    if (!$ID_Usuario) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/empleado.php';
    require_once __DIR__ . '/../models/usuario.php';
    require_once __DIR__ . '/../models/contacto_empleado.php';


    $IDs = Empleado::getIDsByUsuario($ID_Usuario);
    $infoActual = Usuario::readInfoUsuario($ID_Usuario);

    $Nombre = $Nombre ?? $infoActual['Nombre'];
    $Puesto = $Puesto ?? $infoActual['Puesto'];
    $Telefono = $Telefono ?? $infoActual['Telefono'];
    $Correo = $Correo ?? $infoActual['Correo'];
    $Calle = $Calle ?? $infoActual['Calle'];
    $Colonia = $Colonia ?? $infoActual['Colonia'];
    $Codigo_Postal = $Codigo_Postal ?? $infoActual['Codigo_Postal'];

    if (!$IDs) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario no encontrado']);
        return;
    }

    $ID_Empleado = $IDs['ID_Empleado'];
    $ID_Contacto_Empleado = $IDs['ID_Contacto_Empleado'];

    try {
        $connection = new Conexion();

        $connection->beginTransaction();

        Empleado::updateEmpleado($connection, $ID_Empleado, $Nombre, $Puesto, "activo");
        Contacto_Empleado::updateContacto(
            $connection,
            $ID_Contacto_Empleado,
            $Telefono,
            $Correo,
            $Calle,
            $Colonia,
            $Codigo_Postal
        );
        $connection->commit();
        $connection = NULL;


        http_response_code(200);
        echo json_encode(['ok' => true, 'mensaje' => 'Informacion actualizada correctamente']);


    } catch (Exception $e) {
        $connection->rollBack();
        $connection = NULL;
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
    }

    //--Termina case modifyInfoUser

} elseif ($path == '/api/modifyPasswordUser') { //Ruta para modificar password del usuario

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode((['ok' => false, 'error' => 'Método no permitido']));
        return;
    }


    $data = json_decode(file_get_contents('php://input'), true);
    $ID_Usuario = (int) $data['ID_Usuario'];
    $Password = htmlspecialchars($data['Password']);


    if (!$ID_Usuario || !$Password) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/usuario.php';

    $res = Usuario::updatePassword($ID_Usuario, $Password);

    if ($res === 0) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario no encontrado']);
    } elseif ($res === 1) {
        http_response_code(200);
        echo json_encode(['ok' => true, 'mensaje' => 'Password modificada correctamente']);
    } else {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'Error al actualizar']);
    }


    //--Termina case modifyPasswordUser

} elseif ($path == '/api/modifyEstadoUser') { //Ruta para modificar estado del usuario

    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405);
        echo json_encode((['ok' => false, 'error' => 'Método no permitido']));
        return;
    }


    $data = json_decode(file_get_contents('php://input'), true);
    $ID_Usuario = (int) $data['ID_Usuario'];
    $Estado = htmlspecialchars($data['Estado']);


    if (!$ID_Usuario || !$Estado) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }

    require_once __DIR__ . '/../models/usuario.php';


    $res = Usuario::updateEstado($ID_Usuario, $Estado);

    if ($res === 0) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario no encontrado']);
    } elseif ($res === 1) {
        http_response_code(200);
        echo json_encode(['ok' => true, 'mensaje' => 'Estado modificado correctamente']);
    } else {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'Error al actualizar']);
    }

    //-- Termina case modifyEstadoUser

} elseif ($path === '/api/deleteUser') { // Ruta para deshabilitar usuario

    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405);
        echo json_encode((['ok' => false, 'error' => 'Método no permitido']));
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $ID_Usuario = (int) $data['ID_Usuario'];

    if (!$ID_Usuario) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos obligatorios']);
        return;
    }
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/empleado.php';
    require_once __DIR__ . '/../models/usuario.php';

    $IDs = Empleado::getIDsByUsuario($ID_Usuario);

    if (!$IDs) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'mensaje' => 'Usuario no encontrado']);
        return;
    }

    $ID_Empleado = (int) $IDs['ID_Empleado'];

    $connection = new Conexion();

    try {
        $connection->beginTransaction();

        Empleado::desactivarEmpleado($connection, $ID_Empleado);
        Usuario::updateEstado($ID_Usuario, 'no autorizado', $connection);

        $connection->commit();
        $connection = NULL;

        http_response_code(200);
        echo json_encode(['ok' => true, 'mensaje' => 'Empleado desactivado correctamente']);

    } catch (Exception $e) {
        $connection->rollBack();
        $connection = NULL;
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => $e->getMessage()]);
    }

}//--Termina case deleteUser
