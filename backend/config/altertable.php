<?php

require_once __DIR__ . "/database.php";

try {
    $connection = new Conexion();

    $connection->exec("ALTER TABLE Categoria ADD COLUMN Estado VARCHAR(20) NOT NULL DEFAULT 'activo'");
    $connection->exec("ALTER TABLE Proveedor ADD COLUMN Estado VARCHAR(20) NOT NULL DEFAULT 'activo'");

    $connection = NULL;

} catch (PDOException $e) {
    echo new Exception("Hubo un error" . $e->getMessage());
}