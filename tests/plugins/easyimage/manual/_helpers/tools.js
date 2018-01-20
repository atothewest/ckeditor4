/* exported getToken, easyImageTools */
/* global console */

// WARNING: The URL below should not be used for any other purpose than Easy Image plugin development.
// Images uploaded using the testing token service may be deleted automatically at any moment.
// If you would like to try the Easy Image service, please wait until the official launch of Easy Image and sign up for a free trial.
// Images uploaded during the free trial will not be deleted for the whole trial period and additionally the trial service can be converted
// into a subscription at any moment, allowing you to preserve all uploaded images.
var CLOUD_SERVICES_TOKEN_URL = 'https://j2sns7jmy0.execute-api.eu-central-1.amazonaws.com/prod/token';

function getToken( callback ) {
	function uid() {
		var uuid = 'e'; // Make sure that id does not start with number.

		for ( var i = 0; i < 8; i++ ) {
			uuid += Math.floor( ( 1 + Math.random() ) * 0x10000 ).toString( 16 ).substring( 1 );
		}

		return uuid;
	}

	var xhr = new XMLHttpRequest(),
		userId = uid();

	xhr.open( 'GET', CLOUD_SERVICES_TOKEN_URL + '?user.id=' + userId );

	xhr.onload = function() {
		if ( xhr.status >= 200 && xhr.status < 300 ) {
			var response = JSON.parse( xhr.responseText );

			callback( response.token );
		} else {
			console.error( xhr.status );
		}
	};

	xhr.onerror = function( error ) {
		console.error( error );
	};

	xhr.send( null );
}

var easyImageTools = {
	CLOUD_SERVICES_UPLOAD_GATEWAY: 'https://files.cke-cs.com/upload/',

	progress: {
		/*
		 * Returns a type that implements a progress indicator that puts a white overflow
		 * on a image, and removes it indicating the progress.
		 *
		 * @param {CKEDITOR.editor} editor
		 * @param {Function} ProgressBar Base type for progress indicator
		 * {@link CKEDITOR.plugins.imageBase.progressBar}.
		 * @returns {Function}
		 */
		getProgressOverlapType: function( editor, ProgressBar ) {
			if ( this._cache.ProgressOverlap ) {
				return this._cache.ProgressOverlap;
			}

			function ProgressOverlap( totalHeight ) {
				ProgressBar.call( this );

				this.wrapper.addClass( 'cke_progress_overlap' );

				this.totalHeight = totalHeight;
			}

			ProgressOverlap.prototype = new ProgressBar();

			ProgressOverlap.prototype.updated = function( progress ) {
				this.wrapper.setStyle( 'height', 100 - Math.round( progress * 100 ) + '%' );
			};

			ProgressOverlap.createForElement = function( wrapper ) {
				var ret = new ProgressOverlap( wrapper.getClientRect().height );

				wrapper.append( ret.wrapper, true );

				return ret;
			};

			this._cache.ProgressOverlap = ProgressOverlap;

			return ProgressOverlap;
		},

		/*
		 * Returns a type that implements a progress indicator that puts a
		 * circle-shaped progress bar.
		 *
		 * @returns {Function}
		 */
		getProgressCircleType: function( editor, ProgressBar ) {
			if ( this._cache.ProgressCircle ) {
				return this._cache.ProgressCircle;
			}

			// Radius of the progress circle.
			var CIRCLE_PROGRESS_SIZE = 20,
				// Circle width in pixels.
				CIRCLE_THICKNESS = 10,
				DASH_ARRAY = Math.PI * ( CIRCLE_PROGRESS_SIZE * 2 );

			function ProgressCircle() {
				var svgSize = CIRCLE_PROGRESS_SIZE * 4,
					offset = CIRCLE_THICKNESS + CIRCLE_PROGRESS_SIZE,
					htmlTemplate = new CKEDITOR.template( '<div class="cont" data-pct="0">' +
						'	<svg id="svg" width="{svgSize}" height="{svgSize}" viewPort="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
						'		<circle r="{CIRCLE_PROGRESS_SIZE}" cx="{offset}" cy="{offset}" fill="transparent"' +
						'			stroke-dasharray="{DASH_ARRAY}" stroke-dashoffset="0"' +
						'			style="stroke-width: {CIRCLE_THICKNESS}px"></circle>' +
						'		<circle r="{CIRCLE_PROGRESS_SIZE}" cx="{offset}" cy="{offset}" fill="transparent"' +
						'			stroke-dasharray="{DASH_ARRAY}" stroke-dashoffset="{DASH_ARRAY}"' +
						'			style="stroke-width: {CIRCLE_THICKNESS}px" class="bar"></circle>' +
						'	</svg>' +
						'</div>' );

				ProgressBar.call( this );

				this.wrapper.addClass( 'cke_progress_circle' );

				this.circle = CKEDITOR.dom.element.createFromHtml(
					htmlTemplate.output( {
						svgSize: svgSize,
						CIRCLE_PROGRESS_SIZE: CIRCLE_PROGRESS_SIZE,
						CIRCLE_THICKNESS: CIRCLE_THICKNESS,
						DASH_ARRAY: DASH_ARRAY,
						offset: offset
					} )
				);

				this.wrapper.append( this.circle );
			}

			ProgressCircle.prototype = new ProgressBar();

			ProgressCircle.prototype.updated = function( progress ) {
				var percentage = Math.round( progress * 100 ),
					bar = this.circle.findOne( '.bar' ),
					radius = bar.getAttribute( 'r' ),
					c = Math.PI * ( radius * 2 );

				bar.setStyle( 'stroke-dashoffset', ( ( 100 - percentage ) / 100 ) * c );
				this.circle.data( 'pct', percentage );
			};

			ProgressCircle.createForElement = function( wrapper ) {
				var ret = new ProgressCircle();

				wrapper.append( ret.wrapper, true );

				return ret;
			};

			this._cache.ProgressCircle = ProgressCircle;

			return ProgressCircle;
		},

		/*
		 * Cache for tye returned types.
		 */
		_cache: {}
	}
};