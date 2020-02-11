<?php

require_once 'HTTP/Request2.php';
require_once 'SignatureBuilder.php';

$targetId = $_GET['target_id'];
$metadata = $_GET['metadata'];
$instance = new UpdateTarget(null,null,$metadata,$targetId);

// See the Vuforia Web Services Developer API Specification - https://developer.vuforia.com/resources/dev-guide/retrieving-target-cloud-database
// The UpdateTarget sample demonstrates how to update the attributes of a target using a JSON request body. This example updates the target's metadata.

class UpdateTarget{

	//Server Keys
	private $access_key 	= "c3abfd916b3ccc42c7328641f6dc4a290853ddfc";
	private $secret_key 	= "46fae2f9393785fe36e952563c3eccc32449aa4e";

	private $targetId;
	private $url 			= "https://vws.vuforia.com";
	private $requestPath 	= "/targets/";
	private $request;
	private $jsonBody 		= "";
	private $meta;
	private $name;
	private $imageLocation;

	function __construct($targetName,$image,$metadata,$target){
		$this->imageLocation = $image;
		$this->meta = $metadata;
		$this->targetId = $target;
		$this->name = $targetName;

		$this->requestPath = $this->requestPath . $this->targetId;

		if(($this->name==null) && ($this->imageLocation==null) && $this->meta)
		{
			$metadata64 = base64_encode($this->meta);

			$this->jsonBody = json_encode( array( 'application_metadata' => $metadata64 ));

			$this->execUpdateTarget();
		}
		elseif (($this->meta==null) && ($this->imageLocation==null) && $this->name) {

			$this->jsonBody = json_encode( array('name'=>$this->name));

			$this->execUpdateTarget();
		}
		elseif (($this->meta==null) && ($this->name==null) && $this->imageLocation) {

			$this->jsonBody = json_encode( array('width'=>1 ,'image'=>$this->getImageAsBase64(), 'active_flag'=>1));

			$this->execUpdateTarget();
		}
		elseif ($this->name && ($this->meta==null) && $this->imageLocation) {

			$this->jsonBody = json_encode( array( 'width'=>1 , 'name'=>$this->name , 'image'=>$this->getImageAsBase64() , 'active_flag'=>1 ) );

			$this->execUpdateTarget();
		}
		elseif ($this->name && $this->meta && $this->imageLocation) {
			echo $targetName.$image.$metadata.$target;

			$metadata64 = base64_encode($this->meta);

			$this->jsonBody = json_encode( array( 'width'=>1 , 'name'=>$this->name , 'image'=>$this->getImageAsBase64() ,'application_metadata' => $metadata64, 'active_flag'=>1 ) );

			$this->execUpdateTarget();
		}

	}

	public function execUpdateTarget(){

		$this->request = new HTTP_Request2();
		$this->request->setMethod( HTTP_Request2::METHOD_PUT );
		$this->request->setBody( $this->jsonBody );

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
			echo $e->getMessage();
		}


	}

	private function setHeaders(){
		$sb = 	new SignatureBuilder();
		$date = new DateTime("now", new DateTimeZone("GMT"));

		// Define the Date field using the proper GMT format
		$this->request->setHeader('Date', $date->format("D, d M Y H:i:s") . " GMT" );
		$this->request->setHeader("Content-Type", "application/json" );
		// Generate the Auth field value by concatenating the public server access key w/ the private query signature for this request
		$this->request->setHeader("Authorization" , "VWS " . $this->access_key . ":" . $sb->tmsSignature( $this->request , $this->secret_key ));

	}
}

?>
