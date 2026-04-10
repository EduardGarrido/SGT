<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = new Conexion();
    echo 'Conexión exitosa';
} catch(Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
?>