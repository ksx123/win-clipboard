'use strict';

const winClipboard = require( '../lib' );
const chai = require( 'chai' );
const expect = chai.expect;
const clipboardy = require( 'clipboardy' );

describe( 'win-clipboard', function() {
	const FORMATS = {
		TEXT: 'CF_TEXT',
		UNICODE: 'CF_UNICODETEXT',
		CUSTOM: 'win-clipboard-test'
	};

	describe( 'getData', () => {
		it( 'Works', () => {
			return clipboardy.write( 'foo1' )
				.then( () => {
					expect( winClipboard.getData( FORMATS.TEXT ) ).to.be.deep.equal( Buffer.from( 'foo1\0' ) );
				} );
		} );

		it( 'Returns a proper val for nonexisting entires', () => {
			expect( winClipboard.getData( 'some-funny-formaaat-name11' ) ).to.be.equal( null );
		} );
	} );

	describe( 'setData', () => {
		const initialTextData = winClipboard.getData( FORMATS.TEXT );

		after( () => {
			// Restore original data in the clipboard once suite is done.
			winClipboard.setData( ( new Int8Array( initialTextData ) ).buffer, FORMATS.TEXT );
		} );

		it( 'Works with builtin format', function() {
			let randomString = 'Random text ' + Math.random() + '\0',
				randomStringView = new Int8Array( Array.from( randomString ) );

			winClipboard.setData( randomStringView.buffer, FORMATS.TEXT );

			expect( winClipboard.getData( FORMATS.TEXT ) ).to.be.deep.equal( Buffer.from( randomStringView ) );
		} );

		it( 'Returns number of bytes written', function() {
			let bytesView = new Int8Array( [ 1, 1, 1 ] ),
				ret = winClipboard.setData( bytesView.buffer, FORMATS.TEXT );

			expect( ret ).to.be.eql( 3 );
		} );

		it( 'Works with custom format', function() {
			let randomString = 'Random text ' + Math.random() + '\0',
				randomStringView = new Int8Array( Array.from( randomString ) );

			winClipboard.setData( randomStringView.buffer, FORMATS.CUSTOM );

			expect( winClipboard.getData( FORMATS.CUSTOM ) ).to.be.deep.equal( Buffer.from( randomStringView ) );
		} );
	} );

	describe( 'getText', () => {
		it( 'Works well with UTF-8', () => {
			const utfString = 'Foo ¥£€ûл身śĆ🙀🙊';
			return clipboardy.write( utfString )
				.then( () => {
					expect( winClipboard.getText( FORMATS.UNICODE ) ).to.be.eql( utfString );
				} );
		} );

		it( 'Works with plain text', () => {
			const simpleText = 'ab\ncd';

			return clipboardy.write( simpleText )
				.then( () => {
					expect( winClipboard.getText( FORMATS.TEXT ) ).to.be.eql( simpleText );
				} );
		} );

		it( 'Returns a correct value when there are no matches', () => {
			expect( winClipboard.getText( 'funny-non-exisitng-type' ) ).to.be.eql( null );
		} );

		it( 'Returns unocde by default', () => {
			const utfString = '🙀🙊';

			return clipboardy.write( utfString )
				.then( () => {
					expect( winClipboard.getText() ).to.be.eql( utfString );
				} );
		} );
	} );

	describe( 'setText', () => {
		it( 'Sets correctly UTF8', () => {
			const utfString = 'Foo ¥£€ûл身śĆ🙀🙊';

			let res = winClipboard.setText( utfString );

			return clipboardy.read()
				.then( ( data ) => {
					expect( data ).to.be.eql( utfString );
					expect( res ).to.be.eql( 34 );
				} );
		} );

		it( 'Supports ASCII', () => {
			const asciiString = 'Asd';

			let res = winClipboard.setText( asciiString, FORMATS.TEXT ),
				data = winClipboard.getText( 'CF_TEXT' );

			expect( data ).to.be.eql( asciiString );
			expect( res ).to.be.eql( 4 );
		} );
	} );

	describe( 'getHtml / setHtml', () => {
		const html = '<html><body>foo<em>bar</em></body></html>';

		it( 'Works', () => {
			const expected = 'foo<em>bar</em>';

			winClipboard.setHtml( html );

			expect( winClipboard.getHtml() ).to.be.equal( expected );
		} );

		it( 'Returns full HTML', () => {
			const expected = '<html><body><!--StartFragment-->foo<em>bar</em><!--EndFragment--></body></html>';

			winClipboard.setHtml( html );

			expect( winClipboard.getHtml( true ) ).to.be.equal( expected );
		} );
	} );
} );