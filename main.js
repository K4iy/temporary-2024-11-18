// localStorageからTODOを取得
const getTodos = () => {
  const storedTodos = localStorage.getItem('todos');
  return storedTodos ? JSON.parse(storedTodos) : [];
};

// localStorageにTODOを保存
const saveTodos = (todos) => {
  localStorage.setItem('todos', JSON.stringify(todos));
};

// TODOリストを描画
const renderTodos = () => {
  const todos = getTodos();
  const uncompletedTodoList = document.getElementById('uncompleted-todo-list');
  const completedTodoList = document.getElementById('completed-todo-list');

  // リストをクリア
  uncompletedTodoList.innerHTML = '';
  completedTodoList.innerHTML = '';

  todos.forEach(todo => {
    const todoElement = document.createElement('div');
    todoElement.classList.add('todo-card');
    todoElement.dataset.id = todo.id;

    // チェックボックス
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodoCompletion(todo.id));

    // TODO内容
    const todoText = document.createElement('span');
    todoText.classList.add('todo-text');
    todoText.innerHTML = escapeHtml(todo.text); // 改行を <br> に変換して表示

    // クリックで編集モードに切り替え
    todoText.addEventListener('click', (event) => enableEditing(todo, todoText, event));

    // 削除ボタン
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', () => deleteTodo(todo.id));

    // TODOの要素を組み立て
    todoElement.appendChild(checkbox);
    todoElement.appendChild(todoText);
    todoElement.appendChild(deleteButton);

    // 完了・未完了リストに分けて表示
    if (todo.completed) {
      todoElement.classList.add('todo-completed');
      completedTodoList.appendChild(todoElement);
    } else {
      uncompletedTodoList.appendChild(todoElement);
    }
  });
};

// 編集モードを有効にする関数
const enableEditing = (todo, todoTextElement, event) => {
  // 現在のテキストを取得して編集用の入力フィールドを作成
  const textarea = document.createElement('textarea');
  textarea.value = todo.text;  // 改行を保持

  // 編集ボックスのスタイルを適用
  textarea.style.backgroundColor = 'white';
  textarea.style.color = 'black';
  textarea.style.border = '1px solid #ccc';
  textarea.style.padding = '5px';
  textarea.style.fontSize = '16px';
  textarea.style.width = '100%';  // 横幅を親要素に合わせる
  textarea.style.height = '100px';  // 適当な高さを設定

  // クリック位置にカーソルを移動
  textarea.addEventListener('click', (event) => moveCursorToClickPosition(event, textarea));

  // 編集後に内容が変更される場合に保存
  textarea.addEventListener('blur', () => saveEditedTodoText(todo, textarea.value, todoTextElement));
  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {  // Shift + Enter で改行、Enter で保存
      saveEditedTodoText(todo, textarea.value, todoTextElement);
    }
  });

  // 編集中のテキストを差し替え
  todoTextElement.innerHTML = '';  // 編集モードに切り替え
  todoTextElement.appendChild(textarea);
  textarea.focus(); // フォーカスを当てて編集しやすくする
};

// クリック位置にカーソルを移動
const moveCursorToClickPosition = (event, textarea) => {
  const rect = textarea.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;

  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10);
  const charsPerLine = Math.floor(textarea.clientWidth / parseInt(getComputedStyle(textarea).fontSize, 10));

  const lineNumber = Math.floor(offsetY / lineHeight);  // クリックされた行番号
  const charPosition = Math.floor(offsetX / (textarea.clientWidth / charsPerLine));  // クリックされた列番号

  const cursorPosition = lineNumber * charsPerLine + charPosition;

  // カーソル位置を設定
  textarea.selectionStart = cursorPosition;
  textarea.selectionEnd = cursorPosition;

  textarea.setSelectionRange(cursorPosition, cursorPosition); // IE対応
};

// 編集したテキストを保存
const saveEditedTodoText = (todo, newText, todoTextElement) => {
  // テキストが変更されていない場合は何もしない
  if (newText.trim() === todo.text) return;

  // テキストを更新（改行を保持）
  todo.text = newText.trim();

  // localStorageの保存
  const todos = getTodos();
  const updatedTodos = todos.map(t => t.id === todo.id ? todo : t);  // 該当するTODOを更新
  saveTodos(updatedTodos);  // localStorageに保存

  // 変更後、画面に反映
  todoTextElement.innerHTML = escapeHtml(todo.text); // 改行を <br> に変換して表示

  // リストを再描画
  renderTodos();
};

// 改行を <br> に変換する関数
const escapeHtml = (str) => {
  // 改行コードを <br> に置換
  return str.replace(/\n/g, '<br>');
};

// 初期状態でTODOを描画
renderTodos();

// TODO追加フォームの処理
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const newTodoText = todoInput.value.trim();
  if (!newTodoText) return; // 入力が空の場合は何もしない

  const newTodo = {
    id: Date.now().toString(),  // 一意なIDを生成（タイムスタンプを使用）
    text: newTodoText,
    completed: false,
  };

  const todos = getTodos();
  todos.push(newTodo);
  saveTodos(todos);

  todoInput.value = ''; // 入力フォームをリセット
  renderTodos(); // TODOリストを再描画
});

// TODOの完了/未完了切り替え
const toggleTodoCompletion = (id) => {
  const todos = getTodos();
  const todo = todos.find(todo => todo.id === id);

  if (todo) {
    todo.completed = !todo.completed;
    saveTodos(todos);
    renderTodos(); // リストを再描画
  }
};

// TODO削除処理
const deleteTodo = (id) => {
  if (confirm('このTODOを削除してもよろしいですか？')) {
    const todos = getTodos();
    const updatedTodos = todos.filter(todo => todo.id !== id);
    saveTodos(updatedTodos);
    renderTodos(); // リストを再描画
  }
};
