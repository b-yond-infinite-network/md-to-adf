/**********************************************************************************************************************
 *
 *  Markdown Parser
 *
 *  @author bruno.morel@b-yond.com
 *---------------------------------------------------------------------------------------------------------------------
 *
 * This translate all markdown to an intermediate representation composed as an array with
 *  each item containing and object with the follow properties:
 *      adfType : 		the ADF type of the line (heading, paragraph, orderedList, ...
 *      textToEmphasis: the actuel text (if any) attached to the element
 *      typeParam:		any extra parameter for special types (language for codeBlock)
 *      nodeAttached: 	element to manage the special case of a codeBlock attached to a list
 *      textPosition: 	the actual start position of the text (used later for level identication)
 *
 **********************************************************************************************************************/


/**
 * Parse markdown into an Intermediate representation
 *
 * @param markdownLineTextWithTabs an array of markdown expression to process
 * @returns
 * {
 * 	adfType: 			{string}		ADF type of the expression,
 * 	textPosition: 		{number} 		the actual start of the text adfType dependent,
 * 	textToEmphasis: 	{string}		actual text of the element,
 * 	typeParam: 			{string} 		extra parameters adfType dependent,
 * 	nodeAttached: 		({textPosition, typeParam: *, adfType: string, textToEmphasis: string}|null) an attached code block to a list
 * 	}
 */
function parseMarkdownLinetoIR( markdownLineTextWithTabs ){
	//to simplify tab management we replace them with spaces
	const markdownLine = markdownLineTextWithTabs.replace( /\t/g, '    ' )
	
	//we try to match each line to match with a markdown expression
	// or we push an empty paragraph
	
	const headerNode = matchHeader( markdownLine )
	if( headerNode ) return headerNode
	
	const divider = matchDivider( markdownLine )
	if( divider ) return divider
	
	const listNode = matchList( markdownLine )
	if( listNode ) return listNode
	
	const blockQuoteNode = matchBlockQuote( markdownLine )
	if( blockQuoteNode ) return blockQuoteNode
	
	const codeBlockNode = matchCodeBlock( markdownLine )
	if( codeBlockNode ) return codeBlockNode
	
	const paragraphNode = matchParagraph( markdownLine )
	if( paragraphNode ) return paragraphNode
	
	//this is a line break then
	return { 	adfType : 		"paragraph",
		textToEmphasis: "",
		textPosition: 	markdownLine.length }
}

/**
 * Matching of the markdown header
 *
 * @param lineToMatch actual expression to match
 *
 * @returns
 * {
 * 		adfType: 		"heading"
 * 		textPosition 	0
 * 		textToEmphasis: parsed heading text
 * 		typeParam: 		null
 * 		nodeAttached: 	null
 * } |
 * 			null	if the expression doesn't match
 */
