import { useState } from "react"
import ComponentHeader from "./ComponentHeader"
import "../sass/Preview.sass"

export default function Preview({markdownText}){
    const [previewOpenState, updatePreviewOpenState] = useState(false)

    function togglePreviewOpenState(){
        updatePreviewOpenState(!previewOpenState)
    }

    function transfromMarkdownTextToHtml(text){
         return text
    }

    return (
        <div className="preview-component">
            <ComponentHeader title={'Preview'} toggleOpenState={togglePreviewOpenState} openState={previewOpenState}/>
            <div className="markdown-preview-container">
                {transfromMarkdownTextToHtml(markdownText)}
            </div>
        </div>
    )
}