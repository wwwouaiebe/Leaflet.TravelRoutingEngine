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
		- created from RouteEditor
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #68 : Review all existing promises.
	- v1.8.0:
		- issue #97 : Improve adding a new waypoint to a route
	- v1.12.0:
		- Issue #120 : Review the UserInterface
	- v2.2.0:
		- Issue #64 : Improve geocoding
	- v2.3.0:
		- Issue #170 : The apps crash when renaming a waypoint and then saving the route before the end of the renaming...

Doc reviewed 20200810
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file WayPointEditor.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} WayPointOsmData
@desc An object with the name and address found for the WayPoint with Nominatim
@property {string} name
@property {string} address
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module WayPointEditor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theRouteEditor } from '../core/RouteEditor.js';
import { newWayPointPropertiesDialog } from '../dialogs/WayPointPropertiesDialog.js';
import { newGeoCoder } from '../core/GeoCoder.js';
import { newWayPoint } from '../data/WayPoint.js';
import { theEventDispatcher } from '../util/EventDispatcher.js';
import { theGeometry } from '../util/Geometry.js';
import { ROUTE_EDITION_STATUS, LAT_LNG, TWO } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourRenameWayPoint
@desc This function rename a WayPoint
@param {WayPointOsmData} wayPointOsmData the name and address for WayPoint renaming
@param {!number} wayPointObjId The objId of the WayPoint to rename
@fires setrouteslist
@fires showitinerary
@fires roadbookupdate
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourRenameWayPoint ( wayPointOsmData, wayPointObjId ) {
	let wayPoint = theTravelNotesData.travel.editedRoute.wayPoints.getAt ( wayPointObjId );
	if ( wayPoint ) {
		theTravelNotesData.travel.editedRoute.editionStatus = ROUTE_EDITION_STATUS.editedChanged;
		wayPoint.name = wayPointOsmData.name;
		wayPoint.address = wayPointOsmData.address;
		theEventDispatcher.dispatch ( 'setrouteslist' );
		theEventDispatcher.dispatch ( 'showitinerary' );
		theEventDispatcher.dispatch ( 'roadbookupdate' );
	}
	else {
		console.error ( 'waypoint not found' );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourRenameWayPointWithGeocoder
@desc This function rename a WayPoint with data from Nominatim
@param {Array.<number>} latLng The latitude and longitude of the WayPoint
@param {!number} wayPointObjId The objId of the WayPoint to rename
@fires setrouteslist
@fires showitinerary
@fires roadbookupdate
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourRenameWayPointWithGeocoder ( latLng, wayPointObjId ) {
	if ( ! theConfig.wayPoint.reverseGeocoding ) {
		theEventDispatcher.dispatch ( 'setrouteslist' );
		theEventDispatcher.dispatch ( 'showitinerary' );
		theEventDispatcher.dispatch ( 'roadbookupdate' );
		return;
	}

	let geoCoder = newGeoCoder ( );
	geoCoder.getPromiseAddress ( latLng )
		.then (
			geoCoderData => {
				let address = geoCoderData.street;
				if ( '' !== geoCoderData.city ) {
					address += ' ' + geoCoderData.city;
				}
				let wayPointName = '';
				if ( theConfig.wayPoint.geocodingIncludeName ) {
					wayPointName = geoCoderData.name;
				}
				ourRenameWayPoint ( Object.seal ( { name : wayPointName, address : address } ), wayPointObjId );
			}
		)
		.catch (
			err => {
				if ( err instanceof Error ) {
					console.error ( err );
				}
			}
		);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains methods fot WayPoints creation or modifications
@see {@link theWayPointEditor} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class WayPointEditor {

	constructor ( ) {
		Object.freeze ( this );
	}

	/**
	This method add a WayPoint
	@param {Array.<number>} latLng The latitude and longitude where the WayPoint will be added
	@async
	*/

	addWayPoint ( latLng ) {
		theTravelNotesData.travel.editedRoute.editionStatus = ROUTE_EDITION_STATUS.editedChanged;
		let wayPoint = newWayPoint ( );
		wayPoint.latLng = latLng;
		theTravelNotesData.travel.editedRoute.wayPoints.add ( wayPoint );
		ourRenameWayPointWithGeocoder ( latLng, wayPoint.objId );
		theEventDispatcher.dispatch (
			'addwaypoint',
			{
				wayPoint : theTravelNotesData.travel.editedRoute.wayPoints.last,
				letter : theTravelNotesData.travel.editedRoute.wayPoints.length - TWO
			}
		);
		theTravelNotesData.travel.editedRoute.wayPoints.swap ( wayPoint.objId, true );
		theRouteEditor.startRouting ( );
	}

	/**
	This method add a waypoint at a given position on the edited route. It's used to add a WayPoint by
	dragging
	@param {Array.<number>} initialLatLng The latitude and longitude from witch the WayPoint is coming
	@param {Array.<number>} finalLatLng The latitude and longitude where the WayPoint will be added
	@async
	*/

	addWayPointOnRoute ( initialLatLng, finalLatLng ) {
		let newWayPointDistance = theGeometry.getClosestLatLngDistance (
			theTravelNotesData.travel.editedRoute,
			initialLatLng
		).distance;
		theTravelNotesData.travel.editedRoute.editionStatus = ROUTE_EDITION_STATUS.editedChanged;
		let wayPoint = newWayPoint ( );
		wayPoint.latLng = finalLatLng;
		let letter = '';
		let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			let latLngDistance = theGeometry.getClosestLatLngDistance (
				theTravelNotesData.travel.editedRoute,
				wayPointsIterator.value.latLng
			);
			if ( newWayPointDistance < latLngDistance.distance ) {
				letter = String ( wayPointsIterator.index );
				theTravelNotesData.travel.editedRoute.wayPoints.add ( wayPoint );
				theTravelNotesData.travel.editedRoute.wayPoints.moveTo (
					wayPoint.objId, wayPointsIterator.value.objId, true
				);
				ourRenameWayPointWithGeocoder ( finalLatLng, wayPoint.objId );
				theEventDispatcher.dispatch ( 'addwaypoint', { wayPoint : wayPoint, letter : letter } );
				theRouteEditor.startRouting ( );
				break;
			}
		}
	}

	/**
	This method reverse the waypoints order
	@async
	*/

	reverseWayPoints ( ) {
		theTravelNotesData.travel.editedRoute.editionStatus = ROUTE_EDITION_STATUS.editedChanged;
		let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			theEventDispatcher.dispatch ( 'removeobject', { objId : wayPointsIterator.value.objId } );
		}
		theTravelNotesData.travel.editedRoute.wayPoints.reverse ( );
		wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			theEventDispatcher.dispatch (
				'addwaypoint',
				{
					wayPoint : wayPointsIterator.value,
					letter :
						wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' : wayPointsIterator.index )
				}
			);
		}
		theEventDispatcher.dispatch ( 'setrouteslist' );
		theEventDispatcher.dispatch ( 'showitinerary' );
		theEventDispatcher.dispatch ( 'roadbookupdate' );
		theRouteEditor.startRouting ( );
	}

	/**
	This method remove a WayPoint
	@param {!number} wayPointObjId The objId of the WayPoint to remove
	@async
	*/

	removeWayPoint ( wayPointObjId ) {
		theTravelNotesData.travel.editedRoute.editionStatus = ROUTE_EDITION_STATUS.editedChanged;
		theEventDispatcher.dispatch ( 'removeobject', { objId : wayPointObjId } );
		theTravelNotesData.travel.editedRoute.wayPoints.remove ( wayPointObjId );
		theRouteEditor.startRouting ( );
	}

	/**
	This method set the starting WayPoint
	@param {Array.<number>} latLng The latitude and longitude where the WayPoint will be added
	@async
	*/

	setStartPoint ( latLng ) {
		theTravelNotesData.travel.editedRoute.editionStatus = ROUTE_EDITION_STATUS.editedChanged;
		if ( LAT_LNG.defaultValue !== theTravelNotesData.travel.editedRoute.wayPoints.first.lat ) {
			theEventDispatcher.dispatch (
				'removeobject',
				{ objId : theTravelNotesData.travel.editedRoute.wayPoints.first.objId }
			);
		}
		theTravelNotesData.travel.editedRoute.wayPoints.first.latLng = latLng;
		ourRenameWayPointWithGeocoder ( latLng, theTravelNotesData.travel.editedRoute.wayPoints.first.objId );
		theEventDispatcher.dispatch (
			'addwaypoint',
			{
				wayPoint : theTravelNotesData.travel.editedRoute.wayPoints.first,
				letter : 'A'
			}
		);
		theRouteEditor.startRouting ( );
	}

	/**
	This method set the ending WayPoint
	@param {Array.<number>} latLng The latitude and longitude where the WayPoint will be added
	@async
	*/

	setEndPoint ( latLng ) {
		theTravelNotesData.travel.editedRoute.editionStatus = ROUTE_EDITION_STATUS.editedChanged;
		if ( LAT_LNG.defaultValue !== theTravelNotesData.travel.editedRoute.wayPoints.last.lat ) {
			theEventDispatcher.dispatch (
				'removeobject',
				{ objId : theTravelNotesData.travel.editedRoute.wayPoints.last.objId }
			);
		}
		theTravelNotesData.travel.editedRoute.wayPoints.last.latLng = latLng;
		ourRenameWayPointWithGeocoder ( latLng, theTravelNotesData.travel.editedRoute.wayPoints.last.objId );
		theEventDispatcher.dispatch (
			'addwaypoint',
			{
				wayPoint : theTravelNotesData.travel.editedRoute.wayPoints.last,
				letter : 'B'
			}
		);
		theRouteEditor.startRouting ( );
	}

	/**
	This method is called when a drag of a WayPoint ends on the map
	@param {!number} wayPointObjId The objId of the WayPoint that was dragged
	@async
	*/

	wayPointDragEnd ( wayPointObjId ) {
		theTravelNotesData.travel.editedRoute.editionStatus = ROUTE_EDITION_STATUS.editedChanged;
		ourRenameWayPointWithGeocoder (
			theTravelNotesData.travel.editedRoute.wayPoints.getAt ( wayPointObjId ).latLng, wayPointObjId
		);
		theRouteEditor.startRouting ( );
	}

	/**
	This method shows the WayPointPropertiesDialog
	@param {!number} wayPointObjId The objId of the WayPoint that modify
	@async
	@fires setrouteslist
	@fires showitinerary
	@fires roadbookupdate
	*/

	wayPointProperties ( wayPointObjId ) {
		let wayPoint = theTravelNotesData.travel.editedRoute.wayPoints.getAt ( wayPointObjId );
		let wayPointPropertiesDialog = newWayPointPropertiesDialog ( wayPoint );

		wayPointPropertiesDialog.show ( )
			.then (
				( ) => {
					theEventDispatcher.dispatch ( 'setrouteslist' );
					theEventDispatcher.dispatch ( 'showitinerary' );
					theEventDispatcher.dispatch ( 'roadbookupdate' );
				}
			)
			.catch (
				err => {
					if ( err instanceof Error ) {
						console.error ( err );
					}
				}
			);
	}
}

const OUR_WAY_POINT_EDITOR = new WayPointEditor ( );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of WayPointEditor class
	@type {WayPointEditor}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	OUR_WAY_POINT_EDITOR as theWayPointEditor
};

/*
--- End of WayPointEditor.js file ---------------------------------------------------------------------------------------------
*/