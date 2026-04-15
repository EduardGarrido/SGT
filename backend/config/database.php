<?php 
require_once __DIR__ .'/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

date_default_timezone_set("America/Mazatlan");

class Conexion extends PDO { 
   public function __construct() {
      //Sobreescribo el método constructor de la clase PDO.
      try {
         $options = array(
           Pdo\Mysql::ATTR_INIT_COMMAND => 'SET NAMES utf8',
           PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, #Cuando haya un error retornar excep en vez de false
           PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC #Obtener los datos de la db en array asociativo con nombres de las columnas
         );
         parent::__construct('mysql'.':host='.$_ENV['DB_HOST'].';dbname='.$_ENV['DB_NAME'], $_ENV['DB_USER'], $_ENV['DB_PASS'], $options);
      } catch(PDOException $e) {
         echo 'Ha surgido un error y no se puede conectar a la base de datos. Detalle: ' . $e->getMessage();
         exit;
      }
   } 
} 
?>