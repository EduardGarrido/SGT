<?php
require_once __DIR__ . "/../config/database.php";


class Login{
    const TABLE = 'Usuario';


    public static function validar($ID_Usuario, $Password){
    
        try{
        $connection = new Conexion;
        
            $sql = $connection->prepare('SELECT u.Password, u.Estado, e.Puesto FROM '. self::TABLE . ' u 
            INNER JOIN Empleado e ON e.ID_Usuario = u.ID_Usuario
            WHERE u.ID_Usuario = :ID_Usuario');
            $sql->bindValue(':ID_Usuario', $ID_Usuario);
            $sql->execute();
            $row = $sql->fetch();
            $connection = NULL;

            if($row){
                //password_verify($Password, $row['Password'])
                if(password_verify($Password, $row['Password']) && $row['Estado'] == 'autorizado'){
                    return $row;
                }else{
                    return 0;
                }
            }else{
                return -1;
            }
                //password_verify($Password, $row['Password'])
            if(password_verify($Password, $row['Password']) && $row['Estado'] == 'autorizado'){
                return $row;
            }  
               
            return 0;
            
        }catch(PDOException $e){
            throw new Exception("Hubo un error: " . $e->getMessage());
        }
    }//---- Fin Funcion Validar 
}