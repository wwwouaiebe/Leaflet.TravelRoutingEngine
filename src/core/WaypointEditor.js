/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- WayPointEditor.js file --------------------------------------------------------------------------------------------
This file contains:
	- the newWayPointEditor function
	- the g_WayPointEditor object
Changes:
	- v1.4.0:
		- created from RouteEditor
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191121
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { g_WayPointEditor };

import { g_Config } from '../data/Config.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';
import { g_MapEditor } from '../core/MapEditor.js';
import { g_RouteEditor } from '../core/RouteEditor.js';

import { newRouteEditorUI } from '../UI/RouteEditorUI.js';
import { newGeoCoder } from '../core/GeoCoder.js';
import { newDataSearchEngine } from '../data/DataSearchEngine.js';
import { newWayPoint } from '../data/WayPoint.js';

/*
--- newWayPointEditor function ----------------------------------------------------------------------------------------

Patterns : Closure and Singleton

-----------------------------------------------------------------------------------------------------------------------
*/

function newWayPointEditor ( ) {
	
	let m_RouteEditorUI = newRouteEditorUI ( );
	let m_GeoCoder = newGeoCoder ( );

	/*
	--- m_AddWayPoint function ----------------------------------------------------------------------------------------

	This function add a waypoint 
	
	parameters:
	- latLng : 

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddWayPoint ( latLng, distance ) {
		g_TravelNotesData.travel.editedRoute.edited = 2;
		let wayPoint = newWayPoint ( );
		if ( latLng ) {
			wayPoint.latLng = latLng;
			if ( g_Config.wayPoint.reverseGeocoding ) {
				m_GeoCoder.getPromiseAddress ( latLng [ 0 ], latLng [ 1 ], wayPoint.objId ).then ( m_GeocoderRenameWayPoint );
			}
		}
		g_TravelNotesData.travel.editedRoute.wayPoints.add ( wayPoint );
		g_MapEditor.addWayPoint ( g_TravelNotesData.travel.editedRoute.wayPoints.last, g_TravelNotesData.travel.editedRoute.wayPoints.length - 2 );
		if ( distance ) {
			let wayPointsIterator = g_TravelNotesData.travel.editedRoute.wayPoints.iterator;
			while ( ! wayPointsIterator.done ) {
				let latLngDistance = g_RouteEditor.getClosestLatLngDistance ( 
					g_TravelNotesData.travel.editedRoute,
					wayPointsIterator.value.latLng 
				);
				if ( distance < latLngDistance.distance ) {
					g_TravelNotesData.travel.editedRoute.wayPoints.moveTo ( wayPoint.objId, wayPointsIterator.value.objId, true );
					break;
				}
			}
		}
		else {
			g_TravelNotesData.travel.editedRoute.wayPoints.swap ( wayPoint.objId, true );
		}
		m_RouteEditorUI.setWayPointsList ( );
		g_RouteEditor.startRouting ( );
	}
		
	/*
	--- m_AddWayPointOnRoute function ---------------------------------------------------------------------------------

	This function add a waypoint at a given position on the edited route
	
	parameters:
	- latLng : 

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_AddWayPointOnRoute ( routeObjId, event ) {
		let latLngDistance = g_RouteEditor.getClosestLatLngDistance ( 
			newDataSearchEngine ( ).getRoute ( routeObjId ),
			[ event.latlng.lat, event.latlng.lng ] 
		);
		m_AddWayPoint ( latLngDistance.latLng, latLngDistance.distance );
	}
	
	/*
	--- m_ReverseWayPoints function -----------------------------------------------------------------------------------

	This function reverse the waypoints order
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_ReverseWayPoints ( ) {
		g_TravelNotesData.travel.editedRoute.edited = 2;
		let wayPointsIterator = g_TravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			g_MapEditor.removeObject ( wayPointsIterator.value.objId );
		}
		g_TravelNotesData.travel.editedRoute.wayPoints.reverse ( );
		wayPointsIterator = g_TravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			g_MapEditor.addWayPoint ( wayPointsIterator.value, wayPointsIterator .first ? 'A' : ( wayPointsIterator.last ? 'B' : wayPointsIterator.index ) );
		}
		m_RouteEditorUI.setWayPointsList ( );
		g_RouteEditor.startRouting ( );
	}
		
	/*
	--- m_RemoveAllWayPoints function ---------------------------------------------------------------------------------

	This function remove all waypoints except the first and last ( see also Collection ...)
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_RemoveAllWayPoints ( ) {
		g_TravelNotesData.travel.editedRoute.edited = 2;
		let wayPointsIterator = g_TravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
			g_MapEditor.removeObject ( wayPointsIterator.value.objId );
		}
		g_TravelNotesData.travel.editedRoute.wayPoints.removeAll ( true );
		m_RouteEditorUI.setWayPointsList ( );
		g_RouteEditor.startRouting ( );
	}
	
	/*
	--- m_RemoveWayPoint function -------------------------------------------------------------------------------------

	This function remove a waypoint
	
	parameters:
	- wayPointObjId : the waypoint objId to remove

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_RemoveWayPoint ( wayPointObjId ) {
		g_TravelNotesData.travel.editedRoute.edited = 2;
		g_MapEditor.removeObject ( wayPointObjId );
		g_TravelNotesData.travel.editedRoute.wayPoints.remove ( wayPointObjId );
		m_RouteEditorUI.setWayPointsList ( );
		g_RouteEditor.startRouting ( );
	}

	/*
	--- m_RenameWayPoint function -------------------------------------------------------------------------------------

	This function rename a wayPoint
	
	parameters:
	- wayPointObjId : the waypoint objId to rename
	- wayPointName : the new name

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_RenameWayPoint ( wayPointName, wayPointObjId ) {
		g_TravelNotesData.travel.editedRoute.edited = 2;
		g_TravelNotesData.travel.editedRoute.wayPoints.getAt ( wayPointObjId ).name = wayPointName;
		m_RouteEditorUI.setWayPointsList ( );
	}
	
	/*
	--- m_GeocoderRenameWayPoint function -----------------------------------------------------------------------------

	This function rename a wayPoint with the geoCoder response
	
	parameters:
	- geoCoderData : data returned by the geoCoder

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_GeocoderRenameWayPoint ( geoCoderData ) {
		let address = '';
		if ( geoCoderData.address.house_number ) {
			address += geoCoderData.address.house_number + ' ';
		}
		if ( geoCoderData.address.road ) {
			address += geoCoderData.address.road + ' ';
		}
		else if ( geoCoderData.address.pedestrian ) {
			address += geoCoderData.address.pedestrian + ' ';
		}
		if (  geoCoderData.address.village ) {
			address += geoCoderData.address.village;
		}
		else if ( geoCoderData.address.town ) {
			address += geoCoderData.address.town;
		}
		else if ( geoCoderData.address.city ) {
			address += geoCoderData.address.city;
		}
		if ( 0 === address.length ) {
			address += geoCoderData.address.country;
		}
		m_RenameWayPoint ( address, geoCoderData.objId );
	}
	
	/*
	--- m_SwapWayPoints function --------------------------------------------------------------------------------------

	This function change the order of two waypoints
	
	parameters:
	- wayPointObjId : the waypoint objId to swap
	- swapUp : when true the waypoint is swapped with the previous one, otherwise with the next

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SwapWayPoints ( wayPointObjId, swapUp ) {
		g_TravelNotesData.travel.editedRoute.edited = 2;
		g_TravelNotesData.travel.editedRoute.wayPoints.swap ( wayPointObjId, swapUp );
		m_RouteEditorUI.setWayPointsList (  );
		g_RouteEditor.startRouting ( );
	}
		
	/*
	--- m_SetStartPoint function --------------------------------------------------------------------------------------

	This function set the start waypoint
	
	parameters:
	- latLng : the coordinates of the start waypoint

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetStartPoint ( latLng ) {
		g_TravelNotesData.travel.editedRoute.edited = 2;
		if ( 0 !== g_TravelNotesData.travel.editedRoute.wayPoints.first.lat ) {
			g_MapEditor.removeObject ( g_TravelNotesData.travel.editedRoute.wayPoints.first.objId );
		}
		g_TravelNotesData.travel.editedRoute.wayPoints.first.latLng = latLng;
		if ( g_Config.wayPoint.reverseGeocoding ) {
			m_GeoCoder.getPromiseAddress ( latLng [ 0 ], latLng [ 1 ], g_TravelNotesData.travel.editedRoute.wayPoints.first.objId ).then ( m_GeocoderRenameWayPoint );
		}
		g_MapEditor.addWayPoint ( g_TravelNotesData.travel.editedRoute.wayPoints.first, 'A' );
		m_RouteEditorUI.setWayPointsList ( );
		g_RouteEditor.startRouting ( );
	}
		
	/*
	--- m_SetEndPoint function ----------------------------------------------------------------------------------------

	This function set the end waypoint
	
	parameters:
	- latLng : the coordinates of the end waypoint


	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_SetEndPoint ( latLng ) {
		g_TravelNotesData.travel.editedRoute.edited = 2;
		if ( 0 !== g_TravelNotesData.travel.editedRoute.wayPoints.last.lat ) {
			g_MapEditor.removeObject ( g_TravelNotesData.travel.editedRoute.wayPoints.last.objId );
		}
		g_TravelNotesData.travel.editedRoute.wayPoints.last.latLng = latLng;
		if ( g_Config.wayPoint.reverseGeocoding ) {
			m_GeoCoder.getPromiseAddress ( latLng [ 0 ], latLng [ 1 ], g_TravelNotesData.travel.editedRoute.wayPoints.last.objId ).then ( m_GeocoderRenameWayPoint );
		}
		g_MapEditor.addWayPoint ( g_TravelNotesData.travel.editedRoute.wayPoints.last, 'B' );
		m_RouteEditorUI.setWayPointsList ( );
		g_RouteEditor.startRouting ( );
	}
		
	/*
	--- m_WayPointDragEnd function ------------------------------------------------------------------------------------

	This function is called when the dragend event is fired on a waypoint
	
	parameters:
	- wayPointObjId : the TravelNotes waypoint objId

	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_WayPointDragEnd ( wayPointObjId ) {
		g_TravelNotesData.travel.editedRoute.edited = 2;
		if ( g_Config.wayPoint.reverseGeocoding ) {
			let latLng = g_TravelNotesData.travel.editedRoute.wayPoints.getAt ( wayPointObjId ).latLng;
			m_GeoCoder.getPromiseAddress ( latLng [ 0 ], latLng [ 1 ], wayPointObjId ).then ( m_GeocoderRenameWayPoint );
		}
		m_RouteEditorUI.setWayPointsList ( );
		g_RouteEditor.startRouting ( );
	}
	
	/*
	--- m_WayPointDropped function ------------------------------------------------------------------------------------

	This function is called when the drop event is fired on a waypoint
	
	-------------------------------------------------------------------------------------------------------------------
	*/

	function m_WayPointDropped ( draggedWayPointObjId, targetWayPointObjId, draggedBefore ) {
		g_TravelNotesData.travel.editedRoute.edited = 2;
		if ( targetWayPointObjId === g_TravelNotesData.travel.editedRoute.wayPoints.first.objId && draggedBefore ) {
			return;
		}
		if ( targetWayPointObjId === g_TravelNotesData.travel.editedRoute.wayPoints.last.objId && ( ! draggedBefore ) )	{
			return;
		}
		g_TravelNotesData.travel.editedRoute.wayPoints.moveTo ( draggedWayPointObjId, targetWayPointObjId, draggedBefore );
		m_RouteEditorUI.setWayPointsList ( );
		let wayPointsIterator = g_TravelNotesData.travel.editedRoute.wayPoints.iterator;
		while ( ! wayPointsIterator.done ) {
				g_MapEditor.removeObject ( wayPointsIterator.value.objId );
				g_MapEditor.addWayPoint ( wayPointsIterator.value, wayPointsIterator.first ? 'A' : ( wayPointsIterator.last ? 'B' :  wayPointsIterator.index ) );
		}
		g_RouteEditor.startRouting ( );
	}
	
	/*
	--- wayPointEditor object -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			addWayPoint : latLng => m_AddWayPoint ( latLng ),
			
			addWayPointOnRoute : ( routeObjId, event ) => m_AddWayPointOnRoute ( routeObjId, event ),
			
			reverseWayPoints : ( ) => m_ReverseWayPoints ( ),
		
			removeAllWayPoints : ( ) => m_RemoveAllWayPoints ( ),
			
			removeWayPoint : wayPointObjId => m_RemoveWayPoint ( wayPointObjId ),
			
			renameWayPoint : ( wayPointName, wayPointObjId ) => m_RenameWayPoint ( wayPointName, wayPointObjId ),
			
			swapWayPoints : ( wayPointObjId, swapUp ) => m_SwapWayPoints ( wayPointObjId, swapUp ),
			
			setStartPoint : latLng => m_SetStartPoint ( latLng ),

			setEndPoint : latLng  => m_SetEndPoint ( latLng ),

			wayPointDragEnd : wayPointObjId => m_WayPointDragEnd ( wayPointObjId ),

			wayPointDropped : ( draggedWayPointObjId, targetWayPointObjId, draggedBefore ) => m_WayPointDropped ( draggedWayPointObjId, targetWayPointObjId, draggedBefore ),
		}
	);
}

/* 
--- g_WayPointEditor object -------------------------------------------------------------------------------------------

The one and only one wayPointEditor

-----------------------------------------------------------------------------------------------------------------------
*/

let g_WayPointEditor = newWayPointEditor ( );

/*
--- End of WayPointEditor.js file -------------------------------------------------------------------------------------
*/