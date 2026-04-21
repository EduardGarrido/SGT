<?php
//Clase con CRUD y funciones necesarias para tabla usuarios 

require_once __DIR__ . "/../config/database.php";

class Usuario
{
    const TABLE = 'Usuario';
    // ID_Usuario, Password, Estado
    // 1 = correcto
    // 0 = no hay registro o no se encontró 
    // -1 = hubo un error en la ejecución

    //Funcion para crear un usuario
    public static function crearUsuario($Password, $Estado)
    {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare(
                'INSERT INTO ' . self::TABLE . ' (Password, Estado) VALUES (:Password, :Estado)'
            );
            $sql->bindValue(':Password', password_hash($Password, PASSWORD_DEFAULT));
            $sql->bindValue(':Estado', $Estado, PDO::PARAM_STR);
            $valid = $sql->execute();
            $ID_Usuario = $connection->lastInsertId();
            $connection = NULL;

            if ($valid) {
                return $ID_Usuario;
            } else {
                return -1;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion crear usuario


    //Funcion para leer todos los usuarios y retorna el array 
    public static function readAllUsuario()
    {
        try {
            $connection = new Conexion;

            $sql = $connection->prepare('SELECT u.ID_Usuario, e.Nombre  FROM ' . self::TABLE . ' u 
            INNER JOIN Empleado e ON e.ID_Usuario = u.ID_Usuario');
            $sql->execute();
            $usuarios = $sql->fetchAll();
            $connection = NULL;

            if ($usuarios) {
                return $usuarios;
            } else {
                return 0;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion leer todos los usuarios

    //Funcion para leer toda la información de un usuario 
    public static function readInfoUsuario($ID_Usuario)
    {
        try {
            $connection = new Conexion;

            $sql = $connection->prepare('SELECT e.Nombre, e.Puesto, c.Telefono, c.Correo,
            c.Calle, c.Colonia, c.Codigo_Postal FROM Empleado e 
            INNER JOIN Contacto_Empleado c ON c.ID_Contacto_Empleado = e.ID_Contacto_Empleado
            WHERE e.ID_Usuario = :ID_Usuario');
            $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
            $sql->execute();
            $usuario = $sql->fetch();
            $connection = NULL;

            if ($usuario) {
                return $usuario;
            } else {
                return 0;
            }
        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion info de usuario

    // Funcion leer un usuario especifico
    public static function readUsuario($ID_Usuario)
    {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare('SELECT Estado FROM ' . self::TABLE . ' WHERE ID_Usuario = :ID_Usuario');
            $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
            $sql->execute();
            $usuario = $sql->fetch();
            $connection = NULL;

            if ($usuario) {
                return $usuario;
            } else {
                return 0;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion leer un usuario

    //Funcion actualizar un usuario
    public static function updateUsuario($ID_Usuario, $Password, $Estado)
    {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare(
                'UPDATE ' . self::TABLE . ' SET Password = :Password, Estado = :Estado WHERE ID_Usuario = :ID_Usuario'
            );
            $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
            $sql->bindValue(':Password', password_hash($Password, PASSWORD_DEFAULT));
            $sql->bindValue(':Estado', $Estado, PDO::PARAM_STR);
            $valid = $sql->execute();
            $row = $sql->rowCount();
            $connection = NULL;

            if ($valid) {
                if ($row > 0) {
                    return 1; // actualizo usuario
                } else {
                    return 0; // no actualizo, usuario no encontrado
                }
            } else {
                return -1; // error
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion actualizar usuario

    // Funcion eliminar usuario
    public static function deleteUsuario($ID_Usuario)
    {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare('DELETE FROM ' . self::TABLE . ' WHERE ID_Usuario = :ID_Usuario');
            $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
            $valid = $sql->execute();
            $row = $sql->rowCount();
            $connection = NULL;

            if ($valid) {
                if ($row > 0) {
                    return 1; // usuario borrado
                } else {
                    return 0; // no borro o usuario no encontrado
                }
            } else {
                return -1; // error al ejecutar $sql
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion eliminar usuario
}