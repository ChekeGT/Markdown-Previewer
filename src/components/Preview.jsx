import { useState } from "react"
import ComponentHeader from "./ComponentHeader"

export default function Preview({markdownText}){
    const [previewOpenState, updatePreviewOpenState] = useState(false)

    function togglePreviewOpenState(){
        updatePreviewOpenState(!previewOpenState)
    }

    function transfromMarkdownTextToHtml(text){
         return text
    }

    return (
        <div>
            <ComponentHeader title={'Preview'} toggleOpenState={togglePreviewOpenState} openState={updatePreviewOpenState}/>
            <div>
                {transfromMarkdownTextToHtml(markdownText)}
            </div>
        </div>
    )
}