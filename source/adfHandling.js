/***********************************************************************************************************************
 *
 * Atlassian Document Format Handling
 *
 *  @author bruno.morel@b-yond.com
 * ---------------------------------------------------------------------------------------------------------------------
 *
 * This transform a Intermediate Representation Tree (see markdownHandling) into the equivalent ADF nodes.
 * It also remove non-compatible hierarchy that ADF doesn't support
 *
 **********************************************************************************************************************/
const { marks, Heading, Text, Emoji, BulletList, OrderedList, ListItem, CodeBlock, BlockQuote, Paragraph, Rule }	= require( 'adf-builder' )

const attachTextToNodeSliceEmphasis = require( __dirname + '/adfEmphasisParsing' )

// /**
//  * @typedef { import("./markdownParsing").IRElement } IRElement
//  * @typedef { import("./markdownHandling").IRTreeNode } IRTreeNode
//  */

/**
 * Browse the tree recursively to add each node to the ADF Document
 * 	It also treat special cases between top-level node and generic ones
 *
 * @param currentParentNode					{Document}		ADF document to add to
 * @param currentArrayOfNodesOfSameIndent	{IRTreeNode}
 */
function fillADFNodesWithMarkdown( currentParentNode, currentArrayOfNodesOfSameIndent ){
	currentArrayOfNodesOfSameIndent.reduce( ( lastListNode, currentNode ) => {
		const nodeOrListNode = lastListNode !== null
							   && ( currentNode.node.adfType === 'orderedList' || currentNode.node.adfType === 'bulletList' )
							   && lastListNode.content.type === currentNode.node.adfType
							   ? lastListNode
							   : addTypeToNode( currentParentNode, currentNode.node.adfType, currentNode.node.typeParam )
		
		const nodeOrListItem = currentNode.node.adfType === 'orderedList' || currentNode.node.adfType === 'bulletList'
							   ? nodeOrListNode.content.add( new ListItem() )
							   : nodeOrListNode
		const nodeToAttachTextTo = currentNode.node.adfType === 'orderedList' || currentNode.node.adfType === 'bulletList' || currentNode.node.adfType === 'blockQuote'
								   ? typeof currentNode.node.textToEmphasis !== 'undefined' || currentNode.children.length === 0
									 ? nodeOrListItem.content.add( new Paragraph() )
									 : nodeOrListItem
								   : nodeOrListItem
		
		if( currentNode.node.adfType === 'divider' )
			return lastListNode
		
		else if( currentNode.node.adfType !== 'codeBlock'
				 && currentNode.node.textToEmphasis )
			attachItemNode( nodeToAttachTextTo, currentNode.node.textToEmphasis )
		
		else if( currentNode.node.adfType !== 'codeBlock'
				 && currentNode.node.textToEmphasis === '' )
			attachItemNode( nodeToAttachTextTo, ' ' )
		
		else if( currentNode.node.adfType === 'codeBlock' )
			attachTextToNodeRaw( nodeToAttachTextTo, currentNode.node.textToEmphasis )
		
		if( currentNode.children )
			fillADFNodesWithMarkdown( nodeOrListItem, currentNode.children )
		
		return ( currentNode.node.adfType !== 'orderedList' && currentNode.node.adfType !== 'bulletList' )
			   || ( !lastListNode || currentNode.node.adfType === lastListNode.content.type )
			   ? nodeOrListNode
			   : lastListNode
	}, null )
}

/**
 *  Adding a Top-Level ADF element
 *
 * @param adfNodeToAttachTo	{Node}		ADF node to attach this element to
 * @param adfType			{String}	ADF Type of the element we want to attach
 * @param typeParams		{String}	extra params for special top-level nodes
 *
 * @returns 				{Node}		the node added
 */
function addTypeToNode( adfNodeToAttachTo, adfType, typeParams ){
	switch( adfType ) {
		case "heading":
			return adfNodeToAttachTo.content.add( new Heading( typeParams ) )
		
		case "divider":
			return adfNodeToAttachTo.content.add( new Rule() )
		
		case "bulletList":
			return adfNodeToAttachTo.content.add( new BulletList() )
		
		case "orderedList": {
			const orderedListNode = new OrderedList( )
			if( typeParams ) orderedListNode.attrs = { order: typeParams }
			return adfNodeToAttachTo.content.add( orderedListNode )
		}
		
		case "codeBlock":
			return adfNodeToAttachTo.content.add( new CodeBlock( typeParams ) )
		
		case "blockQuote":
			return adfNodeToAttachTo.content.add( new BlockQuote() )
		
		case "paragraph":
			return adfNodeToAttachTo.content.add( new Paragraph() )
		
		default:
			throw 'incompatible type'
	}
}

/**
 * Adding a non-top-level ADF node
 *
 * @param nodeToAttachTo		{Node}		ADF Node to attach to
 * @param rawText				{String}	text content of the node to add
 */
