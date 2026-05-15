<?php
// Se ejecuta en cada arranque antes de los seeders.

require_once __DIR__ . '/database.php';

$migrations = [
    "ALTER TABLE Categoria ADD COLUMN IF NOT EXISTS Estado VARCHAR(20) NOT NULL DEFAULT 'activo'",
    "ALTER TABLE Proveedor ADD COLUMN IF NOT EXISTS Estado VARCHAR(20) NOT NULL DEFAULT 'activo'",
];

try {
    $connection = new Conexion();

    foreach ($migrations as $sql) {
        $connection->exec($sql);
    }

    $connection = NULL;
    echo "Migraciones aplicadas\n\n";

} catch (Exception $e) {
    echo "Error en migraciones: " . $e->getMessage() . "\n\n";
}
