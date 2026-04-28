<?php
//Creación de usuario administrador por defecto
// ID = 1 
// Password = passadmin

require_once __DIR__ . '/database.php';

try {
    $connection = new Conexion;

    $check = $connection->prepare('SELECT ID_Usuario FROM Usuario WHERE ID_Usuario = 1');
    $check->execute();

    if (!$check->fetch()) {
        $connection->beginTransaction();

        //Insertar información en tabla Usuario
        $sql = $connection->prepare('INSERT INTO Usuario (Password, Estado) VALUES (:Password, :Estado)');
        $sql->bindValue(':Password', password_hash('passadmin', PASSWORD_DEFAULT));
        $sql->bindValue(':Estado', 'autorizado');
        $sql->execute();
        $ID_Usuario = $connection->lastInsertId();


        //Insertar información en tabla Contacto_Empleado
        $sql = $connection->prepare('INSERT INTO Contacto_Empleado (Telefono, Correo, Calle, Colonia, Codigo_Postal) 
        VALUES (:Telefono, :Correo, :Calle, :Colonia, :Codigo_Postal)');
        $sql->bindValue(':Telefono', '1239088989');
        $sql->bindValue(':Correo', 'correoadmin@gmail.com');
        $sql->bindValue(':Calle', 'Trendelsur');
        $sql->bindValue(':Colonia', 'Chafajes');
        $sql->bindValue(':Codigo_Postal', '123456');
        $sql->execute();
        $ID_Contacto = $connection->lastInsertId();



        //Insertar información en tabla Empleado
        $sql = $connection->prepare('INSERT INTO Empleado (Nombre, Puesto, Estado, ID_Contacto_Empleado, ID_Usuario) 
        VALUES (:Nombre, :Puesto, :Estado, :ID_Contacto, :ID_Usuario)');
        $sql->bindValue(':Nombre', 'Administrador');
        $sql->bindValue(':Puesto', 'admin');
        $sql->bindValue(':Estado', 'activo');
        $sql->bindValue(':ID_Contacto', $ID_Contacto, PDO::PARAM_INT);
        $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
        $sql->execute();

        $connection->commit();
        $connection = NULL;

        echo "Usuario admin creado correctamente\n\n";
    } else {
        echo "El usuario admin ya existe\n\n";
    }

} catch (Exception $e) {
    if ($connection)
        $connection->rollBack();
    echo "Error: " . $e->getMessage() . "\n\n";
}