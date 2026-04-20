<?php
require_once __DIR__ . '/database.php';

try {
    $connection = new Conexion;

    $check = $connection->prepare('SELECT ID_Usuario FROM Usuario WHERE ID_Usuario = 1');
    $check->execute();

    if(!$check->fetch()){
        $sql = $connection->prepare('INSERT INTO Usuario (Password, Estado) VALUES (:Password, :Estado)');
        $sql->bindValue(':Password', password_hash('passadmin', PASSWORD_DEFAULT));
        $sql->bindValue(':Estado', 'autorizado');
        $sql->execute();
        $ID_Usuario = $connection->lastInsertId();

        $sql = $connection->prepare('INSERT INTO Contacto_Empleado (Telefono) VALUES (:Telefono)');
        $sql->bindValue(':Telefono', '0000000000');
        $sql->execute();
        $ID_Contacto = $connection->lastInsertId();

        $sql = $connection->prepare('INSERT INTO Empleado (Nombre, Puesto, Estado, ID_Contacto_Empleado, ID_Usuario) VALUES (:Nombre, :Puesto, :Estado, :ID_Contacto, :ID_Usuario)');
        $sql->bindValue(':Nombre', 'Administrador');
        $sql->bindValue(':Puesto', 'admin');
        $sql->bindValue(':Estado', 'activo');
        $sql->bindValue(':ID_Contacto', $ID_Contacto, PDO::PARAM_INT);
        $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
        $sql->execute();

        echo "Usuario admin creado correctamente\n\n";
    } else {
        echo "El usuario admin ya existe\n\n";
    }

    $connection = NULL;
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n\n";
}