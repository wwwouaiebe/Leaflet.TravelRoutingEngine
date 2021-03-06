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
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
	- v1.7.0:
		- issue #89 : Add elevation graph
	- v2.0.0:
		- Issue #138 : Protect the app - control html entries done by user.
Doc reviewed 20200730
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ItineraryPoint.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ItineraryPoint
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/* eslint no-fallthrough: ["error", { "commentPattern": "eslint break omitted intentionally" }]*/

import { newObjId } from '../data/ObjId.js';
import { newObjType } from '../data/ObjType.js';
import { ELEV, LAT_LNG, DISTANCE, ZERO, ONE } from '../util/Constants.js';

const OUR_OBJ_TYPE = newObjType ( 'ItineraryPoint' );
const OUR_OBJ_IDS = new WeakMap ( );

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourUpgrade
@desc performs the upgrade
@param {Object} itineraryPoint an itineraryPoint to upgrade
@throws {Error} when the itineraryPoint version is invalid
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourUpgrade ( itineraryPoint ) {
	switch ( itineraryPoint.objType.version ) {
	case '1.0.0' :
	case '1.1.0' :
	case '1.2.0' :
	case '1.3.0' :
	case '1.4.0' :
	case '1.5.0' :
	case '1.6.0' :
		itineraryPoint.elev = ELEV.defaultValue;
		// eslint break omitted intentionally
	case '1.7.0' :
	case '1.7.1' :
	case '1.8.0' :
	case '1.9.0' :
	case '1.10.0' :
	case '1.11.0' :
	case '1.12.0' :
	case '1.13.0' :
	case '2.0.0' :
	case '2.1.0' :
	case '2.2.0' :
		itineraryPoint.objType.version = '2.3.0';
		break;
	default :
		throw new Error ( 'invalid version for ' + OUR_OBJ_TYPE.name );
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourValidate
@desc verify that the parameter can be transformed to an ItineraryPoint and performs the upgrate if needed
@param {Object} something an object to validate
@return {Object} the validated object
@throws {Error} when the parameter is invalid
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourValidate ( something ) {
	if ( ! Object.getOwnPropertyNames ( something ).includes ( 'objType' ) ) {
		throw new Error ( 'No objType for ' + OUR_OBJ_TYPE.name );
	}
	OUR_OBJ_TYPE.validate ( something.objType );
	if ( OUR_OBJ_TYPE.version !== something.objType.version ) {
		ourUpgrade ( something );
	}
	let properties = Object.getOwnPropertyNames ( something );
	[ 'lat', 'lng', 'distance', 'elev', 'objId' ].forEach (
		property => {
			if ( ! properties.includes ( property ) ) {
				throw new Error ( 'No ' + property + ' for ' + OUR_OBJ_TYPE.name );
			}
		}
	);
	return something;
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class ItineraryPoint
@classdesc This class represent an itinerary point
@see {@link newItineraryPoint} for constructor
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class ItineraryPoint {

	constructor ( ) {

		/**
			the latitude of the ItineraryPoint
			@type {number}
			*/

		this.lat = LAT_LNG.defaultValue;

		/**
			the longitude of the ItineraryPoint
			@type {number}
			*/

		this.lng = LAT_LNG.defaultValue;

		/**
			the distance between the beginning of the itinerary and the ItineraryPoint
			@type {number}
			*/

		this.distance = DISTANCE.defaultValue;

		/**
			the elevation (if any)  of the ItineraryPoint
			@type {number}
			*/

		this.elev = ELEV.defaultValue;

		OUR_OBJ_IDS.set ( this, newObjId ( ) );

		Object.seal ( this );
	}

	/**
	the latitude and longitude of the ItineraryPoint
	@type {number[]}
	*/

	get latLng ( ) { return [ this.lat, this.lng ]; }
	set latLng ( LatLng ) {
		this.lat = LatLng [ ZERO ];
		this.lng = LatLng [ ONE ];
	}

	/**
	the ObjType of the WayPoint.
	@type {ObjType}
	@readonly
	*/

	get objType ( ) { return OUR_OBJ_TYPE; }

	/**
	the objId of the ItineraryPoint. objId are unique identifier given by the code
	@readonly
	@type {!number}
	*/

	get objId ( ) { return OUR_OBJ_IDS.get ( this ); }

	/**
	An object literal with the ItineraryPoint properties and without any methods.
	This object can be used with the JSON object
	@type {Object}
	*/

	get jsonObject ( ) {
		return {
			lat : parseFloat ( this.lat.toFixed ( LAT_LNG.fixed ) ),
			lng : parseFloat ( this.lng.toFixed ( LAT_LNG.fixed ) ),
			distance : parseFloat ( this.distance.toFixed ( DISTANCE.fixed ) ),
			elev : parseFloat ( this.elev.toFixed ( ELEV.fixed ) ),
			objId : OUR_OBJ_IDS.get ( this ),
			objType : OUR_OBJ_TYPE.jsonObject
		};
	}

	set jsonObject ( something ) {
		let otherthing = ourValidate ( something );
		this.lat = otherthing.lat || LAT_LNG.defaultValue;
		this.lng = otherthing.lng || LAT_LNG.defaultValue;
		this.distance = otherthing.distance || DISTANCE.defaultValue;
		this.elev = otherthing.elev || ELEV.defaultValue;
		OUR_OBJ_IDS.set ( this, newObjId ( ) );
		this.validateData ( );
	}

	/*
	This method verify that the data stored in the object have the correct type, and,
	for html string data, that they not contains invalid tags and attributes.
	This method must be called each time the data are modified by the user or when
	a file is opened
	*/

	validateData ( ) {
		if ( 'number' !== typeof ( this.lat ) ) {
			this.lat = LAT_LNG.defaultValue;
		}
		if ( 'number' !== typeof ( this.lng ) ) {
			this.lng = LAT_LNG.defaultValue;
		}
		if ( 'number' !== typeof ( this.distance ) ) {
			this.distance = DISTANCE.defaultValue;
		}
		if ( 'number' !== typeof ( this.elev ) ) {
			this.elev = ELEV.defaultValue;
		}
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewItineraryPoint
@desc Constructor for an ItineraryPoint object
@return {ItineraryPoint} an instance of a ItineraryPoint object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewItineraryPoint ( ) {
	return new ItineraryPoint ( );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newItineraryPoint
	@desc Constructor an ItineraryPoint object
	@return {ItineraryPoint} an instance of a ItineraryPoint object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewItineraryPoint as newItineraryPoint
};

/*
--- End of ItineraryPoint.js file ---------------------------------------------------------------------------------------------
*/