/***********************************************************************************************************************
 *
 * Atlassian Document Format parsing of Emphasis
 *
 *  @author bruno.morel@b-yond.com
 * ---------------------------------------------------------------------------------------------------------------------
 *
 * This transform a text with emphasis mark (*, _ or `) into an ADF expanded Paragraph
 *
 **********************************************************************************************************************/
const { marks, Text }	= require( 'adf-builder' )


/**
 * Parse a string character per character to find emphasis patterns
 *  This is a very "manual" way to do it, but it provides the most efficient result
 * @param parentNode			{Node}		ADF Node to attach the suite of Text node to
 * @param textToEmphasis		{String}	text to parse for emphasis parsing
 */
function attachTextToNodeSliceEmphasis( parentNode, textToEmphasis ){
	const lineUnderscored = textToEmphasis.replace( /\*/g, '_' )
	let currentDecorationLevel = 0
	//see convertDecorationLevelToMark
	// 0 => no decoration
	// 1 => italic
	// 2 => bold
	// 3 => bold and italic
	
	let potentialUnderscorePair = false
	let strikedThrough			= false
	let expressionBuffer		= ''
	for( const currentCharacterIndex in lineUnderscored ){
		
		if( lineUnderscored[ currentCharacterIndex ] !== '_' ){
			expressionBuffer += lineUnderscored[ currentCharacterIndex ]
			
			if( potentialUnderscorePair ){
				currentDecorationLevel = currentDecorationLevel === 0 || currentDecorationLevel === 2
										 ? currentDecorationLevel + 1
										 : currentDecorationLevel - 1
				potentialUnderscorePair = false
			}
		}
		
		if( currentCharacterIndex > 0
			&& lineUnderscored[ currentCharacterIndex ] === '~'
			&& lineUnderscored[ currentCharacterIndex - 1 ] === '~' ){
			const textNode = new Text( expressionBuffer.slice( 0, expressionBuffer.length - 2 ),
									   convertDecorationLevelToMark( currentDecorationLevel, strikedThrough ) )
			parentNode.content.add( textNode )
			
			expressionBuffer = ''
			strikedThrough = !strikedThrough
		}
		
		
		if( lineUnderscored[ currentCharacterIndex ] === '_' ){
			let decorationToUse = convertDecorationLevelToMark( currentDecorationLevel, strikedThrough )
			
			if( expressionBuffer !== '' ){
				const textNode = new Text( expressionBuffer, decorationToUse )
				parentNode.content.add( textNode )
				// textWithInline( parentNode, expressionBuffer, decorationToUse )
			}
			else {
				if( potentialUnderscorePair )
					currentDecorationLevel = currentDecorationLevel === 0 || currentDecorationLevel === 1
											 ? currentDecorationLevel + 2
											 : currentDecorationLevel - 2
			}
			
			potentialUnderscorePair = !potentialUnderscorePair
			expressionBuffer = ''
		}
	}
	
	if( expressionBuffer !== '' ){
		const textNode = new Text( expressionBuffer, convertDecorationLevelToMark( currentDecorationLevel, strikedThrough ) )
		parentNode.content.add( textNode )
	}
}

/**
 * Convert a "decoration level" (bit swap) to an actual ADF Mark for the text
 *
 * @param decorationLevelToConvert	{Number}		decoration level follow the convention:
 * 														0 => no decoration
 * 														1 => italic
 * 														2 => bold
 * 														3 => bold and italic
 * @param addStrikethrough			{Boolean}		is strikethrough active?
 */
function convertDecorationLevelToMark( decorationLevelToConvert, addStrikethrough ){
	if( addStrikethrough )
		return decorationLevelToConvert === 1
			   ? marks().strike().em()
			   : decorationLevelToConvert === 2
				 ? marks().strike().strong()
				 : decorationLevelToConvert === 3
				   ? marks().strike().strong().em()
				   : marks().strike()
	
	return decorationLevelToConvert === 1
		   ? marks().em()
		   : decorationLevelToConvert === 2
			 ? marks().strong()
			 : decorationLevelToConvert === 3
			   ? marks().strong().em()
			   : null
}

module.exports = attachTextToNodeSliceEmphasis
