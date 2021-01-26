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
	- v1.6.0:
		- created
	- v1.13.0:
		- Issue #125 : Outphase osmSearch and add it to TravelNotes
Doc reviewed 20200824
Tests ...
*/

const STATUS_OK = 200;
const READY_STATE_DONE = 4;
const TIMEOUT = 40000;

/**
@------------------------------------------------------------------------------------------------------------------------------

@file HttpRequestBuilder.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} RequestHeader
@desc An object representing a request header
@property {string} headerName The header name
@property {string} headerValue The header value
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module HttpRequestBuilder
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@--------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class contains methods for doing http requests
@see {@link theHttpRequestBuilder} for the one and only one instance of this class
@todo Fetch migration
@hideconstructor

@--------------------------------------------------------------------------------------------------------------------------
*/

class HttpRequestBuilder {

	/**
	Start the download of a json file returning a Promise that fullfil when the asked file is downloaded
	correctly and reject when an error occurs.
	The file content is parsed with JSON.parse ( ) and returned as an object to the success handler
	@param {string} url The url of the file to download
	@param {Array.<RequestHeader>} requestHeaders An array of request headers to add to the request
	*/

	getJsonPromise ( url, requestHeaders ) {

		function jsonRequest ( onOk, onError ) {
			let xmlHttpRequest = new XMLHttpRequest ( );
			xmlHttpRequest.timeout = TIMEOUT;
			xmlHttpRequest.ontimeout = function ( ) {
				onError ( 'XMLHttpRequest TimeOut. File : ' + xmlHttpRequest.responseURL );
			};
			xmlHttpRequest.onreadystatechange = function ( ) {
				if ( READY_STATE_DONE === xmlHttpRequest.readyState ) {
					if ( STATUS_OK === xmlHttpRequest.status ) {
						let response = null;
						try {
							response = JSON.parse ( xmlHttpRequest.responseText );
						}
						catch ( err ) {
							onError ( err.message + ' File: ' + xmlHttpRequest.responseURL );
						}
						onOk ( response );
					}
					else {
						onError ( 'Error XMLHttpRequest - File : ' + xmlHttpRequest.responseURL );
					}
				}
			};
			xmlHttpRequest.open ( 'GET', url, true );
			if ( requestHeaders ) {
				requestHeaders.forEach ( header => xmlHttpRequest.setRequestHeader ( header.headerName, header.headerValue ) );
			}
			xmlHttpRequest.overrideMimeType ( 'application/json' );
			xmlHttpRequest.send ( null );
		}

		return new Promise ( jsonRequest );
	}
}

const ourHttpRequestBuilder = Object.freeze ( new HttpRequestBuilder );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of HttpRequestBuilder class
	@type {HttpRequestBuilder}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourHttpRequestBuilder as theHttpRequestBuilder
};

/*
--- End of HttpRequestBuilder.js file -----------------------------------------------------------------------------------------
*/