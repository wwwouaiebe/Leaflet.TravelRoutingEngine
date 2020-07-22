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
--- RoutePropertiesDialog.js file -------------------------------------------------------------------------------------
This file contains:
	- the newRoutePropertiesDialog function
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #36: Add a linetype property to route
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #66 : Work with promises for dialogs
		- Issue #63 : Find a better solution for provider keys upload
	- v1.12.0:
		- Issue #120 : Review the UserInterface
Doc reviewed 20191124
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { theConfig } from '../data/Config.js';
import { newColorDialog } from '../dialogs/ColorDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

import { ZERO } from '../util/Constants.js';

/*
--- newRoutePropertiesDialog function ---------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newRoutePropertiesDialog ( route ) {

	const ROUTE_MIN_WIDTH = 1;
	const ROUTE_MAX_WIDTH = 40;

	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myRoutePropertiesDialog = null;
	let myRoutePropertiesDiv = null;
	let myNameInput = null;
	let myWidthInput = null;
	let myChainInput = null;
	let myDashSelect = null;

	/*
	--- myOnOkButtonClick function ------------------------------------------------------------------------------------

	click event listener for the ok button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {
		route.color = document.getElementById ( 'TravelNotes-ColorDialog-ColorSampleDiv' ).color;
		if ( route.computedName !== myNameInput.value ) {
			route.name = myNameInput.value;
		}
		route.width = parseInt ( myWidthInput.value );
		route.chain = myChainInput.checked;
		route.dashArray = myDashSelect.selectedIndex;

		return route;
	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {

		// the dialog base is created
		myRoutePropertiesDialog = newColorDialog ( route.color );
		myRoutePropertiesDialog.title = theTranslator.getText ( 'RoutePropertiesDialog - Route properties' );
		myRoutePropertiesDialog.okButtonListener = myOnOkButtonClick;
	}

	/*
	--- myCreateRoutePropertiesDiv function ---------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateRoutePropertiesDiv ( ) {
		myRoutePropertiesDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-RoutePropertiesDialog-MainDataDiv'
			}
		);
		myRoutePropertiesDialog.content.insertBefore (
			myRoutePropertiesDiv,
			myRoutePropertiesDialog.content.firstChild
		);
	}

	/*
	--- myCreateWidthDiv function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateNameDiv ( ) {
		let nameDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-RoutePropertiesDialog-NameDiv'
			},
			myRoutePropertiesDiv
		);

		myHTMLElementsFactory.create (
			'div',
			{
				innerHTML : theTranslator.getText ( 'RoutePropertiesDialog - Name' )
			},
			nameDiv
		);

		let inputNameDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-NameInputDiv'
			},
			nameDiv
		);

		myNameInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'text',
				id : 'TravelNotes-RoutePropertiesDialog-NameInput',
				value : route.computedName
			},
			inputNameDiv
		);

	}

	/*
	--- myCreateWidthDiv function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateWidthDiv ( ) {
		let widthDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-WithDiv',
				innerHTML : '<span>' + theTranslator.getText ( 'RoutePropertiesDialog - Width' ) + '</span>'
			},
			myRoutePropertiesDiv
		);

		myWidthInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'number',
				id : 'TravelNotes-RoutePropertiesDialog-WidthInput',
				value : route.width,
				min : ROUTE_MIN_WIDTH,
				max : ROUTE_MAX_WIDTH
			},
			widthDiv
		);
	}

	/*
	--- myCreateDashDiv function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDashDiv ( ) {
		let dashDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-dashDiv'
			},
			myRoutePropertiesDiv
		);
		dashDiv.innerHTML = '<span>' + theTranslator.getText ( 'RoutePropertiesDialog - Linetype' ) + '</span>';
		myDashSelect = myHTMLElementsFactory.create (
			'select',
			{
				className : 'TravelNotes-RoutePropertiesDialog-Select',
				id : 'TravelNotes-RoutePropertiesDialog-DashSelect'
			},
			dashDiv
		);

		let dashChoices = theConfig.route.dashChoices;
		for ( let optionsCounter = ZERO; optionsCounter < dashChoices.length; optionsCounter ++ ) {
			myDashSelect.add ( myHTMLElementsFactory.create ( 'option', { text : dashChoices [ optionsCounter ].text } ) );
		}
		myDashSelect.selectedIndex = route.dashArray < dashChoices.length ? route.dashArray : ZERO;
	}

	/*
	--- myCreateChainDiv function -------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateChainDiv ( ) {
		let chainDiv = myHTMLElementsFactory.create (
			'div',
			{
				className : 'TravelNotes-RoutePropertiesDialog-DataDiv',
				id : 'TravelNotes-RoutePropertiesDialog-ChainDiv'
			},
			myRoutePropertiesDiv
		);
		chainDiv.innerHTML = '<span>' + theTranslator.getText ( 'RoutePropertiesDialog - Chained route' ) + '</span>';
		myChainInput = myHTMLElementsFactory.create (
			'input',
			{
				type : 'checkbox',
				id : 'TravelNotes-RoutePropertiesDialog-ChainInput'
			},
			chainDiv
		);
		myChainInput.checked = route.chain;
	}

	/*
	--- myCreateColorHeaderDiv function -------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateColorHeaderDiv ( ) {
		myHTMLElementsFactory.create (
			'div',
			{
				innerHTML : theTranslator.getText ( 'RoutePropertiesDialog - Color' ),
				id : 'TravelNotes-RoutePropertiesDialog-ColorHeaderDiv'
			},
			myRoutePropertiesDiv
		);
	}

	/*
	--- main ----------------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	myCreateDialog ( );
	myCreateRoutePropertiesDiv ( );
	myCreateNameDiv ( );
	myCreateWidthDiv ( );
	myCreateDashDiv ( );
	myCreateChainDiv ( );
	myCreateColorHeaderDiv ( );

	return myRoutePropertiesDialog;
}

export { newRoutePropertiesDialog };

/*
--- End of RoutePropertiesDialog.js file ------------------------------------------------------------------------------
*/