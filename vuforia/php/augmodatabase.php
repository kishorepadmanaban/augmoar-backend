<html>
<head>
<link rel="stylesheet" type="text/css" href="style.css">
<link href="https://fonts.googleapis.com/css?family=Roboto:100,300" rel="stylesheet">
<link rel="shortcut icon" type="image/png" href="images/favicon.png"/>
</head>

<body>
<header>

<div class="section" id="header" width="100%">
   <p>AUGMO <span class="data">DATABASE</span></p> 
     </div>
     </header>
     
<nav align="left"  >
     <div class="nav" width="100%">
     	<div class="navoptions">
     
  		<a href="http://augmo.net/php/augmodatabase.php" style="text-decoration:none" >DASHBOARD</a>
  	
  		<a href="http://augmo.net/php/augmodatabase.php" style="text-decoration:none" >MANAGE TARGETS</a>
  	
  		<a href="http://augmo.net/php/augmodatabase.php" style="text-decoration:none" >USER MANAGEMENT</a>
     	</div>  	
     </div>     
</nav>

<div id="test">
</div>

<div align="left" id="title" class="title">DASHBOARD
</div>
<br>
<br>

<section>
<div align="center" class="fulltable">
<table width="90%" class="tableheadingtop" border="0" cellspacing="0" cellpadding="0" id="table" >
<div class="tablehead">
<tr class="tablebg">

<th>Target Name</th>
<th>Upload Date</th>
<th>Total Recognition</th>
<th>Current Month Reco</th>
<th>Prev Month Reco</th>
<th>Rating</th>
<th>Action</th>
</tr>
</div>

<div class="hidetext" id="hidetext">

<?php 
require_once 'GetAllTargets.php';
require_once 'GetTarget.php';

$instance = new GetAllTargets();

?>


</div>


</table>


</div>
</section>
<br>
<br>
<br>
<hr>
</body>
</html>




