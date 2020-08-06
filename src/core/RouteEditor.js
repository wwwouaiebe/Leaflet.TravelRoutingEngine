/*
Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/

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
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #28 : Disable "select this point as start point " and "select this point as end point"
			when a start point or end point is already present
		- Issue #30 : Add a context menu with delete command to the waypoints
		- Issue #33 : Add a command to hide a route
		- Issue #34 : Add a command to show all routes
	- v1.3.0:
		- added cutRoute method (not tested...)
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- modified getClosestLatLngDistance to avoid crash on empty routes
		- fixed issue #45
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
		- Issue #62 : Remove time from route popup when readonly travel.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #66 : Work with promises for dialogs
		- Issue #70 : Put the get...HTML functions outside of the editors
		- Issue #68 : Review all existing promises.
	- v1.9.0:
		- issue #101 : Add a print command for a route
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200806
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file RouteEditor.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module RouteEditor
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theAPIKeysManager } from '../core/APIKeysManager.js';
import { theConfig } from '../data/Config.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';
import { theErrorsUI } from '../UI/ErrorsUI.js';
import { theDataSearchEngine } from '../data/DataSearchEngine.js';
import { newRoute } from '../data/Route.js';
import { newGpxFactory } from '../core/GpxFactory.js';
import { newRoutePropertiesDialog } from '../dialogs/RoutePropertiesDialog.js';
import { newPrintRouteMapDialog } from '../dialogs/PrintRouteMapDialog.js';
import { newEventDispatcher } from '../util/EventDispatcher.js';
import { newGeometry } from '../util/Geometry.js';
import { newZoomer } from '../core/Zoomer.js';
import { theProfileWindowsManager } from '../core/ProfileWindowsManager.js';
import { newPrintFactory } from '../printMap/PrintFactory.js';
import { ROUTE_EDITION_STATUS, DISTANCE, LAT_LNG, ZERO, INVALID_OBJ_ID } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function myNewRouteEditor
@desc constructor of RouteEditor object
@return {RouteEditor} an instance of RouteEditor object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function myNewRouteEditor ( ) {

	let myMustZoomToRouteAfterRouting = false;
	let myRoutingRequestStarted = false;
	let myEventDispatcher = newEventDispatcher ( );
	let myGeometry = newGeometry ( );

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myComputeRouteDistances
	@desc This method compute the route, itineraryPoints and maneuvers distances
	@param {Route} route The route for witch the distances are computed
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myComputeRouteDistances ( route ) {

		// Computing the distance between itineraryPoints
		let itineraryPointsIterator = route.itinerary.itineraryPoints.iterator;
		let maneuverIterator = route.itinerary.maneuvers.iterator;

		itineraryPointsIterator.done;
		maneuverIterator.done;

		maneuverIterator.value.distance = DISTANCE.defaultValue;
		maneuverIterator.done;

		route.distance = DISTANCE.defaultValue;
		route.duration = DISTANCE.defaultValue;

		while ( ! itineraryPointsIterator.done ) {
			itineraryPointsIterator.previous.distance = myGeometry.pointsDistance (
				itineraryPointsIterator.previous.latLng,
				itineraryPointsIterator.value.latLng
			);
			route.distance += itineraryPointsIterator.previous.distance;
			maneuverIterator.previous.distance += itineraryPointsIterator.previous.distance;
			if ( maneuverIterator.value.itineraryPointObjId === itineraryPointsIterator.value.objId ) {
				route.duration += maneuverIterator.previous.duration;
				maneuverIterator.value.distance = DISTANCE.defaultValue;
				maneuverIterator.done;
			}
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myChainRoutes
	@desc This method recompute the distances when routes are chained
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myChainRoutes ( ) {
		let routesIterator = theTravelNotesData.travel.routes.iterator;
		let chainedDistance = DISTANCE.defaultValue;
		while ( ! routesIterator.done ) {
			if ( routesIterator.value.chain ) {
				routesIterator.value.chainedDistance = chainedDistance;
				chainedDistance += routesIterator.value.distance;
			}
			else {
				routesIterator.value.chainedDistance = DISTANCE.defaultValue;
			}
			let notesIterator = routesIterator.value.notes.iterator;
			while ( ! notesIterator.done ) {
				notesIterator.value.chainedDistance = routesIterator.value.chainedDistance;
			}
		}
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myHaveValidWayPoints
	@desc This method verify that all waypoints have valid coordinates ( reminder: a route have always a startpoint
	and an endpoint!)
	@param {Route} route The route for witch the waypoints are verified
	@return {boolean} true when all waypoints have valid coordinates
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myHaveValidWayPoints ( route ) {
		let haveValidWayPoints = true;
		route.wayPoints.forEach (
			wayPoint => {
				haveValidWayPoints =
					haveValidWayPoints
					&&
					LAT_LNG.defaultValue !== wayPoint.lat
					&&
					LAT_LNG.defaultValue !== wayPoint.lng;
			}
		);
		return haveValidWayPoints;
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnRoutingError
	@desc Error handler for the startRouting method
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnRoutingError ( err ) {
		myRoutingRequestStarted = false;
		theErrorsUI.showError ( err );
		console.log ( err ? err : 'An error occurs when asking the route to the provider' );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function myOnRoutingOk
	@desc Success handler for the startRouting method
	@private

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	function myOnRoutingOk ( ) {

		myRoutingRequestStarted = false;

		myComputeRouteDistances ( theTravelNotesData.travel.editedRoute );

		// Placing the waypoints on the itinerary
		if ( 'circle' !== theTravelNotesData.travel.editedRoute.itinerary.transitMode ) {
			let wayPointsIterator = theTravelNotesData.travel.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				if ( wayPointsIterator.first ) {
					wayPointsIterator.value.latLng =
						theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.first.latLng;
				}
				else if ( wayPointsIterator.last ) {
					wayPointsIterator.value.latLng =
						theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.last.latLng;
				}
				else {
					wayPointsIterator.value.latLng = newGeometry ( ).getClosestLatLngDistance (
						theTravelNotesData.travel.editedRoute,
						wayPointsIterator.value.latLng
					).latLng;
				}
			}
		}

		// the position of the notes linked to the route is recomputed
		let notesIterator = theTravelNotesData.travel.editedRoute.notes.iterator;
		while ( ! notesIterator.done ) {
			let latLngDistance = myGeometry.getClosestLatLngDistance (
				theTravelNotesData.travel.editedRoute,
				notesIterator.value.latLng
			);
			notesIterator.value.latLng = latLngDistance.latLng;
			notesIterator.value.distance = latLngDistance.distance;
		}

		myChainRoutes ( );

		// and the notes sorted
		theTravelNotesData.travel.editedRoute.notes.sort (
			( first, second ) => first.distance - second.distance
		);

		if ( myMustZoomToRouteAfterRouting ) {
			newZoomer ( ).zoomToRoute ( theTravelNotesData.travel.editedRoute.objId );
		}

		theProfileWindowsManager.createProfile ( theTravelNotesData.travel.editedRoute );

		myEventDispatcher.dispatch (
			'routeupdated',
			{
				removedRouteObjId : theTravelNotesData.travel.editedRoute.objId,
				addedRouteObjId : theTravelNotesData.travel.editedRoute.objId
			}
		);

		myEventDispatcher.dispatch ( 'roadbookupdate' );

		// and the itinerary and waypoints are displayed
		myEventDispatcher.dispatch ( 'setitinerary' );
	}

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class
	@classdesc This class contains methods fot Routes creation or modifications
	@see {@link theNoteEditor} for the one and only one instance of this class
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class RouteEditor {

		addRoute ( ) {
			let route = newRoute ( );
			theTravelNotesData.travel.routes.add ( route );
			myEventDispatcher.dispatch ( 'setrouteslist' );
			myChainRoutes ( );
			myEventDispatcher.dispatch ( 'roadbookupdate' );
			if ( ROUTE_EDITION_STATUS.editedChanged !== theTravelNotesData.travel.editedRoute.editionStatus ) {
				this.editRoute ( route.objId );
			}
		}

		editRoute ( routeObjId ) {
			if ( ROUTE_EDITION_STATUS.editedChanged === theTravelNotesData.travel.editedRoute.editionStatus ) {

				// not possible to edit - the current edited route is not saved or cancelled
				theErrorsUI.showError (
					theTranslator.getText ( 'RouteEditor - Not possible to edit a route without a save or cancel' )
				);
				return;
			}
			if ( INVALID_OBJ_ID !== theTravelNotesData.editedRouteObjId ) {

				// the current edited route is not changed. Cleaning the editors
				this.cancelEdition ( );
			}

			// We verify that the provider  for this route is available
			let initialRoute = theDataSearchEngine.getRoute ( routeObjId );
			let providerName = initialRoute.itinerary.provider;
			let provider = theTravelNotesData.providers.get ( providerName.toLowerCase ( ) );
			if (
				providerName
				&&
				( '' !== providerName )
				&&
				(
					( ! provider )
					||
					( provider.providerKeyNeeded && ! theAPIKeysManager.getKey ( providerName ) )
				)
			) {
				theErrorsUI.showError (
					theTranslator.getText (
						'RouteEditor - Not possible to edit a route created with this provider',
						{ provider : providerName }
					)
				);
				return;
			}

			// Provider and transit mode are changed in the itinerary editor
			if ( providerName && '' !== providerName ) {
				myEventDispatcher.dispatch ( 'setprovider', { provider : providerName } );
			}
			let transitMode = initialRoute.itinerary.transitMode;
			if ( transitMode && '' !== transitMode ) {
				myEventDispatcher.dispatch ( 'settransitmode', { transitMode : transitMode } );
			}

			// The edited route is pushed in the editors
			theTravelNotesData.travel.editedRoute = newRoute ( );
			initialRoute.editionStatus = ROUTE_EDITION_STATUS.editedNoChange;

			// Route is cloned, so we can have a cancel button in the editor
			theTravelNotesData.travel.editedRoute.jsonObject = initialRoute.jsonObject;
			theTravelNotesData.editedRouteObjId = initialRoute.objId;
			theTravelNotesData.travel.editedRoute.hidden = false;
			initialRoute.hidden = false;
			theProfileWindowsManager.updateProfile (
				theTravelNotesData.editedRouteObjId,
				theTravelNotesData.travel.editedRoute
			);
			myChainRoutes ( );
			myEventDispatcher.dispatch (
				'routeupdated',
				{
					removedRouteObjId : initialRoute.objId,
					addedRouteObjId : theTravelNotesData.travel.editedRoute.objId
				}
			);

			myEventDispatcher.dispatch ( 'roadbookupdate' );
			myEventDispatcher.dispatch ( 'setitinerary' );
			myEventDispatcher.dispatch ( 'setrouteslist' );
		}

		removeRoute ( routeObjId ) {
			let routeToDeleteObjId = routeObjId;
			if (
				(
					routeToDeleteObjId === theTravelNotesData.editedRouteObjId
					||
					routeToDeleteObjId === theTravelNotesData.travel.editedRoute.objId
				)
				&&
				ROUTE_EDITION_STATUS.editedChanged === theTravelNotesData.travel.editedRoute.editionStatus
			) {

				// cannot remove the route currently edited and changed
				theErrorsUI.showError ( theTranslator.getText ( 'TravelEditor - Cannot remove an edited route' ) );
				return;
			}

			if (
				routeToDeleteObjId === theTravelNotesData.editedRouteObjId
				||
				routeToDeleteObjId === theTravelNotesData.travel.editedRoute.objId

			) {
				routeToDeleteObjId = theTravelNotesData.editedRouteObjId;
				this.cancelEdition ( );
			}

			myEventDispatcher.dispatch (
				'routeupdated',
				{
					removedRouteObjId : routeToDeleteObjId,
					addedRouteObjId : INVALID_OBJ_ID
				}
			);

			theTravelNotesData.travel.routes.remove ( routeToDeleteObjId );
			theProfileWindowsManager.deleteProfile ( routeToDeleteObjId );
			myChainRoutes ( );

			myEventDispatcher.dispatch ( 'roadbookupdate' );
			myEventDispatcher.dispatch ( 'setrouteslist' );
		}

		removeManeuver ( maneuverObjId ) {
			theTravelNotesData.travel.editedRoute.itinerary.maneuvers.remove ( maneuverObjId );
			myEventDispatcher.dispatch ( 'setitinerary' );
			myEventDispatcher.dispatch ( 'roadbookupdate' );
		}

		saveGpx ( routeObjId ) {
			newGpxFactory ( ).routeToGpx ( routeObjId );
		}

		chainRoutes ( ) {
			myChainRoutes ( );
		}

		startRouting ( ) {
			if (
				theConfig.routing.auto
				&&
				! myRoutingRequestStarted
				&&
				myHaveValidWayPoints ( theTravelNotesData.travel.editedRoute )
			) {
				myMustZoomToRouteAfterRouting = ZERO === theTravelNotesData.travel.editedRoute.itinerary.itineraryPoints.length;
				myRoutingRequestStarted = true;
				let routeProvider = theTravelNotesData.providers.get ( theTravelNotesData.routing.provider.toLowerCase ( ) );
				theTravelNotesData.travel.editedRoute.itinerary.provider = routeProvider.name;
				theTravelNotesData.travel.editedRoute.itinerary.transitMode = theTravelNotesData.routing.transitMode;
				routeProvider.getPromiseRoute ( theTravelNotesData.travel.editedRoute, null )
					.then ( myOnRoutingOk )
					.catch ( myOnRoutingError );
			}
		}

		saveEdition ( ) {

			// the edited route is cloned
			let clonedRoute = newRoute ( );
			clonedRoute.jsonObject = theTravelNotesData.travel.editedRoute.jsonObject;

			// and the initial route replaced with the clone
			theTravelNotesData.travel.routes.replace ( theTravelNotesData.editedRouteObjId, clonedRoute );
			theTravelNotesData.editedRouteObjId = clonedRoute.objId;
			this.cancelEdition ( );
		}

		cancelEdition ( ) {

			// !!! order is important!!!
			let editedRoute = theDataSearchEngine.getRoute ( theTravelNotesData.editedRouteObjId );
			editedRoute.editionStatus = ROUTE_EDITION_STATUS.notEdited;

			theProfileWindowsManager.updateProfile (
				theTravelNotesData.travel.editedRoute.objId,
				editedRoute
			);

			myEventDispatcher.dispatch (
				'routeupdated',
				{
					removedRouteObjId : theTravelNotesData.travel.editedRoute.objId,
					addedRouteObjId : theTravelNotesData.editedRouteObjId
				}
			);

			theTravelNotesData.editedRouteObjId = INVALID_OBJ_ID;
			theTravelNotesData.travel.editedRoute = newRoute ( );
			myChainRoutes ( );

			myEventDispatcher.dispatch ( 'roadbookupdate' );
			myEventDispatcher.dispatch ( 'setrouteslist' );
			myEventDispatcher.dispatch ( 'setitinerary' );
		}

		routeProperties ( routeObjId ) {
			let route = theDataSearchEngine.getRoute ( routeObjId );
			let routePropertiesDialog = newRoutePropertiesDialog ( route );

			routePropertiesDialog.show ( ).then (
				( ) => {
					myChainRoutes ( );
					if ( myHaveValidWayPoints ( route ) ) {
						myEventDispatcher.dispatch (
							'routepropertiesupdated',
							{
								routeObjId : route.objId
							}
						);
					}
					myEventDispatcher.dispatch ( 'roadbookupdate' );
					myEventDispatcher.dispatch ( 'setrouteslist' );
				}
			)
				.catch ( err => console.log ( err ? err : 'An error occurs in the route properties dialog' ) );
		}

		printRouteMap ( routeObjId ) {
			let printRouteMapDialog = newPrintRouteMapDialog ( );

			printRouteMapDialog.show ( ).then (
				printData => {
					newPrintFactory ( ).print ( printData, routeObjId );
				}
			)
				.catch ( err => console.log ( err ? err : 'An error occurs in the route properties dialog' ) );
		}

		showRoute ( routeObjId ) {
			myEventDispatcher.dispatch (
				'routeupdated',
				{
					removedRouteObjId : INVALID_OBJ_ID,
					addedRouteObjId : routeObjId
				}
			);
			theDataSearchEngine.getRoute ( routeObjId ).hidden = false;
			myEventDispatcher.dispatch ( 'setrouteslist' );
		}

		hideRoute ( routeObjId ) {
			myEventDispatcher.dispatch (
				'routeupdated',
				{
					removedRouteObjId : routeObjId,
					addedRouteObjId : INVALID_OBJ_ID
				}
			);
			theDataSearchEngine.getRoute ( routeObjId ).hidden = true;
			myEventDispatcher.dispatch ( 'setrouteslist' );
		}

		showRoutes ( ) {
			let routesIterator = theTravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				if ( routesIterator.value.hidden ) {
					myEventDispatcher.dispatch (
						'routeupdated',
						{
							removedRouteObjId : INVALID_OBJ_ID,
							addedRouteObjId : routesIterator.value.objId
						}
					);
					routesIterator.value.hidden = false;
				}
			}
			myEventDispatcher.dispatch ( 'setrouteslist' );
		}

		hideRoutes ( ) {
			let routesIterator = theTravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				if (
					! routesIterator.value.hidden
					&&
					routesIterator.value.objId !== theTravelNotesData.editedRouteObjId
				) {
					myEventDispatcher.dispatch (
						'routeupdated',
						{
							removedRouteObjId : routesIterator.value.objId,
							addedRouteObjId : INVALID_OBJ_ID
						}
					);
					routesIterator.value.hidden = true;
				}
			}
			myEventDispatcher.dispatch ( 'setrouteslist' );
		}
	}

	return Object.seal ( new RouteEditor );
}

const myRouteEditor = myNewRouteEditor ( );

export {
	myRouteEditor as theRouteEditor
};

/*
--- End of RouteEditor.js file ------------------------------------------------------------------------------------------------
*/