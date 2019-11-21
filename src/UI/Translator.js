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
--- Translator.js file ------------------------------------------------------------------------------------------------
This file contains:
	- the newTranslator function
	- the g_Translator object
Changes:
	- v1.0.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed 20191121
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

export { g_Translator };

/* 
--- newTranslator funtion ---------------------------------------------------------------------------------------------

This function returns a Translator object

Patterns : Closure and singleton 
-----------------------------------------------------------------------------------------------------------------------
*/

function newTranslator ( ) {

	let m_translations = new Map ( );
	
	function m_SetTranslations ( translations ) {
		translations.forEach (
			translation => m_translations.set ( translation.msgid, translation.msgstr )
		);
	}
	
	function m_GetText ( msgid , params ) { 
		let translation = m_translations.get ( msgid );
		if ( params && translation ) {
			Object.getOwnPropertyNames ( params ).forEach (
				propertyName => translation = translation.replace ( '{' + propertyName + '}' , params [ propertyName ] )
			);
		}
		
		return translation ? translation : msgid;
	}
	
	return {
		setTranslations : translations => m_SetTranslations ( translations ),
		getText : ( msgid , params ) => { return m_GetText ( msgid , params ); }
	};
}

/* 
--- g_Translator object -----------------------------------------------------------------------------------------------

The one and only one translator

-----------------------------------------------------------------------------------------------------------------------
*/

let g_Translator = newTranslator ( );

/*
--- End of Translator.js file -----------------------------------------------------------------------------------------
*/	
