<?php
ini_set('display_errors', 1);
require_once 'HTTP/Request2.php';
require_once 'SignatureBuilder.php';

// See the Vuforia Web Services Developer API Specification - https://developer.vuforia.com/resources/dev-guide/retrieving-target-cloud-database
// The PostNewTarget sample demonstrates how to update the attributes of a target using a JSON request body. This example updates the target's metadata.
$name = $_GET['name'];
$location = $_GET['location'];
$instance = new PostNewTarget($name,$location);


class PostNewTarget{

	//Server Keys
	private $access_key 	= "c3abfd916b3ccc42c7328641f6dc4a290853ddfc";
	private $secret_key 	= "46fae2f9393785fe36e952563c3eccc32449aa4e";

	//private $targetId 		= "eda03583982f41cdbe9ca7f50734b9a1";
	private $url 			= "https://vws.vuforia.com";
	private $requestPath 	= "/targets";
	private $request;       // the HTTP_Request2 object
	private $jsonRequestObject;
	private $result;

	private $targetName; 	//= "nippon";
	private $imageLocation; 	//= "http://augmo.net/src/q.jpg";

	function __construct($name,$location){

		$this->imageLocation = $location;

		$this->targetName = $name;

		$this->jsonRequestObject = json_encode( array( 'width'=>1.0 , 'name'=>$this->targetName , 'image'=>$this->getImageAsBase64() , 'application_metadata'=>base64_encode("Vuforia test metadata") , 'active_flag'=>1 ) );

		$this->execPostNewTarget();

	}

	function getImageAsBase64(){

		$file = file_get_contents( $this->imageLocation );

		if( $file ){

			$file = base64_encode( $file );
		}

		return $file;

	}

	public function execPostNewTarget(){

		$this->request = new HTTP_Request2();
		$this->request->setMethod( HTTP_Request2::METHOD_POST );
		$this->request->setBody( $this->jsonRequestObject );

		$this->request->setConfig(array(
				'ssl_verify_peer' => false
		));

		$this->request->setURL( $this->url . $this->requestPath );

		// Define the Date and Authentication headers
		$this->setHeaders();


		try {

			$response = $this->request->send();

			if (200 == $response->getStatus() || 201 == $response->getStatus() ) {
				echo $response->getBody();
			} else {
				echo  $response->getBody();
			}
		} catch (HTTP_Request2_Exception $e) {
			echo $e->getMessage();
		}
	}


	private function setHeaders(){
		$sb = 	new SignatureBuilder();
		$date = new DateTime("now", new DateTimeZone("GMT"));

		// Define the Date field using the proper GMT format
		$this->request->setHeader('Date', $date->format("D, d M Y H:i:s") . " GMT" );

		$this->request->setHeader("Content-Type", "application/json" );
		// $this->request->setHeader("Access-Control-Allow-Origin: * ");
		// $this->request->setHeader("Access-Control-Allow-Credentials: true" );
		// $this->request->setHeader("Access-Control-Max-Age: 86400" );
		// $this->request->setHeader("Access-Control-Allow-Methods: GET, POST, OPTIONS" );
		// Generate the Auth field value by concatenating the public server access key w/ the private query signature for this request
		$this->request->setHeader("Authorization" , "VWS " . $this->access_key . ":" . $sb->tmsSignature( $this->request , $this->secret_key ));

	}
}

?>
