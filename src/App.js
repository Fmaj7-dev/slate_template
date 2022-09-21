// Import React dependencies.
import React, { useState, useCallback } from 'react'
// Import the Slate editor factory.
import { createEditor } from 'slate'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react'
import { Editor, Transforms } from 'slate'

import { ImageElement } from './custom-types.d.ts'

import './App.css';

// Add the initial value.
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
]

/*const ImageElement = {
  type: 'image',
  url: string,
  children: [{}],
}*/

const App = () => {
  const [editor] = useState(() => withReact(createEditor()))

  // Define a rendering function based on the element passed to `props`. We use
  // `useCallback` here to memoize the function for subsequent renders.
  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  const addRandomText = () => {
    editor.insertText("asdf\n")
  }

  const addRandomImage = () => {
    console.log("random image")
  }

  return (
    <div>
    <Slate editor={editor} value={initialValue}>
      <button onClick={addRandomText}>Click me</button>
      <Navbar addText={addRandomText} addImage={addRandomImage}/>
      <br/><br/><br/><br/>
      <Editable
        renderElement={renderElement}
        onKeyDown={event => {
          if (event.key === 'r' && event.ctrlKey) {
            event.preventDefault()
            // Determine whether any of the currently selected blocks are code blocks.
            const [match] = Editor.nodes(editor, {
              match: n => n.type === 'code',
            })
            // Toggle the block type depending on whether there's already a match.
            Transforms.setNodes(
              editor,
              { type: match ? 'paragraph' : 'code' },
              { match: n => Editor.isBlock(editor, n) }
            )
          }
        }}
      />
    </Slate>
    </div>
  )
}

function Navbar(props){
  return (
    <div className="navbar">
      <a className="active" href="#"><i className="fa fa-fw fa-home"></i> Home</a> 
      <a href="#"><i className="fa fa-fw fa-search"></i> Search</a> 
      <a href="#" onClick={props.addText}><i className="fa fa-fw fa-file-text-o"></i> Add Text</a> 
      <a href="#"><i className="fa fa-fw fa-image"></i> Add Image</a> 
      <a className="menu_right" href="#"><i className="fa fa-fw fa-user"></i> Login</a>
    </div>
  );
}

// Define a React component renderer for our code blocks.
const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>
}

export default App;
