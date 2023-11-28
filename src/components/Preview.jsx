import { useState } from "react"
import ComponentHeader from "./ComponentHeader"
import "../sass/Preview.sass"

export default function Preview({markdownText}){
    const [previewOpenState, updatePreviewOpenState] = useState(false)

    function togglePreviewOpenState(){
        updatePreviewOpenState(!previewOpenState)
    }

    const sortMatchObj = (matchObj) => {
        let {transformedMatches, matchIndexes } = matchObj
       
        let orderedTransformedMatches = []

        const matchIndexesCopy = [...matchIndexes]
        matchIndexes.sort((a,b) => {
            return a[0] - b[0] != 0 ? a [0] - b[0] : b[1] - a[1]
        }
        )

        matchIndexes.forEach((matchIndex, i) => {
            const previousIndex = matchIndexesCopy.indexOf(matchIndex)

            orderedTransformedMatches.push({
                value: transformedMatches[previousIndex],
                currentIndex: i
            })
        })

        orderedTransformedMatches.sort((a,b) => a.currentIndex - b.currentIndex)

        orderedTransformedMatches = orderedTransformedMatches.map((obj) => obj.value )

        let orderedMatchObj = {
            transformedMatches: orderedTransformedMatches,
            matchIndexes: matchIndexes
        }
        return orderedMatchObj
    }


    const transformMatchObjToHtml = (matchObj, line) => {
        matchObj = sortMatchObj(matchObj)
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

    function transformcodeSnippetIntoHtml(txt){
        let lines = txt.split('\n').map((line) => {
            line = line.replace(/^(`{1,3}) /, '').replace(/ (`{1,3})$/, '')
            return line
        })

        const getMatchObj = (regexes, transformFunction, line) => {
            const transformedMatches = []
            const matchIndexes = []
    
            

            regexes.forEach((regex) => {

                // There is a bug that causes that if this line is not here
                // The regex is not detecting nothing. I do not know a cause 
                // for that.
                line.match(regex)
    
                let match;
                while ((match = regex.exec(line)) != null){
                    transformedMatches.push(transformFunction(match[0]))
                    matchIndexes.push([match.index, match.index + match[0].length - 1])
                }
            })
            
    
            const matchObj = {
                transformedMatches: transformedMatches,
                matchIndexes: matchIndexes
            }
    
            return matchObj
        }

        const generalDetectFunction = (keywords, txt) => {
            for (let i = 0; i < keywords.length; i++){
                const keyword = keywords[i]
                if (keyword.test(txt)){
                    return true
                }
            }
            return false
        }
        const inLineDetectionAndTransform = [
            {
                keywords: [
                    /\+/g, /-/g, /\*/g, /\//g, /%/g, 
                    /\+\+/g, /--/g,
                    /=/g, /\+=/g, /-=/g, /\*=/g, /=/g, /%=/g,
                    /==/g, /===/g, /!=/g, /!==/g,
                    />/g, /</g, />=/g, /<=/g,
                    /&&/g, /\|\|/g, /!/g,
                    /&/g, /\|/g, /\^/g, /~/g, /<</g, />>/g, />>>/g,
                    /\?/g, /:/g,
                  ],
                  detectFunction: function(txt){
                    return generalDetectFunction(this.keywords, txt)
                  },
                  transformFunction: (txt) => (<span className="token operator">{txt}</span>),
                  getMatchObj: function (txt){
                    return getMatchObj(this.keywords, this.transformFunction, txt)
                }
            },
            {
                keywords: [
                    /var/g,
                    /let/g,
                    /const/g,
                    /if/g,
                    /else/g,
                    /switch/g,
                    /case/g,
                    /break/g,
                    /for/g,
                    /while/g,
                    /do/g,
                    /function/g,
                    /return/g,
                    /this/g,
                    /new/g,
                    /typeof/g,
                    /null/g,
                    /undefined/g,
                    /true/g,
                    /false/g,
                    /try/g,
                    /catch/g,
                    /throw/g,
                    /finally/g,
                    /delete/g
                ],
                detectFunction: function(txt){
                    return generalDetectFunction(this.keywords, txt)
                },
                transformFunction: function(txt){
                    return (<span className="token keyword">{txt}</span>)
                },
                getMatchObj: function (txt){
                    return getMatchObj(this.keywords, this.transformFunction, txt)
                }
            },
            {
                regexes: [
                    /var [^;=]+[ ]*(=|;)/g,
                    /let [^;=]+[ ]*(=|;)/g,
                    /const [^;=]+[ ]*(=)/g,
                    /function.+\(/g,
                    /new .+\(/g 
                ],
                firstNegativeRegexes: [
                    /^(var) /,
                    /^(let) /,
                    /^(const) /,
                    /^(function) /,
                    /^(new) /
                ],
                secondNegativeRegexes: [
                    /=$|;$/,
                    /=$|;$/,
                    /=$/,
                    /\($/,
                    /\($/
                ],
                detectFunction: function(txt){

                    return generalDetectFunction(this.regexes, txt)
                },
                transformFunction: (txt) => (<span className={`token name`}>{txt}</span>),
                getMatchObj: function (txt){

                    const transformedMatches = []
                    const matchIndexes = []

                    const getTransformedMatch = (match, negativeRegexIndex) =>  this.transformFunction(match.replace(this.firstNegativeRegexes[negativeRegexIndex], '').replace(this.secondNegativeRegexes[negativeRegexIndex], ''))
                    

                    let match;
                    this.regexes.forEach((regex, i) => {
                        txt.match(regex)
                        
                        while((match = regex.exec(txt)) != null){

                            transformedMatches.push(getTransformedMatch(match[0], i))
                            const keywordLength = match[0].match(this.firstNegativeRegexes[i])[0].length
                            const start = match.index + keywordLength - 1
                            matchIndexes.push([start, start + match[0].length - keywordLength - 1])
                        }
                    })
            
                    const matchObj = {
                        transformedMatches: transformedMatches,
                        matchIndexes: matchIndexes
                    }



            
                    return matchObj
                }
            },
            {
                keywords: [
                    /;/g,
                    /:/g,
                    /,/g,
                    /\(/g,
                    /\)/g,
                    /\{/g,
                    /\}/g,
                    /\[/g,
                    /\]/g,
                    /\./g,
                    /\?/g
                ],
                detectFunction: function(txt){
                    return generalDetectFunction(this.keywords, txt)
                },
                transformFunction: (txt) => (<span className="token punctuation">{txt}</span>),
                getMatchObj: function (txt){
                    return getMatchObj(this.keywords, this.transformFunction, txt)
                }
            },
            {
                regex: /'[^']+'|"[^"]+"|`[^`]+`/,
                detectFunction: function(txt){
                    return this.regex.test(txt)
                },
                transformFunction: (txt) => (<span className="token string">{txt}</span>),
                getMatchObj: function (txt){
                    return getMatchObj(this.keywords, this.transformFunction, txt)
                }
            },
        ]
        
        const applyInlineDetectionAndTransform = (line) => {
            let matchObjects = []
            inLineDetectionAndTransform.forEach((obj) => {
                if (obj.detectFunction(line)){
                    matchObjects.push(obj.getMatchObj(line))
                }
            })
            const joinedMatchObjects = joinMatchObjects(matchObjects)
            return (<>{transformMatchObjToHtml(joinedMatchObjects, line)}</>)
        }
        const allLineDetectionAndTransform = [
            {
            regex: /^([ ]*\/\/)/g,
            name: 'comment',
            detectFunction: function(line){
                return this.regex.test(line)
            },
            transformFunction: function(line){
                return (<span className={`token ${this.name}`}>{line.replace(this.regex, '')}</span>)
            }
            },
        ]
        lines = lines.map((line) => {
            for (let i = 0; i < allLineDetectionAndTransform.length; i++){
                const obj = allLineDetectionAndTransform[i]
                if (obj.detectFunction(line)){
                    return obj.transformFunction(line)
                }
            }
            return <>{applyInlineDetectionAndTransform(line)}</>
        })
        
        
        return (<>{lines}</>)
        
    }
    function applyInlineMarkdown(markdownLine){
        
        
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
                regex: /(`{1,3} [^`]+ `{1,3})/g,
                detectFunction: function (line){
                    return this.regex.test(line)
                },
                transformFunction: function(txt){
                    return (<code>{transformcodeSnippetIntoHtml(txt)}</code>)
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