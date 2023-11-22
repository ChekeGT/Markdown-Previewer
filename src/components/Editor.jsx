import { useState } from "react"

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
        <div className="editor-header">
            <div className="icon-and-text-container">
                <i className="fa fa-free-code-camp"></i>
                <p>Editor</p>
            </div>
            <i onClick={toggleEditorOpenState} className={`fa ${editorOpenState ? 'fa-compress' : 'fa-arrows-alt'}`}></i>
        </div>
        <textarea value={value} onChange={handleEditorChange} className={`editor-textarea ${editorOpenState ? 'open' : ''}`}></textarea>
    </div>
)
}