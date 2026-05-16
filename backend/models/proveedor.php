<?php

// Clase con CRUD para proveedores

require_once __DIR__ . '/../config/database.php';

class Proveedor
{
    const TABLE = "Proveedor";
    // ID_Proveedor, Nombre_Proveedor, Telefono

    // Funcion para crear un nuevo proveedor
    public static function createProveedor($Nombre_Proveedor, $Telefono)
    {
        try {
            $connection = new Conexion();

            $sql = $connection->prepare('INSERT INTO ' . self::TABLE . ' (Nombre_Proveedor, Telefono, Estado)
            VALUES (:Nombre_Proveedor, :Telefono, :Estado)');
            $sql->bindValue(':Nombre_Proveedor', $Nombre_Proveedor);
            $sql->bindValue(':Telefono', $Telefono);
            $sql->bindValue(':Estado', 'activo');
            $sql->execute();
            $ID_Proveedor = $connection->lastInsertId();
            $connection = NULL;

            return $ID_Proveedor;


        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion crear proveedor

    // Funcion para leer todos los proveedores
    public static function readAllProveedores()
    {
        try {
            $Estado = 'activo';
            $connection = new Conexion();

            $sql = $connection->prepare('SELECT ID_Proveedor, Nombre_Proveedor, Telefono FROM ' . self::TABLE .
                ' WHERE Estado = :Estado');
            $sql->bindValue(':Estado', $Estado);
            $sql->execute();
            $proveedores = $sql->fetchAll();

            $connection = NULL;

            if ($proveedores) {
                return $proveedores;
            } else {
                return false;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }

    }//-- Fin funcion leer todos los proveedores

    // Funcion para leer 1 proveedor
    public static function readProveedor($ID_Proveedor)
    {
        try {
            $connection = new Conexion();

            $sql = $connection->prepare('SELECT Nombre_Proveedor, Telefono, Estado FROM ' . self::TABLE . '
            WHERE ID_Proveedor = :ID_Proveedor');
            $sql->bindValue(':ID_Proveedor', $ID_Proveedor, PDO::PARAM_INT);
            $sql->execute();
            $row = $sql->fetch();

            $connection = NULL;

            if ($row) {
                return $row;
            } else {
                return false;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }

    }//-- Fin funcion leer proveedor


    // Funcion para modificar un proveedor
    public static function updateProveedor($ID_Proveedor, $Nombre_Proveedor, $Telefono, $Estado)
    {
        try {

            $connection = new Conexion();
            $sql = $connection->prepare('UPDATE ' . self::TABLE . ' SET Nombre_Proveedor = :Nombre_Proveedor,
            Telefono = :Telefono,
            Estado = :Estado
            WHERE ID_Proveedor = :ID_Proveedor');
            $sql->bindValue(':Nombre_Proveedor', $Nombre_Proveedor);
            $sql->bindValue(':Telefono', $Telefono);
            $sql->bindValue(':Estado', $Estado);
            $sql->bindValue(':ID_Proveedor', $ID_Proveedor, PDO::PARAM_INT);

            $sql->execute();
            $row = $sql->rowCount();
            $connection = NULL;


            return $row > 0 ? 1 : 0;

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion modificar proveedor

    // Funcion para modificar el estado de un proveedor 
    public static function desactivarProveedor($ID_Proveedor, $Estado)
    {
        try {

            $connection = new Conexion();
            $sql = $connection->prepare('UPDATE ' . self::TABLE . ' SET Estado = :Estado
            WHERE ID_Proveedor = :ID_Proveedor');
            $sql->bindValue(':Estado', $Estado);
            $sql->bindValue(':ID_Proveedor', $ID_Proveedor, PDO::PARAM_INT);
            $sql->execute();
            $row = $sql->rowCount();
            $connection = NULL;

            return $row > 0 ? 1 : 0;

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion modificar estado
}
