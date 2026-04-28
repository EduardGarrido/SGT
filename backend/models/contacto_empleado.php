<?php
// Clase Contacto Empleado, crea y actualiza información del contacto 

require_once __DIR__ . "/../config/database.php";

class Contacto_Empleado
{
    const TABLE = 'Contacto_Empleado';
    // ID_Contacto_Empleado, Telefono, Correo, Calle, Colonia, Codigo_Postal
    // 1 = correcto
    // 0 = no hay registro o no se encontró 
    // -1 = hubo un error en la ejecución


    //Funcion Crear informacion de contacto de usuario 
    public static function crearContacto($connection, $Telefono, $Correo, $Calle, $Colonia, $Codigo_Postal)
    {

        try {
            $sql = $connection->prepare(
                'INSERT INTO ' . self::TABLE . ' (Telefono, Correo, Calle, Colonia, Codigo_Postal) 
                VALUES (:Telefono, :Correo, :Calle, :Colonia, :Codigo_Postal)'
            );
            $sql->bindValue(':Telefono', $Telefono, PDO::PARAM_STR);
            $sql->bindValue(':Correo', $Correo, PDO::PARAM_STR);
            $sql->bindValue(':Calle', $Calle, PDO::PARAM_STR);
            $sql->bindValue(':Colonia', $Colonia, PDO::PARAM_STR);
            $sql->bindValue(':Codigo_Postal', $Codigo_Postal, PDO::PARAM_STR);
            $sql->execute();
            return $connection->lastInsertId();


        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion crear info de contacto

    // Funcion actualizar info de contacto de usuario 
    public static function updateContacto($connection, $ID_Contacto_Empleado, $Telefono, $Correo, $Calle, $Colonia, $Codigo_Postal)
    {

        try {
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
            if ($valid) {
                if ($row > 0) {
                    return 1;
                } else {
                    return 0;
                }
            } else {
                return -1;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin actualizar contacto

}//--Fin clase Contacto_Empleado
