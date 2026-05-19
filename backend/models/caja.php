<?php

//Rutas de caja

require_once __DIR__ . "/../config/database.php";

class Caja
{

    const TABLE = "Caja";
    // ID_Caja, Fecha, Hora, Monto_Inicial, Monto_Final, Estado, Estado_Final, ID_Usuario, Hora_Final

    // Funcion para abrir (crear) caja
    public static function openCaja($Fecha, $Hora, $Monto_Inicial, $Estado, $ID_Usuario)
    {
        try {
            $connection = new Conexion();

            $sql = $connection->prepare('INSERT INTO ' . self::TABLE . ' (Fecha, Hora, Monto_Inicial,
            Estado, ID_Usuario) VALUES (:Fecha, :Hora, :Monto_Inicial,
            :Estado, :ID_Usuario)');
            $sql->bindValue(':Fecha', $Fecha);
            $sql->bindValue(':Hora', $Hora);
            $sql->bindValue(':Monto_Inicial', $Monto_Inicial);
            $sql->bindValue(':Estado', $Estado);
            $sql->bindValue(':ID_Usuario', $ID_Usuario);
            $sql->execute();

            $ID_Caja = $connection->lastInsertId();
            $connection = NULL;


            return $ID_Caja;



        } catch (PDOException $e) {
            throw new Exception("Hubo un error " . $e->getMessage());
        }
    }//-- Fin funcion abrir caja


    //Funcion cerrar caja
    public static function closeCaja($ID_Caja, $Monto_Final, $Monto_Final_Sistema, $Estado_Final, $Hora_Final)
    {
        try {
            $Estado = 'cerrada';
            $connection = new Conexion();

            $sql = $connection->prepare("UPDATE " . self::TABLE . " SET Monto_Final
            = :Monto_Final, Monto_Final_Sistema = :Monto_Final_Sistema, Estado = :Estado, Estado_Final = :Estado_Final, Hora_Final = :Hora_Final 
            WHERE ID_Caja = :ID_Caja");
            $sql->bindValue(":ID_Caja", $ID_Caja, PDO::PARAM_INT);
            $sql->bindValue(":Monto_Final", $Monto_Final);
            $sql->bindValue(":Monto_Final_Sistema", $Monto_Final_Sistema);
            $sql->bindValue(":Estado", $Estado);
            $sql->bindValue(":Estado_Final", $Estado_Final);
            $sql->bindValue(":Hora_Final", $Hora_Final);
            $sql->execute();

            $row = $sql->rowCount();
            $connection = NULL;


            return $row > 0 ? 1 : 0;

        } catch (PDOException $e) {
            throw new Exception("Hubo un error " . $e->getMessage());
        }
    }//-- Fin funcion cerrar caja

    // Funcion para obtener el monto inicial de una caja 
    public static function getMontoInicial($ID_Caja)
    {
        try {
            $connection = new Conexion;

            $sql = $connection->prepare('SELECT Monto_Inicial FROM ' . self::TABLE . ' 
            WHERE ID_Caja = :ID_Caja');
            $sql->bindValue(':ID_Caja', $ID_Caja, PDO::PARAM_INT);
            $sql->execute();
            $monto = $sql->fetch();
            $connection = NULL;

            if ($monto) {
                return $monto;
            } else {
                return false;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion obtener monto

    // Funcion para obtener el monto final de una caja 
    public static function getMontoFinal($ID_Caja)
    {
        try {
            $connection = new Conexion;

            $sql = $connection->prepare('SELECT SUM(Monto) FROM Venta 
            WHERE ID_Caja = :ID_Caja');
            $sql->bindValue(':ID_Caja', $ID_Caja, PDO::PARAM_INT);
            $sql->execute();
            $monto = $sql->fetch();
            $connection = NULL;

            if ($monto) {
                return $monto;
            } else {
                return false;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion obtener monto final


    // Funcion para saber si existe alguna caja abierta
    public static function cajaAbierta()
    {
        try {
            $connection = new Conexion();
            $sql = $connection->prepare('SELECT ID_Caja, Monto_Inicial FROM ' . self::TABLE . ' WHERE Estado = :Estado');
            $sql->bindValue(':Estado', 'abierta');
            $sql->execute();
            $caja = $sql->fetch();
            $connection = NULL;

            return $caja ? $caja : false;

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion caja abierta


    // Funcion para leer caja
    public static function readCaja()
    {
        try {
            $connection = new Conexion;

            $sql = $connection->prepare('SELECT c.ID_Caja, c.Fecha, c.Hora, c.Monto_Inicial, c.Monto_Final,
            c.Estado_Final, c.Hora_Final, e.Nombre  FROM ' . self::TABLE . ' c
            INNER JOIN Empleado e ON e.ID_Usuario = c.ID_Usuario  
            WHERE Fecha = (SELECT MAX(Fecha) FROM Caja) AND Hora = (SELECT MIN(Hora) FROM Caja)');
            $sql->execute();
            $producto = $sql->fetch();
            $connection = NULL;

            if ($producto) {
                return $producto;
            } else {
                return false;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }

    }

}//-- Fin clase Caja