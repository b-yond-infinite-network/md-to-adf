const { Document, marks, Heading, Text, Emoji, BulletList, OrderedList, ListItem, CodeBlock, BlockQuote, Paragraph }	= require( 'adf-builder' )

function translateGITHUBMarkdownToADF( markdownText ){
	
	const textTree = buildTreeFromMarkdown( markdownText )
	
	const adfRoot = new Document()
	if( textTree.length > 0 )
		fillADFNodesWithMarkdown( adfRoot, textTree )
	
	return adfRoot
}


function buildTreeFromMarkdown( rawTextMarkdown ){
	///MARDKOWN logic - closing code blocks
	//  When a code block is open, it should be closed by a triple caret, everything in between is code
	const { codeBlockHandled } = rawTextMarkdown.split( /\r\n|\r|\n/ ).reduce( ( { codeBlockHandled, indexCurrentCodeBloc }, currentLine, indexCurrentLine ) => {
		const lineTranslation = translateMarkdownLineToADF( currentLine )
		
		if( typeof indexCurrentCodeBloc === "undefined"
			&& ( lineTranslation.adfType === 'codeBlock'
				 || lineTranslation.nodeAttached ) ){
			codeBlockHandled.push( lineTranslation )
			if( lineTranslation.nodeAttached ){
				codeBlockHandled.push( lineTranslation.nodeAttached )
			}
			
			return { codeBlockHandled, indexCurrentCodeBloc: codeBlockHandled.length - 1 }
		}
		
		if( typeof indexCurrentCodeBloc !== "undefined"
			&& ( lineTranslation.adfType !== 'codeBlock'
				 || typeof lineTranslation.typeParam === "undefined"
				 || lineTranslation.typeParam !== '' ) ) {
			const textToAdd = lineTranslation.textPosition >= codeBlockHandled[ indexCurrentCodeBloc ].textPosition
							  ? currentLine.slice( codeBlockHandled[ indexCurrentCodeBloc ].textPosition )
							  : currentLine
			codeBlockHandled[ indexCurrentCodeBloc ].textToEmphasis = codeBlockHandled[ indexCurrentCodeBloc ].textToEmphasis
																	  + ( codeBlockHandled[ indexCurrentCodeBloc ].textToEmphasis === ''
																		  ? textToAdd
																		  : '\n' + textToAdd )
			return { codeBlockHandled, indexCurrentCodeBloc }
		}
		
		if( typeof indexCurrentCodeBloc !== "undefined"
			&& lineTranslation.adfType === 'codeBlock'
			&& typeof lineTranslation.typeParam !== "undefined"
			&& lineTranslation.typeParam === '' ){
			return { codeBlockHandled }
		}
		
		codeBlockHandled.push( lineTranslation )
		
		return { codeBlockHandled }
	}, { codeBlockHandled: [] } )
	
	//MARKDOWN -- handling of unfinished empty codeBlock
	const cleanedCodeBlock = codeBlockHandled.filter( ( currentNode ) => {
		if( currentNode.adfType !== 'codeBlock' )
			return currentNode
		
		if( currentNode.textToEmphasis !== '' )
			return currentNode
	} )
	
	///MARKDOWN logic
	// empty line handling => heading is an exception, otherwise non-empty line aggregate in the parent element
	// For all other type, following a markdown with any paragraph of text is considered a continuation, so we aggregate
	//  all subsequent text into the same parent element (paragraph, list item, ...)
	const { breakedLineNodes } = cleanedCodeBlock.reduce( ( { breakedLineNodes, currentParent }, currentLineNode ) => {
		
		if( currentLineNode.adfType === 'heading'
			|| currentLineNode.adfType === 'codeBlock' ){
			breakedLineNodes.push( currentLineNode )
			return { breakedLineNodes }
		}
		
		if( currentLineNode.adfType !== 'paragraph' ){
			breakedLineNodes.push( currentLineNode )
			return { breakedLineNodes, currentParent: currentLineNode }
		}
		
		if( /^(?:[\s]*)$/.test( currentLineNode.textToEmphasis ) ) {
			//we're breaking into a new paragraph
			return { breakedLineNodes }
		}
		
		//this is a non-empty paragraph, if we are already filling up a paragraph, let's add the text inside
		if( currentParent ){
			const textToAdd = currentLineNode.textPosition >= currentParent.textPosition
							  ? currentLineNode.textToEmphasis.slice( currentParent.textPosition )
							  : currentLineNode.textToEmphasis
			currentParent.textToEmphasis = currentParent.textToEmphasis + ( currentLineNode.textToEmphasis.charAt( 0 ) !== ' '
																			? ' ' + textToAdd
																			: textToAdd )
			return { breakedLineNodes, currentParent }
		}
		
		//this is a lone new paragraph, we add it to the list
		breakedLineNodes.push( currentLineNode )
		return { breakedLineNodes, currentParent: currentLineNode }
		
	}, { breakedLineNodes: [ ] } )
	
	///MARKDOWN logic
	// Realign children nodes to orderedList and bulletList
	const { accumulatedNodes } = breakedLineNodes.reduce( ( { accumulatedNodes, indexCurrentList }, currentLineNode ) => {
		
		if( currentLineNode.adfType !== 'heading'
			&& currentLineNode.adfType !== 'orderedList'
			&& currentLineNode.adfType !== 'bulletList'
			&& indexCurrentList
			&& currentLineNode.textPosition < accumulatedNodes[ indexCurrentList ].textPosition + 2 ){
			currentLineNode.textPosition = accumulatedNodes[ indexCurrentList ].textPosition + 2
		}
		
		accumulatedNodes.push( currentLineNode )
		
		if( currentLineNode.adfType === 'heading' )
			return { accumulatedNodes }
		
		if( currentLineNode.adfType === 'bulletList' || currentLineNode.adfType === 'orderedList' ){
			return { accumulatedNodes, indexCurrentList: accumulatedNodes.length - 1 }
		}
		
		return { accumulatedNodes, indexCurrentList }
		
	}, { accumulatedNodes: [ ] } )
	
	///MARKDOWN logic
	// List all different levels to consider
	const levelsPosition = accumulatedNodes.reduce( ( currentLevelList, currentNode ) => {
		if( currentNode.adfType !== 'orderedList'
			&& currentNode.adfType !== 'bulletList' )
			return currentLevelList
		
		return ( currentLevelList.includes( currentNode.textPosition + 2 ) || currentLevelList.includes( currentNode.textPosition + 3 ) )
			   ? currentLevelList
			   : currentNode.textPosition + 2 > ( currentLevelList[ currentLevelList.length - 1 ] + 1 )
				 ? [ ...currentLevelList, currentNode.textPosition + 2 ]
				 : currentLevelList
	}, [ 0 ] )
	
	///MARKDOWN logic
	// Map all nodes to a specific level
	const levelsListsIndexes = levelsPosition.map( ( currentLevelPosition, currentIndex ) => {
		return accumulatedNodes.filter( currentList => ( currentList.textPosition >= currentLevelPosition
														   && ( currentIndex === levelsPosition.length - 1 //this is the last level
																|| currentList.textPosition < levelsPosition[ currentIndex + 1 ] ) ) )
							   .map( currentList => ( {
								   indexOfList: accumulatedNodes.indexOf( currentList ),
								   children: [],
								   node: currentList } ) )
	} )
	
	
	const treeOfNode = levelsListsIndexes.reduce( ( currentTree, currentArrayOfListIndexes, currentIndexInTheArrayOfListIndexes ) => {
		const stepAtTree = currentArrayOfListIndexes.reduce( ( currentTreeValues, currentListValues ) => {
			if( currentIndexInTheArrayOfListIndexes <= 0 )
				return [ ...currentTreeValues, currentListValues ]
			
			const parentList = levelsListsIndexes[ currentIndexInTheArrayOfListIndexes - 1 ]
			const lastParentWithIndexBelow = parentList.findIndex( currentParentListIndex => {
				return currentParentListIndex.indexOfList > currentListValues.indexOfList
			} )
			const parentIndexToUse = lastParentWithIndexBelow === -1
									 ? parentList.length - 1
									 : lastParentWithIndexBelow === 0
									   ? 0
									   : lastParentWithIndexBelow - 1
			if( parentIndexToUse < 0 )
				throw 'Parent list of node is empty!'
	
			parentList[ parentIndexToUse ].children.push( currentListValues )
			
			return currentTreeValues
		}, currentTree )
		return stepAtTree
	}, [] )
	
	
	return treeOfNode
}

