const { Document, marks, Heading, Text, Emoji, BulletList, OrderedList, ListItem, CodeBlock, BlockQuote, Paragraph }	= require( 'adf-builder' )

function translateGITHUBMarkdownToADF( markdownText ){
	
	const textTree = buildTreeFromMarkdown( markdownText )
	
	const adfRoot = new Document()
	if( textTree.length > 0 )
		fillADFNodesWithMarkdown( adfRoot, textTree )
	
	return adfRoot
}


function buildTreeFromMarkdown( rawTextMarkdown ){
	const arrOfNodes = rawTextMarkdown.split( '\n' ).flatMap( currentLine => {
		return translateMarkdownLineToADF( currentLine )
		//{ adfType, typeParam, textToEmphasis, textPosition }
	} )
	
	const { accumulatedNodes } = arrOfNodes.reduce( ( { accumulatedNodes, indexCurrentCodeBlock }, currentLineNode ) => {
		if( ( currentLineNode.adfType === 'codeBlock'
			  || ( currentLineNode.nodeAttached && currentLineNode.nodeAttached.adfType === 'codeBlock' ) )
			&& typeof indexCurrentCodeBlock === 'undefined' ){
			
			accumulatedNodes.push( currentLineNode )
			accumulatedNodes[ accumulatedNodes.length - 1 ].textToEmphasis = ''
			
			if( currentLineNode.nodeAttached
				&& currentLineNode.nodeAttached.adfType === 'codeBlock' ){
				currentLineNode.nodeAttached.textToEmphasis = ''
				accumulatedNodes.push( currentLineNode.nodeAttached )
			}
			
			return { accumulatedNodes, indexCurrentCodeBlock: accumulatedNodes.length - 1 }
		}
		
		if( currentLineNode.adfType === 'codeBlock'
			&& typeof indexCurrentCodeBlock !== 'undefined' ){
			accumulatedNodes[ indexCurrentCodeBlock ].textPosition = currentLineNode.textPosition
			return { accumulatedNodes }
		}
		
		if( currentLineNode.adfType === 'paragraph'
			&& typeof indexCurrentCodeBlock !== 'undefined'
			&& typeof accumulatedNodes[ indexCurrentCodeBlock ].textToEmphasis !== 'undefined' ){
			
			if( accumulatedNodes[ indexCurrentCodeBlock ].textToEmphasis !== '' )
				accumulatedNodes[ indexCurrentCodeBlock ].textToEmphasis += '\n'
			
			accumulatedNodes[ indexCurrentCodeBlock ].textToEmphasis += currentLineNode.textToEmphasis
			accumulatedNodes[ indexCurrentCodeBlock ].textPosition = currentLineNode.textPosition
			
			return { accumulatedNodes, indexCurrentCodeBlock }
		}
		
		accumulatedNodes.push( currentLineNode )
		return { accumulatedNodes }
	}, { accumulatedNodes: [ ] } )
	
	const levelsPosition = accumulatedNodes.reduce( ( currentLevelList, currentList ) => {
		return currentLevelList.includes( currentList.textPosition ) || currentLevelList.includes( currentList.textPosition + 1 )
			   ? currentLevelList
			   : currentLevelList.length === 0 || currentList.textPosition > ( currentLevelList[ currentLevelList.length - 1 ] + 1 )
				 ? [ ...currentLevelList, currentList.textPosition ]
				 : currentList.textPosition
				   ? currentLevelList.splice( 	currentLevelList.findIndex( findIndexListValues => {
						return currentList.textPosition < findIndexListValues.textPosition
					} ), 0, currentList.textPosition )
				   : currentLevelList
	}, [ ] )
	
	const levelsListsIndexes = levelsPosition.map( currentLevelPosition => {
		return accumulatedNodes.filter( currentList => ( currentList.textPosition === currentLevelPosition
														 || currentList.textPosition === currentLevelPosition + 1 ) )
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
	return {  }
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
			textPosition: 	lineToMatch.indexOf( '```' ) }
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
	const paragraph = lineToMatch.match( /^(?:[\s])*(?<paragraphText>[^\n]+)$/i )
	if( paragraph
		&& paragraph.groups
		&& paragraph.groups.paragraphText ){
		return { 	adfType : 		"paragraph",
			textToEmphasis: paragraph.groups.paragraphText,
			textPosition: 	lineToMatch.indexOf( paragraph.groups.paragraphText ) }
	}
	
	return null
}

function fillADFNodesWithMarkdown( currentParentNode, currentArrayOfNodesOfSameIndent ){
	currentArrayOfNodesOfSameIndent.reduce( ( lastListNode, currentNode ) => {
		
		const nodeOrListNode = lastListNode && lastListNode.content.type === currentNode.node.adfType
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
		
		if( currentNode.node.textToEmphasis )
			attachTextToNodeWithEmphasis( nodeToAttachTextTo, currentNode.node.textToEmphasis )
		
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


function attachTextToNodeWithEmphasis( parentNode, textToEmphasis ){
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
				textWithInline( parentNode, expressionBuffer, decorationToUse )
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
	if( expressionBuffer !== '' )
		textWithInline( parentNode, expressionBuffer, convertDecorationLevelToMark( currentDecorationLevel ) )
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

function textWithInline( nodeToAttachTo, rawText, marksToUse ){
	const strInlineRegExp = '(?<textBefore>[^`]*)' +
							'(?:' +
							'`(?<inlineCode>[^`]+)`' +
							'|' + '!\\[(?<imageTitle>[^\\[\\]]+)\\]\\((?<imageURL>[^\\(\\)"]+)(?: "(?<imageHover>[^"]*)")?\\)' +
							'|' + '\\[(?<linkTitle>[^\\[\\]]+)\\]\\((?<linkURL>[^\\(\\)"]+)(?: "(?<linkHover>[^"]*)")?\\)' +
							'|' + ':(?<emojiCode>[^`]+):' +
							')' +
							'(?<textAfter>[^`]*)'
	const inlineRegExp = new RegExp( strInlineRegExp, 'g' )
	
	let snippet = null
	let hasAtLeastOneExpression = false
	while( ( snippet = inlineRegExp.exec( rawText ) ) ) {
		hasAtLeastOneExpression = true
		if( snippet.groups.textBefore ){
			const textNode = new Text( snippet.groups.textBefore, marksToUse )
			nodeToAttachTo.content.add( textNode )
		}
		
		if( snippet.groups.inlineCode ){
			const textNode = new Text( snippet.groups.inlineCode, marks().code() )
			nodeToAttachTo.content.add( textNode )
		}
		
		if( snippet.groups.emojiCode ){
			const emojiNode = new Emoji( {shortName: snippet.groups.emojiCode} )
			nodeToAttachTo.content.add( emojiNode )
		}
		
		if( snippet.groups.imageTitle
			|| snippet.groups.imageURL
			|| snippet.groups.imageHover ){
			// const textNode = new Text( snippet.groups.inlineCode, marks().code() )
			// nodeToAttachTo.content.add( textNode )
		}
		
		if( snippet.groups.linkTitle
			|| snippet.groups.linkURL
			|| snippet.groups.linkHover ){
			const textNode = new Text( snippet.groups.linkTitle,
									   marks().link( snippet.groups.linkURL,
													 snippet.groups.linkHover ) )
			nodeToAttachTo.content.add( textNode )
		}
		
		// if( snippet.groups.imageTitle ){
		// 	const textNode = new Text( link.groups.inlineCode, marks().code() )
		// 	nodeToAttachTo.content.add( textNode )
		// }
		
		if( snippet.groups.textAfter ){
			const textNode = new Text( snippet.groups.textAfter, marksToUse )
			nodeToAttachTo.content.add( textNode )
		}
	}
	
	if( !hasAtLeastOneExpression ){
		const textNode = new Text( rawText, marksToUse )
		nodeToAttachTo.content.add( textNode )
	}
	
}

module.exports = translateGITHUBMarkdownToADF
