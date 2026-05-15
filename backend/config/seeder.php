<?php
// Seeder único: ajustes de schema idempotentes + usuarios semilla
// Se ejecuta en cada arranque (main.js -> runSeeders)
//
// Usuarios sembrados:
//  ID = 1  admin     password = passadmin
//  ID = 2  empleado  password = pass

require_once __DIR__ . '/database.php';

// Ajustes de schema (idempotentes). Sirven como red de seguridad para DBs
// existentes que se hayan creado con un database.sql anterior. Para una DB
// recién creada con el database.sql actual, estos ALTER son no-ops.
$schemaAjustes = [
    "ALTER TABLE Categoria ADD COLUMN IF NOT EXISTS Estado VARCHAR(20) NOT NULL DEFAULT 'activo'",
    "ALTER TABLE Proveedor ADD COLUMN IF NOT EXISTS Estado VARCHAR(20) NOT NULL DEFAULT 'activo'",
];

function crearUsuarioSemilla(
    Conexion $connection,
    int $idEsperado,
    string $password,
    string $nombre,
    string $puesto,
    string $telefono,
    string $correo,
    string $calle,
    string $colonia,
    string $codigoPostal
): void {
    $check = $connection->prepare('SELECT ID_Usuario FROM Usuario WHERE ID_Usuario = :ID_Usuario');
    $check->bindValue(':ID_Usuario', $idEsperado, PDO::PARAM_INT);
    $check->execute();

    if ($check->fetch()) {
        echo "Usuario {$nombre} (ID={$idEsperado}) ya existe\n";
        return;
    }

    $connection->beginTransaction();
    try {
        $sql = $connection->prepare('INSERT INTO Usuario (Password, Estado) VALUES (:Password, :Estado)');
        $sql->bindValue(':Password', password_hash($password, PASSWORD_DEFAULT));
        $sql->bindValue(':Estado', 'autorizado');
        $sql->execute();
        $ID_Usuario = $connection->lastInsertId();

        $sql = $connection->prepare('INSERT INTO Contacto_Empleado (Telefono, Correo, Calle, Colonia, Codigo_Postal)
        VALUES (:Telefono, :Correo, :Calle, :Colonia, :Codigo_Postal)');
        $sql->bindValue(':Telefono', $telefono);
        $sql->bindValue(':Correo', $correo);
        $sql->bindValue(':Calle', $calle);
        $sql->bindValue(':Colonia', $colonia);
        $sql->bindValue(':Codigo_Postal', $codigoPostal);
        $sql->execute();
        $ID_Contacto = $connection->lastInsertId();

        $sql = $connection->prepare('INSERT INTO Empleado (Nombre, Puesto, Estado, ID_Contacto_Empleado, ID_Usuario)
        VALUES (:Nombre, :Puesto, :Estado, :ID_Contacto, :ID_Usuario)');
        $sql->bindValue(':Nombre', $nombre);
        $sql->bindValue(':Puesto', $puesto);
        $sql->bindValue(':Estado', 'activo');
        $sql->bindValue(':ID_Contacto', $ID_Contacto, PDO::PARAM_INT);
        $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
        $sql->execute();

        $connection->commit();
        echo "Usuario {$nombre} (ID={$idEsperado}) creado correctamente\n";
    } catch (Exception $e) {
        $connection->rollBack();
        throw $e;
    }
}

try {
    $connection = new Conexion();

    // 1. Ajustes de schema
    foreach ($schemaAjustes as $sql) {
        $connection->exec($sql);
    }

    // 2. Usuarios semilla
    crearUsuarioSemilla(
        $connection,
        1,
        'passadmin',
        'Administrador',
        'admin',
        '1239088989',
        'correoadmin@gmail.com',
        'Trendelsur',
        'Chafajes',
        '123456'
    );

    crearUsuarioSemilla(
        $connection,
        2,
        'pass',
        'Empleado',
        'empleado',
        '6763458283',
        'correoempleado@gmail.com',
        'Trendelnorte',
        'Lagos del Country',
        '654321'
    );

    $connection = NULL;
    echo "\n";

} catch (Exception $e) {
    echo "Error en seeder: " . $e->getMessage() . "\n\n";
}
