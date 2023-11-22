import { useState } from "react"
import Editor from "./components/Editor"
function App() {
  
  const [editorText, updateEditorText ] = useState('')

  return (
    <>
      <Editor value={editorText} updateValue={updateEditorText}/>
    </>
  )
}

export default App
