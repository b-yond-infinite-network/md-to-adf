/**********************************************************************************************************************
 *
 *  Markdown handling
 *
 *  @author bruno.morel@b-yond.com
 *---------------------------------------------------------------------------------------------------------------------
 *
 * This build an intermediate representation tree and manage the hierarchy and priorities of the markdown expressions
 *  each branch will contain an object with the follow properties:
 *
 **********************************************************************************************************************/
const translateMarkdownLineToIR = require( __dirname + '/markdownParsing' )

/**
 * @typedef {Object}  IRTreeNode
 * @property {IRElement} 	node 			- intermediate representation of the markdown element
 * @property {IRElement[]} 	children 		- the list of children attach to that node
 * @property {Number} 		indexOfList 	- the index in the list of expression
 */


/**
 * Implement markdown greediness and collapsing of subnode, generate the final node tree representing
 *  the IRElement topology
 *
 * @param rawTextMarkdown	{String[]}		array of expression to parse and handle
 *
 * @returns {IRElement[]}	an array of IRElement
 */
function buildTreeFromMarkdown( rawTextMarkdown ){
	//code block are the most greedy expression in markdown
	const cleanedCodeBlock = collapseCodeBloc( rawTextMarkdown )
	
	//block quote collapse paragraphs, so we have to to them first
	const blockquotedNodes = collapseBlockquote( cleanedCodeBlock )
	
	//paragraph themselves collapse when they are not separated by
	// two consecutive empty lines
	const breakedLineNodes = collapseParagraph( blockquotedNodes )
	
	//lists accumulate elements of the same level unless separated by
	// 	two consecutive empty lines
	const accumulatedNodes = accumulateLevelFromList( breakedLineNodes )
	
	//we build the array of textPosition for each level
	const levelsPosition = createLevelList( accumulatedNodes )
	
	//map each element to a level, in order
	const elementMap = mapIRToLevels( accumulatedNodes, levelsPosition )
	
	return buildTreeFromLevelMap( elementMap )
}



/**
 * CodeBlock swallow all text until they are closed, so we collapsed all paragraph into them
 *   When a code block is open, it should be closed by a triple caret, everything in between is code
 *
 * @param rawIROfMarkdown	{Array} 	the array of IRElement to look into collapsing
 *
 * @returns {IRElement[]}	an array of IRElement
 */
