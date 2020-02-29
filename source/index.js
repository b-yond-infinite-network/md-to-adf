/***********************************************************************************************************************
 *
 * Take any markdown (Github focussed for now) and translate it into a JIRA/Confluence compatible ADF document
 *
 *  @author bruno.morel@b-yond.com
 *
 **********************************************************************************************************************/
const { Document }	= require( 'adf-builder' )


const buildIRTreeFromMarkdown = require( __dirname + '/markdownHandling' )
const fillADFNodesWithMarkdown = require( __dirname + '/adfHandling' )

function translateGITHUBMarkdownToADF( markdownText ){
	
	const textTree = buildIRTreeFromMarkdown( markdownText )
	
	const adfRoot = new Document()
	if( textTree.length > 0 )
		fillADFNodesWithMarkdown( adfRoot, textTree )
	
	return adfRoot
}

module.exports = translateGITHUBMarkdownToADF
