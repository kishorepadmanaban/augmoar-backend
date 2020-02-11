<html>
<head>
<style>

body{
  font-family:verdana;
}

.result{
  font-family:courier;
  color:black;
}
</style>
</head>
<body>
<br />
<br />
<br />

<?php
require_once 'GetTarget.php';
require_once 'UpdateTarget.php';
require_once 'DeleteTarget.php';
require_once 'PostNewTarget.php';
require_once 'GetAllTargets.php';


$instance = null;

if( isset( $_GET['select']) ){

  $selection = $_GET['select'];

  $name = $_GET['name'];
	$location = $_GET['location'];


	switch( $selection ){

		case "GetTarget" :
			$instance = new GetTarget("565fe2494be2451ab7b5ee81d743d5a1");
			break;
		case "UpdateTarget" :
			$instance = new UpdateTarget("asian","http://augmo.net/src/q.jpg","test","565fe2494be2451ab7b5ee81d743d5a1");
			break;
		case "DeleteTarget" :
			$instance = new DeleteTarget("565fe2494be2451ab7b5ee81d743d5a1");
			break;
		case "PostNewTarget" :
			$instance = new PostNewTarget($name,$location);
			break;
		case "GetAllTargets" :
			$instance = new GetAllTargets();
			break;
		default :
			echo "INVALID SELECTION";
			break;
	}
}

?>

<div>Samples:</div>
<br />
<div>
<a href="SampleSelector.php?select=GetTarget"><b>GetTarget.php</b> queries a single target by target id.</a>
</div>
<br />
<div>
<a href="SampleSelector.php?select=GetAllTargets"><b>GetAllTargets.php</b> queries for all target ids in a Cloud Reco database.</a>
</div>
<br />
<div>
<a href="SampleSelector.php?select=UpdateTarget"><b>UpdateTarget.php</b> updates the metadata for a target.</a>
</div>
<br />
<div>
<a href="SampleSelector.php?select=DeleteTarget"><b>DeleteTarget.php</b> deletes a target from its Cloud Database.</a>
</div>
<br />
<div>
<a href="SampleSelector.php?select=PostNewTarget"><b>PostNewTarget.php</b> uploads a new target to a Cloud Database.</a>
</div>
<br />
<br />
<br />
<br />
<div>
<a href="CheckPHPEnvironment.php">Review your PHP installation.</a>
</div>
</body>
</html>
