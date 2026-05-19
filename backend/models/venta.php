<?php

// Clase para venta 

require_once __DIR__ . '/../config/database.php';

class Venta
{
    const TABLE = 'Venta';


    // Funcion para crear venta
    public static function openVenta($Fecha, $ID_Caja)
    {

        try {
            $Estado = 'enproceso';

            $connection = new Conexion;
            $sql = $connection->prepare('INSERT INTO ' . self::TABLE . ' (Fecha, Hora, Monto, Estado, ID_Caja) 
            VALUES(:Fecha, :Hora, :Monto, :Estado, :ID_Caja)');
            $sql->bindValue(':Fecha', $Fecha, PDO::PARAM_STR);
            $sql->bindValue(':Hora', '00:00:00', PDO::PARAM_STR);
            $sql->bindValue(':Monto', '0', PDO::PARAM_STR);
            $sql->bindValue(':Estado', $Estado, PDO::PARAM_STR);
            $sql->bindValue(':ID_Caja', $ID_Caja, PDO::PARAM_INT);
            $sql->execute();
            return $connection->lastInsertId();

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion crear venta


    // Funcion para agregar producto a detalle
    public static function addProductoVenta($connection, $ID_Venta, $ID_Producto, $Cantidad, $Precio_Unitario)
    {
        try {
            $sql = $connection->prepare('INSERT INTO Detalle_Venta (Cantidad, Precio_Unitario, ID_Venta, ID_Producto)
            VALUES (:Cantidad, :Precio_Unitario, :ID_Venta, :ID_Producto)');
            $sql->bindValue(':Cantidad', $Cantidad, PDO::PARAM_INT);
            $sql->bindValue(':Precio_Unitario', $Precio_Unitario);
            $sql->bindValue(':ID_Venta', $ID_Venta, PDO::PARAM_INT);
            $sql->bindValue(':ID_Producto', $ID_Producto, PDO::PARAM_INT);
            $sql->execute();
            return $connection->lastInsertId();
        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion agregar producto a detalle
/*
        // Funcion para quitar producto del detalle
        public static function removeProductoVenta($ID_Detalle_Venta)
        {
            try {
                $connection = new Conexion();
                $sql = $connection->prepare('DELETE FROM Detalle_Venta WHERE ID_Detalle_Venta = :ID_Detalle_Venta');
                $sql->bindValue(':ID_Detalle_Venta', $ID_Detalle_Venta, PDO::PARAM_INT);
                $sql->execute();
                return $sql->rowCount() > 0 ? 1 : 0;
            } catch (PDOException $e) {
                throw new Exception("Hubo un error: " . $e->getMessage());
            }
        }//-- Fin funcion quitar producto de detalle
    */

    // Funcion para obtener detalles de una venta
    public static function getDetalleVenta($ID_Venta)
    {
        try {
            $connection = new Conexion();
            $sql = $connection->prepare('SELECT ID_Producto, Cantidad FROM Detalle_Venta
        WHERE ID_Venta = :ID_Venta');
            $sql->bindValue(':ID_Venta', $ID_Venta, PDO::PARAM_INT);
            $sql->execute();
            return $sql->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion obtener detalle venta

    // Funcion para completar venta 
    public static function completeVenta($ID_Venta, $Hora, $Monto, $Forma_Pago)
    {
        try {
            $Estado = 'finalizada';
            $connection = new Conexion();

            $sql = $connection->prepare('UPDATE ' . self::TABLE . ' SET Hora = :Hora,
            Monto = :Monto, Estado = :Estado, Forma_Pago = :Forma_Pago
            WHERE ID_Venta = :ID_Venta');
            $sql->bindValue(':Hora', $Hora, PDO::PARAM_STR);
            $sql->bindValue(':Monto', $Monto, PDO::PARAM_STR);
            $sql->bindValue(':Estado', $Estado, PDO::PARAM_STR);
            $sql->bindValue(':Forma_Pago', $Forma_Pago, PDO::PARAM_STR);
            $sql->bindValue(':ID_Venta', $ID_Venta, PDO::PARAM_INT);
            $sql->execute();

            $row = $sql->rowCount();

            return $row > 0 ? 1 : 0;


        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion para completar venta


    // Funcion para cancelar venta
    public static function cancelVenta($ID_Venta)
    {
        try {
            $connection = new Conexion();
            $sql = $connection->prepare('UPDATE ' . self::TABLE . ' SET Estado = :Estado
        WHERE ID_Venta = :ID_Venta');
            $sql->bindValue(':Estado', 'cancelada', PDO::PARAM_STR);
            $sql->bindValue(':ID_Venta', $ID_Venta, PDO::PARAM_INT);
            $sql->execute();
            return $sql->rowCount() > 0 ? 1 : 0;
        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- fin funcion cancelar venta


    public static function readAllVentas($ID_Caja)
    {
        try {
            $connection = new Conexion();
            $sql = $connection->prepare('SELECT Fecha, Hora, Monto  FROM' . self::TABLE . '
        WHERE ID_Caja = :ID_Caja');
            $sql->bindValue(':ID_Caja', $ID_Caja, PDO::PARAM_INT);
            $sql->execute();
            $ventas = $sql->fetchAll();
            $connection = NULL;

            if ($ventas) {
                return $ventas;
            } else {
                return false;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }
}