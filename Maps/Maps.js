(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the 
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/*
--- HTMLElementsFactory.js file ---------------------------------------------------------------------------------------
This file contains:
	- the HTMLElementsFactory object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20170929
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	/* 
	--- HTMLElementsFactory object ------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	var HTMLElementsFactory = function ( ) {

		/* 
		--- HTMLElementsFactory object --------------------------------------------------------------------------------
		
		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			create : function ( tagName, properties, parentNode ) {
				var element;
				if ( 'text' === tagName.toLowerCase ( ) ) {
					element = document.createTextNode ( '' );
				}
				else {
					element = document.createElement ( tagName );
				}
				if ( parentNode ) {
					parentNode.appendChild ( element );
				}
				if ( properties )
				{
					for ( var property in properties ) {
						try {
							element [ property ] = properties [ property ];
						}
						catch ( e ) {
							console.log ( "Invalid property : " + property );
						}
					}
				}
				return element;
			}
			
		};
			
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = HTMLElementsFactory;
	}

}());

/*
--- End of HTMLElementsFactory.js file --------------------------------------------------------------------------------
*/	

},{}],2:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the 
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/*
--- MapBuilder.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the MapBuilder object
	- the module.exports implementation
Changes:

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var MapBuilder = function ( ) {

		var _Translator = require ( './Translator' ) ( );

		
		// default config values. Normally overloaded  at startup with MapsConfig.json
		var _Config = 
		{
			map : {
				center : {
					lat : 50.50923,
					lng : 5.49542
				},
				zoom : 17
			},
			theDevil : 
			{
				addButton : false,
				title : "MapsBuilder - Reminder! The devil will know everything about you" ,
				text : "&#x1f47f;"
			},
			printerMark :
			{
				addOnMap : false,
				top : "723px",
				left : "1051px"
			},
			travelNotesAsLeafletControl : false,
			contactMail : "http://www.ouaie.be/blog/pages/contact/",
			donate : false,
			scaleControl : 
			{
				imperial:false,
				metric:true
			},
			mouseControl: true
		};
		
		var _Map = null; // the map

		var _TravelNotesInterface = null; // the TravelNotes apps
		
		var _Layers = {}; // the layers

		var _Attributions = {
			leaflet : '&copy; <a href="http://leafletjs.com/" target="_blank" title="Leaflet">Leaflet</a> ',
			osm : '| &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" title=" ' + _Translator.getText ( "MapsBuilder - OpenStreetMap contributors" ) + '">' + _Translator.getText ( "MapsBuilder - OpenStreetMap contributors" ) + '</a> ',
			thunderforest : '| Tiles courtesy of <a href="http://www.thunderforest.com/" target="_blank" title="Andy Allan">Andy Allan</a> ',
			esri : '| Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community ',
			kartverket : '| <a href="https://kartverket.no/" target="_blank">Kartverket</a> ',
			ign : _Translator.getText ( "MapsBuilder - IGN" ),
			mapbox : '| &copy; <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a> ',
			donate : '| <span style="color:red">&#x2764;</span> <a href="https://donate.openstreetmap.org/" target="_blank" title="' + _Translator.getText ( "MapsBuilder - Donate" ) + '">' + _Translator.getText ( "MapsBuilder - Donate" ) + '</a> ',
			travelnotes : '| &copy; <a href="https://github.com/wwwouaiebe" target="_blank" title="https://github.com/wwwouaiebe">Maps & TravelNotes</a> '
		};

		var _LayerId = null; // the current layer id

		var _HtmlElementsFactory = require ( './HTMLElementsFactory' ) ( );

		// helper object used to maintain the mouse control
		var _MouseControl = function ( ) {
			var _MousePos = null;
			var _Zoom = null;
			var _Name = '';
			var _Update = function ( )
			{
				if ( document.getElementById ( 'mapsMouseControl' ) ) {
					document.getElementById ( 'mapsMouseControl' ).innerHTML = '<span>' + _MousePos + '&nbsp;-&nbsp;Zoom&nbsp;:&nbsp;' + _Zoom + ( _Name !=='' ? '&nbsp;-&nbsp;' +_Name : '' ) + '</span>';
				}
			};
			return {
				set mousePos ( MousePos ) {
					_MousePos = 
						( MousePos.lat > 0 ? MousePos.lat.toFixed ( 6 ) + '&nbsp;N' : ( -MousePos.lat ).toFixed ( 6 ) + '&nbsp;S' ) +
						'&nbsp;-&nbsp;' +
						( MousePos.lng > 0 ? MousePos.lng.toFixed ( 6 ) + '&nbsp;E' : ( -MousePos.lng ).toFixed ( 6 ) + '&nbsp;W' );
					_Update ( );
				},
				get mousePos ( ) { return null; },
				set zoom ( Zoom ) {
					_Zoom = Zoom;
					_Update ( );
				},
				get zoom ( ) { return null; },
				set name ( Name ) {
					_Name = Name;
					_Update ( );
				},
				get name ( ) { return null; }				
			};
		} ( );
		
		/*
		--- _SetLayer method ---------------------------------------------------------------------------------------------------

		This method set the current layer

		------------------------------------------------------------------------------------------------------------------------
		*/

		var _SetLayer = function ( layerId ) {
			if ( ! _Layers [ layerId ] ) {
				return;
			}

			var layer = _Layers [ layerId ].layer;

			if ( _LayerId ) {
				_Map.removeLayer ( _Layers [ _LayerId ].layer );
			}
			_Map.addLayer ( layer );
			_LayerId = layerId;
			
			document.getElementsByClassName ( "leaflet-control-attribution" ) [0].innerHTML = 
				_Attributions.leaflet +
				_Layers [ layerId ].attribution +
				( _Config.donate ? _Attributions.donate : '' ) +
				( L.travelNotes ? _Attributions.travelnotes : '' );	

			_Map.setMinZoom ( 0 );
			_Map.setMaxZoom ( 18 );
			if ( layer.options.myMaxZoom ) {
				// zoom changed on the Map if the zoom factor is > than the maxZoom
				if ( layer.options.myMaxZoom < _Map.getZoom ( ) ) {
					_Map.setZoom ( layer.options.myMaxZoom );
				}
				_Map.setMaxZoom ( layer.options.myMaxZoom );
			}
			if ( layer.options.myMinZoom  ) {
				// zoom changed on the Map if the zoom factor is < than the minZoom
				if ( layer.options.myMinZoom > _Map.getZoom ( ) ) {
					_Map.setZoom ( layer.options.myMinZoom );
				}
				_Map.setMinZoom ( layer.options.myMinZoom );
			}
			// bounds changed on the map if the layer have bounds
			if ( layer.options.bounds ) {
				if ( ! _Map.getBounds ( ).intersects ( layer.options.bounds ) ) {
					_Map.fitBounds ( layer.options.bounds );
				}
			}
			_Map.setMaxBounds ( null ); // don't remove - strange! zoom is not correct on the kartverket layer when this line is missing
			_Map.setMaxBounds ( layer.options.bounds );
			if ( _TravelNotesInterface && layer.options.layerId ) {
				var userData = _TravelNotesInterface.userData;
				userData.layerId = layer.options.layerId;
				_TravelNotesInterface.userData = userData;
			}
				
			_Map.fire ( 'baselayerchange', _Layers [ _LayerId ].layer )	;
		};
		
		/* --- End of _SetLayer method --- */

		/*
		--- _BuildLayers method ------------------------------------------------------------------------------------------------

		This method build the different layers added to the map

		------------------------------------------------------------------------------------------------------------------------
		*/

		var _BuildLayers = function ( ) {
			
			var providerKeys = {};
			_Layers [ '0' ] = {
				layer : L.tileLayer ( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', { layerId : '0'} ),
				name : _Translator.getText ( 'MapsBuilder - OSM Color') ,
				toolbarText : 'OSM',
				attribution : _Attributions.osm
			};
			_Layers [ '1' ] = {
				layer : L.tileLayer ( 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', { layerId : '1' } ),
				name : _Translator.getText ( 'MapsBuilder - OSM Black and White'),
				toolbarText : 'OSM',
				attribution : _Attributions.osm
			};
			_Layers [ '5' ] = {
				layer : L.tileLayer ( 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { layerId : '5' } ),
				name : _Translator.getText ( 'MapsBuilder - Esri aerial view' ),
				toolbarText : 'ESRI',
				attribution : _Attributions.esri
			};
			_Layers [ '6' ] = {
				layer : L.tileLayer ( 
					'http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=matrikkel_bakgrunn&zoom={z}&x={x}&y={y}', 
					{ 
						layerId : '6',
						bounds : L.latLngBounds ( L.latLng ( 56.84, 1.40 ), L.latLng ( 72.10, 35.15 ) )
					}
				),
				name : _Translator.getText ( 'MapsBuilder - Kartverket Norway'),
				toolbarText : 'N',
				attribution : _Attributions.kartverket
			};
			if ( _TravelNotesInterface ) {
				if ( 0 < _TravelNotesInterface.getProviderKey ( 'thunderforest' ).length ) {
					providerKeys.thunderforest = _TravelNotesInterface.getProviderKey ( 'thunderforest' );
					_Layers [ '2' ] = {
						layer : L.tileLayer ( 'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=' + providerKeys.thunderforest, { layerId : '2'} ),
						name : _Translator.getText ( 'MapsBuilder - Thunderforest - Transport' ),
						toolbarText : '&#x1f686;',
						attribution : _Attributions.osm + _Attributions.thunderforest
					};		
					_Layers [ '3' ] = {
						layer : L.tileLayer ( 'http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + providerKeys.thunderforest, { layerId : '3' } ),
						name : _Translator.getText ( 'MapsBuilder - Thunderforest OpenCycleMap' ),
						toolbarText : '&#x1f6b2;',
						attribution : _Attributions.osm + _Attributions.thunderforest
					};
					_Layers [ '4' ] = {
						layer : L.tileLayer ( 'http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=' + providerKeys.thunderforest, { layerId : '4'} ),
						name : _Translator.getText ( 'MapsBuilder - Thunderforest - Outdoors' ),
						toolbarText : '&#x1f6b6;',
						attribution : _Attributions.osm + _Attributions.thunderforest
					};
					_Layers [ '12' ] = {
						layer : L.tileLayer ( 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=' + providerKeys.thunderforest, { layerId : '12' } ),
						toolbarText : '&#x26f0;',
						name : _Translator.getText ( 'MapsBuilder - Thunderforest - Landscape' ),
						attribution : _Attributions.osm + _Attributions.thunderforest
					};
				}
				if ( 0 < _TravelNotesInterface.getProviderKey ( 'ign' ).length ) {
					_Layers [ '7' ] = {
						layer : L.tileLayer ( 
							'http://www.ngi.be/cartoweb/1.0.0/topo/default/3857/{z}/{y}/{x}.png',
							{ 
								layerId : '7',
								myMinZoom : 7,
								myMaxZoom: 17,
								bounds : L.latLngBounds ( L.latLng ( 49.49, 2.54 ), L.latLng ( 51.51, 6.41 ) )
							} 
						),
						name : _Translator.getText ( 'MapsBuilder - IGN-NGI - Belgium' ),
						toolbarText : 'IGN',
						attribution : _Attributions.ign
					};
				}
				if ( 0 < _TravelNotesInterface.getProviderKey ( 'mapbox' ).length ) {
					providerKeys.mapbox = _TravelNotesInterface.getProviderKey ( 'mapbox' );
					_Layers [ '8' ] = {
						layer : L.tileLayer ( 'https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=' + providerKeys.mapbox, { layerId : '8'} ),
						name : 'Mapbox - Streets',
						toolbarText : 'M',
						attribution : _Attributions.osm + _Attributions.mapbox
					};		
					_Layers [ '9' ] = {
						layer : L.tileLayer ( 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token=' + providerKeys.mapbox, { layerId : '9'} ),
						name : 'Mapbox - Outdoors',
						toolbarText : 'M',
						attribution :  _Attributions.osm + _Attributions.mapbox
					};
					_Layers [ '10' ] = {
						layer : L.tileLayer ( 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=' + providerKeys.mapbox, { layerId : '10'} ),
						name : 'Mapbox - Light',
						toolbarText : 'M',
						attribution :  _Attributions.osm + _Attributions.mapbox
					};
					_Layers [ '11' ] = {
						layer : L.tileLayer ( 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=' + providerKeys.mapbox, { layerId : '11'} ),
						name : 'Mapbox - Dark',
						toolbarText : 'M',
						attribution :  _Attributions.osm + _Attributions.mapbox
					};	
				}
			}
		};
		
		/* --- End of _BuildLayers method --- */

		/*
		--- _BuildToolbar method -----------------------------------------------------------------------------------------------

		This method build the toolbar on the left of the map

		------------------------------------------------------------------------------------------------------------------------
		*/

		var _BuildToolbar = function ( ) {

			var mapsToolbar = _HtmlElementsFactory.create ( 
				'div',
				{
					id : 'mapsToolbar'
				},
				document.getElementsByTagName ( 'body' ) [ 0 ]
			);
			var mapsToolbarHeader = _HtmlElementsFactory.create ( 
				'div',
				{
					id : 'mapsToolbarHeader',
					innerHTML : 'Maps'
				},
				mapsToolbar
			);
			
			mapsToolbar.addEventListener (
				'mouseenter',
				function ( ) {
					var mapsToolbarButtons = _HtmlElementsFactory.create ( 
						'div',
						{
							id : 'mapsToolbarButtons'
						},
						document.getElementById ( 'mapsToolbar' )
					);
					var mapsToolbarHomeButton = _HtmlElementsFactory.create ( 
						'div',
						{
							id : 'mapsToolbarHomeButton',
							className : 'mapsToolbarButton',
							innerHTML : '<a title="home" href="' + window.location.origin + '" target="_blank">&#x1f3e0;</a>'
						},
						mapsToolbarButtons
					);

					var listener = function ( event ) {
						_SetLayer ( event.target.layerId );
					};
					
					for ( var layer in _Layers ) {
						var mapsToolbarButton = _HtmlElementsFactory.create ( 
							'div',
							{
								className : 'mapsToolbarButton mapsToolbarLayerButton',
								innerHTML : _Layers [ layer ].toolbarText,
								layerId : layer,
								id: 'mapsToolbarLayer' + layer + 'Button',
								title : _Layers [ layer ].name
							},
							mapsToolbarButtons
						);

						mapsToolbarButton.addEventListener (
							'click',
							listener,
							true
						);
					}

					var mapsToolbarContactButton = _HtmlElementsFactory.create ( 
						'div',
						{
							id : 'mapsToolbarContactButton',
							className : 'mapsToolbarButton',
							innerHTML : '<a title="contact" href="' + window.location.origin + '" target="_blank">&#x1f4e7;</a>'
						},
						mapsToolbarButtons
					);
					
					var mapsToolbarHelpButton = _HtmlElementsFactory.create ( 
						'div',
						{
							id : 'mapsToolbarHelpButton',
							className : 'mapsToolbarButton',
							innerHTML : '<a title="Maps help" href="https://github.com/wwwouaiebe/maps/tree/gh-pages" target="_blank">?</a>'
						},
						mapsToolbarButtons
					);
					if ( L.travelNotes ) {
						var mapsToolbarTravelNotesHelpButton = _HtmlElementsFactory.create ( 
							'div',
							{
								id : 'mapsToolbarTravelNotesHelpButton',
								className : 'mapsToolbarButton',
								innerHTML : '<a title="leaflet.TravelNotes help" href="https://github.com/wwwouaiebe/leaflet.TravelNotes/tree/gh-pages" target="_blank">?</a>'
							},
							mapsToolbarButtons
						);
					}
					if ( _Config.theDevil.addButton )
					{
						var href = 'https://www.google.com/maps/@' + _Map.getCenter ( ).lat + ',' +_Map.getCenter ( ).lng + ',' + _Map.getZoom ( ) + 'z';
						var mapsToolbarEvilButton = _HtmlElementsFactory.create ( 
							'div',
							{
								id : 'mapsToolbarDevilButton',
								className : 'mapsToolbarButton',
								innerHTML : '<a id="mapsToolbarDevilLink" href="' + href + '" title="' + _Config.theDevil.title + '" target="_blank">' + _Config.theDevil.text + '</a>'
							},
							mapsToolbarButtons
						);
					}
					if ( _Config.contactMail ) {
						document.getElementById ( 'mapsToolbarContactButton' ).innerHTML = '<a href="' + _Config.contactMail + '" title = "Contact" target="_blank">&#x1f4e7;</a>';
					}
				},
				false
			);
			
			mapsToolbar.addEventListener (
				'mouseleave',
				function ( ) {
					document.getElementById ( 'mapsToolbar' ).removeChild ( document.getElementById ( 'mapsToolbarButtons' ) );
				},
				false
			);
		};
		
		/* --- End of _BuildToolbar method --- */

		/*
		--- _BuildMouseControl method ------------------------------------------------------------------------------------------------

		This method build the mouse control

		------------------------------------------------------------------------------------------------------------------------
		*/

		var _BuildMouseControl = function ( ) {
			if ( _Config.mouseControl ) {
				var mouseControl = _HtmlElementsFactory.create ( 
					'div',
					{
						id : 'mapsMouseControl'
					},
					document.getElementsByTagName ( 'body' ) [ 0 ]
				);
			}

		};
		
		/* --- End of _BuildMouseControl method --- */

		/*
		--- _BuildPrinterMark method ------------------------------------------------------------------------------------------------

		This method build the TravelNotes control

		------------------------------------------------------------------------------------------------------------------------
		*/

		var _BuildPrinterMark = function ( ) {
			if ( _Config.printerMark.addOnMap )
			{
				var mapsPrinterMark = _HtmlElementsFactory.create ( 
					'div',
					{
						id : 'mapsPrinterMark',
					},
					document.getElementsByTagName ( 'body' ) [ 0 ]
				);
				mapsPrinterMark.setAttribute ( "top", _Config.printerMark.top );
				mapsPrinterMark.setAttribute ( "left", _Config.printerMark.left ); 
			}
		};
		
		/* --- End of _BuildPrinterMark method --- */

		/*
		--- _BuildTravelNotesControl method ------------------------------------------------------------------------------------------------

		This method build the TravelNotes control

		------------------------------------------------------------------------------------------------------------------------
		*/

		var _BuildTravelNotesControl = function ( ) {
			if ( L.travelNotes ) {
				var _HtmlElementsFactory = require ( './HTMLElementsFactory' ) ( );
				_TravelNotesInterface = L.travelNotes.interface ( );
				if ( ! _Config.travelNotesAsLeafletControl ) {
					var mapsTravelNotes = _HtmlElementsFactory.create ( 
						'div',
						{
							id : 'mapsTravelNotes'
						},
						document.getElementsByTagName ( 'body' ) [ 0 ]
					);
					_TravelNotesInterface.addControl ( _Map, "mapsTravelNotes", { position: "topright"} );
				}
				else
				{
					_TravelNotesInterface.addControl ( _Map, null, { position: "topright"} );
				}
				_TravelNotesInterface.rightContextMenu = true;
			}
		};

		/* --- End of _BuildTravelNotesControl method --- */
		
		/*
		--- _buildAttributionControl method ------------------------------------------------------------------------------------------

		This method build the attribution control

		------------------------------------------------------------------------------------------------------------------------
		*/

		var _BuildAttributionControl = function ( ) {

			L.control.attribution ( { position : 'bottomleft', prefix : false } ).addTo ( _Map );
		};

		/* --- End of _buildAttributionControl method --- */

		/*
		--- _buildScaleControl method ------------------------------------------------------------------------------------------

		This method build the scale control

		------------------------------------------------------------------------------------------------------------------------
		*/

		var _BuildScaleControl = function ( ) {

			L.control.scale ( { position : 'bottomleft', metric: _Config.scaleControl.metric, imperial: _Config.scaleControl.imperial  } ).addTo ( _Map );
		};

		/*
		--- _buildEvents method ------------------------------------------------------------------------------------------------

		This method links the event handlers with the map events

		------------------------------------------------------------------------------------------------------------------------
		*/

		var _BuildEvents = function ( ) {

			_Map.on ( 
				'zoomend moveend',
				function ( event ) {
					if ( document.getElementById ( "mapsToolbarDevilLink" ) ) {
						document.getElementById ( "mapsToolbarDevilLink" ).href = 'https://www.google.com/maps/@' + _Map.getCenter ( ).lat + ',' +_Map.getCenter ( ).lng + ',' + _Map.getZoom ( ) + 'z';
					}
				}
			);
			if ( _Config.mouseControl ){
				_Map.on (
					'mousemove',
					function ( event ) {
						_MouseControl.mousePos = event.latlng;
					}
				);
				_Map.on ( 
					'zoomend',
					function ( event ) {
						_MouseControl.zoom = _Map.getZoom ( );
					}
				);
			}
			_Map.on ( 
				'travelnotesfileloaded',
				function ( event ) {
					_MouseControl.name = event.name || '';
					if ( event.readOnly ) {
						if ( document.getElementById ( "mapsToolbar" ) ) {
							document.getElementById ( "mapsToolbar" ).style.visibility = "hidden";
							document.getElementById ( "mapsToolbar" ).style.width = "0";
						}
						if ( document.getElementById ( "mapsMouseControl" ) ) {
							document.getElementById ( "mapsMouseControl" ).style.visibility = "hidden";
						}
					}	
					if ( _TravelNotesInterface ) {
						var baseLayer;
						var layerId;
						if ( _TravelNotesInterface.userData.layerId ) {
							_SetLayer ( _TravelNotesInterface.userData.layerId );
						}
					}
				}
			);

		};

		/* --- End of _buildEvents method --- */

		/*
		--- MapBuilder object -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/
		
		return {			
			build : function ( params ) {
				
				if ( params && params [ 0 ] ) {
					_Config = params [ 0 ];
				}

				if ( params && params [ 1 ] ) {
					_Translator.setTranslations ( params [ 1 ] );
				}
				_Config.theDevil.title = _Translator.getText ( "MapsBuilder - Reminder! The devil will know everything about you" );
				_Attributions.osm = '| &copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" title=" ' + _Translator.getText ( "MapsBuilder - OpenStreetMap contributors" ) + '">' + _Translator.getText ( "MapsBuilder - OpenStreetMap contributors" ) + '</a> ';
				_Attributions.ign = _Translator.getText ( "MapsBuilder - IGN" );
				_Attributions.donate = '| <span style="color:red">&#x2764;</span> <a href="https://donate.openstreetmap.org/" target="_blank" title="' + _Translator.getText ( "MapsBuilder - Donate" ) + '">' + _Translator.getText ( "MapsBuilder - Donate" ) + '</a> ';

				_Map = L.map ( 'mapsMap', { attributionControl : false, zoomControl : false } ).setView( [ _Config.map.center.lat,_Config.map.center.lng ], _Config.map.zoom );
	
				_MouseControl.zoom = _Map.getZoom ( );
				
				_BuildAttributionControl ( );
				
				_BuildScaleControl ( );
				
				_BuildTravelNotesControl ( );
				
				_BuildLayers ( );
				
				_BuildToolbar ( );
				
				_BuildMouseControl ( );
				
				_BuildPrinterMark ( );
				
				_BuildEvents ( );
				
				_SetLayer ( '0' );				
			}
		};
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = MapBuilder;
	}

}());

/*
--- End of MapBuilder.js file ----------------------------------------------------------------------------------------
*/
},{"./HTMLElementsFactory":1,"./Translator":5}],3:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the 
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/*
--- Maps.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the starting code for Maps
Changes:

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ) {

	'use strict';

	var getLanguage = function ( ) {
		var langage ='fr';
		var urlSearch = decodeURI ( window.location.search ).substr ( 1 ).split ( '&' );
		var newUrlSearch = '?' ;
		for ( var urlCounter = 0; urlCounter < urlSearch.length; urlCounter ++ ) {
			var param = urlSearch [ urlCounter ].split ( '=' );
			if ( ( 2 === param.length ) && 'lng' === param [ 0 ].toLowerCase ( ) ) {
				langage = param [ 1 ].toLowerCase ( );
			}
		}
		return langage.toUpperCase ( );
	};

console.log ( window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) + 'Maps/Maps' + getLanguage ( ) +'.json' );
	
	var mapBuilder = require ( './MapBuilder' ) ( );
	
	require ( './TaskLoader' ) ( ).start ( 
		[
			{
				task: 'loadJsonFile',
				url : window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) + 'Maps/MapsConfig.json',
			},
			{
				task: 'loadJsonFile',
				url : window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) + 'Maps/Maps' + getLanguage ( ) +'.json',
			},
			{	
				task: 'wait'
			},
			{	
				task: 'run',
				func : mapBuilder.build,
				context : mapBuilder,
				responses : [ 0, 1 ]
			}
		]
	);
	
} ) ( );

/*
--- End of Maps.js file ----------------------------------------------------------------------------------------
*/
},{"./MapBuilder":2,"./TaskLoader":4}],4:[function(require,module,exports){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the 
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/*
--- TaskLoader.js file -----------------------------------------------------------------------------------------------
This file contains:
	- the TaskLoader object
	- the module.exports implementation
Changes:

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';

	var TaskLoader = function ( ) {
		
		var _JsonFileLoader = function ( ) {
			return {
				start : function ( context, nextTaskOnOk, fileUrl, taskNumber )
				{
					var xmlHttpRequest = new XMLHttpRequest ( );
					xmlHttpRequest.onreadystatechange = function ( ) {
						if ( xmlHttpRequest.readyState == 4 ) {
							var response = null;
							if ( xmlHttpRequest.status == 200 ) {
								try {
									response = JSON.parse ( xmlHttpRequest.responseText );
									nextTaskOnOk.call (  context,  response, taskNumber );
								}
								catch ( e )
								{
								}
								
							}
						}
					};
					xmlHttpRequest.open ( "GET", fileUrl, true );
					xmlHttpRequest.overrideMimeType ( 'application/json' );
					xmlHttpRequest.send ( null );
				}
			};
		};
		
		var _TaskPointer = 0;
		var _TaskCounter = 0;
		var _Tasks = [];

		/*
		--- taskRunner object -----------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			taskRunner : function ( ) {
				var loopEndFlag = false;
				while ( ! loopEndFlag ) {
					switch ( _Tasks [ _TaskCounter ].task )
					{
						case 'loadJsonFile':
							_JsonFileLoader ( ).start ( this, this.endTask, _Tasks [ _TaskCounter ].url, _TaskCounter );
							_Tasks [ _TaskCounter].status = 1;
							_TaskCounter ++;
							loopEndFlag = _TaskCounter >= _Tasks.length;
							break;
						case 'wait':
							loopEndFlag = true;
							// calling endTask to avoid an infinite break if previous tasks are already finished
							this.endTask ( "", _TaskCounter );
							break;
						case 'run' :
							var params = (_Tasks [ _TaskCounter ].params ? _Tasks [ _TaskCounter ].params : [ ] );
							if ( _Tasks [ _TaskCounter ].responses ) {
								for (var responsesCounter = 0; responsesCounter < _Tasks [ _TaskCounter ].responses.length; responsesCounter ++ ) {
									params.push ( _Tasks [ _Tasks [ _TaskCounter ].responses [ responsesCounter ]].response );
								}
							}
							_Tasks [ _TaskCounter ].func.call ( _Tasks [ _TaskCounter ].context, params );
							_TaskCounter ++;
							loopEndFlag = _TaskCounter >= _Tasks.length;
							break;
						default:
							_TaskCounter ++;
							loopEndFlag = _TaskCounter >= _Tasks.length;
							break;
					}
				}
			},
			start : function ( tasks ) {
				_Tasks = tasks;
				var _TaskCounter = 0;
				for ( _TaskCounter = 0; _TaskCounter < _Tasks.length; _TaskCounter ++ ) {
					_Tasks [ _TaskCounter ].status = 0;
				}
				_TaskCounter = 0;
				this.taskRunner ( );
			},
			endTask : function ( response, taskNumber ) {
				if ( 'loadJsonFile' === _Tasks [ taskNumber ].task ) {
					_Tasks [ taskNumber ].response = response;
				}
				_Tasks [ taskNumber].status = 2;
				if ( 'wait' ===  _Tasks [ _TaskCounter ].task ){ 
					var status = true;
					for (var statusCounter = 0; statusCounter < _TaskCounter; statusCounter ++ )
					{
						status &= _Tasks [ statusCounter ].status === 2;
					}
					if ( status ) {
						_TaskCounter ++;
						this.taskRunner ( );
					}
				}
			}
		};
	};
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = TaskLoader;
	}

}());

/*
--- End of TaskLoader.js file ----------------------------------------------------------------------------------------
*/
},{}],5:[function(require,module,exports){
(function (global){
/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/
This  program is free software;
you can redistribute it and/or modify it under the terms of the 
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/*
--- Translator.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the Translator object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
Doc reviewed 20170930
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {
	
	'use strict';
	var Translator = function ( ) {
		
		if ( ! global.translations ) {
			global.translations = new Map ( );
		}

		return {
			
			setTranslations : function ( translations ) {
				translations.forEach (
					function ( translation ) {
						global.translations.set ( translation.msgid, translation.msgstr );
					}
				);
			},
			
			getText : function ( msgid , params ) { 
				var translation = global.translations.get ( msgid );
				if ( params && translation ) {
					Object.getOwnPropertyNames ( params ).forEach (
						function ( propertyName ) {
							translation = translation.replace ( '{' + propertyName + '}' , params [ propertyName ] ); 
						}
					);
				}
				
				return ! translation ? msgid : translation;
			}
		};
	};
	
	/* 
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = Translator;
	}

} ) ( );

/*
--- End of Translator.js file -----------------------------------------------------------------------------------------
*/	

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[3]);
