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
	- v2.0.0:
		- created
Doc reviewed ...
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file Layer.js
@copyright Copyright - 2017 2021 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------
@typedef {Object} LayerToolbarButton
@desc A layers toolbar button properties
@property {string} text The text to display in the toolbar button
@property {string} color The foreground color of the toolbar button
@property {string} backgroundColor The background color of the toolbar button
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module Layer
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theHTMLSanitizer } from '../util/HTMLSanitizer.js';
import { ZERO, ONE } from '../util/Constants.js';

/**
@------------------------------------------------------------------------------------------------------------------------------

@class Layer
@classdesc This class represent a background map
@desc A background map with all the properties
@property {string} service The type of service: wms or wmts
@property {string} url The url to use to get the map
@property {Object} wmsOptions See the Leaflet TileLayer.WMS documentation
@property {Array.<number>} bounds The lower left and upper right corner of the map
@property {number} minZoom The smallest possible zoom for this map
@property {number} maxZoom The largest possible zoom for this map
@property {string} name The name of the map
@property {LayerToolbarButton} toolbar An object with text, color and backgroundColor properties used to create
the button in the toolbar
@property {string} providerName The name of the service provider. This name will be used to find the access key to the service.
@property {booolean} providerKeyNeeded When true, an access key is required to get the map.
@property {string} attribution The map attributions. For maps based on OpenStreetMap, it is not necessary to add
the attributions of OpenStreetMap because they are always present in Travel & Notes.
@property {string} getCapabilitiesUrl The url of the getCapabilities file when it is known.@see {@link newLayer} for constructor
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class Layer	{

	/* eslint-disable-next-line complexity, max-statements */
	constructor ( jsonLayer ) {
		if ( jsonLayer.name && 'string' === typeof ( jsonLayer.name ) ) {
			this.name = theHTMLSanitizer.sanitizeToJsString ( jsonLayer.name );
		}
		else {
			throw new Error ( 'invalid name for layer' );
		}
		if ( jsonLayer.service && ( 'wms' === jsonLayer.service || 'wmts' === jsonLayer.service ) ) {
			this.service = jsonLayer.service;
		}
		else {
			throw new Error ( 'invalid service for layer ' + this.name );
		}
		if ( jsonLayer.url && 'string' === typeof ( jsonLayer.url ) ) {
			this.url = jsonLayer.url;
		}
		else {
			throw new Error ( 'invalid url for layer ' + this.name );
		}
		if ( 'wms' === this.service ) {
			if (
				jsonLayer.wmsOptions
				&&
				jsonLayer.wmsOptions.layers && 'string' === typeof ( jsonLayer.wmsOptions.layers )
				&&
				jsonLayer.wmsOptions.format && 'string' === typeof ( jsonLayer.wmsOptions.format )
				&&
				jsonLayer.wmsOptions.transparent && 'boolean' === typeof ( jsonLayer.wmsOptions.transparent )
			) {
				this.wmsOptions = jsonLayer.wmsOptions;
				this.wmsOptions.layers = theHTMLSanitizer.sanitizeToJsString ( this.wmsOptions.layers );
				this.wmsOptions.format = theHTMLSanitizer.sanitizeToJsString ( this.wmsOptions.format );
			}
			else {
				throw new Error ( 'invalid wmsOptions for layer ' + this.name );
			}
		}
		try {
			if (
				jsonLayer.bounds
				&&
				'number' === typeof jsonLayer.bounds [ ZERO ] [ ZERO ]
				&&
				'number' === typeof jsonLayer.bounds [ ZERO ] [ ONE ]
				&&
				'number' === typeof jsonLayer.bounds [ ONE ] [ ZERO ]
				&&
				'number' === typeof jsonLayer.bounds [ ONE ] [ ONE ]
			) {
				this.bounds = jsonLayer.bounds;
			}
		}
		catch ( err ) {
			throw new Error ( 'invalid bounds for layer ' + this.name );
		}
		if ( jsonLayer.minZoom && 'number' === typeof ( jsonLayer.minZoom ) ) {
			this.minZoom = jsonLayer.minZoom;
		}
		if ( jsonLayer.maxZoom && 'number' === typeof ( jsonLayer.maxZoom ) ) {
			this.maxZoom = jsonLayer.maxZoom;
		}
		if (
			jsonLayer.toolbar
			&&
			jsonLayer.toolbar.text && 'string' === typeof ( jsonLayer.toolbar.text )
			&&
			jsonLayer.toolbar.color && 'string' === typeof ( jsonLayer.toolbar.color )
			&&
			jsonLayer.toolbar.backgroundColor && 'string' === typeof ( jsonLayer.toolbar.backgroundColor )
		) {
			this.toolbar = jsonLayer.toolbar;
			this.toolbar.text = theHTMLSanitizer.sanitizeToJsString ( this.toolbar.text );
			this.toolbar.color =
				theHTMLSanitizer.sanitizeToColor ( this.toolbar.color ) || '#000000';
			this.toolbar.backgroundColor =
				theHTMLSanitizer.sanitizeToColor ( this.toolbar.backgroundColor ) || '#ffffff';
		}
		else {
			throw new Error ( 'invalid toolbar for layer ' + this.name );
		}
		if ( jsonLayer.providerName && 'string' === typeof ( jsonLayer.providerName ) ) {
			this.providerName = theHTMLSanitizer.sanitizeToJsString ( jsonLayer.providerName );
		}
		else {
			throw new Error ( 'invalid providerName for layer ' + this.name );
		}
		if ( 'boolean' === typeof ( jsonLayer.providerKeyNeeded ) ) {
			this.providerKeyNeeded = jsonLayer.providerKeyNeeded;
		}
		else {
			throw new Error ( 'invalid providerKeyNeeded for layer ' + this.name );
		}
		if ( '' === jsonLayer.attribution ) {
			this.attribution = '';
		}
		else if ( jsonLayer.attribution && 'string' === typeof ( jsonLayer.attribution ) ) {
			this.attribution = theHTMLSanitizer.sanitizeToHtmlString ( jsonLayer.attribution ).htmlString;
		}
		else {
			throw new Error ( 'invalid attribution for layer ' + this.name );
		}
		if ( jsonLayer.getCapabilitiesUrl && 'string' === typeof ( jsonLayer.getCapabilitiesUrl ) ) {
			this.getCapabilitiesUrl = theHTMLSanitizer.sanitizeToUrl ( jsonLayer.getCapabilitiesUrl ).url;
			if ( '' === this.getCapabilitiesUrl ) {
				throw new Error ( 'invalid getCapabilitiesUrl for layer ' + this.name );
			}
		}

		Object.freeze ( this );
	}
}

function ourNewLayer ( jsonLayer ) {
	return new Layer ( jsonLayer );
}

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@function
	@desc constructor of Layer objects
	@param {object} jsonLayer the layer description coming from the TravelNotesLayer file
	@return {Layer} an instance of a Layer object
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourNewLayer as newLayer
};

/**
--- End of Layer.js file ------------------------------------------------------------------------------------------------------
*/