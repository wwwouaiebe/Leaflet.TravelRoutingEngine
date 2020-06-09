/*
Copyright - 2020 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- FloatWindow.js file ----------------------------------------------------------------------------------------------
This file contains:
	- the newFloatWindow function
Changes:
	- v1.7.0:
		- created
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';
import { theTravelNotesData } from '../data/TravelNotesData.js';

import { ZERO } from '../util/Constants.js';

/*
--- newFloatWindow function -------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newFloatWindow ( ) {

	const DRAG_MARGIN = 20;

	let myWindowDiv = null;
	let myHeaderDiv = null;
	let myContentDiv = null;

	let myStartDragX = ZERO;
	let myStartDragY = ZERO;
	let myWindowX = ZERO;
	let myWindowY = ZERO;
	let myScreenWidth = ZERO;
	let myScreenHeight = ZERO;

	let myOnClose = null;

	let myHTMLElementsFactory = newHTMLElementsFactory ( );

	/*
	--- myCreateDialogDiv function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateWindowDiv ( ) {
		myScreenWidth = theTravelNotesData.map.getContainer ( ).clientWidth;
		myScreenHeight = theTravelNotesData.map.getContainer ( ).clientHeight;

		myWindowDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-FloatWindow-Container'
			},
			document.querySelector ( 'body' )
		);

	}

	/*
	--- myClose function ----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myClose ( ) {
		if ( myOnClose ) {
			myOnClose ( );
		}
		document.querySelector ( 'body' ).removeChild ( myWindowDiv );
	}

	/*
	--- myCreateTopBar function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateTopBar ( ) {
		let topBar = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-FloatWindow-TopBar',
				draggable : true
			},
			myWindowDiv
		);

		let cancelButton = myHTMLElementsFactory.create (
			'div',
			{
				innerHTML : '&#x274c',
				className : 'TravelNotes-FloatWindow-CancelButton',
				title : theTranslator.getText ( 'FloatWindow - Close' )
			},
			topBar
		);

		cancelButton.addEventListener ( 'click', myClose, false );

		topBar.addEventListener (
			'dragstart',
			dragStartEvent => {
				try {
					dragStartEvent.dataTransfer.setData ( 'Text', '1' );
				}
				catch ( err ) {
					console.log ( err );
				}
				myStartDragX = dragStartEvent.screenX;
				myStartDragY = dragStartEvent.screenY;
			},
			false
		);

		topBar.addEventListener (
			'dragend',
			dragEndEvent => {
				myWindowX += dragEndEvent.screenX - myStartDragX;
				myWindowY += dragEndEvent.screenY - myStartDragY;
				myWindowX = Math.min (
					Math.max ( myWindowX, DRAG_MARGIN ),
					myScreenWidth - myWindowDiv.clientWidth - DRAG_MARGIN
				);
				myWindowY = Math.max ( myWindowY, DRAG_MARGIN );
				let dialogMaxHeight =
					myScreenHeight - Math.max ( myWindowY, ZERO ) - DRAG_MARGIN;
				myWindowDiv.setAttribute (
					'style',
					'top:' + myWindowY + 'px;left:' + myWindowX + 'px;max-height:' + dialogMaxHeight + 'px;'
				);
			},
			false
		);

	}

	/*
	--- myCreateHeaderDiv function ------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateHeaderDiv ( ) {
		myHeaderDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-FloatWindow-HeaderDiv'
			},
			myWindowDiv
		);
	}

	/*
	--- myCreateContentDiv function -----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateContentDiv ( ) {
		myContentDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-FloatWindow-ContentDiv'
			},
			myWindowDiv
		);
	}

	/*
	--- createWindow function -----------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateWindow ( ) {
		myCreateWindowDiv ( );
		myCreateTopBar ( );
		myCreateHeaderDiv ( );
		myCreateContentDiv ( );
	}

	/*
	--- FloatWindow object --------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return {
		createWindow : ( ) => myCreateWindow ( ),

		close : ( ) => myClose ( ),

		set onClose ( OnClose ) { myOnClose = OnClose; },

		get header ( ) { return myHeaderDiv; },
		set header ( Header ) { myHeaderDiv = Header; },

		get content ( ) { return myContentDiv; },
		set content ( Content ) { myContentDiv = Content; }
	};
}

export { newFloatWindow };

/*
--- End of FloatWindow.js file ----------------------------------------------------------------------------------------
*/