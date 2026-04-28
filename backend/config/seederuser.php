<?php
//Creación de usuario empleado default
// ID = 2
// password = pass

require_once __DIR__ . '/database.php';

try {
    $connection = new Conexion;

    $check = $connection->prepare('SELECT ID_Usuario FROM Usuario WHERE ID_Usuario = 2');
    $check->execute();

    if (!$check->fetch()) {
        $connection->beginTransaction();

        //Insertar información tabla usuario
        $sql = $connection->prepare('INSERT INTO Usuario (Password, Estado) VALUES (:Password, :Estado)');
        $sql->bindValue(':Password', password_hash('pass', PASSWORD_DEFAULT));
        $sql->bindValue(':Estado', 'autorizado');
        $sql->execute();
        $ID_Usuario = $connection->lastInsertId();


        //Insertar información tabla Contacto_Empleado
        $sql = $connection->prepare('INSERT INTO Contacto_Empleado (Telefono, Correo, Calle, Colonia, Codigo_Postal) 
        VALUES (:Telefono, :Correo, :Calle, :Colonia, :Codigo_Postal)');
        $sql->bindValue(':Telefono', '6763458283');
        $sql->bindValue(':Correo', 'correoempleado@gmail.com');
        $sql->bindValue(':Calle', 'Trendelnorte');
        $sql->bindValue(':Colonia', 'Lagos del Country');
        $sql->bindValue(':Codigo_Postal', '654321');
        $sql->execute();
        $ID_Contacto = $connection->lastInsertId();


        //Insertar información tabla Empleado
        $sql = $connection->prepare('INSERT INTO Empleado (Nombre, Puesto, Estado, ID_Contacto_Empleado, ID_Usuario) 
        VALUES (:Nombre, :Puesto, :Estado, :ID_Contacto, :ID_Usuario)');
        $sql->bindValue(':Nombre', 'Empleado');
        $sql->bindValue(':Puesto', 'empleado');
        $sql->bindValue(':Estado', 'activo');
        $sql->bindValue(':ID_Contacto', $ID_Contacto, PDO::PARAM_INT);
        $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
        $sql->execute();

        $connection->commit();
        $connection = NULL;

        echo "Usuario empleado creado correctamente\n\n";
    } else {
        echo "El usuario empleado ya existe\n\n";
    }

} catch (Exception $e) {
    if ($connection)
        $connection->rollBack();
    echo "Error: " . $e->getMessage() . "\n\n";
}