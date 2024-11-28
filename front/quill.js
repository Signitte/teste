import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { QuillBinding } from 'y-quill';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';

Quill.register('modules/cursors', QuillCursors);

let ydoc = new Y.Doc();
let ycolumns = ydoc.getArray('columns');
const provider = new WebsocketProvider("ws://localhost:1234", "teste", ydoc);


ycolumns.observeDeep(function() {
  document.body.innerHTML=`<button onclick="createColumn()">Create Column</button>
      <button onclick="createTask(0)">Create Task</button>
  <script src="quill.bundle.js"></script>`
  ycolumns.forEach(function(columns, index) {
    const columnContainer=document.createElement('div');
    columnContainer.setAttribute('id', `${index}`);
    document.body.appendChild(columnContainer);
    const createTaskButton = document.createElement('button');
    createTaskButton.innerText = 'Create Task';
    createTaskButton.onclick = () => createTask(index);
    columnContainer.append(createTaskButton);
    
    columns.forEach(function(column){
      console.log("LOOK HERE");
      console.log(column);

      // Get text types for title and description
      const title = ydoc.getText(`${column}-${index}-title`);
      const desc = ydoc.getText(`${column}-${index}-desc`);

      // Create a parent container div for title and description
      const parentContainer = document.createElement('div');
      parentContainer.setAttribute('id', `${column}-${index}`);
      parentContainer.classList.add('column-container');
      // Append the parent container to #columns-container
      document.getElementById(`${index}`).append(parentContainer);

      // Create a title container
      const titleContainer = document.createElement('div');
      titleContainer.setAttribute('id', `${column}-${index}-title`);
      titleContainer.classList.add('title-container');
      parentContainer.append(titleContainer);

      // Create a description container
      const descContainer = document.createElement('div');
      descContainer.setAttribute('id', `${column}-${index}-desc`);
      descContainer.classList.add('desc-container');
      parentContainer.append(descContainer);

      // Initialize Quill editor for description
      const descEditor = new Quill(descContainer, {
        modules: {
          cursors: true,
          toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['image', 'code-block']
          ],
          history: {
            userOnly: true
          }
        },
        placeholder: 'Start collaborating...',
        theme: 'snow' // or 'bubble'
      });

      // Initialize Quill editor for title
      const titleEditor = new Quill(titleContainer, {
        theme: 'snow',
        modules: {
          cursors: true,
          toolbar: false  // Disable the toolbar to make it simple
        },
        placeholder: 'Type something...',
      });

      // Bind the editors to Yjs
      const descBinding = new QuillBinding(desc, descEditor, provider.awareness);
      const titleBinding = new QuillBinding(title, titleEditor, provider.awareness);


      // Mark this column as rendered
  })
  });
});

// Function to create a new column
function createTask(columnId) {
  ycolumns.get(columnId).push([ycolumns.get(columnId)._length]);
}

function createColumn(){
  console.log(ycolumns)
  const column=new Y.Array();
  ycolumns.push([column]);
}

window.createTask = createTask;
window.createColumn = createColumn;