function matchHeader( lineToMatch ){
	const headerType = lineToMatch.match( /^(?<headerNumber>[#]{1,6}) (?<headerText>.*)$/i )
	if( headerType
		&& headerType.groups
		&& headerType.groups.headerNumber
		&& headerType.groups.headerText ){
		return { 	adfType : 		"heading",//adfRoot.heading( headerType.groups.headerNumber.length ),
			textToEmphasis: headerType.groups.headerText,
			typeParam:		headerType.groups.headerNumber.length,
			textPosition: 	0
		}
	}
	
	return null
}

/**
 * Matching of a markdown list
 *
 * @param lineToMatch actual expression to match
 *
 * @returns
 * {
 * 		adfType: 		"orderedList" or "bulletList"
 * 		textPosition 	actual text start - 2 (the space and level indicator)
 * 		textToEmphasis: parsed list or bullet text
 * 		typeParam: 		null
 * 		nodeAttached: 	if the parsed list or bullet text is a codeblock attach the codebloc element
 * } |
 * 			null	if the expression doesn't match
 */
function matchList( lineToMatch ){
	const list = lineToMatch.match( /^(?:[\s])*(?:[*\-+] |(?<orderedNumber>[0-9]+)[.)] )+(?<listText>.*)$/i )
	if( list
		&& list.groups
		&& list.groups.listText ){
		// adfDescription.bulletList( )
		// 			  .textItem(  )
		const textIsCodeBlock = matchCodeBlock( list.groups.listText )
		if( textIsCodeBlock )
			textIsCodeBlock.textPosition = lineToMatch.indexOf( list.groups.listText )
		
		return { 	adfType	: 		list.groups.orderedNumber
										? "orderedList"
										: "bulletList",
			typeParam:		list.groups.orderedNumber,
			textToEmphasis: textIsCodeBlock ? '': list.groups.listText,
			textPosition: 	lineToMatch.indexOf( list.groups.listText ) - 2,
			nodeAttached: 	textIsCodeBlock
		}
	}
	
	return null
}

/**
 * Match a markdown code block
 *
 * @param lineToMatch 	actual expression to match
 *
 * @returns
 * {
 * 		adfType: 		"codeBlock"
 * 		textPosition 	actual level of the block expression
 * 		textToEmphasis: ''
 * 		typeParam: 		language declared in the expression (if any)
 * 		nodeAttached: 	null
 * } |
 * 			null		if the expression doesn't match
 */
function matchCodeBlock( lineToMatch ){
	const codeBlock = lineToMatch.match( /^(?:[\s]*```)(?<Language>[^\s]*)$/i )
	if( codeBlock
		&& codeBlock.groups ){
		
		return { 	adfType: 		"codeBlock",
			typeParam:		codeBlock.groups.Language,
			textPosition: 	lineToMatch.indexOf( '```' ),
			textToEmphasis: '' }
	}
	
	return null
}

/**
 * Match a markdown blockquote
 *
 * @param lineToMatch 	actual expression to match
 *
 * @returns
 * {
 * 		adfType: 		"blockQuote"
 * 		textPosition 	actual level of the block expression
 * 		textToEmphasis: actual text in the block
 * 		typeParam: 		null
 * 		nodeAttached: 	null
 * } |
 * null		if the expression doesn't match
 */
function matchBlockQuote( lineToMatch ){
	const blockquote = lineToMatch.match( /^(?:[\s])*> (?<quoteText>.*)$/i )
	if( blockquote
		&& blockquote.groups
		&& blockquote.groups.quoteText ){
		
		return { 	adfType : 		"blockQuote",
			textToEmphasis: blockquote.groups.quoteText,
			textPosition: 	lineToMatch.indexOf( '> ' ) }
	}
	
	return null
}

/**
 * Match a markdown paragraph
 *
 * @param lineToMatch 	actual expression to match
 *
 * @returns
 * {
 * 		adfType: 		"paragraph"
 * 		textPosition 	actual level of the text parsed
 * 		textToEmphasis: actual text of the paragraph
 * 		typeParam: 		null
 * 		nodeAttached: 	null
 * } |
 * 			null		if the expression doesn't match
 */
function matchParagraph( lineToMatch ){
	const paragraph = lineToMatch.match( /^(?:[\s]*)(?<paragraphText>[^\n]+)$/ )
	if( paragraph
		&& paragraph.groups
		&& paragraph.groups.paragraphText ){
		return { 	adfType : 		"paragraph",
			textToEmphasis: paragraph.groups.paragraphText,
			textPosition: 	!paragraph.groups.paragraphText.match( /^(?:[\s]*)$/ )
							 ? lineToMatch.indexOf( paragraph.groups.paragraphText )
							 : lineToMatch.length }
	}
	
	return null
}

/**
 * Match a markdown divider
 *
 * @param lineToMatch 	actual expression to match
 *
 * @returns
 * {
 * 		adfType: 		"divider"
 * 		textPosition 	0
 * 		textToEmphasis: ''
 * 		typeParam: 		null
 * 		nodeAttached: 	null
 * } |
 * 			null		if the expression doesn't match
 */
function matchDivider( lineToMatch ){
	const divider = lineToMatch.match( /^(\s*-{3,}\s*|\s*\*{3,}\s*|\s*_{3,}\s*)$/ )
	if( divider ){
		return { 	adfType : 		"divider",
			textToEmphasis: '',
			textPosition: 	0 }
	}
	
	return null
}

module.exports = parseMarkdownLinetoIR
