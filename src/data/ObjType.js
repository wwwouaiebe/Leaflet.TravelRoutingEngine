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
	- v1.5.0:
		- Issue #52 : when saving the travel to the file, save also the edited route.
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20200731
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file ObjType.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module ObjType
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theCurrentVersion } from '../data/Version.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourNewObjType
@desc Constructor for a ObjType object
@param {string} objTypeName The name of the ObjType
@return {ObjType} an instance of a ObjType object
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourNewObjType ( objTypeName ) {

	const MY_NAME = objTypeName;
	const MY_VERSION = theCurrentVersion;

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@class ObjType
	@classdesc This class represent a ObjType
	@see {@link newObjType} for constructor
	@hideconstructor

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	class ObjType {

		constructor ( ) {
			Object.freeze ( this );
		}

		/**
		the name of the ObjType
		@type {string}
		*/

		get name ( ) { return MY_NAME; }

		/**
		the version of the ObjType
		@type {string}
		*/

		get version ( ) { return MY_VERSION; }

		/**
		An object literal with the ObjType properties and without any methods.
		This object can be used with the JSON object
		@type {Object}
		*/

		get jsonObject ( ) {
			return {
				name : MY_NAME,
				version : MY_VERSION
			};
		}

		/**
		Verify that the ObjType is valid
		@throws when the ObjType is invalid
		*/

		validate ( something ) {
			if ( ! Object.getOwnPropertyNames ( something ).includes ( 'name' ) ) {
				throw new Error ( 'No name for ' + MY_NAME );
			}
			if ( MY_NAME !== something.name ) {
				throw new Error ( 'Invalid name for ' + MY_NAME );
			}
			if ( ! Object.getOwnPropertyNames ( something ).includes ( 'version' ) ) {
				throw new Error ( 'No version for ' + MY_NAME );
			}
		}
	}

	return new ObjType ( );

}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function newObjType
	@desc Constructor for a ObjType object
	@param {string} objTypeName The name of the ObjType
	@return {ObjType} an instance of a ObjType object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewObjType as newObjType
};

/*
--- End of ObjType.js file ----------------------------------------------------------------------------------------------------
*/