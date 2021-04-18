const { StyleSheet } = self.MP
const stylesheet = new StyleSheet({ stylePath: 'pages/add-todo/add-todo.acss' });
export default stylesheet.exports(`.page-add-todo {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
  }
  .add-todo {
    padding: 40px;
    -webkit-box-flex: 1;
    -webkit-flex-grow: 1;
            flex-grow: 1;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .add-todo-input {
    display: block;
    font-size: 0.5rem;
    font-weight: 100;
    padding: 5px 5px;
    background: none;
    border: none;
    border-bottom: 1px solid #DFDFDF;
    color: #0EFFD6;
    width: 100%;
  }
  .todo-footer {
    padding: 0.5rem 0 1rem;
    font-size: 0.48rem;
    font-weight: 200;
    text-align: center;
  }`);