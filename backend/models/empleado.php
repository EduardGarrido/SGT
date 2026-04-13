<?php

if($_ENV['APP_ENV'] === 'development') {
    error_reporting(-1);
    ini_set("display_errors", 1);
}

require_once __DIR__ . "/../config/database.php";

class Empleado {
    const TABLE = 'Empleado';

    public function crearUsuario($Password, $Estado) {

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
    }

    public function readUsuario($ID_Usuario) {
        try {
            $connection = new Conexion;

            $sql = $connection->prepare('SELECT * FROM ' . self::TABLE . ' WHERE ID_Usuario = :ID_Usuario');
            $sql->bindValue(':ID_Usuario', $ID_Usuario, PDO::PARAM_INT);
            $sql->execute();
            $usuario = $sql->fetch(PDO::FETCH_ASSOC);
            $connection = NULL;

            if ($usuario) {
                return $usuario;
                // TODO
            } else {
                return;
            }
            } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }

    public function updateUsuario($ID_Usuario, $Password, $Estado) {
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
                    return 0; // no actualizo
                }
            } else {
                return -1; // error
            }
        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }

    public function deleteUsuario($ID_Usuario) {
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
                return 2; // error al ejecutar $sql
            }
            $connection = NULL;
        } catch (PDOException $e) {
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }
}
?>