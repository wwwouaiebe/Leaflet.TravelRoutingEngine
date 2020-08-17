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
	- v1.3.0:
		- added train button
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20200817
Tests ...
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@file DataPanesUI.js
@copyright Copyright - 2017 2020 - wwwouaiebe - Contact: https://www.ouaie.be/
@license GNU General Public License
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@typedef {Object} PaneUI
@desc An object that can be displayed as a pane
@property {function} remove A function that do the cleaning of the Data pane
@property {function} add A function that add all the needed HTMLElement in the Data pane
@property {function} getId A function that gives a unique identifier for the DataPaneUI
@property {function} getButtonText A function that return the text to be displayed in the Data pane button
@public

@------------------------------------------------------------------------------------------------------------------------------
*/

/**
@------------------------------------------------------------------------------------------------------------------------------

@module DataPanesUI
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

import { theHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { MOUSE_WHEEL_FACTORS, DATA_PANE_ID } from '../util/Constants.js';

let ourActivePaneId = DATA_PANE_ID.invalidPane;
let ourPanes = new Map ( );
let ourDataPaneDiv = null;

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourRemoveActivePane
@desc This method remove the content of the Data Pane Div
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourRemoveActivePane ( ) {
	if ( DATA_PANE_ID.invalidPane !== ourActivePaneId ) {
		ourPanes.get ( ourActivePaneId ).remove ( ourDataPaneDiv );
		ourDataPaneDiv.innerHTML = '';
	}
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourShowPane
@desc Show a pane
@param paneId the pane id to show
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourShowPane ( paneId ) {
	ourRemoveActivePane ( );
	ourActivePaneId = paneId;
	ourPanes.get ( ourActivePaneId ).add ( ourDataPaneDiv );
	document.querySelectorAll ( '.TravelNotes-DataPaneUI-PaneButton' ).forEach (
		paneButton => {
			if ( paneButton.paneId === ourActivePaneId ) {
				paneButton.classList.add ( 'TravelNotes-DataPaneUI-ActivePaneButton' );
			}
			else {
				paneButton.classList.remove ( 'TravelNotes-DataPaneUI-ActivePaneButton' );
			}
		}
	);
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnPaneButtonClick
@desc click event listener for the pane buttons
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnPaneButtonClick ( clickEvent ) {
	ourShowPane ( clickEvent.target.paneId );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@function ourOnDataPaneDivWheel
@desc Wheel event listener for Data Pane Div
@private

@------------------------------------------------------------------------------------------------------------------------------
*/

function ourOnDataPaneDivWheel ( wheelEvent ) {
	if ( wheelEvent.deltaY ) {
		wheelEvent.target.scrollTop +=
			wheelEvent.deltaY * MOUSE_WHEEL_FACTORS [ wheelEvent.deltaMode ];
	}
	wheelEvent.stopPropagation ( );
}

/**
@------------------------------------------------------------------------------------------------------------------------------

@class
@classdesc This class manages the differents panes on the UI
@see {@link theDataPanesUI} for the one and only one instance of this class
@hideconstructor

@------------------------------------------------------------------------------------------------------------------------------
*/

class DataPanesUI {

	/**
	creates the data panes on the user interface
	@param {HTMLElement} uiMainDiv The HTML element in witch the different elements of the UI have to be created
	*/

	createUI ( uiMainDiv ) {
		if ( ourDataPaneDiv ) {
			return;
		}
		let headerDiv = theHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-UI-FlexRowDiv'
			},
			uiMainDiv
		);
		ourPanes.forEach (
			pane => {
				theHTMLElementsFactory.create (
					'div',
					{
						innerHTML : pane.getButtonText ( ),
						className : 'TravelNotes-DataPaneUI-PaneButton',
						paneId : pane.getId ( )
					},
					headerDiv
				).addEventListener ( 'click', ourOnPaneButtonClick, false );
			}
		);
		ourDataPaneDiv = theHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-DataPanesUI-DataPanesDiv'
			},
			uiMainDiv
		);
		ourDataPaneDiv.addEventListener ( 'wheel', ourOnDataPaneDivWheel, false );
	}

	/**
	add a pane to the DataPanesUI
	@param {PaneUI} paneUI The pane to add
	*/

	addPane ( paneUI ) {
		ourPanes.set ( paneUI.getId ( ), paneUI );
	}

	/**
	show a pane to the DataPanesUI
	@param {string|number} pane id of the pane to be displayed
	*/

	showPane ( paneId ) {
		ourShowPane ( paneId );
	}

	/**
	Update a pane ( = show the pane only if the pane is the active pane )
	@param {string|number} pane id of the pane to be displayed
	*/

	updatePane ( paneId ) {
		if ( paneId === ourActivePaneId ) {
			ourShowPane ( paneId );
		}
	}
}

const ourDataPanesUI = Object.freeze ( new DataPanesUI );

export {

	/**
	@--------------------------------------------------------------------------------------------------------------------------

	@desc The one and only one instance of DataPanesUI class
	@type {DataPanesUI}
	@constant
	@global

	@--------------------------------------------------------------------------------------------------------------------------
	*/

	ourDataPanesUI as theDataPanesUI
};

/*
--- End of dataPanesUI.js file ----------------------------------------------------------------------------------------
*/