function collapseCodeBloc( rawIROfMarkdown ){
	///MARDKOWN logic - closing code blocks
	//
	const { codeBlockHandled } =  rawIROfMarkdown.split( /\r\n|\r|\n/ ).reduce( ( { codeBlockHandled, indexCurrentCodeBloc }, currentLine ) => {
		const lineTranslation = translateMarkdownLineToIR( currentLine )
		
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
	
	//handling of unfinished empty codeBlock
	const cleanedCodeBlock = codeBlockHandled.filter( ( currentNode ) => {
		if( currentNode.adfType !== 'codeBlock' )
			return currentNode
		
		if( currentNode.textToEmphasis !== '' )
			return currentNode
	} )
	
	return cleanedCodeBlock
}

/**
 * Blockquote start with each line identify with a caret. Any interruption (line break) create a new blockquote
 *
 * @param rawIROfMarkdown	{Array} 	the array of IRElement to look into collapsing
 *
 * @returns {IRElement[]}	an array of IRElement
 */
function collapseBlockquote( rawIROfMarkdown ){
	const { blockquotedNodes } = rawIROfMarkdown.reduce( ( { blockquotedNodes, currentLastThatWasBlockQuote }, currentLineNode ) => {
		
		if( !currentLastThatWasBlockQuote
			&& currentLineNode.adfType === 'blockQuote' ){
			blockquotedNodes.push( currentLineNode )
			return { blockquotedNodes, currentLastThatWasBlockQuote: currentLineNode }
		}
		
		//this is a non-empty paragraph, if we are already filling up a paragraph, let's add the text inside
		if( currentLastThatWasBlockQuote
			&& currentLineNode.adfType === 'blockQuote' ){
			currentLastThatWasBlockQuote.textToEmphasis = currentLastThatWasBlockQuote.textToEmphasis +
														  ' ' + currentLineNode.textToEmphasis
			return { blockquotedNodes, currentLastThatWasBlockQuote }
		}
		
		//this is non-blockquote node, we add it to the list
		blockquotedNodes.push( currentLineNode )
		return { blockquotedNodes }
		
	}, { blockquotedNodes: [ ] } )
	
	return blockquotedNodes
}

/**
 * Heading is an exception, otherwise non-empty line aggregate in the parent element
 * For all other type, following a markdown with any paragraph of text is considered a continuation, so we aggregate
 * all subsequent text into the same parent element (paragraph, list item, ...)
 *
 * @param rawIROfMarkdown	{Array} 	the array of IRElement to look into collapsing
 *
 * @returns {IRElement[]}	an array of IRElement
 */
function collapseParagraph( rawIROfMarkdown ){
	const { breakedLineNodes } = rawIROfMarkdown.reduce( ( { breakedLineNodes, currentParent, lastWasAlsoAParagraph }, currentLineNode ) => {
		
		if( currentLineNode.adfType === 'heading'
			|| currentLineNode.adfType === 'divider'
			|| currentLineNode.adfType === 'codeBlock' ){
			breakedLineNodes.push( currentLineNode )
			return { breakedLineNodes }
		}
		
		if( currentLineNode.adfType !== 'paragraph' ){
			breakedLineNodes.push( currentLineNode )
			return { breakedLineNodes, currentParent: currentLineNode }
		}
		
		if( !lastWasAlsoAParagraph
			&& /^(?:[\s]*)$/.test( currentLineNode.textToEmphasis ) ) {
			//we're breaking into a new paragraph
			return { breakedLineNodes, lastWasAlsoAParagraph: true }
		}
		
		if( lastWasAlsoAParagraph
			&& /^(?:[\s]*)$/.test( currentLineNode.textToEmphasis ) ) {
			//we've double break, we add a paragraph
			breakedLineNodes.push( currentLineNode )
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
	
	return breakedLineNodes
}


/**
 * Realign children nodes to orderedList and bulletList
 *
 * @param rawIROfMarkdown	{Array} 	the array of IRElement to look into collapsing
 *
 * @returns {IRElement[]}	an array of IRElement
 */
function accumulateLevelFromList( rawIROfMarkdown ){
	const { accumulatedNodes } = rawIROfMarkdown.reduce( ( { accumulatedNodes, indexCurrentList }, currentLineNode ) => {
		
		if( currentLineNode.adfType !== 'heading'
			&& currentLineNode.adfType !== 'divider'
			&& currentLineNode.adfType !== 'orderedList'
			&& currentLineNode.adfType !== 'bulletList'
			&& indexCurrentList
			&& currentLineNode.textPosition < accumulatedNodes[ indexCurrentList ].textPosition + 2 ){
			currentLineNode.textPosition = accumulatedNodes[ indexCurrentList ].textPosition + 2
		}
		
		accumulatedNodes.push( currentLineNode )
		
		if( currentLineNode.adfType === 'heading'
			|| currentLineNode.adfType === 'divider' )
			return { accumulatedNodes }
		
		if( currentLineNode.adfType === 'bulletList' || currentLineNode.adfType === 'orderedList' ){
			return { accumulatedNodes, indexCurrentList: accumulatedNodes.length - 1 }
		}
		
		return { accumulatedNodes, indexCurrentList }
		
	}, { accumulatedNodes: [ ] } )
	
	return accumulatedNodes
}

/**
 * Build an array of all the different level (defined by the lists) we have to manage
 *  and their corresponding textPosition
 *
 * @param rawIROfMarkdown	{Array} 	the array of IRElement to look into collapsing
 *
 * @returns {Number[]}		an array of the textPosition for each level
 */
function createLevelList( rawIROfMarkdown ){
	return rawIROfMarkdown.reduce( ( currentLevelList, currentNode ) => {
		if( currentNode.adfType !== 'orderedList'
			&& currentNode.adfType !== 'bulletList' )
			return currentLevelList
		
		return ( currentLevelList.includes( currentNode.textPosition + 2 ) || currentLevelList.includes( currentNode.textPosition + 3 ) )
			   ? currentLevelList
			   : currentNode.textPosition + 2 > ( currentLevelList[ currentLevelList.length - 1 ] + 1 )
				 ? [ ...currentLevelList, currentNode.textPosition + 2 ]
				 : currentLevelList
	}, [ 0 ] )
}


/**
 * Map all element to their level in an array of level
 *
 * @param rawIROfMarkdown	{Array} 	the array of IRElement to look into mapping
 * @param levelsPosition	{Array} 	the list of level's textPosition to use
 *
 * @returns {IRTreeNode[]}		an array of IRTreeNode
 */
function mapIRToLevels( rawIROfMarkdown, levelsPosition ){
	return levelsPosition.map( ( currentLevelPosition, currentIndex ) => {
		return rawIROfMarkdown.filter( currentList => ( currentList.textPosition >= currentLevelPosition
														 && ( currentIndex === levelsPosition.length - 1 //this is the last level
															  || currentList.textPosition < levelsPosition[ currentIndex + 1 ] ) ) )
							   .map( currentList => ( {
								   indexOfList: rawIROfMarkdown.indexOf( currentList ),
								   children: [],
								   node: currentList } ) )
	} )
}

/**
 * Map all element to their level in an array of level
 *
 * @param levelsMap			{Array} 	the level array of array of IRElement
 *
 * @returns {IRTreeNode[]}				tree of IRElements and their children
 */
function buildTreeFromLevelMap( levelsMap ){
	const treeOfNode = levelsMap.reduce( ( currentTree, currentArrayOfListIndexes, currentIndexInTheArrayOfListIndexes ) => {
		const stepAtTree = currentArrayOfListIndexes.reduce( ( currentTreeValues, currentListValues ) => {
			if( currentIndexInTheArrayOfListIndexes <= 0 )
				return [ ...currentTreeValues, currentListValues ]
			
			const parentList = levelsMap[ currentIndexInTheArrayOfListIndexes - 1 ]
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

module.exports = buildTreeFromMarkdown
