/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

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

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );
	var _DataManager = require ( '../data/DataManager' ) ( );
	
	// Events listeners for buttons under the routes list
	var onCancelTravelButton = function ( clickEvent ) {
		clickEvent.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).clear ( );
	};

	var onClickAddRouteButton = function ( event ) {
		event.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).addRoute ( );
	};
	
	// Events for buttons and input on the routes list items
	var onRoutesListDelete = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).removeRoute ( event.itemNode.dataObjId );
	};

	var onRoutesListUpArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, true );
	};

	var onRoutesListDownArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, false );
	};

	var onRoutesListRightArrow = function ( event ) {
		event.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).editRoute ( event.itemNode.dataObjId );
	};
	
	var onRouteslistChange = function ( event ) {
		event.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).renameRoute ( event.dataObjId, event.changeValue );
	};
	
	var onClickSaveTravelButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).saveTravel ( );
	};	
	
	var onClickOpenTravelButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		require ( '../core/TravelEditor' ) ( ).openTravel ( clickEvent );
	};	
		
	var onClickUndoButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
	};	
		
	var onClickExpandButton = function ( clickEvent ) {

		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelNotes-Control-TravelHeaderDiv' ).classList.toggle ( 'TravelNotes-Control-SmallHeader' );
		document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-ControlTravelButtonsDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.contains ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).title = hiddenList ? _Translator.getText ( 'TravelEditorUI - Show' ) : _Translator.getText ( 'TravelEditorUI - Hide' );

		clickEvent.stopPropagation ( );
	};
	
	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		
		document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.toggle ( 'TravelNotes-Control-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.contains ( 'TravelNotes-Control-ExpandedList' );
		document.getElementById ( 'TravelNotes-Control-ExpandRoutesListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelNotes-Control-ExpandRoutesListButton' ).title = expandedList ? _Translator.getText ( 'TravelEditorUI - Reduce the list' ) : _Translator.getText ( 'TravelEditorUI - Expand the list' );		
	};

	// User interface

	var _RoutesList = null;

	var getTravelEditorUI = function ( ) {
				
		var _CreateUI = function ( controlDiv ){ 
		
			if ( document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// Routes
			
			var headerDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-TravelHeaderDiv', className : 'TravelNotes-Control-HeaderDiv'}, controlDiv );

			var expandButton = htmlElementsFactory.create ( 'span', { innerHTML : '&#x25bc;', id : 'TravelNotes-ControlTravelExpandButton', className : 'TravelNotes-Control-ExpandButton'}, headerDiv );
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );
			htmlElementsFactory.create ( 'span', { innerHTML : _Translator.getText ( 'TravelEditorUI - Routes' ), id : 'TravelNotes-Control-TravelHeaderText', className : 'TravelNotes-Control-HeaderText'}, headerDiv );
		
			var dataDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-Control-TravelDataDiv', className : 'TravelNotes-Control-DataDiv'}, controlDiv );
			
			_RoutesList = require ( './SortableList' ) ( { minSize : 0, placeholders : [ _Translator.getText ( 'TravelEditorUI - Route' )], id : 'TravelNotes-Control-TravelRoutesList' }, dataDiv );
			_RoutesList.container.addEventListener ( 'SortableListDelete', onRoutesListDelete, false );
			_RoutesList.container.addEventListener ( 'SortableListUpArrow', onRoutesListUpArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListDownArrow', onRoutesListDownArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListRightArrow', onRoutesListRightArrow, false );
			_RoutesList.container.addEventListener ( 'SortableListChange', onRouteslistChange, false );
			
			var buttonsDiv = htmlElementsFactory.create ( 'div', { id : 'TravelNotes-ControlTravelButtonsDiv', className : 'TravelNotes-Control-ButtonsDiv' }, controlDiv );

			var expandListButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-ExpandRoutesListButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			);
			expandListButton.addEventListener ( 'click' , onClickExpandListButton, false );
			
			var cancelTravelButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-CancelTravelButton',
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Cancel travel' ), 
					innerHTML : '&#x274c'
				},
				buttonsDiv 
			);
			cancelTravelButton.addEventListener ( 'click', onCancelTravelButton, false );

			var saveTravelButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-SaveTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Save travel' ), 
					innerHTML : '&#x1f4be;'
				}, 
				buttonsDiv 
			);
			saveTravelButton.addEventListener ( 'click' , onClickSaveTravelButton, false );

			var openTravelDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-OpenTravelDiv'
				}, 
				buttonsDiv 
			);
			
			var openTravelInput = htmlElementsFactory.create ( 
				'input',
				{
					id : 'TravelNotes-Control-OpenTravelInput', 
					type : 'file',
					accept : '.trv'
				},
				openTravelDiv
			);
			openTravelInput.addEventListener ( 'change', onClickOpenTravelButton, false );

			var openTravelFakeDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-OpenTravelFakeDiv'
				}, 
				openTravelDiv 
			);

			var openTravelButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-OpenTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Open travel' ), 
					innerHTML : '&#x1F4C2;'
				}, 
				openTravelFakeDiv 
			);
			openTravelButton.addEventListener ( 'click' , function ( ) { openTravelInput.click ( ); }, false );
			
			var openTravelRoadbookButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-OpenTravelRoadbookButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Open travel roadbook' ), 
					innerHTML : '<a href="roadbook.html?page=' + _DataManager.UUID + '" target="_blank">&#x1F4CB;</a>' //'&#x23CD;'
				}, 
				buttonsDiv
			);

			var undoButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-UndoButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Undo' ), 
					innerHTML : '&#x21ba;'
				}, 
				buttonsDiv 
			);
			undoButton.addEventListener ( 'click' , onClickUndoButton, false );

			var addRouteButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-AddRoutesButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - New route' ), 
					innerHTML : '+'
				}, 
				buttonsDiv 
			);
			addRouteButton.addEventListener ( 'click' , onClickAddRouteButton, false );
		};	
		
		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
			
			setRoutesList : function (  ) {
				_RoutesList.removeAllItems ( );
				var routesIterator = _DataManager.travel.routes.iterator;
				while ( ! routesIterator.done ) {
					_RoutesList.addItem ( routesIterator.value.name, routesIterator.value.objId, false );
				}
			}
		};
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getTravelEditorUI;
	}

}());