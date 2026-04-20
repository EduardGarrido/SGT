<?php 
$backendPath = dirname(__DIR__, 1);

require_once $backendPath . '/../vendor/autoload.php';

// safeLoad() skips missing files — Docker injects vars via env_file instead of a file
Dotenv\Dotenv::createImmutable(dirname(__DIR__, 2))->safeLoad();

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
           PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, #Cuando haya un error retornar excep en vez de false
           PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC #Obtener los datos de la db en array asociativo con nombres de las columnas
         );
         parent::__construct('mysql:host='.$_ENV['DB_HOST'].';port='.($_ENV['DB_PORT'] ?? '3306').';dbname='.$_ENV['DB_NAME'], $_ENV['DB_USER'], $_ENV['DB_PASS'], $options);
      } catch(PDOException $e) {
         echo 'Ha surgido un error y no se puede conectar a la base de datos. Detalle: ' . $e->getMessage();
         exit;
      }
   } 
} 
