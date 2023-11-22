import { useState } from "react"
import ComponentHeader from "./ComponentHeader"
import '../sass/Editor.sass'

export default function Editor({value, updateValue}){
    const [editorOpenState, updateEditorOpenState] = useState(false)

    function toggleEditorOpenState(){
        updateEditorOpenState(!editorOpenState)
    }
    
    function handleEditorChange(e){
        let value = e.target.value
        updateValue(value)
    }
return (
    <div className="editor-general-container">
        <ComponentHeader title={'Editor'} toggleOpenState={toggleEditorOpenState} openState={editorOpenState}/>
        <textarea value={value} onChange={handleEditorChange} className={`editor-textarea ${editorOpenState ? 'open' : ''}`}></textarea>
    </div>
)
}