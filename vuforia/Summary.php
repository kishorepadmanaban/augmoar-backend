<?php

require_once 'HTTP/Request2.php';
require_once 'SignatureBuilder.php';

$targetId = $_GET['target_id'];
$instance = new Summary($targetId);

// See the Vuforia Web Services Developer API Specification - https://developer.vuforia.com/resources/dev-guide/retrieving-target-cloud-database
// The GetTarget sample demonstrates how to query a single target by target id.
class Summary{

	//Server Keys
	private $access_key 	= "c3abfd916b3ccc42c7328641f6dc4a290853ddfc";
	private $secret_key 	= "46fae2f9393785fe36e952563c3eccc32449aa4e";

	// private $targetId 	= "042166d48e7e4390befeb68a82699e9b";
	private $url 		= "https://vws.vuforia.com";
	private $requestPath = "/summary/";// . $targetId;
	private $request;

	function Summary($id){

		$this->targetId = $id;

		$this->requestPath = $this->requestPath . $this->targetId;

		$this->execGetTarget();
	}

	private function execGetTarget(){

		$this->request = new HTTP_Request2();
		$this->request->setMethod( HTTP_Request2::METHOD_GET );

		$this->request->setConfig(array(
				'ssl_verify_peer' => false
		));

		$this->request->setURL( $this->url . $this->requestPath );

		// Define the Date and Authentication headers
		$this->setHeaders();


		try {

			$response = $this->request->send();

			if (200 == $response->getStatus()) {
				echo $response->getBody();
			} else {
				echo $response->getBody();
			}
		} catch (HTTP_Request2_Exception $e) {
			echo 'Error: ' . $e->getMessage();
		}


	}

	private function setHeaders(){
		$sb = 	new SignatureBuilder();
		$date = new DateTime("now", new DateTimeZone("GMT"));

		// Define the Date field using the proper GMT format
		$this->request->setHeader('Date', $date->format("D, d M Y H:i:s") . " GMT" );
		// Generate the Auth field value by concatenating the public server access key w/ the private query signature for this request
		$this->request->setHeader("Authorization" , "VWS " . $this->access_key . ":" . $sb->tmsSignature( $this->request , $this->secret_key ));

	}
}

?>
