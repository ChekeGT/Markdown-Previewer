import { useState } from "react"
import Editor from "./components/Editor"
import Preview from "./components/Preview"
import "./sass/App.sass"
function App() {
  
  const [editorText, updateEditorText ] = useState('')

  const [renderedComponents, updateRenderedComponents ] = useState({
    editor: true,
    preview: true
  })

  function togglePreviewVisibility(){
    updateRenderedComponents({...renderedComponents, preview: !renderedComponents.preview})
  }

  function toggleEditorVisibility(){
    updateRenderedComponents({...renderedComponents, editor: !renderedComponents.editor})
  }


  return (
    <div className="general-container">
      {renderedComponents.editor && renderedComponents.preview ? 
      <>
        <Editor value={editorText} updateValue={updateEditorText} toggleFullVisibility={togglePreviewVisibility} openState={!renderedComponents.preview}/>
        <Preview markdownText={editorText} toggleFullVisibility={toggleEditorVisibility} openState={!renderedComponents.editor}/> 
      </>: renderedComponents.editor ? <Editor value={editorText} updateValue={updateEditorText} toggleFullVisibility={togglePreviewVisibility} openState={!renderedComponents.preview}/>
      : renderedComponents.preview ? <Preview markdownText={editorText} toggleFullVisibility={toggleEditorVisibility} openState={!renderedComponents.editor}/> : <></>
      }
    </div>
  )
}

export default App
