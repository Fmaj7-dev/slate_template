// Import React dependencies.
import React, { useState, useCallback } from 'react'
// Import the Slate editor factory.
import { createEditor } from 'slate'

// Import the Slate components and React plugin.
import { Slate, Editable, withReact, useSlateStatic, ReactEditor, useSelected, useFocused } from 'slate-react'
import { Editor, Transforms } from 'slate'

import { ImageElement } from './custom-types.d.ts'

import { Button, Icon, Toolbar } from './components.tsx'
import { css } from '@emotion/css'
import isUrl from 'is-url'
import imageExtensions from 'image-extensions'

import './App.css';

// Add the initial value.
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
  {
    type: 'image',
    url: 'https://source.unsplash.com/kFrdX5IeQzI',
    children: [{ text: '' }],
  },
]
////////////////////////////////////////////////////////////////////
const withImages = editor => {
  const { insertData, isVoid } = editor

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = data => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result
            insertImage(editor, url)
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

const insertImage = (editor, url) => {
  const text = { text: '' }
  const image: ImageElement = { type: 'image', url, children: [text] }
  Transforms.insertNodes(editor, image)
}

const Element = props => {
  const { attributes, children, element } = props

  switch (element.type) {
    case 'image':
      return <Image {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Image = ({ attributes, children, element }) => {
  const editor = useSlateStatic()
  const path = ReactEditor.findPath(editor, element)

  const selected = useSelected()
  const focused = useFocused()
  return (
    <div {...attributes}>
      {children}
      <div
        contentEditable={false}
        className={css`
          position: relative;
        `}
      >
        <img
          src={element.url}
          className={css`
            display: block;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
          `}
        />
        <Button
          active
          onClick={() => Transforms.removeNodes(editor, { at: path })}
          className={css`
            display: ${selected && focused ? 'inline' : 'none'};
            position: absolute;
            top: 0.5em;
            left: 0.5em;
            background-color: white;
          `}
        >
          <Icon>delete</Icon>
        </Button>
      </div>
    </div>
  )
}

const InsertImageButton = () => {
  const editor = useSlateStatic()
  return (
    <Button
      onMouseDown={event => {
        event.preventDefault()
        /*const url = window.prompt('Enter the URL of the image:')
        if (url && !isImageUrl(url)) {
          alert('URL is not an image')
          return
        }
        url && insertImage(editor, url)*/
        insertImage(editor, "https://upload.wikimedia.org/wikipedia/commons/3/31/Ray_Flying_Legends_2005-1.jpg")
      }}
    >
      <Icon>image</Icon>
    </Button>
  )
}

const isImageUrl = url => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return imageExtensions.includes(ext)
}
////////////////////////////////////////////////////////////////////


const App = () => {
  const [editor] = useState(() => withImages(withReact(createEditor())))

  // Define a rendering function based on the element passed to `props`. We use
  // `useCallback` here to memoize the function for subsequent renders.
  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      case 'image':
        return <Image {...props} />
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
    <InsertImageButton />
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
