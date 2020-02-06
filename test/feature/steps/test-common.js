const { Before, After, Given, When, Then, And } = require( 'jest-cucumber-fusion' )

const translate 	= require( '../../../index' )
const filesystem  	= require( 'fs' )

let translatedADF 	= ''
let jiraContent 	= ''

function extractContentFromContentPath( contentRoot, contentPath ){
	return contentPath.reduce( ( lastContent, currentDepthLevelValue ) => {
		expect( lastContent ).toBeDefined()
		expect( lastContent.content ).toBeDefined()
		expect( lastContent.content.content ).toBeInstanceOf( Array )
		expect( lastContent.content.content[ currentDepthLevelValue ] ).toBeDefined()
		
		return lastContent.content.content[ currentDepthLevelValue ]
	}, contentRoot )
}


Before( ( ) => {
	translatedADF 	= ''
	jiraContent		= ''
} )


Given( /^the markdown in GITHUB is '(.*)'$/, gitthubMarkdown => {
	jiraContent = gitthubMarkdown
})

Given( /^the markdown in GITHUB the same than in the markdown file named '(.*)'$/, exampleMDFile => {
	jiraContent = filesystem.readFileSync( __dirname + '/../../markdown-capture/' + exampleMDFile + '.md', 'utf8')
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
			   + ( lineMatch && ( lineMatch.groups.whiteSpaces || lineMatch.groups.text )
				   ? lineMatch.groups.whiteSpaces ? lineMatch.groups.whiteSpaces : lineMatch.groups.text
				   : currentLineInTable )
		
	} )
})

When( /^we translate it in ADF$/, async (  ) => {
	translatedADF = translate( jiraContent )
})


Then( And( /the (\d*)(?:st|nd|rd|th) ADF chunk has type '(.*)'$/, async ( ordinal, contentType ) => {
	const arrayIndexToTest = ordinal - 1
	expect( arrayIndexToTest ).toBeGreaterThanOrEqual( 0 )
	
	expect( translatedADF.content.content[ arrayIndexToTest ].content.type ).toEqual( contentType )
} ) )

Then( And( /the (\d*)(?:st|nd|rd|th) ADF has '(.*)' as attribute$/, async ( ordinal, attributeAndValueToFind ) => {
	const arrayIndexToTest = ordinal - 1
	expect( arrayIndexToTest ).toBeGreaterThanOrEqual( 0 )
	
	const parsedAttributes = JSON.parse( attributeAndValueToFind )
	const flattenTranslatedADFChunk = JSON.parse( JSON.stringify( translatedADF.content.content[ arrayIndexToTest ] ) )
	expect( flattenTranslatedADFChunk.attrs ).toEqual( expect.objectContaining( parsedAttributes ) )
} ) )

Then( And( /the (\d*)(?:st|nd|rd|th) ADF chunk contains '(.*)'$/, async ( ordinal, expectedTranslationObject ) => {
	const arrayIndexToTest = ordinal - 1
	expect( arrayIndexToTest ).toBeGreaterThanOrEqual( 0 )
	
	const parsedExpectedObject = JSON.parse( expectedTranslationObject )
	
	expect( translatedADF.content.content ).toBeDefined()
	const flattenTranslatedADFChunk = JSON.parse( JSON.stringify( translatedADF.content.content[ arrayIndexToTest ] ) )
	
	expect( flattenTranslatedADFChunk ).toEqual( expect.objectContaining( parsedExpectedObject ) )
} ) )


Then( And( /^the ADF chunk at content path (\[(?: *\d+(?: |, |,)*)+\]) has type '(.*)'$/,
		   ( depthArray, contentType ) => {
			   const finalContentAtDepth = extractContentFromContentPath( translatedADF, JSON.parse( depthArray ) )
	
			   expect( finalContentAtDepth.content.type ).toEqual( contentType )
		   } ) )

Then( And( /^the ADF chunk at content path (\[(?: *\d+(?: |, |,)*)+\]) has a content at (\d*) of type '(.*)'$/,
		   ( depthArray, indexInContent, contentType ) => {
			   const finalContentAtDepth = extractContentFromContentPath( translatedADF, JSON.parse( depthArray ) )
			
			   const flattenTranslatedADFChunk = JSON.parse( JSON.stringify( finalContentAtDepth.content.content[ indexInContent ] ) )
			   expect( flattenTranslatedADFChunk.type ).toEqual( contentType )
		   } ) )

Then( And( /^the ADF chunk at content path (\[(?: *\d+(?: |, |,)*)+\]) has a content at (\d*) with attribute '(.*)'$/,
		   ( depthArray, indexInContent, attributeAndValueToFind ) => {
			   const finalContentAtDepth = extractContentFromContentPath( translatedADF, JSON.parse( depthArray ) )
	
			   const parsedAttributes = JSON.parse( attributeAndValueToFind )
			   const flattenTranslatedADFChunk = JSON.parse( JSON.stringify( finalContentAtDepth ) )
			   expect( flattenTranslatedADFChunk.attrs ).toEqual( expect.objectContaining( parsedAttributes ) )
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
	const parsedExpectedObject = require( __dirname + '/../../markdown-capture/' + exampleJSONFile + '.json' )
	// const parsedExpectedObject = JSON.parse( expectedTranslationObject )
	
	const flattenTranslatedADFChunk = JSON.parse( JSON.stringify( translatedADF.content.content ) )
	
	expect( flattenTranslatedADFChunk ).toEqual( expect.arrayContaining( parsedExpectedObject ) )
} ) )

After(() => {  } )