function attachItemNode( nodeToAttachTo, rawText ) {
	const slicedInline = sliceInLineCode( rawText )
	
	const { slicedInlineAndEmoji } = slicedInline.reduce( ( { slicedInlineAndEmoji }, currentSlice ) => {
		if( !currentSlice.isMatching ){
			const slicedEmoji = sliceEmoji( currentSlice.text )
			
			return { slicedInlineAndEmoji: slicedInlineAndEmoji.concat( slicedEmoji ) }
		}
		
		slicedInlineAndEmoji.push( currentSlice )
		return { slicedInlineAndEmoji }
	}, { slicedInlineAndEmoji: [] } )
	
	const { slicedInlineAndEmojiAndLink } = slicedInlineAndEmoji.reduce( ( { slicedInlineAndEmojiAndLink }, currentSlice ) => {
		if( !currentSlice.isMatching ){
			const slicedLink = sliceLink( currentSlice.text )
			
			return { slicedInlineAndEmojiAndLink: slicedInlineAndEmojiAndLink.concat( slicedLink ) }
		}
		
		slicedInlineAndEmojiAndLink.push( currentSlice )
		return { slicedInlineAndEmojiAndLink }
	}, { slicedInlineAndEmojiAndLink: [] } )
	
	for( const currentSlice of slicedInlineAndEmojiAndLink ) {
		switch( currentSlice.type ){
			case 'inline':
				const inlineCodeNode = new Text( currentSlice.text, marks().code() )
				nodeToAttachTo.content.add( inlineCodeNode )
				break
			
			case 'emoji':
				const emojiNode = new Emoji( {shortName: currentSlice.text } )
				nodeToAttachTo.content.add( emojiNode )
				break
			
			case 'link':
				const linkNode = new Text( currentSlice.text,
										   marks().link( currentSlice.optionalText1,
														 currentSlice.optionalText2 ) )
				nodeToAttachTo.content.add( linkNode )
				break
			
			case 'image':
				const imageNode = new Text( currentSlice.text,
											marks().link( currentSlice.optionalText1,
														  currentSlice.optionalText2 ) )
				nodeToAttachTo.content.add( imageNode )
				break
			
			default:
				attachTextToNodeSliceEmphasis( nodeToAttachTo, currentSlice.text )
			// const textNode = new Text( currentSlice.text, marksToUse )
			// nodeToAttachTo.content.add( textNode )
		}
	}
}

/**
 * Match text content with and ADF inline type
 *
 * @param rawText				{String}	the text content to try to match
 *
 * @returns 					{String[]}	the different slice matching an inline style
 */
function sliceInLineCode( rawText ){
	return sliceOneMatchFromRegexp( rawText, 'inline', /(?<nonMatchBefore>[^`]*)(?:`(?<match>[^`]+)`)(?<nonMatchAfter>[^`]*)/g )
}

/**
 * Match text content with and ADF emoji type
 *
 * @param rawText				{String}	the text content to try to match
 *
 * @returns 					{String[]}	the different slice matching an emoji style
 */
function sliceEmoji( rawText ){
	return sliceOneMatchFromRegexp( rawText, 'emoji',/(?<nonMatchBefore>[^`]*)(?::(?<match>[^`\s]+):)(?<nonMatchAfter>[^`]*)/g )
}

/**
 * Match text content with and ADF link type
 *
 * @param rawText				{String}	the text content to try to match
 *
 * @returns 					{String[]}	the different slice matching a link style
 */
function sliceLink( rawText ){
	return sliceOneMatchFromRegexp( rawText, 'link',/(?<nonMatchBefore>[^`]*)(?:\[(?<match>[^\[\]]+)\]\((?<matchOptional>[^\(\)"]+)(?: "(?<matchOptional2>[^"]*)")?\))(?<nonMatchAfter>[^`]*)/g )
}

/**
 * Match text content with and regular expression with one match
 *
 * @param rawText				{String}	the text content to try to match
 * @param typeTag				{String}	the ADF Type to return if it matches
 * @param regexpToSliceWith		{RegExp}	the regexp with a match group and a non-match group to use
 *
 * @returns 					{String[]}	the different slice matching the specified regexp
 */
function sliceOneMatchFromRegexp( rawText, typeTag, regexpToSliceWith ){
	let slicesResult = [ ]
	let snippet = null
	let hasAtLeastOneExpression = false
	
	while( ( snippet = regexpToSliceWith.exec( rawText ) ) ) {
		hasAtLeastOneExpression = true
		if( snippet.groups.nonMatchBefore ){
			slicesResult.push( { isMatching: false, text: snippet.groups.nonMatchBefore } )
		}
		
		if( snippet.groups.match ){
			slicesResult.push( {
								   isMatching: 		true,
								   type: 			typeTag,
								   text: 			snippet.groups.match,
								   optionalText1: 	snippet.groups.matchOptional,
								   optionalText2: 	snippet.groups.matchOptional2
							   } )
		}
		
		if( snippet.groups.nonMatchAfter ){
			slicesResult.push( { isMatching: false, text: snippet.groups.nonMatchAfter } )
		}
	}
	
	if( !hasAtLeastOneExpression )
		slicesResult.push( { isMatching: false, text: rawText } )
	
	return slicesResult
}

/**
 * Attach a raw simple text node to the parent
 *
 * @param nodeToAttachTo	{Node}		ADF node to attach to
 * @param textToAttach		{String}	text to use for the Text node
 */
function attachTextToNodeRaw( nodeToAttachTo, textToAttach ){
	const textNode = new Text( textToAttach )
	nodeToAttachTo.content.add( textNode )
}

module.exports = fillADFNodesWithMarkdown
