/*
 *--------------------------------------------------------------------------
 * 
 * Interactive Seating Chart Application
 * Preface
 *--------------------------------------------------------------------------
 *
 * @author     Nate Buchar, Brooklyn United 
 *             Ace Atienza, Brooklyn United 
 * @version    1.0 beta 2
 * @copyright  2013 Brooklyn United / All rights reserved
 *
 * Developer Mode?: */ DeveloperMode = true; /*
 *
 *--------------------------------------------------------------------------
 * Known Issues
 *--------------------------------------------------------------------------
 * - 31 Jul 13 13:30 <Nate>
 *   Can select more than four seats a time; limit to just four.
 *
 *   ! Resolved 06 Aug 13 16:20 <Nate>
 *
 * - 31 Jul 13 16:29 <Nate>
 *   Animations are slow and lag the system. This has only started to occur
 *   after using .attr() to apply styles, and not CSS.
 *
 *   @see window.App.Data.seat
 *
 *   This may however be related to clearing and repopulating the selection
 *   table following every seat selection. There are no delays when
 *   deselecting elements, which leads me to believe it's that .attr() is
 *   the culprit.
 *   
 *   ! Update 06 Aug 13 16:44 <Nate>
 *   The issue seems to have resolved itself for small numbers.
 *
 *   ! Update 07 Aug 10:28 <Nate>
 *   Maximum selection count implemented; user cannot select more than four
 *   seats at a time, therefore this becomes a non-issue
 *
 *   ! Resolved 07 Aug 10:28 <Nate>
 *
 * - 06 Aug 13 10:34 <Nate>
 *   Selected seats table delete buttons are currently non-operational.
 *
 *--------------------------------------------------------------------------
 * Future Features
 *--------------------------------------------------------------------------
 * - click and drag to select <implemented> <Nate>
 * - seat sorting and filtering
 * - seat selection rules
 * - seat object constructor with relevant methods
 * - seats selected must be adjacent
 *    - provide user feedback to errors
 *
 */
 
/*
 *--------------------------------------------------------------------------
 * Models
 * Documentation
 *--------------------------------------------------------------------------
 *
 * Declare your model here: */ Model = 'map01'; /*
 *
 * Contents:
 * - 1. How to Import a Data Model
 * - 2. Referring to a Data Model Within the Application
 *
 * 1. How to Import a Data Model:
 *
 * Include the data file in the header of the application index.
 * Filename need not be the same as the JSON Model name, however
 * Model names must be unique.
 *
 *   <script type="text/javascript" src="path/to/data.js"></script>
 *
 * In the data file, be sure to namespace the JSON data by using 
 * window.App.Data. Example:
 *
 *   window.App.Data.map01 = { ... };
 *
 * The name of the data Model in this 'map01'. We abstract loading the
 * models by declaring the name of our desired model at the start of
 * the application JS. When the Application has been started, we declare
 * our Model using this string via window.App.Data['ourmodel']
 *
 *   Model = 'map01';
 *
 * 
 * 2. Referring to a Data Model Within the Application:
 * 
 * To refer to the model that you've previously declared (@see '1. How to
 * Import a Data Model'), we first declare the Application namespace,
 * which in our case is Window.App, then the Data namespace which is
 * a subspace of the Application: Window.App.Data, then followed by the
 * term 'Model', which is an object assoicated with the Data object, and
 * was previously declared:
 *
 *   window.App.Data.Model
 *
 * Example usage:
 *
 *   // assuming 'width' and 'seats' are applicable properties of our model
 *   var mapWidth = window.App.Data.Model.width;
 *   var seats = window.App.Data.Model.seats;
 *   
 *   seats.forEach(function(seat) { ... });
 *
 */

