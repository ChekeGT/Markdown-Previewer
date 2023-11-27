import { useState } from "react"
import ComponentHeader from "./ComponentHeader"
import "../sass/Preview.sass"

export default function Preview({markdownText}){
    const [previewOpenState, updatePreviewOpenState] = useState(false)

    function togglePreviewOpenState(){
        updatePreviewOpenState(!previewOpenState)
    }


    

    function applyInlineMarkdown(markdownLine){
        
        const transformMatchObjToHtml = (matchObj, line) => {
            const {transformedMatches, matchIndexes } = matchObj


            let startingIndexForEmptyText = 0


            const textArr = []

            matchIndexes.forEach((matchIndex, i) => {
                const emptyText = <>{line.slice(startingIndexForEmptyText, matchIndex[0] - startingIndexForEmptyText)}</>
                const editedText = <>{transformedMatches[i]}</>

                textArr.push(emptyText, editedText)

                startingIndexForEmptyText = matchIndex[1] + 1
                
                if (i == matchIndexes.length - 1){
                    textArr.push(<>{line.slice(startingIndexForEmptyText, line.length)}</>)
                }
            })
            

            return (<>{matchIndexes.length > 0 ? textArr : line}</>)
        }

        const isMatchAlreadyPresent = (matchObj, matchIndex) => {
            const { matchIndexes } = matchObj
            

            for (let i = 0; i < matchIndexes.length; i++){
                const obj = matchIndexes[i]
                for (let j = obj[0]; j <= obj[1]; j++){
                    for (let k = matchIndex[0]; k <= matchIndex[1]; k++){
                        if (k == j){
                            return true
                        }
                    }
                }
            }
            
            return false
        }

        const joinMatchObjects = (matchObjects) => { 
            
            let joinedMatchObj = {
                transformedMatches: [],
                matchIndexes: []
            }
            matchObjects.forEach((matchObj) => {
                const {transformedMatches, matchIndexes } = matchObj
                for (let i = 0; i < matchIndexes.length; i++){
                    const transformedMatch = transformedMatches[i]
                    const matchIndex = matchIndexes[i]
                    
                    if (!isMatchAlreadyPresent(joinedMatchObj, matchIndex)){
                        joinedMatchObj.transformedMatches.push(transformedMatch)
                        joinedMatchObj.matchIndexes.push(matchIndex)       
                    }
                }
            })


            return joinedMatchObj
        }

        const getMatchObj = (regex, transformFunction, line) => {
            const transformedMatches = []
            const matchIndexes = []

            // There is a bug that causes that if this line is not here
            // The regex is not detecting nothing. I do not know a cause 
            // for that.
            line.match(regex)

            let match;
            while ((match = regex.exec(line)) != null){
                transformedMatches.push(transformFunction(match[0]))
                matchIndexes.push([match.index, match.index + match[0].length - 1])
            }


            const matchObj = {
                transformedMatches: transformedMatches,
                matchIndexes: matchIndexes
            }

            return matchObj
        }
        const inLineMarkdownDetectionAndTransform = [
            {
                regex: /(\*\* [^*]+ \*\*)/g,
                matchFunction: function (line){
                    return line.match(this.regex)
                },
                detectFunction: function (line){
                    return this.regex.test(line)
                },
                transformFunction: ((txt) => (<strong>{txt.replace(/^(\*\*)/, '').replace(/(\*\*)$/, '')}</strong>)),
            },
            {
                regex: /(\* [^*]+ \*)/g,
                detectFunction: function(line){
                    return this.regex.test(line)
                },
                transformFunction: ((txt) => (<i>{txt.replace(/(^\*)/, '').replace(/\*$/, '')}</i>)),
            },
            {
                regex: /(` [^`]+ `)/g,
                detectFunction: function (line){
                    return this.regex.test(line)
                },
                getMatchObj: function (inLineMatch) {
                    return inLineMatch
                },
                transformFunction: function(txt){
                    // Pending work here
                    txt = txt.replace(/^`/, '').replace(/`$/, '')
                    return txt
                }
            }
        ]
        let matchObjects = []
        inLineMarkdownDetectionAndTransform.forEach((inlineObj) => {
            if (inlineObj.detectFunction(markdownLine)){
                let regex = inlineObj.regex
                let transformFunction = inlineObj.transformFunction
                matchObjects.push(getMatchObj(regex, transformFunction, markdownLine))
            }
        })
        
        return (<>{transformMatchObjToHtml(joinMatchObjects(matchObjects), markdownLine)}</>)
    }


    // List related functions.
    const getIndentationLevel = (markdownLine) => Math.floor(markdownLine.match(/^[ ]*/)[0].length / 4)

    function isLastListIndexComplete(listIndexes){
        const lastListIndex = listIndexes[listIndexes.length - 1]
        return lastListIndex.finalIndex != undefined
    }

    function markdownListDetection(markdownLines, startingIndex = 0, finalIndex = markdownLines.length - 1, indentationLevel = 0) {
        // We need to find the starting index and the ending index
        const listIndexes = []
        const regex = /^([ ]*-)|^([ ]*[0-9]+\. )/


        for (let i = startingIndex; i <= finalIndex; i++){
            const line = markdownLines[i]
            if (regex.test(line)){
                if(((listIndexes.length == 0 || isLastListIndexComplete(listIndexes)) && getIndentationLevel(line) == indentationLevel)){
                    listIndexes.push({
                        startingIndex: i,
                        finalIndex: undefined,
                        indentationLevel: indentationLevel
                    })   
                }
            }

            
            const lastIndexObj = listIndexes[listIndexes.length - 1]
            if (lastIndexObj != undefined){
                if (lastIndexObj.finalIndex == undefined && lastIndexObj.startingIndex <= i && (!regex.test(line) || i == markdownLines.length - 1 || getIndentationLevel(line) < lastIndexObj.indentationLevel || i == finalIndex)){
                    const nextIndentationLvl = indentationLevel + 1
                    if (i == markdownLines.length - 1 || i == finalIndex){
                        lastIndexObj.finalIndex = i
                    }
                    if (!regex.test(line) || getIndentationLevel(line) < lastIndexObj.indentationLevel){
                        lastIndexObj.finalIndex = i -1
                    }
                    lastIndexObj.subLists = markdownListDetection(markdownLines, lastIndexObj.startingIndex + 1, lastIndexObj.finalIndex, nextIndentationLvl)                    
                }
                listIndexes[listIndexes.length - 1 ] = lastIndexObj
            }
        }

        return listIndexes
    }

    function transformListIndexesFromObjectIntoArray(listIndexes, depth = 0){
        if (listIndexes == undefined){
            return undefined
        }

        const getSubListLength = (subList) => {
            let length = 0
            subList.forEach(element => {
                if (Array.isArray(element)){
                    length += getSubListLength(element)
                }else{
                    length += 1
                }
            })

            return length
        }

        
       return listIndexes.map((listIndex) => {
            let arrayTransformation = []
            const subLists = transformListIndexesFromObjectIntoArray(listIndex.subLists, depth + 1)

            for (let i = listIndex.startingIndex; i <= listIndex.finalIndex; i++){
                arrayTransformation.push(i)
            }
            if (subLists != undefined){
                for (let i = 0; i < subLists.length; i++){
                    const subList = subLists[i]
                    const firstIndex = subList[0]

                    arrayTransformation.splice(arrayTransformation.indexOf(firstIndex), getSubListLength(subList), subList)
                }
            }


            return arrayTransformation
        })
    }

    function transformListIndexesToHtml(listIndexes, markdownLines, depth = 0){
        if (listIndexes == undefined){
            return (<></>)
        }

        listIndexes = listIndexes.map((listIndex, i) => (<>
            {
                    Array.isArray(listIndex) ?
                     <ul key={`depth: ${depth}, index: ${i}}`}>{transformListIndexesToHtml(listIndex, markdownLines, depth + 1)}</ul> :
                     <li key={`depth: ${depth}, index: ${i}}`}>{applyInlineMarkdown(markdownLines[listIndex].replace(/^([ ]*- )/, ''))}</li>
            }
            </>)
        )

        return listIndexes 
    }

    function placeListsInHtmlLinesList(htmlLines, markdownListsObjects, markdownListsHtml){

        if (htmlLines && markdownListsObjects && markdownListsHtml){
            const firstAndFinalIndexes = []
            markdownListsObjects.forEach((markdownListObj, i) => {
                const firstIndex = markdownListObj.startingIndex
                const finalIndex = markdownListObj.finalIndex
                firstAndFinalIndexes.push([firstIndex, finalIndex]) 

                htmlLines[firstIndex] = markdownListsHtml[i]
            })

            let removedObjects = 0
            firstAndFinalIndexes.forEach((firstAndFinalIndex) => {
                const numberOfDeletedObjects = firstAndFinalIndex[1] - firstAndFinalIndex[0]
                
                htmlLines.splice(firstAndFinalIndex[0] + 1 - removedObjects, numberOfDeletedObjects)
                removedObjects +=  numberOfDeletedObjects
            })
        }

        return htmlLines
    }

    function applyAllLineMarkdown(markdownLines){
        const allLineMarkdownDetectionAndTransform = [
            {
                detectFunction: ((line) => line.startsWith('#####')),
                transformFunction: ((line) => (<h5>{applyInlineMarkdown(line.replace(/^#{5}/, ''))}</h5>))
            },
            {
                detectFunction: ((line) => line.startsWith('####')),
                transformFunction: ((line) => (<h4>{applyInlineMarkdown(line.replace(/^#{4}/, ''))}</h4>))
            },
            {
                detectFunction: ((line) => line.startsWith('###')),
                transformFunction: ((line) => (<h3>{applyInlineMarkdown(line.replace(/^#{3}/, ''))}</h3>))
            },
            {
                detectFunction: ((line) => line.startsWith('##')),
                transformFunction: ((line) => (<h2>{applyInlineMarkdown(line.replace(/^#{2}/, ''))}</h2>))
            },
            {
                detectFunction: ((line) => line.startsWith('#')),
                transformFunction: ((line) => (<h1>{applyInlineMarkdown(line.replace(/^#{1}/, ''))}</h1>))
            },
            {
                detectFunction: ((line) => /^>/.test(line)),
                transformFunction: ((line) => (<p className="quoteblock">{applyInlineMarkdown(line.replace(/^>/, ''))}</p>))
            },
        ]

        return markdownLines.map((markdownLine) => {
            for (let i = 0; i < allLineMarkdownDetectionAndTransform.length; i++){
                const obj =  allLineMarkdownDetectionAndTransform[i]
                if (obj.detectFunction(markdownLine)){
                    return obj.transformFunction(markdownLine)
                }else{
                  return (<p>{applyInlineMarkdown(markdownLine)}</p>)  
                }
            }
            return markdownLine
         })
    }


    function transformMarkdownTextToHtml(text){
        
         const markdownLines =  text.split('\n')

         const markdownLists = markdownListDetection(markdownLines)
         const listIndexes = transformListIndexesFromObjectIntoArray(markdownLists)


         const htmlLists = transformListIndexesToHtml(listIndexes, markdownLines)


         let htmlLines = applyAllLineMarkdown(markdownLines)


         htmlLines = placeListsInHtmlLinesList(htmlLines, markdownLists, htmlLists)
         return htmlLines
    }

    return (
        <div className="preview-component">
            <ComponentHeader title={'Preview'} toggleOpenState={togglePreviewOpenState} openState={previewOpenState}/>
            <div className="markdown-preview-container">
                {transformMarkdownTextToHtml(markdownText)}
            </div>
        </div>
    )
}