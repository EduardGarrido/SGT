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
    public static function crearUsuario($connection, $Password, $Estado)
    {

        try {
            $sql = $connection->prepare(
                'INSERT INTO ' . self::TABLE . ' (Password, Estado) VALUES (:Password, :Estado)'
            );
            $sql->bindValue(':Password', password_hash($Password, PASSWORD_DEFAULT));
            $sql->bindValue(':Estado', $Estado, PDO::PARAM_STR);
            $sql->execute();
            return $connection->lastInsertId();


        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion crear usuario


    //Funcion para leer todos los usuarios y retorna el array 
    public static function readAllUsuario()
    {
        try {
            $connection = new Conexion;

            $sql = $connection->prepare(
                'SELECT u.ID_Usuario, e.Nombre, u.Estado FROM ' . self::TABLE . ' u 
                INNER JOIN Empleado e ON e.ID_Usuario = u.ID_Usuario WHERE e.Estado = "activo"'
            );
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

            $sql = $connection->prepare(
                'SELECT e.Nombre, e.Puesto, u.Estado, c.Telefono, c.Correo,
                c.Calle, c.Colonia, c.Codigo_Postal FROM Empleado e 
                INNER JOIN Contacto_Empleado c ON c.ID_Contacto_Empleado = e.ID_Contacto_Empleado
                INNER JOIN Usuario u ON u.ID_Usuario = e.ID_Usuario
                WHERE e.ID_Usuario = :ID_Usuario'
            );
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

    //Funcion actualizar estado de usuario
    public static function updateEstado($ID_Usuario, $Estado, $connection = NULL)
    {

        try {
            $conn = $connection ?? new Conexion;


            $sql = $conn->prepare(
                'UPDATE ' . self::TABLE . ' SET Estado = :Estado WHERE ID_Usuario = :ID_Usuario'
            );
            $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
            $sql->bindValue(':Estado', $Estado, PDO::PARAM_STR);
            $sql->execute();
            $row = $sql->rowCount();
            $conn = NULL;

            if ($row > 0) {
                return 1;
            } else {
                return 0;

            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion actualizar estado de usuario

    //Funcion actualizar password de usuario
    public static function updatePassword($ID_Usuario, $Password)
    {

        try {
            $connection = new Conexion();

            $sql = $connection->prepare(
                'UPDATE ' . self::TABLE . ' SET Password = :Password WHERE ID_Usuario = :ID_Usuario'
            );
            $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
            $sql->bindValue(':Password', password_hash($Password, PASSWORD_DEFAULT));
            $sql->execute();
            $row = $sql->rowCount();
            $connection = NULL;


            if ($row > 0) {
                return 1;
            } else {
                return 0;
            }


        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion password estado de usuario

}//--Fin clase Usuario