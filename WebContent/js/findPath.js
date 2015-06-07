
		var travelmode='DRIVING';
		var map;
		var geocoder;
		var bounds;
		var markersArray;
		var distarr,timearr,sparr,totdist,totdisttime,tottime,tottimedist,spdis,sptime;
		var points=[];
		var lat,lng;
		var dispath='', timepath='',speedpath='';
		Array.matrix = function(numrows, numcols, initial){
			   var arr = [];
			   for (var i = 0; i < numrows; ++i){
			      var columns = [];
			      for (var j = 0; j < numcols; ++j){
			         columns[j] = initial;
			      }
			      arr[i] = columns;
			    }
			    return arr;
			};
		
		//var points=['bangalore','tirupati','anantapur','kurnool'];

		var destinationIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=D|FF0000|000000';
		var originIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=O|FFFF00|000000';
		var myCenter=new google.maps.LatLng(lat,lng);
		
		function initialize() {
		  var opts = {
		    center: myCenter,
		    zoom: 7
		  };
		  map = new google.maps.Map(document.getElementById('googleMap'), opts);
		  var marker=new google.maps.Marker({
			  position:myCenter,
			  });
		marker.setMap(map);
		  geocoder = new google.maps.Geocoder();
  		calculateDistances();
		}

		function getAddress()
		{
			var address=points[0];
			if(address == '')
			{
				alert('Source Address Cannot be empty !!!');
				return;
			}
			address.replace(' ','+');
			var xmlhttp;
			if (window.XMLHttpRequest)
			  xmlhttp=new XMLHttpRequest();
			else
			  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");			 
			xmlhttp.onreadystatechange=function()
			  {
			  if (xmlhttp.readyState==4 && xmlhttp.status==200)
			    {
			    	if(xmlhttp.responseXML.getElementsByTagName("status")[0].childNodes[0].nodeValue!="OK")
			    	{
			    		alert("Address Not found... Please try again !!!");
			    	}
			    	else
			    	{
			    		lng=xmlhttp.responseXML.getElementsByTagName("lng")[0].childNodes[0].nodeValue;
			    		lat=xmlhttp.responseXML.getElementsByTagName("lat")[0].childNodes[0].nodeValue;
			    		initialize();
			    	}
			    }
			  };
			xmlhttp.open("post","https://maps.googleapis.com/maps/api/geocode/xml?address="+address+"&key=AIzaSyAeDuZFs0-EFABlOMvrCcAprxQ59S12rZY",true);
			xmlhttp.send();
		}

		function calculateDistances() {
		  var service = new google.maps.DistanceMatrixService();
		  service.getDistanceMatrix(
		    {
		      origins: points,
		      destinations: points,
		      travelMode: travelmode,
		      unitSystem: google.maps.UnitSystem.METRIC,
		    }, callback);		
		}

		function callback(response, status) {
		  if (status != google.maps.DistanceMatrixStatus.OK) {
		    alert('Error was: ' + status);
		  } else {
		    var origins = response.originAddresses;
		    var destinations = response.destinationAddresses;
		    var outputDiv = document.getElementById('outputDiv');
		    outputDiv.innerHTML = '';
		    deleteOverlays();
		    var distancearray = Array.matrix(points.length,points.length,0);
		    var durationarray = Array.matrix(points.length,points.length,0);
		    var speedarray= Array.matrix(points.length,points.length,0);
		    
		    for (var i = 0; i < origins.length; i++) {
		      var results = response.rows[i].elements;
		      addMarker(origins[i], false);
		      for (var j = i+1; j < results.length; j++) {
		        addMarker(destinations[j], true);
		        console.log(results[j].status.value);
		        try
		        {
			        outputDiv.innerHTML += origins[i] + ' to ' + destinations[j]
			            + ': ' + results[j].distance.text + ' in '
			            + results[j].duration.text + '<br>';
			         distancearray[i][j]=results[j].distance.value;
			         distancearray[j][i]=results[j].distance.value;
			         durationarray[i][j]=results[j].duration.value;
			         durationarray[j][i]=results[j].duration.value;
			         speedarray[i][j]=results[j].distance.value/results[j].duration.value;
			         speedarray[j][i]=speedarray[i][j];
		        }	
		        catch(e)
		        {
		        	alert(e);
		        }
		      }
		    }
		    distarr=distancearray;
		    timearr=durationarray;
		    sparr=speedarray;
		    callServlet(distancearray,'distance');
		    callServlet(durationarray,'time');
		    callServlet(durationarray,'speed');
		  }
		}
		
		function callServlet(distancearray,flag)
		{
			var xmlhttp;
			if (window.XMLHttpRequest)
			  xmlhttp=new XMLHttpRequest();
			else
			  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");			 
			xmlhttp.onreadystatechange=function()
			  {
			  if (xmlhttp.readyState==4 && xmlhttp.status==200)
			    {
				  var seq=xmlhttp.getResponseHeader("seq");
				  calcRoute(seq,flag);
			    }
			  };
			xmlhttp.open("post","./findSequence?distancemat="+distancearray+"&len="+points.length,true);
			xmlhttp.send();
		}
				
		function calcRoute(seq,flag) 
		{
			var directionsDisplay;
			var directionsService = new google.maps.DirectionsService();
			var pathmap;
			//console.log(seq);
			var opseq=seq.split(" ");
		  directionsDisplay = new google.maps.DirectionsRenderer();
		  var src = new google.maps.LatLng(lat,lng);
		  var mapOptions = {
		    zoom:7,
		    center: src
		  };
		  if(flag=='distance')
			  pathmap = new google.maps.Map(document.getElementById('distancepathMap'), mapOptions);
		  else if(flag=='time')
			  pathmap = new google.maps.Map(document.getElementById('timepathMap'), mapOptions);
		  else
			  pathmap = new google.maps.Map(document.getElementById('speedpathMap'), mapOptions);
		  directionsDisplay.setMap(pathmap);

		  var waypoints = [],prev=-1;
		  totdist=0,tottime=0,totdisttime=0,tottimedist=0,spdis=0,sptime=0;
		  for (var i = 0; i < points.length; i++)
		  {
		      var address = points[opseq[i]-1];
		      if(flag=='distance')
		      {
		    	  if(i>0)
		    	  {
		    		  totdist+=distarr[opseq[i]-1][prev];
		    		  totdisttime+=timearr[opseq[i]-1][prev];
		    	  }
		    	  dispath+=address+' --> ';		    	
		      }
		      else if(flag=='time')
		      {
		    	  if(i>0)
		    	  {
		    		  tottime+=timearr[opseq[i]-1][prev];
		    		  tottimedist+=distarr[opseq[i]-1][prev];
		    	  }
		    	  timepath+=address+' --> ';
		      }
		      else
		      {
		    	  if(i>0)
		    	  {
		    		  sptime+=timearr[opseq[i]-1][prev];
		    		  spdis+=distarr[opseq[i]-1][prev];
		    	  }
		    	  speedpath+=address+' --> ';		    	  
		      }
	    	  prev=opseq[i]-1;
	    	  
		      if (address !== "") {
		          waypoints.push({
		        	  location: address,
		              stopover: false
		          });
		      }
		  }
		  if(flag=='distance')
		  {
			  totdist+=distarr[prev][0];
			  totdisttime+=timearr[prev][0];
			  dispath+=' '+points[0]+' <br /><br /> Total Distance : '+(totdist/1000)+' KM <br /> Total Time : '+Math.ceil(totdisttime/60)+' Min';
			  document.getElementById('distancepathdetails').innerHTML=dispath;
		  }
		  else if(flag=='time')
	      {
			  tottime+=timearr[prev][0];
			  tottimedist+=distarr[prev][0];
			  timepath+=' '+points[0]+' <br /><br /> Total Time : '+Math.ceil(tottime/60)+' Min <br /> Total Distance : '+(tottimedist/1000)+' KM';
			  document.getElementById('timepathdetails').innerHTML=timepath;
	      }
		  else
	      {
			  sptime+=timearr[prev][0];
			  spdis+=distarr[prev][0];
			  speedpath+=' '+points[0]+' <br /><br /> Total Time : '+Math.ceil(sptime/60)+' Min <br /> Total Distance : '+(spdis/1000)+' KM';
			  document.getElementById('speedpathdetails').innerHTML=speedpath;
	      }
		  
		  var pnt =lat+','+lng;
		  var request = {
		      origin:pnt,
		      destination:pnt,
		      waypoints: waypoints,
		      travelMode: travelmode,
		  };
		  directionsService.route(request, function(response, status) {			 
		    if (status == google.maps.DirectionsStatus.OK) {
		      directionsDisplay.setDirections(response);
		    }
		    else
		    {
		    	alert("Route Not found between source and destination...");
		    }
		  });
		}

		function addMarker(location, isDestination) {
		  var icon;
		  if (isDestination) {
		    icon = destinationIcon;
		  } else {
		    icon = originIcon;
		  }
		  geocoder.geocode({'address': location }, function(results, status) {
		    if (status == google.maps.GeocoderStatus.OK) {
		      bounds.extend(results[0].geometry.location);
		      map.fitBounds(bounds);
		      var marker = new google.maps.Marker({
		        map: map,
		        position: results[0].geometry.location,
		        icon: icon,
		      });
		      markersArray.push(marker);
		    } else {
		      alert('Geocode was not successful for the following reason: '
		        + status);
		    }
		  });
		}

		function deleteOverlays() {
		  for (var i = 0; i < markersArray.length; i++) {
		    markersArray[i].setMap(null);
		  }
		  markersArray = [];
		}
		//google.maps.event.addDomListener(window, 'load', initialize);
		