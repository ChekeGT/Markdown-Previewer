import { useState } from "react"
import Editor from "./components/Editor"
import Preview from "./components/Preview"
function App() {
  
  const [editorText, updateEditorText ] = useState('')

  return (
    <>
      <Editor value={editorText} updateValue={updateEditorText}/>
      <Preview markdownText={editorText}/>
    </>
  )
}

export default App
