<?php

// Clase con CRUD para categorias

require_once __DIR__ . '/../config/database.php';

class Categoria
{
    const TABLE = "Categoria";

    // Funcion para crear una nueva categoria
    public static function createCategoria($Nombre_Categoria)
    {
        try {
            $connection = new Conexion();

            $sql = $connection->prepare('INSERT INTO ' . self::TABLE . ' (Nombre_Categoria, Estado)
            VALUES (:Nombre_Categoria, :Estado)');
            $sql->bindValue(':Nombre_Categoria', $Nombre_Categoria);
            $sql->bindValue(':Estado', 'activo');
            $sql->execute();
            $ID_Categoria = $connection->lastInsertId();
            $connection = NULL;

            return $ID_Categoria;


        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion crear categoria

    // Funcion para leer todas las categorias (con conteo de productos asociados)
    public static function readAllCategoria()
    {
        try {
            $connection = new Conexion();

            $sql = $connection->prepare('SELECT c.ID_Categoria, c.Nombre_Categoria, c.Estado,
            COUNT(p.ID_Producto) AS Productos
            FROM ' . self::TABLE . ' c
            LEFT JOIN Producto p ON p.ID_Categoria = c.ID_Categoria
            GROUP BY c.ID_Categoria, c.Nombre_Categoria, c.Estado
            ORDER BY c.ID_Categoria');
            $sql->execute();
            $categorias = $sql->fetchAll();

            $connection = NULL;

            if ($categorias) {
                return $categorias;
            } else {
                return false;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }

    }//-- Fin funcion leer todas las categorias

    // Funcion para leer 1 categoria
    public static function readCategoria($ID_Categoria)
    {
        try {
            $connection = new Conexion();

            $sql = $connection->prepare('SELECT Nombre_Categoria, Estado FROM ' . self::TABLE . '
            WHERE ID_Categoria = :ID_Categoria');
            $sql->bindValue(':ID_Categoria', $ID_Categoria, PDO::PARAM_INT);
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

    }//-- Fin funcion leer categoria


    // Funcion para modificar una categoria
    public static function updateCategoria($ID_Categoria, $Nombre_Categoria, $Estado)
    {
        try {

            $connection = new Conexion();
            $sql = $connection->prepare('UPDATE ' . self::TABLE . ' SET Nombre_Categoria = :Nombre_Categoria,
            Estado = :Estado
            WHERE ID_Categoria = :ID_Categoria');
            $sql->bindValue(':Nombre_Categoria', $Nombre_Categoria);
            $sql->bindValue(':Estado', $Estado);
            $sql->bindValue(':ID_Categoria', $ID_Categoria, PDO::PARAM_INT);

            $sql->execute();
            $row = $sql->rowCount();
            $connection = NULL;


            return $row > 0 ? 1 : 0;

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion modificar categoria

    // Funcion para desactivar categoria (soft-delete)
    public static function desactivarCategoria($ID_Categoria)
    {
        try {
            $connection = new Conexion();

            $sql = $connection->prepare('UPDATE ' . self::TABLE . ' SET Estado = :Estado
            WHERE ID_Categoria = :ID_Categoria');
            $sql->bindValue(':Estado', 'inactivo');
            $sql->bindValue(':ID_Categoria', $ID_Categoria, PDO::PARAM_INT);
            $sql->execute();
            $row = $sql->rowCount();
            $connection = NULL;

            return $row > 0 ? 1 : 0;

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion desactivar categoria
}
