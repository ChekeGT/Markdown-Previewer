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
        
        
        const doesNextMatchIndexSkipsText = (matchIndexes, currentIndex) => {
            if (!(currentIndex == matchIndexes.length - 1) ){
                const currentLastIndex = matchIndexes[currentIndex][1]
                const nextFirstIndex = matchIndexes[currentIndex + 1][0]

                if (nextFirstIndex - currentLastIndex > 0){
                    return true
                }
            }
            return false
        }


        const textArr = []


        matchIndexes.forEach((matchIndex, i) => {

            
            const editedText = <>{transformedMatches[i]}</>

            if (i == 0){
                const emptyText = <>{line.slice(0, matchIndex[0])}</>
                textArr.push(emptyText, editedText)
            }else{
                textArr.push(editedText)
            }

            if (doesNextMatchIndexSkipsText(matchIndexes, i)){
                const nextMatchIndex = matchIndexes[i + 1]
                const plainText = <>{line.slice(matchIndex[1] + 1, nextMatchIndex[0])}</>

                textArr.push(plainText)
            }
            if (i == matchIndexes.length - 1){
                const plainText = <>{line.slice(matchIndex[1] + 1, )}</>
                textArr.push(plainText)
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
            line = line.replace(/^(`{1,3})/, '').replace(/ (`{1,3})$/, '')
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
                    /\bvar\b/g,
                    /\blet\b/g,
                    /\bconst\b/g,
                    /\bif\b/g,
                    /\belse\b/g,
                    /\bswitch\b/g,
                    /\bcase\b/g,
                    /\bbreak\b/g,
                    /\bfor\b/g,
                    /\bwhile\b/g,
                    /\bdo\b/g,
                    /\bfunction\b/g,
                    /\breturn\b/g,
                    /\bthis\b/g,
                    /\bnew\b/g,
                    /\btypeof\b/g,
                    /\bnull\b/g,
                    /\bundefined\b/g,
                    /\btrue\b/g,
                    /\bfalse\b/g,
                    /\btry\b/g,
                    /\bcatch\b/g,
                    /\bthrow\b/g,
                    /\bfinally\b/g,
                    /\bdelete\b/g
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
                    /\bvar\b [^;=]+[ ]*(=|;)/g,
                    /\blet\b [^;=]+[ ]*(=|;)/g,
                    /\bconst\b [^;=]+[ ]*(=)/g,
                    /\bfunction\b.+\(/g,
                    /\bnew\b .+\(/g 
                ],
                firstNegativeRegexes: [
                    /^(\bvar\b) /,
                    /^(\blet\b) /,
                    /^(\bconst\b) /,
                    /^(\bfunction\b) /,
                    /^(\bnew\b) /
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

                    const getTransformedText = (match, negativeRegexIndex) =>  match.replace(this.firstNegativeRegexes[negativeRegexIndex], '').replace(this.secondNegativeRegexes[negativeRegexIndex], '')
                    

                    let match;
                    this.regexes.forEach((regex, i) => {
                        txt.match(regex)
                        
                        while((match = regex.exec(txt)) != null){

                            const transformedText = getTransformedText(match[0], i)

                            transformedMatches.push(this.transformFunction(transformedText))
                            const keywordLength = match[0].match(this.firstNegativeRegexes[i])[0].length
                            const start = match.index + keywordLength
                            const end = start + match[0].length - keywordLength - 2

                            matchIndexes.push([start, end])
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
                regexes: [
                    /\bfunction\b[^;=]+\([^(;)]+\)|\bfunction\b\([^(;)]+\)/g,
                    /\bnew\b [^;=]+\([^(;)]+\)/g 
                ],
                negativeRegexes: [
                    /\bfunction\b[^;=]+\(|\bfunction\b\(/g,
                    /\bnew\b [^;=]+\(/
                ],
                detectFunction: function(txt){
                    return generalDetectFunction(this.regexes, txt)
                },
                transformFunction: (txt) => (<span className={`token parameter`}>{txt}</span>),
                getMatchObj: function (txt){

                    const transformedMatches = []
                    const matchIndexes = []


                    const getParameters = (match, negativeRegexIndex) =>  match.replace(this.negativeRegexes[negativeRegexIndex], '').replace(/\)/g, '').split(',')

                    let match;
                    this.regexes.forEach((regex, i) => {
                        txt.match(regex)
                        
                        while((match = regex.exec(txt)) != null){

                            const parameters = getParameters(match[0], i)
                            
                            const keywordLength = match[0].match(this.negativeRegexes[i])[0].length - 1
                            let parametersStart = match.index + keywordLength + 1


                            parameters.forEach((parameter) => {
                                transformedMatches.push(this.transformFunction(parameter))
                                
                                let parameterEndIndex = parametersStart + parameter.length - 1
                                matchIndexes.push([parametersStart, parameterEndIndex ])

                                parametersStart = parameterEndIndex + 2
                            })
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
                regexes: [
                    /(\bvar\b [^;=]+[ ]*=[ ]*[^;=]+;)/g,
                    /(\blet\b [^;=]+[ ]*=[ ]*[^;=]+;)/g,
                    /(\bconst\b [^;=]+[ ]*=[ ]*[^;=]+;)/g,
                ],
                negativeRegexes: [
                    /(\bvar\b [^;=]+[ ]*=)/,
                    /(\blet\b [^;=]+[ ]*=)/,
                    /(\bconst\b [^;=]+[ ]*=)/
                ],
                detectFunction: function(txt){
                    return generalDetectFunction(this.regexes, txt)
                },
                transformFunction: (txt) => (<span className={`token value`}>{txt}</span>),
                getMatchObj: function (txt){

                    const transformedMatches = []
                    const matchIndexes = []


                    const getTransformedText = (match, negativeRegexIndex) =>  match.replace(this.negativeRegexes[negativeRegexIndex], '').replace(/;/g, '')
                    

                    let match;
                    this.regexes.forEach((regex, i) => {
                        txt.match(regex)
                        
                        while((match = regex.exec(txt)) != null){

                            const transformedText = getTransformedText(match[0], i)

                            transformedMatches.push(this.transformFunction(transformedText))
                            const keywordLength = match[0].match(this.negativeRegexes[i])[0].length - 1
                            const start = match.index + keywordLength + 1
                            const end = start + transformedText.length - 1
                            matchIndexes.push([start,  end])
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
                regex: /'[^']+'|"[^"]+"|`[^`]+`/g,
                detectFunction: function(txt){
                    return this.regex.test(txt)
                },
                transformFunction: (txt) => (<span className="token string">{txt}</span>),
                getMatchObj: function (txt){
                    return getMatchObj([this.regex], this.transformFunction, txt)
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
        lines = lines.map((line, index) => {
            for (let i = 0; i < allLineDetectionAndTransform.length; i++){
                const obj = allLineDetectionAndTransform[i]
                if (obj.detectFunction(line)){
                    return obj.transformFunction(line)
                }
            }
            if (lines.length == 1 || index == 0 || index == lines.length - 1){
                return <>{applyInlineDetectionAndTransform(line)}</>   
            }
            return <p>{applyInlineDetectionAndTransform(line)}</p>
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
                        indentationLevel: indentationLevel,
                        type: /^([ ]*-)/.test(line) ? 'ul' : 'ol' 
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

                    arrayTransformation.splice(arrayTransformation.indexOf(firstIndex), getSubListLength(subList) - 1, subList)
                }
            }
            arrayTransformation.push({type: listIndex.type})


            return arrayTransformation
        })
    }

    function transformListIndexesToHtml(listIndexes, markdownLines, depth = 0){
        if (listIndexes == undefined){
            return (<></>)
        }

        

        listIndexes = listIndexes.map((listIndex, i) => {
            if (Array.isArray(listIndex)){
                let type = listIndex.pop().type

                if (type == 'ol'){
                    let start = markdownLines[listIndex[0]].match(/[ ]*\d+/)[0].match(/\d+/)[0]
                    return <ol start={start} key={`depth: ${depth}, index: ${i}}`}>{transformListIndexesToHtml(listIndex, markdownLines, depth + 1)}</ol>
                }
                return <ul key={`depth: ${depth}, index: ${i}}`}>{transformListIndexesToHtml(listIndex, markdownLines, depth + 1)}</ul>
            }
            return <>
                {
                    <li key={`depth: ${depth}, index: ${i}}`}>{applyInlineMarkdown(markdownLines[listIndex].replace(/^([ ]*- )|^([ ]*\d+. )/, ''))}</li>
                }
            </>
        })

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

    function applyMultiLineMarkdown(htmlLines, markdownLines){
        const multiLineObjects = [
            {
                detect: (markdownLines) => markdownListDetection(markdownLines),
                transform: function(markdownLines, htmlLines){
                    const markdownLists = markdownListDetection(markdownLines)
                    const listIndexes = transformListIndexesFromObjectIntoArray(markdownLists)
                    
           
                    const htmlLists = transformListIndexesToHtml(listIndexes, markdownLines)

                    return placeListsInHtmlLinesList(htmlLines, markdownLists, htmlLists)
                }
            },
            {
                detect: function (markdownLines){
                    const regex = /`{3}/
                    let indexObjects = []

                    const isLastIndexObjectComplete = (indexObjects) => {
                        if (indexObjects.length == 0){
                            return false
                        }else{
                            const lastIndexObj = indexObjects[indexObjects.length - 1]
                            return lastIndexObj.end != null
                        }
                    }
                    for (let i = 0; i < markdownLines.length; i++){
                        const line = markdownLines[i]
                        if (regex.test(line)){
                            let match = regex.exec(line)
                            if (indexObjects.length == 0){
                                indexObjects.push({start: i, end: null, inlineStart: match.index })
                            }else{
                                if (isLastIndexObjectComplete(indexObjects)){
                                    indexObjects.push({start:i, end:null})
                                }else{
                                    indexObjects[indexObjects.length - 1].end = i
                                    indexObjects[indexObjects.length - 1].inlineEnd = match.index + 3
                                }
                            }
                        }
                    }   
                    indexObjects = indexObjects.filter((indexObj) => indexObj.end != null)
                    return indexObjects
                },
                transform: function (markdownLines, htmlLines){
                    const indexObjects = this.detect(markdownLines)
                    const transformToHtml = (markdownLines, indexObj) => {
                        const section = markdownLines.slice(indexObj.start, indexObj.end + 1)
                        const firstString =  <>{applyInlineMarkdown(section[0].slice(0, indexObj.inlineStart))}</>
                        const endingString = <>{applyInlineMarkdown(section[section.length - 1].slice(indexObj.inlineEnd,))}</>

                        section[0] = section[0].slice(indexObj.inlineStart + 1, )
                        section[section.length - 1] = section[section.length -1].slice(0, indexObj.inlineEnd)
                        return (
                            <>
                                {firstString}
                                <code>{transformcodeSnippetIntoHtml(section.join('\n'))}</code>
                                {endingString}
                            </>
                        )
                    }
                    indexObjects.forEach(indexObj => {
                        const { start, end } = indexObj
                        htmlLines.splice(start, end - start + 1, transformToHtml(markdownLines, indexObj))
                    })
                    return htmlLines
                }
            },
            {
                detect: function(markdownLines){
                    const regex = /^([ ]*\| [^|]+ \|)/
                    const indexObjects = []
                    const isLastIndexObjectComplete = (indexObjects) => {
                        if (indexObjects.length == 0){
                            return false
                        }else{
                            const lastIndexObj = indexObjects[indexObjects.length - 1]
                            return lastIndexObj.end != null
                        }
                    }
                    markdownLines.forEach((line, i) => {
                        if (regex.test(line)){
                            if (indexObjects.length == 0 || isLastIndexObjectComplete(indexObjects)){
                                indexObjects.push({start: i, end:null})
                            }
                            if (i == markdownLines.length - 1){
                                indexObjects[indexObjects.length - 1].end = i
                            }
                        }else{
                            if (indexObjects.length > 0 && !isLastIndexObjectComplete(indexObjects)){
                                indexObjects[indexObjects.length - 1].end = i - 1
                            }
                        }
                    })
                    return indexObjects
                },
                transform: function(markdownLines, htmlLines){
                    const indexObjects = this.detect(markdownLines)

                    const transformLine = (line) => {
                        console.log(line)
                        let columns = line.match(/\| [^|]+ \|/g)
                        console.log(columns)
                        if (columns){
                            columns = columns.map((column) => <td>{applyInlineMarkdown(column.replace(/^\|/, '').replace(/\|$/, ''))}</td>)
                        }
                        return <tr>{columns}</tr>
                    }
                    indexObjects.forEach((indexObj) => {
                       const rows = []
                       for (let i = indexObj.start; i <= indexObj.end; i++){
                        const line = markdownLines[i]
                        if (i == indexObj.start){
                            rows.push(<thead>{transformLine(line)}</thead>)
                        }else{
                            rows.push(<tbody>{transformLine(line)}</tbody>)
                        }
                       }
                       htmlLines.splice(indexObj.start, indexObj.end - indexObj.start + 1, <table>{rows}</table>) 
                    })
                    return htmlLines
                }
            }
        ]

        multiLineObjects.forEach((obj) => {
            if(obj.detect(markdownLines)){
                htmlLines = obj.transform(markdownLines, htmlLines)
            }
        })

        return htmlLines
    }


    function transformMarkdownTextToHtml(text){
        
         const markdownLines =  text.split('\n')



         let htmlLines = applyAllLineMarkdown(markdownLines)

         return applyMultiLineMarkdown(htmlLines, markdownLines)
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