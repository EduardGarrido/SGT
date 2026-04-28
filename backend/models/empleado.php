<?php
//Clase con CRUD para administrar empleados

require_once __DIR__ . "/../config/database.php";

class Empleado
{
    const TABLE = 'Empleado';
    // ID_Empleado, Nombre, Puesto, Estado, ID_Contacto_Empleado, ID_Usuario
    // 1 = correcto
    // 0 = no hay registro o no se encontró 
    // -1 = hubo un error en la ejecución

    //Funcion para crear empleado 
    public static function crearEmpleado($connection, $Nombre, $Puesto, $Estado, $ID_Contacto_Empleado, $ID_Usuario)
    {

        try {
            $sql = $connection->prepare(
                'INSERT INTO ' . self::TABLE . ' (Nombre, Puesto, Estado, ID_Contacto_Empleado, ID_Usuario) 
                VALUES (:Nombre, :Puesto, :Estado, :ID_Contacto_Empleado, :ID_Usuario)'
            );
            $sql->bindValue(':Nombre', $Nombre, PDO::PARAM_STR);
            $sql->bindValue(':Puesto', $Puesto, PDO::PARAM_STR);
            $sql->bindValue(':Estado', $Estado, PDO::PARAM_STR);
            $sql->bindValue(':ID_Contacto_Empleado', $ID_Contacto_Empleado, PDO::PARAM_INT);
            $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
            $sql->execute();
            return $connection->lastInsertId();


        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion crear empleado 

    //Funcion para obtener los IDs de empleado y contacto mediante ID de usuario
    public static function getIDsByUsuario($ID_Usuario)
    {
        try {
            $connection = new Conexion();

            $sql = $connection->prepare('SELECT ID_Empleado, ID_Contacto_Empleado FROM ' . self::TABLE . ' 
            WHERE ID_Usuario = :ID_Usuario');
            $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
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

    }//-- Fin funcion obtener IDs

    //Funcion para actualizar empleado
    public static function updateEmpleado($connection, $ID_Empleado, $Nombre, $Puesto, $Estado)
    {

        try {
            $sql = $connection->prepare(
                'UPDATE ' . self::TABLE . ' SET Nombre = :Nombre, Puesto = :Puesto, Estado = :Estado WHERE ID_Empleado = :ID_Empleado'
            );
            $sql->bindValue(':ID_Empleado', $ID_Empleado, PDO::PARAM_INT);
            $sql->bindValue(':Nombre', $Nombre, PDO::PARAM_STR);
            $sql->bindValue(':Puesto', $Puesto, PDO::PARAM_STR);
            $sql->bindValue(':Estado', $Estado, PDO::PARAM_STR);
            $valid = $sql->execute();
            $row = $sql->rowCount();


            if ($row > 0) {
                return 1;
            } else {
                return 0;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion actualizar empleado 

    //Funcion eliminar (desactivar) empleado 
    public static function desactivarEmpleado($connection, $ID_Empleado)
    {
        try {
            $sql = $connection->prepare(
                'UPDATE ' . self::TABLE . ' SET Estado = :Estado WHERE ID_Empleado = :ID_Empleado'
            );
            $sql->bindValue(':ID_Empleado', $ID_Empleado, PDO::PARAM_INT);
            $sql->bindValue(':Estado', 'inactivo');
            $sql->execute();
            return $sql->rowCount() > 0 ? 1 : 0;

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }

    }//-- Fin funcion eliminar empleado
}//--Fin clase Empleado
