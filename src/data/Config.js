/*
Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/

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
Changes:
	- v1.4.0:
		- created from DataManager
		- added searchPointMarker, previousSearchLimit, nextSearchLimit to config
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #63 : Find a better solution for provider keys upload
		- Issue #75 : Merge Maps and TravelNotes
	- v1.9.0:
		- issue #101 : Add a print command for a route
	- v1.11.0:
		- Issue #110 : Add a command to create a SVG icon from osm for each maneuver
	- v1.12.0:
		- Issue #120 : Review the UserInterface
	- v2.0.0:
		- Issue #136 : Remove html entities from js string
		- Issue #138 : Protect the app - control html entries done by user.
		- Issue #139 : Remove Globals
Doc reviewed 20200731
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Config.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module Config
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theHTMLSanitizer } from '../util/HTMLSanitizer.js';

/* eslint-disable no-magic-numbers */
let ourPrivateConfig = {
	APIKeys : {
		saveToSessionStorage : true
	},
	APIKeysDialog : {
		haveUnsecureButtons : true,
		showAPIKeys : true,
		showButton : true
	},
	colorDialog : {
		haveSlider : true,
		initialRed : 0
	},
	contextMenu : {
		timeout : 1500
	},
	errorsUI :
	{
		helpTimeOut : 30000,
		showError : true,
		showHelp : true,
		showInfo : true,
		showWarning : true,
		timeOut : 10000
	},
	geoCoder : {
		distances : {
			city : 1200,
			hamlet : 200,
			town : 1500,
			village : 400
		},
		osmCityAdminLevel : {
			DEFAULT : '8',
			GB : '10'
		}
	},
	geoLocation : {
		marker : {
			color : '#ff0000',
			radius : 11
		},
		options : {
			enableHighAccuracy : false,
			maximumAge : 0,
			timeout : Infinity
		},
		zoomFactor : 17,
		zoomToPosition : true
	},
	itineraryPaneUI :
	{
		showManeuvers : false,
		showNotes : true
	},
	itineraryPoint : {
		marker : {
			color : '#ff0000',
			fill : false,
			radius : 7,
			weight : 2
		},
		zoomFactor : 17
	},
	layersToolbarUI : {
		haveLayersToolbarUI : true,
		toolbarTimeOut : 1500,
		theDevil : {
			addButton : false
		}
	},
	map :
	{
		center : {
			lat : 50.50923,
			lng : 5.49542
		},
		zoom : 12
	},
	mouseUI : {
		haveMouseUI : true
	},
	nominatim :
	{
		url : 'https://nominatim.openstreetmap.org/',
		language : '*'
	},
	note : {
		grip : {
			size : 10,
			opacity : 0,
			moveOpacity : 1
		},
		haveBackground : false,
		maxManeuversNotes : 100,
		polyline : {
			color : '#808080',
			weight : 1
		},
		reverseGeocoding : false,
		svgIcon : {
			angleDistance : 10,
			angleDirection :
			{
				right : 35,
				slightRight : 80,
				continue : 100,
				slightLeft : 145,
				left : 200,
				sharpLeft : 270,
				sharpRight : 340
			},
			rcnRefDistance : 20,
			roadbookFactor : 1,
			zoom : 17
		}
	},
	noteDialog : {
		areaHeight : {
			icon : 2,
			popupContent : 8
		},
		mask : {
			iconsDimension : true,
			iconTextArea : false,
			tooltip : false,
			popupContent : false,
			address : false,
			link : false,
			phone : true
		},
		theDevil : {
			addButton : false,
			zoomFactor : 17
		}
	},
	osmSearch : {
		nextSearchLimit : {
			color : '#ff0000',
			fill : false,
			weight : 1
		},
		previousSearchLimit : {
			color : '#006400',
			fill : false,
			weight : 1
		},
		searchPointMarker : {
			color : '#006400',
			fill : false,
			radius : 20,
			weight : 4
		},
		searchPointPolyline : {
			color : '#006400',
			fill : false,
			weight : 4
		},
		showSearchNoteDialog : false
	},
	overpassApi : {
		timeOut : 40,
		url : 'https://lz4.overpass-api.de/api/interpreter'
	},
	printRouteMap :
	{
		isEnabled : true,
		maxTiles : 240,
		paperWidth : 287,
		paperHeight : 200,
		pageBreak : false,
		printNotes : true,
		borderWidth : 30,
		zoomFactor : 15,
		entryPointMarker : {
			color : '#00ff00',
			weight : 4,
			radius : 10,
			fill : true,
			fillOpacity : 1
		},
		exitPointMarker : {
			color : '#ff0000',
			weight : 4,
			radius : 10,
			fill : true,
			fillOpacity : 1
		}
	},
	route : {
		color : '#ff0000',
		dashArray : 0,
		dashChoices : [
			{
				text : '——————',
				iDashArray : [ 0 ]
			},
			{
				text : '— — — — —',
				iDashArray : [ 4, 2 ]
			},
			{
				text : '—‧—‧—‧—‧—',
				iDashArray : [ 4, 2, 0, 2 ]
			},
			{
				text : '················',
				iDashArray : [ 0, 2 ]
			}
		],
		elev : {
			smooth : true,
			smoothCoefficient : 0.25,
			smoothPoints : 3
		},
		showDragTooltip : 3,
		width : 3
	},
	routeEditor : {
		showEditedRouteInRoadbook : true
	},
	travelEditor : {
		clearAfterSave : true,
		startMinimized : true,
		startupRouteEdition : true,
		timeout : 1000
	},
	travelNotes : {
		autoLoad : true,
		haveBeforeUnloadWarning : true,
		language : 'fr'
	},
	travelNotesToolbarUI :
	{
		contactMail : {
			url : 'https://github.com/wwwouaiebe/leaflet.TravelNotes/issues'
		}
	},
	wayPoint : {
		reverseGeocoding : false
	}
};
/* eslint-enable no-magic-numbers */

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourCopyObjectTo
@desc copy the properties between two objects
@param {Object} source The source object
@param {Object} target The target object
@example
This method:
- search recursively all target properties
- foreach found property, search the same property in source
- copy the property value from source to target if found
- search recursively all sources properties
- foreach found property search the same property in target
- copy the property value from source to target
So:
- if a property is missing in the user config, the property is selected from the default config
- if a property is in the user config but missing in the default config, the property is also added (and reminder
  that the user can have more dashChoices than the default config )
