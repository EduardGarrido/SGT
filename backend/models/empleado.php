<?php

if($_ENV['APP_ENV'] === 'development') {
    error_reporting(-1);
    ini_set("display_errors", 1);
}

require_once __DIR__ . "/../config/database.php";

class Empleado {
    const TABLE = 'Empleado';
    // ID_Empleado, Nombre, Puesto, Estado, ID_Contacto_Empleado, ID_Usuario

    public static function crearEmpleado($Nombre, $Puesto, $Estado, $ID_Contacto_Empleado, $ID_Usuario) {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare(
                'INSERT INTO ' . self::TABLE . ' (Nombre, Puesto, Estado, ID_Contacto_Empleado, ID_Usuario) 
                VALUES (:Nombre, :Puesto, :Estado, :ID_Contacto_Empleado, :ID_Usuario)'
                );
            $sql->bindValue(':Nombre', $Nombre, PDO::PARAM_STR);
            $sql->bindValue(':Puesto', $Puesto, PDO::PARAM_STR);
            $sql->bindValue(':Estado', $Estado, PDO::PARAM_STR);
            $sql->bindValue(':ID_Contacto_Empleado', $ID_Contacto_Empleado, PDO::PARAM_INT);
            $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
            $valid = $sql->execute();
            $ID_Empleado = $connection->lastInsertId();
            $connection = NULL;

            if ($valid) {
                return $ID_Empleado;
            } else {
                return -1;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }

    public static function readEmpleado($ID_Empleado) {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare('SELECT Nombre, Puesto, Estado FROM ' . self::TABLE . ' WHERE ID_Empleado = :ID_Empleado');
            $sql->bindValue(':ID_Empleado', $ID_Empleado, PDO::PARAM_INT);
            $sql->execute();
            $empleado = $sql->fetch(PDO::FETCH_ASSOC);
            $connection = NULL;

            if ($empleado) {
                return $empleado;
            } else {
                return false;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }

    public static function updateEmpleado($ID_Empleado, $Nombre, $Puesto, $Estado) {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare(
                'UPDATE ' . self::TABLE . ' SET Nombre = :Nombre, Puesto = :Puesto, Estado = :Estado WHERE ID_Empleado = :ID_Empleado'
                );
            $sql->bindValue(':ID_Empleado', $ID_Empleado, PDO::PARAM_INT);
            $sql->bindValue(':Nombre', $Nombre, PDO::PARAM_STR);
            $sql->bindValue(':Puesto', $Puesto, PDO::PARAM_STR);
            $sql->bindValue(':Estado', $Estado, PDO::PARAM_STR);
            $valid = $sql->execute();
            $row = $sql->rowCount();
            $connection = NULL;

            if ($valid) {
                if ($row > 0) {
                    return 1; // actualizo empleado
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

    public static function deleteEmpleado($ID_Empleado) {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare('DELETE FROM ' . self::TABLE . ' WHERE ID_Empleado = :ID_Empleado');
            $sql->bindValue(':ID_Empleado', $ID_Empleado, PDO::PARAM_INT);
            $valid = $sql->execute();
            $row = $sql->rowCount();
            $connection = NULL;

            if ($valid) {
                if ($row > 0) {
                    return 1; // empleado borrado
                } else {
                    return 0; // no borro o empleado no encontrado
                }
            } else {
                return -1; // error
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }
}
