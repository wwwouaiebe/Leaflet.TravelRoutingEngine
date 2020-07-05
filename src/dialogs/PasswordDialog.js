/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- PasswordDialog.js file --------------------------------------------------------------------------------------------
This file contains:
	- the newPasswordDialog.js function
Changes:
	- v1.6.0:
		- created
	- v1.11.0:
		- Issue #113 : When more than one dialog is opened, using thr Esc or Return key close all the dialogs
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { theTranslator } from '../UI/Translator.js';
import { newBaseDialog } from '../dialogs/BaseDialog.js';
import { newHTMLElementsFactory } from '../util/HTMLElementsFactory.js';

/*
--- newPasswordDialog function ----------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------------------------------
*/

function newPasswordDialog ( verifyPassword ) {

	let myHTMLElementsFactory = newHTMLElementsFactory ( );
	let myPasswordDialog = null;
	let myPasswordDiv = null;
	let myPasswordInput = null;

	/*
	--- myOnOkButtonClick function ------------------------------------------------------------------------------------

	click event listener for the ok button

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnOkButtonClick ( ) {

		const PSWD_MIN_LENGTH = 12;

		myPasswordDialog.hideError ( );
		if ( verifyPassword ) {
			if (
				( myPasswordInput.value.length < PSWD_MIN_LENGTH )
				||
				! myPasswordInput.value.match ( RegExp ( '[0-9]+' ) )
				||
				! myPasswordInput.value.match ( RegExp ( '[a-z]+' ) )
				||
				! myPasswordInput.value.match ( RegExp ( '[A-Z]+' ) )
				||
				! myPasswordInput.value.match ( RegExp ( '[^0-9a-zA-Z]' ) )
			) {
				myPasswordDialog.showError ( theTranslator.getText ( 'PasswordDialog - Password rules' ) );
				myPasswordInput.focus ( );
				return;
			}
		}

		return new window.TextEncoder ( ).encode ( myPasswordInput.value );
	}

	/*
	--- myCreateDialog function ---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateDialog ( ) {

		// the dialog base is created
		myPasswordDialog = newBaseDialog ( );
		myPasswordDialog.title = theTranslator.getText ( 'PasswordDialog - password' );
		myPasswordDialog.okButtonListener = myOnOkButtonClick;
		myPasswordDiv = myHTMLElementsFactory.create (
			'div',
			{
				id : 'TravelNotes-PasswordDialog-DataDiv'
			},
			myPasswordDialog.content
		);
	}

	/*
	--- myCreateContent function --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myCreateContent ( ) {
		myPasswordInput = myHTMLElementsFactory.create (
			'input',
			{
				id : 'TravelNotes-PasswordDialog-PasswordInput',
				type : 'password'
			},
			myPasswordDiv
		);
	}

	/*
	--- myOnShow function ---------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myOnShow ( ) {
		myPasswordInput.focus ( );
	}

	/*
	--- main function -------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	myCreateDialog ( );
	myCreateContent ( );
	myPasswordDialog.onShow = myOnShow;

	return myPasswordDialog;
}

export { newPasswordDialog };

/*
--- End of PasswordDialog.js file -------------------------------------------------------------------------------------
*/