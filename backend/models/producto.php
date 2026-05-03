<?php

require_once __DIR__ . "/../config/database.php";

class Producto
{
    const TABLE = 'Producto';
    // ID_Producto, Nombre_Producto, Precio, Cantidad, Unidad_Medida, Estado, Cantidad_Minima, ID_Categoria, ID_Proveedor
    // 1 = correcto
    // 0 = no hay registro o no se encontró 
    // -1 = hubo un error en la ejecución


    // Funcion para crear un Producto
    public static function crearProducto(
        $Nombre_Producto,
        $Precio,
        $Cantidad,
        $Unidad_Medida,
        $Estado,
        $Cantidad_Minima,
        $ID_Categoria,
        $ID_Proveedor
    ) {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare(
                'INSERT INTO ' . self::TABLE . ' (Nombre_Producto, Precio, Cantidad, Unidad_Medida, 
                Estado, Cantidad_Minima, ID_Categoria, ID_Proveedor) 
                VALUES (:Nombre_Producto, :Precio, :Cantidad, :Unidad_Medida, 
                :Estado, :Cantidad_Minima, :ID_Categoria, :ID_Proveedor)'
            );
            $sql->bindValue(':Nombre_Producto', $Nombre_Producto, PDO::PARAM_STR);
            $sql->bindValue(':Precio', $Precio, PDO::PARAM_STR);
            $sql->bindValue(':Cantidad', $Cantidad, PDO::PARAM_INT);
            $sql->bindValue(':Unidad_Medida', $Unidad_Medida, PDO::PARAM_STR);
            $sql->bindValue(':Estado', $Estado, PDO::PARAM_STR);
            $sql->bindValue(':Cantidad_Minima', $Cantidad_Minima, PDO::PARAM_INT);
            $sql->bindValue(':ID_Categoria', $ID_Categoria, PDO::PARAM_INT);
            $sql->bindValue(':ID_Proveedor', $ID_Proveedor, PDO::PARAM_INT);
            $sql->execute();
            $ID_Producto = $connection->lastInsertId();
            $connection = NULL;

            return $ID_Producto;

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//-- Fin funcion crear producto


    //Funcion para leer todos los productos 
    public static function readAllProductos()
    {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare('SELECT p.ID_Producto, p.Nombre_Producto, p.Precio, p.Cantidad, p.Unidad_Medida, p.Estado,
            c.Nombre_Categoria, d.Nombre_Proveedor  FROM ' . self::TABLE . ' p 
            INNER JOIN Categoria c ON c.ID_Categoria = p.ID_Categoria
            INNER JOIN Proveedor d ON d.ID_Proveedor = p.ID_Proveedor');
            $sql->execute();
            $productos = $sql->fetchAll();
            $connection = NULL;

            if ($productos) {
                return $productos;
            } else {
                return false;
            }

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//--Fin funcion leer todos los productos 

    //Funcion para leer producto 
    public static function readProducto($ID_Producto)
    {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare('SELECT p.ID_Producto, p.Nombre_Producto, p.Precio, p.Cantidad, p.Unidad_Medida, p.Estado,
            p.Cantidad_Minima, c.ID_Categoria, c.Nombre_Categoria, d.ID_Proveedor, d.Nombre_Proveedor  FROM ' . self::TABLE . ' p 
            INNER JOIN Categoria c ON c.ID_Categoria = p.ID_Categoria
            INNER JOIN Proveedor d ON d.ID_Proveedor = p.ID_Proveedor
            WHERE p.ID_Producto = :ID_Producto');
            $sql->bindValue(':ID_Producto', $ID_Producto, PDO::PARAM_INT);
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
    }//--Fin funcion leer producto 

    //Funcion actualizar producto
    public static function updateProducto(
        $ID_Producto,
        $Nombre_Producto,
        $Precio,
        $Cantidad,
        $Unidad_Medida,
        $Estado,
        $Cantidad_Minima,
        $ID_Categoria,
        $ID_Proveedor
    ) {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare(
                'UPDATE ' . self::TABLE . ' SET Nombre_Producto = :Nombre_Producto, Precio = :Precio, 
                Cantidad = :Cantidad, Unidad_Medida = :Unidad_Medida, Estado = :Estado, 
                Cantidad_Minima = :Cantidad_Minima, ID_Categoria = :ID_Categoria, ID_Proveedor = :ID_Proveedor
                WHERE ID_Producto = :ID_Producto'
            );
            $sql->bindValue(':ID_Producto', $ID_Producto, PDO::PARAM_INT);
            $sql->bindValue(':Nombre_Producto', $Nombre_Producto, PDO::PARAM_STR);
            $sql->bindValue(':Precio', $Precio, PDO::PARAM_STR);
            $sql->bindValue(':Cantidad', $Cantidad, PDO::PARAM_INT);
            $sql->bindValue(':Unidad_Medida', $Unidad_Medida, PDO::PARAM_STR);
            $sql->bindValue(':Estado', $Estado, PDO::PARAM_STR);
            $sql->bindValue(':Cantidad_Minima', $Cantidad_Minima, PDO::PARAM_INT);
            $sql->bindValue(':ID_Categoria', $ID_Categoria, PDO::PARAM_INT);
            $sql->bindValue(':ID_Proveedor', $ID_Proveedor, PDO::PARAM_INT);

            $sql->execute();
            $row = $sql->rowCount();
            $connection = NULL;

            return $row > 0 ? 1 : 0;

        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//--Fin funcion actualizar producto 



    /*
    public static function deleteProducto($ID_Producto) {

        try {
            $connection = new Conexion;

            $sql = $connection->prepare('DELETE FROM ' . self::TABLE . ' WHERE ID_Producto = :ID_Producto');
            $sql->bindValue(':ID_Producto', $ID_Producto, PDO::PARAM_INT);
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
    */
}