// Whole-script strict mode snytax
// "use strict";
(function($) {

	/* 
	*	Import module path from Drupal; BROKEN
	*  @see bmgseating.module
	*/
	// Drupal.behaviors.bmgseating = {
	//     attach: function (context, settings) {
	//       this.modulePath = Drupal.settings.bmgseating.modulePath;
	//       this.basePath = Drupal.settings.basePath;
	//     },
	//     getPaths: function() {
	//     	return this.modulePath;
	//     }
 //  	};
 //  	// Drupal.behaviors.bmgseating.attach();
	// // console.log(Drupal.behaviors.bmgseating); // Object
	// // console.log(Drupal.behaviors.bmgseating.basePath); // undefined
	// console.log(Drupal.behaviors.bmgseating.modulePath);

	// hack. hardcoded for now
	var modulePath = 'sites/all/modules/bmg-seating';
	var basePath = 'http://localhost/drupal/';

	/*
	 *--------------------------------------------------------------------------
	 * Application namespace
	 *--------------------------------------------------------------------------
	 *
	 * paths      An obejct containing the list of applicable paths
	 * chart      The chart object; @see window.App.Chart
	 * utilities  An object containing utility methods
	 * data       
	 * start      Application object start method; runs all initializations and
	 *            starts the application.
	 *
	 */
	window.App = {
	
		// subspaced Application objects
		Paths: {},
		Data: {},
		Model: {},
		Map: {},
		Utilities: {},
		
		// Application methods
		start: function() {
			// load map data model
			window.App.importModel();
		},
		
		importModel: function(model) {
			var data, pathToModel;
			
			pathToModel = window.App.Paths.data + Model + '.js';
			var url = basePath + 'ticketmaster';
			
			$.ajax({
				url: url,
				type: 'GET',
				dataType: 'json'
			})
			
			// getJSON success
			.done(function(json) {
		
				// set the JSON data to the Model
				window.App.Model = json.data;
				
				// initialize Map object constructor
				window.App.Map.init();
			})
			
			// getJSON failure
			.fail(function(jqxhr, textStatus, error) {
				console.log('Error: ' + url + ' : ' + error);
			})
			
			// always perform this action
			.always(function() {
				// console.log('getJSON: complete');
			});
		},
	};
	
	
	/*
	 *--------------------------------------------------------------------------
	 * window.App.Paths
	 *--------------------------------------------------------------------------
	 *
	 * Paths for maps, charts, buttons, and other SVG objects
	 *
	 */
	window.App.Paths = {
		data: modulePath + '/data/',
		images: modulePath + '/img/'
	};
	
	
	/*
	 *--------------------------------------------------------------------------
	 * window.App.Data
	 *--------------------------------------------------------------------------
	 *
	 * Contains data that will be used elsewhere numerous times throughout the
	 * application; conveniently located in one single location.
	 *
	 * seat	defines properties for all seats, such as radius and fill color
	 * map*	map data
	 *
	 */
	window.App.Data = {
		seat: {
			'static': {
				'r': 5,
				'fill': '#39C7FF',
				'strokeWidth': 2,
				'stroke': 'rgba(0,0,0,0)'
			},
			'hover': {
				'r': 6,
				'fill': '#FBA2E9',
				'stroke': 'rgba(0,0,0,0)'
			},
			'select': {
				'r': 7,
				'fill': '#E834C6',
				'stroke': '#FFFFFF'
			},
			'active': {
				'r': 5,
				'fill': '#39C7FF',
				'stroke': 'rgba(0,0,0,0)'
			}
		}
	};
	
	
	/*
	 *--------------------------------------------------------------------------
	 * window.App.Map object constructor
	 *--------------------------------------------------------------------------
	 *
	 * @method init()    initializes setup of chart; calls the create() method
	 * @method create()  creates the chart by appending to the #chart node
	 *
	 * Seat  The Seat object constructor
	 *
	 * @returns {object} returns self
	 *
	 */
	window.App.Map = (function() {
	
		// global variables within the Chart namespace
		var self, $map, svg, $svg,
		    $tooltip, mapOffset, scale,
		    selectedSeats, isDragging, mouse,
		    $seatsTableData, chosenSeats, $submit;
		
		return {			
			// initialize
			init: function() {
				// referencing parent object for access outside of scope
				self = this;
				
				// bind elements
				self.bindElements();
				
				// set initial values
				scale = 1;
				selectedSeats = [];
				chosenSeats = [];
				
				// attach event listener on push
				selectedSeats.push = function (){
					for(var i = 0, l = arguments.length; i < l; i += 1) {
						this[this.length] = arguments[i];
						self.updateSeats(this,this.length);
					}
					return this.length;
				};
				
				mapOffset = {
				 'left': $map.offset().left,
				  'top': $map.offset().top
					//'left': 0,
					//'top': 0
				};
				isDragging = false;
				
				// set up and create
				self.create();
			},
			
			// bind elements
			bindElements: function() {
				$map = $('#map');
				$tooltip = $('#seat-tooltip');
				$seatsTableData = $('#selected-seats-data');
				$submit = $('.seating-submit');

				$submit.click(function(event) {
					event.preventDefault();
					self.submitSelection();
				});
			},
			
			// create chart
			create: function() {
				svg = window.d3.select('#map')
					.append('svg:svg')
					.attr({
						'width'	: window.App.Model.width,
						'height': window.App.Model.height,
					})
					.style({
						'background-image':
							"url(" + window.App.Paths.images + window.App.Model.background + ")"
					});
				
				// bind jQuery svg var
				$svg = $('#map svg');
					
				// map mousemove
				$svg.on('mouseup', self.mapMouseup);
				
				// draw the map elements
				self.drawMap();
			},
			
			// draw seats
			drawMap: function() {

				svg.selectAll('g')
					.data(window.App.Model.sections)
					.enter()
					.append('g')
					.attr({
						'name': function(d) { return d.name; },
						'x'		: function(d) { return d.x; },
						'y'		: function(d) { return d.y; },
						'width'	: function(d) { return d.width; },
						'height': function(d) { return d.height; }
					})
					.classed('section', true)
					.each(function(d) {
						d3.select(this).selectAll('circle')
							.data(d.seats)
							.enter()
							.append('circle')
							.attr({
								'cx': function(d) { return d.cx ; },
								'cy': function(d) { return d.cy; },
								'r': window.App.Data.seat.static.r*scale,
								'fill': window.App.Data.seat.static.fill,
								'stroke-width': window.App.Data.seat.static.strokeWidth,
								'stroke': window.App.Data.seat.static.stroke
							})
							.classed({
								'seat': true,
								'sold': function(d) { return d.available === 'false' }
							})
							
							// seat mouseover
							.on('mouseover', self.seatMouseover)
						 	
						 	// seat mouseout
						 	.on('mouseout', self.seatMouseout)
						 	
						 	// seat click
						 	.on('click', self.seatClick)
						 	
						 	// seat mousedown
						 	.on('mousedown', self.seatMousedown);
					});
			},
			
			selectSeat: function(seat, d) {
				if(seat.classed('selected')) {
					self.deselectSeat(seat, d);
					return;
				}
				
	 			if(d.available === 'true' &&
	 			    selectedSeats.length < window.App.Model.maxSeats) {
					seat.classed('selected', true);
					selectedSeats.push(seat);

					// var d = $(seat.data()).get(0);
					// var section = d3.select(seat[0][0].parentNode).data()[0].name;
					// var price = d3.select(seat[0][0].parentNode).data()[0].price;
					// console.log(d, section, price);
					
					// animate seat (fancy shit!)
					seat
						.transition()
						.duration(500)
						.ease('elastic')
						.attr({
							'r': window.App.Data.seat.static.r*scale + 5,
							'fill': window.App.Data.seat.select.fill,
							'stroke': window.App.Data.seat.select.stroke
						})
						.transition()
						.delay(150)
						.duration(1000)
						.attr('r', window.App.Data.seat.select.r*scale);
					
					if($tooltip.not(':visible')) {
						$tooltip.fadeIn(200);
					}
				}
			},
			
			deselectSeat: function(seat, d) {
				seat.classed('selected', false);
	 			selectedSeats.splice(selectedSeats.indexOf(seat), 1);
	 			
	 			// animate seat
	 			seat
 					.transition()
 					.duration(250)
 					.ease('bounce')
 					.attr({
						'r': window.App.Data.seat.static.r*scale,
						'fill': window.App.Data.seat.static.fill,
						'stroke': window.App.Data.seat.static.stroke
					});
				
				$tooltip.stop().fadeOut(500);
			},
			
			// map events
			mapMouseup: function(e) {
				isDragging = false;
			},
			
			// seat events
			seatMouseover: function(d, i) {
				// seat must be available

				if(d.available === 'true') {
					var seat = d3.select(this);
					var section = d3.select(seat[0][0].parentNode).data()[0].name;
					var price = d3.select(seat[0][0].parentNode).data()[0].price;
					
					// set tooltip location and info; fade in
			 	 	$tooltip.css({
		 	 			'top': parseInt(d.cy) + 6 + 'px',
		 	 			'left': parseInt(d.cx) - 14 + 'px'
		 	 		}).html(
		 	 			'<p>' + section.toUpperCase() + ' SECTION' +
 	 		      '<br/>Seat ' + d.row + d.seat +
 	 		      '<br/>$' + price + '<br/>' +
 	 		      'Avaiable for purchase</p>'
	 		      ).fadeIn(200);

	 		      // animate seat if not selected
	 		      if(!seat.classed('selected')) {
	 		      	seat
				 			.transition()
				 			.duration(250)
				 			.ease('bounce')
				 			.attr({
								'r': window.App.Data.seat.hover.r*scale,
								'fill': window.App.Data.seat.hover.fill,
								'stroke': window.App.Data.seat.hover.stroke
							});
	 		      }
	 		      
	 		    if(isDragging && selectedSeats.length) {
	 		    	self.selectSeat(seat, d);
	 		    }
		 	 	}
			},
			
			seatMouseout: function(d, i) {
				var seat = d3.select(this);
		 		$tooltip.stop().fadeOut(50); // hide tooltip
		 		
		 		if(!seat.classed('selected')) {
		 			// animate seat if not selected
		 			seat
		 	 			.transition()
		 	 			.duration(1000)
		 	 			.ease('bounce')
		 	 			.attr({
							'r': window.App.Data.seat.static.r*scale,
							'fill': window.App.Data.seat.static.fill
						});
		 		}
			},
			
			seatClick: function(d, i) {
				var seat = d3.select(this);
		 		// anything else?
			},
			
			seatMousedown: function(d, i) {
				isDragging = true;
				self.selectSeat(d3.select(this), d);
			},
			
			updateSeats: function(seats, length) {

				$seatsTableData.html('');
				
				seats.forEach(function(seat) {
					var d = $(seat.data()).get(0);
					var section = d3.select(seat[0][0].parentNode).data()[0].name;
					var price = d3.select(seat[0][0].parentNode).data()[0].price;
					

					$seatsTableData.append(
						'<tr>' +
							'<td>' + section + '</td>' + 
							'<td>' + d.row + '</td>' +
							'<td>' + d.seat + '</td>' +
							'<td>' + d.type + '</td>' + 
							'<td>' + price + '</td>' +
							'<td><div class="table-delete"></div></td>' +
						'</tr>'
					);
				});
			},

			submitSelection: function() {
				selectedSeats.forEach(function(seat) {
					var d = $(seat.data()).get(0);
					var section = d3.select(seat[0][0].parentNode).data()[0].name;
					var price = d3.select(seat[0][0].parentNode).data()[0].price;

					chosenSeats.push({'section': section, 'row': d.row, 'seat': d.seat, 'type': d.type, 'price': price});
				});

				chosenSeats = JSON.stringify(chosenSeats);

				// var url = Drupal.settings.basePath + 'bmgseating/form';
				var url = Drupal.settings.basePath + 'bmgseating/pureform';
			
				$.ajax({
					url: url,
					type: 'POST',
					data: 'chosen_seats=' + chosenSeats
				}).done(function(response) {

					$('#page-title').text('Your chosen seats:');
					$map.html('');
					var $selectedSeatsTable = $('#selected-seats-table');
					$selectedSeatsTable.html('');
					$('#edit-submit').remove();
					$selectedSeatsTable.append('<table id="chosenSeatsTable"><thead><tr><th>Section</th><th>Row</th><th>Seat</th><th>Price</th></tr></thead></table>');
					var $chosenSeatsTable = $('#chosenSeatsTable');
					var orderTotal = 0;

					response.forEach(function(seat) {
						$chosenSeatsTable.append(
							'<tr>' +
								'<td>' + seat.section + '</td>' + 
								'<td>' + seat.row + '</td>' +
								'<td>' + seat.seat + '</td>' +
								'<td>' + seat.price + '</td>' +
							'</tr>'
						);

						orderTotal += parseInt(seat.price);
					});

					$chosenSeatsTable.append('<tr id="order-total"><td></td><td></td><td></td><td>Total: ' + orderTotal + '</td></tr>');

				}).fail(function(jqxhr, textStatus, error) {
					console.log('Error: ' + url + ' : ' + error);
				});

			}


		};
		
		return window.App.Map;
		
	})(); // end window.App.Map
	
	window.App.start();

})(jQuery); // end SIAF; for organizational purposes