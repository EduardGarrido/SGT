<?php

require_once __DIR__ . "/../config/database.php";

class Contacto_Empleado {
    const TABLE = 'Contacto_Empleado';
    // ID_Contacto_Empleado, Telefono, Correo, Calle, Colonia, Codigo_Postal

    public static function crearContacto($Telefono, $Correo, $Calle, $Colonia, $Codigo_Postal) {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare(
                'INSERT INTO ' . self::TABLE . ' (Telefono, Correo, Calle, Colonia, Codigo_Postal) 
                VALUES (:Telefono, :Correo, :Calle, :Colonia, :Codigo_Postal)'
                );
            $sql->bindValue(':Telefono', $Telefono, PDO::PARAM_STR);
            $sql->bindValue(':Correo', $Correo, PDO::PARAM_STR);
            $sql->bindValue(':Calle', $Calle, PDO::PARAM_STR);
            $sql->bindValue(':Colonia', $Colonia, PDO::PARAM_STR);
            $sql->bindValue(':Codigo_Postal', $Codigo_Postal, PDO::PARAM_STR);
            $valid = $sql->execute();
            $ID_Contacto_Empleado = $connection->lastInsertId();
            $connection = NULL;

            if ($valid) {
                return $ID_Contacto_Empleado;
            } else {
                return -1; // error
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }

    public static function readContacto($ID_Contacto_Empleado) {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare('SELECT * FROM ' . self::TABLE . ' WHERE ID_Contacto_Empleado = :ID_Contacto_Empleado');
            $sql->bindValue(':ID_Contacto_Empleado', $ID_Contacto_Empleado, PDO::PARAM_INT);
            $sql->execute();
            $contacto_empleado = $sql->fetch(PDO::FETCH_ASSOC);
            $connection = NULL;

            if ($contacto_empleado) {
                return $contacto_empleado;
            } else {
                return false;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }

    public static function updateContacto($ID_Contacto_Empleado, $Telefono, $Correo, $Calle, $Colonia, $Codigo_Postal) {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare(
                'UPDATE ' . self::TABLE . ' SET Telefono = :Telefono, Correo = :Correo, 
                Calle = :Calle, Colonia = :Colonia, Codigo_Postal = :Codigo_Postal 
                WHERE ID_Contacto_Empleado = :ID_Contacto_Empleado'
                );
            $sql->bindValue(':ID_Contacto_Empleado', $ID_Contacto_Empleado, PDO::PARAM_INT);
            $sql->bindValue(':Telefono', $Telefono, PDO::PARAM_STR);
            $sql->bindValue(':Correo', $Correo, PDO::PARAM_STR);
            $sql->bindValue(':Calle', $Calle, PDO::PARAM_STR);
            $sql->bindValue(':Colonia', $Colonia, PDO::PARAM_STR);
            $sql->bindValue(':Codigo_Postal', $Codigo_Postal, PDO::PARAM_STR);
            $valid = $sql->execute();
            $row = $sql->rowCount();
            $connection = NULL;

            if ($valid) {
                if ($row > 0) {
                    return 1; // actualizo contacto_empleado
                } else {
                    return 0; // no actualizo
                }
            } else {
                return -1; // error
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }

    public static function deleteContacto($ID_Contacto_Empleado) {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare('DELETE FROM ' . self::TABLE . ' WHERE ID_Contacto_Empleado = :ID_Contacto_Empleado');
            $sql->bindValue(':ID_Contacto_Empleado', $ID_Contacto_Empleado, PDO::PARAM_INT);
            $valid = $sql->execute();
            $row = $sql->rowCount();
            $connection = NULL;

            if ($valid) {
                if ($row > 0) {
                    return 1; // contacto_empleado borrado
                } else {
                    return 0; // no borro o contacto_empleado no encontrado
                }
            } else {
                return -1; // error
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }
}

?>