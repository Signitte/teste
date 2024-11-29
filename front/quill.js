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
  document.body.innerHTML = `
    <h1>Kanban Board</h1>
    <button class="btn btn-primary mb-3" onclick="createColumn()">Create Column</button>
    <div id="board" class="d-flex"></div>
  `;
  
  ycolumns.forEach(function(columns, index) {
    const columnContainer = document.createElement('div');
    columnContainer.setAttribute('id', index);
    columnContainer.classList.add('col-md-3', 'p-3', 'border', 'rounded', 'mr-2', 'bg-light');
    
    const board = document.getElementById('board');
    board.append(columnContainer);

    const columnTitle = ydoc.getText(`${index}-title`);
    const columnTitleContainer = document.createElement('div');
    columnTitleContainer.setAttribute('id', `${index}-title`);
  
    columnContainer.append(columnTitleContainer);
    
    const columnTitleEditor = new Quill(columnTitleContainer, {
      theme: 'snow',
      modules: {
        cursors: true,
        toolbar: false // Disable the toolbar to keep it simple
      },
      placeholder: 'Título da Coluna',
    });
    
    // Enforce bold formatting and H2 size
    columnTitleContainer.style.fontWeight = 'bold';
    columnTitleContainer.style.fontSize = '2rem'; // Match H2 size
    columnTitleContainer.style.lineHeight = '1.5';
    columnTitleContainer.style.whiteSpace = 'nowrap'; // Prevent wrapping
    columnTitleContainer.style.overflow = 'hidden'; // Hide overflow content
    columnTitleContainer.style.textOverflow = 'ellipsis'; // Add ellipsis if text is too long
    columnTitleContainer.style.height = '75px'; // Fixed height for consistency
    columnTitleContainer.style.padding = '0';
    columnTitleContainer.style.margin = '0';


    // Restringir editor a uma única linha
    columnTitleEditor.on('text-change', () => {
      const text = columnTitleEditor.getText();
      if (text.includes('\n')) {
        columnTitleEditor.deleteText(text.indexOf('\n'), 1);
      }
    });

    const createTaskButton = document.createElement('button');
    createTaskButton.innerText = 'Create Task';
    createTaskButton.classList.add('btn', 'btn-success', 'mt-2');
    createTaskButton.onclick = () => createTask(index);
    columnContainer.append(createTaskButton);

    const columnTitleBinding = new QuillBinding(columnTitle, columnTitleEditor, provider.awareness);

    columns.forEach(function(column) {
      const title = ydoc.getText(`${column}-${index}-title`);
      const desc = ydoc.getText(`${column}-${index}-desc`);

      const parentContainer = document.createElement('div');
      parentContainer.setAttribute('id', `${column}-${index}`);
      parentContainer.classList.add('task-container', 'mb-3', 'p-2', 'border', 'rounded', 'bg-white');
      columnContainer.append(parentContainer);

      // Título da tarefa
      const titleContainer = document.createElement('div');
      titleContainer.setAttribute('id', `${column}-${index}-title`);
      titleContainer.classList.add('task-title-editor');
      parentContainer.append(titleContainer);

      const titleEditor = new Quill(titleContainer, {
        theme: 'snow',
        modules: {
          cursors: true,
          toolbar: false
        },
        placeholder: 'Título da Tarefa',
      });
      const titleBinding = new QuillBinding(title, titleEditor, provider.awareness);

      // Descrição da tarefa
      const descContainer = document.createElement('div');
      descContainer.setAttribute('id', `${column}-${index}-desc`);
      descContainer.classList.add('description-editor');
      parentContainer.append(descContainer);

      const descEditor = new Quill(descContainer, {
        theme: 'snow',
        modules: {
          cursors: true,
          toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['image', 'code-block']
          ],
        },
        placeholder: 'Descrição da Tarefa',
      });
      const descBinding = new QuillBinding(desc, descEditor, provider.awareness);
    });
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