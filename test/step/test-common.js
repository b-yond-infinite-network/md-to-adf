const { Before, After, Given, When, Then, And } = require( 'jest-cucumber-fusion' )

const translate 	= require( '../../source' )
const filesystem  	= require( 'fs' )

let translatedADF 	= ''
let jiraContent 	= ''

function extractContentFromContentPath( contentRoot, contentPath ){
	return contentPath.reduce( ( lastContent, currentDepthLevelValue ) => {
		expect( lastContent ).toBeDefined()
		expect( lastContent.content ).toBeDefined()
		if( lastContent.content instanceof Array ) {
			expect( lastContent.content[ currentDepthLevelValue ] ).toBeDefined()
			expect( lastContent.content.length ).toBeGreaterThan( currentDepthLevelValue )
			return lastContent.content[ currentDepthLevelValue ]
		}
		
		expect( lastContent.content.content ).toBeInstanceOf( Array )
		expect( lastContent.content.content.length ).toBeGreaterThan( currentDepthLevelValue )
		expect( lastContent.content.content[ currentDepthLevelValue ] ).toBeDefined()
		
		return lastContent.content.content[ currentDepthLevelValue ]
	}, contentRoot )
}


Before( ( ) => {
	translatedADF 	= ''
	jiraContent		= ''
} )

Given( 'the markdown has a mix of carriage return and breakline', () => {
	jiraContent = "This is a paragraph, with a breakline\nand a carriage return\r"
})

Given( /^the markdown in GITHUB is '(.*)'$/, gitthubMarkdown => {
	jiraContent = gitthubMarkdown
})

Given( /^the markdown in GITHUB the same than in the markdown file named '(.*)'$/, exampleMDFile => {
	jiraContent = filesystem.readFileSync( __dirname + '/../markdown-capture/' + exampleMDFile + '.md', 'utf8')
})

Given( 'the markdown in GITHUB is :', lineTable => {
	const anchor = Object.getOwnPropertyNames( lineTable[ 0 ] ) [ 0 ]
	const anchorMatch = anchor.match( /^'(?<whiteSpaces>\s*)'$|^'(?<text>.*)$/ )
	const markdownTable = [ ( anchorMatch
							  && ( anchorMatch.groups.whiteSpaces || anchorMatch.groups.text )
							  ? anchorMatch.groups.whiteSpaces ? anchorMatch.groups.whiteSpaces : anchorMatch.groups.text
							  : anchor ),
							...lineTable.map( currentLine => currentLine[ anchor ] ) ]
	jiraContent = markdownTable.reduce( ( currentContent, currentLineInTable ) => {
		const lineMatch = currentLineInTable.match( /^'(?<whiteSpaces>\s*)'$|^'(?<text>.*)$/ )
		return currentContent
			   + '\n'
			   + ( lineMatch && lineMatch.groups.whiteSpaces !== null && typeof lineMatch.groups.whiteSpaces !== "undefined"
				   ? lineMatch.groups.whiteSpaces
				   : lineMatch && lineMatch.groups.text !== null && typeof lineMatch.groups.text !== "undefined"
					 ? lineMatch.groups.text
					 : currentLineInTable )
		
	} )
})

When( /^we translate it in ADF$/, async (  ) => {
	translatedADF = translate( jiraContent )
})


Then( And( /^the ADF chunk at content path (\[(?: *\d+(?: |, |,)*)+\]) has type '(.*)'$/,
		   ( depthArray, contentType ) => {
			   const finalContentAtDepth = extractContentFromContentPath( translatedADF, JSON.parse( depthArray ) )
			
			   const flattenTranslatedADFChunk = JSON.parse( JSON.stringify( finalContentAtDepth ) )
			   expect( flattenTranslatedADFChunk.type ).toEqual( contentType )
		   } ) )

Then( And( /^the ADF chunk at content path (\[(?: *\d+(?: |, |,)*)+\]) has attribute '(.*)'$/,
		   ( depthArray, attributeAndValueToFind ) => {
			   const finalContentAtDepth = extractContentFromContentPath( translatedADF, JSON.parse( depthArray ) )
	
			   const parsedAttributes = JSON.parse( attributeAndValueToFind )
			   const flattenTranslatedADFChunk = JSON.parse( JSON.stringify( finalContentAtDepth ) )
			   expect( flattenTranslatedADFChunk.attrs ).toEqual( expect.objectContaining( parsedAttributes ) )
		   } ) )

Then( And( /^the ADF chunk at content path (\[(?: *\d+(?: |, |,)*)+\]) contains '(.*)'$/,
		   ( depthArray, expectedTranslationObject ) => {
			   const finalContentAtDepth = extractContentFromContentPath( translatedADF, JSON.parse( depthArray ) )
	
			   const parsedExpectedObject = JSON.parse( expectedTranslationObject )
	
			   expect( translatedADF.content.content ).toBeDefined()
			   const flattenTranslatedADFChunk = JSON.parse( JSON.stringify( finalContentAtDepth.content.content ) )
	
			   expect( flattenTranslatedADFChunk ).toEqual( expect.arrayContaining( [ expect.objectContaining( parsedExpectedObject ) ] ) )
		   } ) )



Then( And( /the ADF document content has all the object defined in json file named '(.*)'$/, async exampleJSONFile => {
	const parsedExpectedObject = require( __dirname + '/../markdown-capture/' + exampleJSONFile + '.json' )
	// const parsedExpectedObject = JSON.parse( expectedTranslationObject )
	
	const flattenTranslatedADFChunk = JSON.parse( JSON.stringify( translatedADF.content.content ) )
	
	expect( flattenTranslatedADFChunk ).toEqual( expect.arrayContaining( parsedExpectedObject ) )
} ) )

After(() => {  } )