- if a property is changed in the user config, the property is adapted
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/* eslint-disable max-depth */

function ourCopyObjectTo ( source, target ) {
	if ( ( 'object' !== typeof source ) || ( 'object' !== typeof target ) ) {
		return;
	}
	try {

		// iteration on target.
		for ( let property in target ) {
			if ( 'object' === typeof target [ property ] ) {
				ourCopyObjectTo ( source [ property ], target [ property ] );
			}
			else if ( typeof ( source [ property ] ) === typeof ( target [ property ] ) ) {
				if ( 'string' === typeof ( target [ property ] ) ) {
					if ( 'color' === property ) {
						target [ property ] = theHTMLSanitizer.sanitizeToColor ( source [ property ] ) || target [ property ];
					}
					else if ( 'url' === property ) {
						target [ property ] = theHTMLSanitizer.sanitizeToUrl ( source [ property ] ).url;
					}
					else {
						target [ property ] =
								theHTMLSanitizer.sanitizeToJsString ( source [ property ] );
					}
				}
				else {
					target [ property ] = source [ property ] || target [ property ];
				}
			}
		}

		// iteration on source
		for ( let property in source ) {
			if ( 'object' === typeof source [ property ] ) {
				if ( '[object Array]' === Object.prototype.toString.call ( source [ property ] ) ) {
					target [ property ] = target [ property ] || [];
				}
				else {
					target [ property ] = target [ property ] || {};
				}
				ourCopyObjectTo ( source [ property ], target [ property ] );
			}
			else if ( 'string' === typeof ( target.property ) ) {
				target [ property ] =
							theHTMLSanitizer.sanitizeToHtmlString ( source [ property ], [] ).htmlString;
			}
			else {
				target [ property ] = source [ property ];
			}
		}
	}
	catch ( err ) {
		if ( err instanceof Error ) {
			console.error ( err );
		}
	}
}

/* eslint-enable max-depth */

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourFreeze
@desc Freeze an object recursively
@param {Object} object The object to freeze
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourFreeze ( object ) {
	for ( let property in object ) {
		if ( 'object' === typeof object [ property ] ) {
			object [ property ] = ourFreeze ( object [ property ] );
		}
	}

	return Object.freeze ( object );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc Class used to store the configuration of the code
@see {@link theConfig} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class Config {
	get APIKeys ( ) { return ourPrivateConfig.APIKeys; }
	get APIKeysDialog ( ) { return ourPrivateConfig.APIKeysDialog; }
	get colorDialog ( ) { return ourPrivateConfig.colorDialog; }
	get contextMenu ( ) { return ourPrivateConfig.contextMenu; }
	get errorsUI ( ) { return ourPrivateConfig.errorsUI; }
	get geoCoder ( ) { return ourPrivateConfig.geoCoder; }
	get geoLocation ( ) { return ourPrivateConfig.geoLocation; }
	get itineraryPaneUI ( ) { return ourPrivateConfig.itineraryPaneUI; }
	get itineraryPoint ( ) { return ourPrivateConfig.itineraryPoint; }
	get layersToolbarUI ( ) { return ourPrivateConfig.layersToolbarUI; }
	get map ( ) { return ourPrivateConfig.map; }
	get mouseUI ( ) { return ourPrivateConfig.mouseUI; }
	get nominatim ( ) { return ourPrivateConfig.nominatim; }
	get note ( ) { return ourPrivateConfig.note; }
	get noteDialog ( ) { return ourPrivateConfig.noteDialog; }
	get osmSearch ( ) { return ourPrivateConfig.osmSearch; }
	get overpassApi ( ) { return ourPrivateConfig.overpassApi; }
	get printRouteMap ( ) { return ourPrivateConfig.printRouteMap; }
	get route ( ) { return ourPrivateConfig.route; }
	get routeEditor ( ) { return ourPrivateConfig.routeEditor; }
	get travelEditor ( ) { return ourPrivateConfig.travelEditor; }
	get travelNotes ( ) { return ourPrivateConfig.travelNotes; }
	get travelNotesToolbarUI ( ) { return ourPrivateConfig.travelNotesToolbarUI; }
	get wayPoint ( ) { return ourPrivateConfig.wayPoint; }

	overload ( source ) {
		ourCopyObjectTo ( source, ourPrivateConfig );
		ourPrivateConfig = ourFreeze ( ourPrivateConfig );
	}

}

let ourConfig = new Config;

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of Config class
	@type {Config}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourConfig as theConfig
};

/*
--- End of Config.js file -----------------------------------------------------------------------------------------------------
*/