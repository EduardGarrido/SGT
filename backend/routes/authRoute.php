<?php
if($path === '/api/login'){
        if($_SERVER['REQUEST_METHOD'] !== 'POST'){
            http_response_code(405);
            echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
            return;
        }
        require_once __DIR__ . '/../models/login.php';

        $data = json_decode(file_get_contents('php://input'), true);
        $ID_Usuario = htmlspecialchars($data['ID_Usuario']);
        $Password = htmlspecialchars($data['Password']);

        if (!$ID_Usuario || !$Password) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'mensaje' => 'Faltan campos']);
            return;
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
        return;// --Termina case login

}elseif($path === '/api/logout'){
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
            return;
        }

        $_SESSION =[];

        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(
                session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }

        session_destroy();

        echo json_encode(['ok' => true, 'mensaje' => 'Sesión cerrada']);
       
        return;// -- Termina case logout
}
?>