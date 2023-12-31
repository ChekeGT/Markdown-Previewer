import { useEffect, useState } from "react"
import ComponentHeader from "./ComponentHeader"
import '../sass/Editor.sass'

const defaultTxt = `
# Welcome to my React Markdown Previewer!
        
## This is a sub-heading...
### And here's some other cool stuff:
        
Heres some code, \` <div></div> \`, between 2 backticks.
        
\`\`\`
// this is multi-line code:
        
function anotherExample(firstLine, lastLine) {
    if (firstLine == '"""' && lastLine == '"""') {
    return multiLineCode;
    }
}
\`\`\`
        
You can also make text **bold**... whoa!
Or *. both .*
Or * italic *.
And feel free to go crazy ~~ crossing stuff out ~~.
        
There's also [links](https://www.freecodecamp.org), and
> Block Quotes!
        
And if you want to get really crazy, even tables:
        
| Wild Header | | Crazy Header | | Another Header? |
| ------------ | | ------------- | | ------------- |
| Your content can | | be here, and it | | can be here.... | 
| And here. | | Okay. | | I think we get it. |
        
- And of course there are lists.
    - Some are bulleted.
        - With different indentation levels.
            - That look like this.
        
        
1. And there are numbered lists too.
1. Use just 1s if you want!
1. And last but not least, let's not forget embedded images:
        
![freeCodeCamp Logo](https://cdn.freecodecamp.org/testable-projects-fcc/images/fcc_secondary.svg)
`

export default function Editor({value, updateValue, toggleFullVisibility, openState}){
    
    function handleEditorChange(e){
        let value = e.target.value
        updateValue(value)
    }

    useEffect(() => {
        updateValue(defaultTxt)
    }, [])
return (
    <div className="editor-general-container">
        <ComponentHeader title={'Editor'} toggleOpenState={toggleFullVisibility} openState={openState}/>
        <textarea id="editor" value={value} onChange={handleEditorChange} className={`editor-textarea ${openState ? 'open' : ''}`}></textarea>
    </div>
)
}