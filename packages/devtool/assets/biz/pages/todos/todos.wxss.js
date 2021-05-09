const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/todos/todos.wxss' });
import appStyle from '../../app.wxss';
stylesheet.imports(appStyle);
import cs0 from '../../components/add-button/add-button.wxss';
stylesheet.imports(cs0);
export default stylesheet.exports(`.page-todos {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    width: 100%;
    max-height: 100vh;
  }
  .user {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-shrink: 0;
            flex-shrink: 0;
    padding: 30px;
    color: #FFF;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .avatar {
    width: 1.3rem;
    height: 1.3rem;
    border-radius: 50%;
    background-color: #FFF;
    -webkit-align-self: center;
            align-self: center;
  }
  .nickname {
    padding-top: 0.4rem;
    text-align: center;
    font-size: 0.4rem;
    font-weight: 100;
  }
  .test {
    font-size: 20px;
  }
  .todo-items {
    -webkit-box-flex: 1;
    -webkit-flex-grow: 1;
            flex-grow: 1;
    font-size: 0.34rem;
    padding: 0.5rem 1.2rem;
    color: #0EFFD6;
    overflow: auto;
  }
  .todo-items-group {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
  }
  .todo-item {
    position: relative;
    margin-bottom: 0.5rem;
    padding-left: 0.8rem;
    line-height: 0.7rem;
    height: 0.8rem;
    box-sizing: border-box;
    border: 2px solid rgb(14, 255, 214);
    border-radius: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-transition: border 0.2s;
    transition: border 0.2s;
  }
  .todo-item:last-child {
    margin-bottom: 0;
  }
  .todo-item::before {
    content: '';
    position: absolute;
    left: 0.12rem;
    margin-right: 0.2rem;
    width: 0.45rem;
    height: 0.45rem;
    background-color: rgba(14, 222, 255, 0.3);
    border-radius: 50%;
    top: 50%;
    -webkit-transform: translateY(-50%);
            transform: translateY(-50%);
    -webkit-transition: background-color 0.2s;
    transition: background-color 0.2s;
  }
  .todo-item::after {
    content: '';
    position: absolute;
    left: 0.29rem;
    width: 0.08rem;
    height: 0.18rem;
    top: 50%;
    -webkit-transform: translateY(-60%) rotate(38deg);
            transform: translateY(-60%) rotate(38deg);
    border: 0.04rem solid #FFF;
    border-width: 0 0.04rem 0.04rem 0;
    opacity: 0;
    -webkit-transition: opacity 0.2s;
    transition: opacity 0.2s;
  }
  .todo-item-checkbox {
    display: none;
  }
  .checked .todo-item-text {
    text-decoration: line-through;
    color: #1AA0B8;
  }
  .checked.todo-item {
    border: 2px solid rgba(14, 222, 255, 0.2);
  }
  .checked.todo-item::before {
    background-color: rgba(14, 222, 255, 0.2);
  }
  .checked.todo-item::after {
    opacity: 1;
  }
  .todo-footer {
    -webkit-flex-shrink: 0;
            flex-shrink: 0;
    padding: 0.5rem 0 1rem;
    font-size: 0.48rem;
    font-weight: 200;
    text-align: center;
  }`);