<?php 
$backendPath = __DIR__ . '/..';

require_once $backendPath . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable($backendPath);
$dotenv->load();

date_default_timezone_set('America/Mazatlan');

if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

class Conexion extends PDO { 
   public function __construct() {
      //Sobreescribo el método constructor de la clase PDO.
      try {
         $options = array(
           Pdo\Mysql::ATTR_INIT_COMMAND => 'SET NAMES utf8',
         );
         parent::__construct('mysql'.':host='.$_ENV['DB_HOST'].';dbname='.$_ENV['DB_NAME'], $_ENV['DB_USER'], $_ENV['DB_PASS'], $options);
      } catch(PDOException $e) {
         echo 'Ha surgido un error y no se puede conectar a la base de datos. Detalle: ' . $e->getMessage();
         exit;
      }
   } 
} 