function translateMarkdownLineToADF( markdownLineTextWithTabs ){
	const markdownLine = markdownLineTextWithTabs.replace( /\t/g, '    ' )
	
	const headerNode = matchHeader( markdownLine )
	if( headerNode ) return headerNode
	
	
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
		const nodeToAttachTextTo = currentNode.node.adfType === 'orderedList' || currentNode.node.adfType === 'bulletList'
								   ? currentNode.node.textToEmphasis || currentNode.children.length === 0
									 ? nodeOrListItem.content.add( new Paragraph() )
									 : nodeOrListItem
								   : nodeOrListItem
		
		if( currentNode.node.adfType !== 'codeBlock'
			&& currentNode.node.textToEmphasis )
			attachItemNode( nodeToAttachTextTo, currentNode.node.textToEmphasis )
		
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

function addTypeToNode( adfNodeToAttachTo, adfType, typeParams ){
	switch( adfType ) {
		case "heading":
			return adfNodeToAttachTo.content.add( new Heading( typeParams ) )
		
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

function sliceInLineCode( rawText ){
	return sliceOneMatchFromRegexp( rawText, 'inline', /(?<nonMatchBefore>[^`]*)(?:`(?<match>[^`]+)`)(?<nonMatchAfter>[^`]*)/g )
}

function sliceEmoji( rawText ){
	return sliceOneMatchFromRegexp( rawText, 'emoji',/(?<nonMatchBefore>[^`]*)(?::(?<match>[^`\s]+):)(?<nonMatchAfter>[^`]*)/g )
}

function sliceLink( rawText ){
	return sliceOneMatchFromRegexp( rawText, 'link',/(?<nonMatchBefore>[^`]*)(?:\[(?<match>[^\[\]]+)\]\((?<matchOptional>[^\(\)"]+)(?: "(?<matchOptional2>[^"]*)")?\))(?<nonMatchAfter>[^`]*)/g )
}

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

function attachTextToNodeSliceEmphasis( parentNode, textToEmphasis ){
	const lineUnderscored = textToEmphasis.replace( /\*/g, '_' )
	let currentDecorationLevel = 0
	//see convertDecorationLevelToMark
	// 0 => no decoration
	// 1 => italic
	// 2 => bold
	// 3 => bold and italic
	
	let potentialUnderscorePair = false
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
		
		if( lineUnderscored[ currentCharacterIndex ] === '_' ){
			let decorationToUse = convertDecorationLevelToMark( currentDecorationLevel )
			
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
		const textNode = new Text( expressionBuffer, convertDecorationLevelToMark( currentDecorationLevel ) )
		parentNode.content.add( textNode )
	}
	// textWithInline( parentNode, expressionBuffer, convertDecorationLevelToMark( currentDecorationLevel ) )
}

function convertDecorationLevelToMark( decorationLevelToConvert ){
	return decorationLevelToConvert === 1
		   ? marks().em()
		   : decorationLevelToConvert === 2
			 ? marks().strong()
			 : decorationLevelToConvert === 3
			   ? marks().strong().em()
			   : null
}


function attachTextToNodeRaw( nodeToAttachTo, textToAttach ){
	const textNode = new Text( textToAttach )
	nodeToAttachTo.content.add( textNode )
}

module.exports = translateGITHUBMarkdownToADF
